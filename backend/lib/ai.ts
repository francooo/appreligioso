import { InputError, User } from "./auth.js";
import { sql } from "./db.js";
import { AiKind, ChatMessage, groqChat, systemPrompt } from "./groq.js";
import { Methods, body, notFound, oneOf, param, text, uuid } from "./resources.js";

// Recursos de IA do usuário logado. Tudo filtra por user_id.
//   POST   /api/ai/chat                  { conversationId?, message }       -> { conversation, reply }
//   POST   /api/ai/palavra               { reference, passage }             -> { conversation, reply }
//   POST   /api/ai/oracao                { intention, tag? }                -> { conversation, reply }
//   POST   /api/ai/diario                { items[], mood? }                 -> { conversation, reply }
//   GET    /api/ai/conversations?kind=   -> { conversations }
//   GET    /api/ai/conversation?id=      -> { conversation, messages }
//   DELETE /api/ai/conversation?id=      -> { deleted }

const KINDS: AiKind[] = ["chat", "palavra", "oracao", "diario"];
const HISTORY = 20;

type Conversation = { id: string; kind: AiKind; title: string; created_at: string; updated_at: string };

function dailyLimit() {
  const n = Number(process.env.AI_DAILY_LIMIT);
  return Number.isInteger(n) && n > 0 ? n : 50;
}

async function checkUsage(user: User) {
  const [row] = (await sql`
    SELECT count(*)::int AS n FROM ai_messages m
    JOIN ai_conversations c ON c.id = m.conversation_id
    WHERE c.user_id = ${user.id} AND m.role = 'assistant' AND m.created_at > now() - interval '24 hours'
  `) as { n: number }[];
  if (row.n >= dailyLimit()) throw new InputError("Limite diário da IA atingido. Volte amanhã.", 429);
}

function titleOf(s: string) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > 60 ? `${t.slice(0, 57)}…` : t;
}

/** Grava a pergunta e a resposta juntas (só depois que a IA respondeu). */
async function persist(user: User, kind: AiKind, conversationId: string | null, title: string, question: string, reply: string) {
  const id = conversationId ?? crypto.randomUUID();
  const [conv] = (await sql.transaction([
    conversationId
      ? sql`UPDATE ai_conversations SET updated_at = now() WHERE id = ${id} AND user_id = ${user.id} RETURNING *`
      : sql`INSERT INTO ai_conversations (id, user_id, kind, title) VALUES (${id}, ${user.id}, ${kind}, ${titleOf(title)}) RETURNING *`,
    sql`INSERT INTO ai_messages (conversation_id, role, content) VALUES (${id}, 'user', ${question})`,
    sql`INSERT INTO ai_messages (conversation_id, role, content, created_at) VALUES (${id}, 'assistant', ${reply}, now() + interval '1 millisecond')`,
  ])) as Conversation[][];
  return conv[0];
}

/** Recurso de resposta única (Palavra, Oração, Diário). */
async function oneShot(user: User, kind: AiKind, title: string, question: string) {
  await checkUsage(user);
  const reply = await groqChat([
    { role: "system", content: systemPrompt(user.tradition, kind) },
    { role: "user", content: question },
  ]);
  return { conversation: await persist(user, kind, null, title, question, reply), reply };
}

const ACTIONS: Record<string, Methods> = {
  chat: {
    POST: async ({ user, request }) => {
      const b = await body(request);
      const message = text(b.message, "Mensagem", { max: 2000 })!;
      const conversationId = b.conversationId == null ? null : uuid(String(b.conversationId));

      let history: ChatMessage[] = [];
      if (conversationId) {
        const [conv] = await sql`SELECT id FROM ai_conversations WHERE id = ${conversationId} AND user_id = ${user.id} AND kind = 'chat'`;
        if (!conv) notFound();
        const rows = (await sql`
          SELECT role, content FROM (
            SELECT role, content, created_at FROM ai_messages
            WHERE conversation_id = ${conversationId} ORDER BY created_at DESC LIMIT ${HISTORY}
          ) t ORDER BY created_at
        `) as ChatMessage[];
        history = rows;
      }

      await checkUsage(user);
      const reply = await groqChat([
        { role: "system", content: systemPrompt(user.tradition, "chat") },
        ...history,
        { role: "user", content: message },
      ]);
      return { conversation: await persist(user, "chat", conversationId, message, message, reply), reply };
    },
  },

  palavra: {
    POST: async ({ user, request }) => {
      const b = await body(request);
      const reference = text(b.reference, "Referência", { max: 120 })!;
      const passage = text(b.passage, "Texto", { max: 2000 })!;
      return oneShot(user, "palavra", reference, `Texto do dia (${reference}):\n"${passage}"`);
    },
  },

  oracao: {
    POST: async ({ user, request }) => {
      const b = await body(request);
      const intention = text(b.intention, "Intenção", { max: 500 })!;
      const tag = text(b.tag, "Etiqueta", { max: 30, optional: true });
      return oneShot(user, "oracao", intention, `Minha intenção${tag ? ` (${tag})` : ""}: ${intention}`);
    },
  },

  diario: {
    POST: async ({ user, request }) => {
      const b = await body(request);
      if (!Array.isArray(b.items)) throw new InputError("items deve ser uma lista.");
      const items = b.items
        .map((it, i) => text(it, `Item ${i + 1}`, { max: 500, optional: true }))
        .filter((it): it is string => !!it)
        .slice(0, 3);
      if (!items.length) throw new InputError("Escreva pelo menos um motivo de gratidão.");
      const mood = text(b.mood, "Humor", { max: 40, optional: true });
      const question = `Hoje sou grato(a) por:\n${items.map((it) => `- ${it}`).join("\n")}${mood ? `\nComo me sinto: ${mood}` : ""}`;
      return oneShot(user, "diario", items[0], question);
    },
  },

  conversations: {
    GET: async ({ user, request }) => {
      const kind = oneOf(param(request, "kind") ?? undefined, "kind", KINDS, true);
      const rows = kind
        ? await sql`SELECT * FROM ai_conversations WHERE user_id = ${user.id} AND kind = ${kind} ORDER BY updated_at DESC LIMIT 50`
        : await sql`SELECT * FROM ai_conversations WHERE user_id = ${user.id} ORDER BY updated_at DESC LIMIT 50`;
      return { conversations: rows };
    },
  },

  conversation: {
    GET: async ({ user, request }) => {
      const id = uuid(param(request, "id") ?? undefined);
      const [conversation] = await sql`SELECT * FROM ai_conversations WHERE id = ${id} AND user_id = ${user.id}`;
      if (!conversation) notFound();
      const messages = await sql`SELECT id, role, content, created_at FROM ai_messages WHERE conversation_id = ${id} ORDER BY created_at`;
      return { conversation, messages };
    },
    DELETE: async ({ user, request }) => {
      const id = uuid(param(request, "id") ?? undefined);
      const rows = await sql`DELETE FROM ai_conversations WHERE id = ${id} AND user_id = ${user.id} RETURNING id`;
      return rows.length ? { deleted: true } : notFound();
    },
  },
};

export const AI_ACTIONS = ACTIONS;
