import { InputError } from "./auth.js";

// Cliente mínimo da Groq (API compatível com OpenAI). A chave fica só no servidor.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 25_000;

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type AiKind = "chat" | "palavra" | "oracao" | "diario";

const TRADITION_LABELS: Record<string, string> = {
  catolica: "católica",
  evangelica: "evangélica",
  espirita: "espírita",
  judaica: "judaica",
  islamica: "islâmica",
  budista: "budista",
  livre: "espiritualidade livre, sem religião específica",
};

const TASKS: Record<AiKind, string> = {
  chat:
    "Você conversa como um guia espiritual: escuta, acolhe e responde com sabedoria da tradição, citando textos sagrados quando fizer sentido. Respostas curtas (até 3 parágrafos), a não ser que pedam mais.",
  palavra:
    "Escreva uma reflexão sobre o texto do dia: o que ele diz, o que significa e um convite prático para viver isso hoje. Até 3 parágrafos curtos.",
  oracao:
    "Escreva uma oração pessoal, em primeira pessoa, a partir da intenção da pessoa, no estilo de oração da tradição. Até 2 parágrafos. Responda só com a oração.",
  diario:
    "A pessoa registrou motivos de gratidão no diário. Escreva um comentário curto e acolhedor (até 1 parágrafo), valorizando o que ela escreveu e ligando a um ensinamento da tradição.",
};

export function systemPrompt(tradition: string | null, kind: AiKind) {
  const label = TRADITION_LABELS[tradition ?? ""] ?? TRADITION_LABELS.catolica;
  return [
    "Você é o assistente do Lumina, um app de oração e vida espiritual.",
    `A pessoa segue a tradição ${label}. Responda sempre de forma fiel e respeitosa a essa tradição, sem impor outra.`,
    "Escreva em português do Brasil, com tom acolhedor, simples e sereno. Não invente citações: se não tiver certeza da referência, não cite.",
    "Você não substitui ajuda médica, psicológica ou um líder religioso. Se a pessoa demonstrar risco à própria vida ou crise grave, acolha e indique o CVV (ligue 188, 24h, gratuito) ou o serviço de emergência (192).",
    TASKS[kind],
  ].join("\n");
}

function requireKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY não definida.");
  return key;
}

const DEFAULT_MODEL = "openai/gpt-oss-120b";

export async function groqChat(messages: ChatMessage[], { maxTokens = 2000, temperature = 0.7 } = {}) {
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  // Modelos de raciocínio (gpt-oss): pensa pouco e não devolve o raciocínio, só a resposta.
  const reasoning = model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low", include_reasoning: false } : {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${requireKey()}` },
      body: JSON.stringify({
        model,
        messages,
        ...reasoning,
        max_tokens: maxTokens,
        temperature,
      }),
    });
  } catch (err) {
    console.error("Groq indisponível:", err);
    throw new InputError("A IA demorou para responder. Tente de novo.", 503);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    console.error("Groq erro", res.status, await res.text().catch(() => ""));
    if (res.status === 429) throw new InputError("A IA está muito requisitada agora. Tente em instantes.", 429);
    throw new InputError("A IA não conseguiu responder agora. Tente de novo.", 503);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new InputError("A IA não conseguiu responder agora. Tente de novo.", 503);
  return content;
}
