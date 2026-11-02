import { InputError, User } from "./auth.js";
import { sql } from "./db.js";

// Recursos do usuário logado. Cada handler recebe o usuário da sessão e a requisição;
// todas as consultas filtram por user_id, então ninguém lê ou altera dados de outra pessoa.

export const TRADITIONS = ["catolica", "evangelica", "espirita", "judaica", "islamica", "budista", "livre"];
const SAVED_TYPES = ["passagem", "oracao", "reflexao", "plano"];
const MOODS = ["Em paz", "Grata", "Cansada", "Esperançosa"];

type Ctx = { user: User; request: Request; id?: string };
type Handler = (ctx: Ctx) => Promise<unknown>;
type Methods = Partial<Record<"GET" | "POST" | "PATCH" | "PUT" | "DELETE", Handler>>;

// ---------- validação ----------

async function body(request: Request): Promise<Record<string, unknown>> {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new InputError("Corpo JSON inválido.");
  return data as Record<string, unknown>;
}

function text(v: unknown, field: string, { max = 500, optional = false } = {}): string | null {
  if (v === undefined || v === null || v === "") {
    if (optional) return null;
    throw new InputError(`${field} é obrigatório.`);
  }
  if (typeof v !== "string") throw new InputError(`${field} inválido.`);
  const t = v.trim();
  if (!t && !optional) throw new InputError(`${field} é obrigatório.`);
  if (t.length > max) throw new InputError(`${field} passa de ${max} caracteres.`);
  return t || null;
}

function oneOf(v: unknown, field: string, options: string[], optional = false): string | null {
  if ((v === undefined || v === null) && optional) return null;
  if (typeof v !== "string" || !options.includes(v)) throw new InputError(`${field} inválido.`);
  return v;
}

function bool(v: unknown, field: string): boolean | null {
  if (v === undefined) return null;
  if (typeof v !== "boolean") throw new InputError(`${field} inválido.`);
  return v;
}

function time(v: unknown, field: string, optional = false): string | null {
  if (v === undefined && optional) return null;
  if (typeof v !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw new InputError(`${field} inválido (HH:MM).`);
  return v;
}

function int(v: unknown, field: string, min = 0): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min) throw new InputError(`${field} inválido.`);
  return v;
}

function uuid(id: string | undefined) {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw new InputError("id inválido.");
  return id;
}

function param(request: Request, name: string) {
  return new URL(request.url).searchParams.get(name);
}

function notFound(): never {
  throw new InputError("Item não encontrado.", 404);
}

// ---------- recursos ----------

const profile: Methods = {
  GET: async ({ user }) => ({ user }),
  PATCH: async ({ user, request }) => {
    const b = await body(request);
    const name = b.name === undefined ? null : text(b.name, "Nome", { max: 80 });
    const tradition = b.tradition === undefined ? null : oneOf(b.tradition, "Tradição", TRADITIONS);
    const [updated] = await sql`
      UPDATE users SET
        name       = COALESCE(${name}, name),
        tradition  = COALESCE(${tradition}, tradition),
        updated_at = now()
      WHERE id = ${user.id}
      RETURNING id, email, name, avatar_url, tradition`;
    return { user: updated };
  },
};

const PREF_DEFAULTS = {
  notify_prayer: true,
  notify_word: true,
  notify_news: false,
  sound: "Sino suave",
  vibration: true,
  dnd: false,
  dnd_start: "22:00",
  dnd_end: "06:00",
  city: null,
};

const preferences: Methods = {
  GET: async ({ user }) => {
    const [row] = await sql`SELECT * FROM user_preferences WHERE user_id = ${user.id}`;
    return { preferences: row ?? { user_id: user.id, ...PREF_DEFAULTS } };
  },
  PATCH: async ({ user, request }) => {
    const b = await body(request);
    const v = {
      notify_prayer: bool(b.notify_prayer, "notify_prayer"),
      notify_word: bool(b.notify_word, "notify_word"),
      notify_news: bool(b.notify_news, "notify_news"),
      vibration: bool(b.vibration, "vibration"),
      dnd: bool(b.dnd, "dnd"),
      sound: b.sound === undefined ? null : text(b.sound, "Som", { max: 40 }),
      dnd_start: time(b.dnd_start, "Início do não perturbe", true),
      dnd_end: time(b.dnd_end, "Fim do não perturbe", true),
      city: b.city === undefined ? null : text(b.city, "Cidade", { max: 80, optional: true }),
    };
    // Garante a linha com os padrões antes de aplicar a alteração.
    await sql`INSERT INTO user_preferences (user_id) VALUES (${user.id}) ON CONFLICT (user_id) DO NOTHING`;
    const [row] = await sql`
      UPDATE user_preferences SET
        notify_prayer = COALESCE(${v.notify_prayer}, notify_prayer),
        notify_word   = COALESCE(${v.notify_word}, notify_word),
        notify_news   = COALESCE(${v.notify_news}, notify_news),
        vibration     = COALESCE(${v.vibration}, vibration),
        dnd           = COALESCE(${v.dnd}, dnd),
        sound         = COALESCE(${v.sound}, sound),
        dnd_start     = COALESCE(${v.dnd_start}, dnd_start),
        dnd_end       = COALESCE(${v.dnd_end}, dnd_end),
        city          = CASE WHEN ${b.city !== undefined} THEN ${v.city} ELSE city END,
        updated_at    = now()
      WHERE user_id = ${user.id}
      RETURNING *`;
    return { preferences: row };
  },
};

const intentions: Methods = {
  GET: async ({ user, request }) => {
    const status = oneOf(param(request, "status") ?? undefined, "status", ["active", "answered"], true);
    const rows = status
      ? await sql`SELECT * FROM intentions WHERE user_id = ${user.id} AND status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT * FROM intentions WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    return { intentions: rows };
  },
  POST: async ({ user, request }) => {
    const b = await body(request);
    const [row] = await sql`
      INSERT INTO intentions (user_id, text, tag)
      VALUES (${user.id}, ${text(b.text, "Intenção", { max: 280 })}, ${text(b.tag, "Etiqueta", { max: 30, optional: true })})
      RETURNING *`;
    return { intention: row };
  },
};

const intentionById: Methods = {
  PATCH: async ({ user, request, id }) => {
    const b = await body(request);
    const status = oneOf(b.status, "status", ["active", "answered"], true);
    const t = b.text === undefined ? null : text(b.text, "Intenção", { max: 280 });
    const [row] = await sql`
      UPDATE intentions SET
        text        = COALESCE(${t}, text),
        status      = COALESCE(${status}, status),
        answered_at = CASE WHEN ${status}::text = 'answered' THEN now()
                           WHEN ${status}::text = 'active' THEN NULL
                           ELSE answered_at END
      WHERE id = ${uuid(id)} AND user_id = ${user.id}
      RETURNING *`;
    return row ? { intention: row } : notFound();
  },
  DELETE: async ({ user, id }) => {
    const rows = await sql`DELETE FROM intentions WHERE id = ${uuid(id)} AND user_id = ${user.id} RETURNING id`;
    return rows.length ? { deleted: true } : notFound();
  },
};

const journal: Methods = {
  GET: async ({ user, request }) => {
    const month = param(request, "month"); // YYYY-MM
    const q = param(request, "q")?.trim();
    const limit = Math.min(Number(param(request, "limit")) || 50, 200);
    if (month && !/^\d{4}-\d{2}$/.test(month)) throw new InputError("month inválido (YYYY-MM).");
    const rows = await sql`
      SELECT * FROM journal_entries
      WHERE user_id = ${user.id}
        AND (${month}::text IS NULL OR to_char(entry_date, 'YYYY-MM') = ${month})
        AND (${q ?? null}::text IS NULL OR array_to_string(items, ' ') ILIKE '%' || ${q ?? null} || '%')
      ORDER BY entry_date DESC, created_at DESC
      LIMIT ${limit}`;
    return { entries: rows };
  },
  POST: async ({ user, request }) => {
    const b = await body(request);
    if (!Array.isArray(b.items)) throw new InputError("items deve ser uma lista.");
    const items = b.items
      .map((it, i) => text(it, `Item ${i + 1}`, { max: 500, optional: true }))
      .filter((it): it is string => !!it)
      .slice(0, 3);
    if (!items.length) throw new InputError("Escreva pelo menos um motivo de gratidão.");
    const mood = oneOf(b.mood, "Humor", MOODS, true);
    const date = b.date === undefined ? null : text(b.date, "Data", { max: 10 });
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new InputError("Data inválida (YYYY-MM-DD).");
    const [row] = await sql`
      INSERT INTO journal_entries (user_id, items, mood, entry_date)
      VALUES (${user.id}, ${items}, ${mood}, COALESCE(${date}::date, CURRENT_DATE))
      RETURNING *`;
    return { entry: row };
  },
};

const journalById: Methods = {
  DELETE: async ({ user, id }) => {
    const rows = await sql`DELETE FROM journal_entries WHERE id = ${uuid(id)} AND user_id = ${user.id} RETURNING id`;
    return rows.length ? { deleted: true } : notFound();
  },
};

const reminders: Methods = {
  GET: async ({ user }) => ({
    reminders: await sql`SELECT * FROM reminders WHERE user_id = ${user.id} ORDER BY time`,
  }),
  POST: async ({ user, request }) => {
    const b = await body(request);
    const [row] = await sql`
      INSERT INTO reminders (user_id, time, label, days, enabled)
      VALUES (${user.id}, ${time(b.time, "Horário")}, ${text(b.label, "Nome", { max: 60 })},
              ${text(b.days, "Dias", { max: 40, optional: true }) ?? "Todos os dias"}, ${bool(b.enabled, "enabled") ?? true})
      RETURNING *`;
    return { reminder: row };
  },
};

const reminderById: Methods = {
  PATCH: async ({ user, request, id }) => {
    const b = await body(request);
    const [row] = await sql`
      UPDATE reminders SET
        time    = COALESCE(${time(b.time, "Horário", true)}, time),
        label   = COALESCE(${b.label === undefined ? null : text(b.label, "Nome", { max: 60 })}, label),
        days    = COALESCE(${b.days === undefined ? null : text(b.days, "Dias", { max: 40 })}, days),
        enabled = COALESCE(${bool(b.enabled, "enabled")}, enabled)
      WHERE id = ${uuid(id)} AND user_id = ${user.id}
      RETURNING *`;
    return row ? { reminder: row } : notFound();
  },
  DELETE: async ({ user, id }) => {
    const rows = await sql`DELETE FROM reminders WHERE id = ${uuid(id)} AND user_id = ${user.id} RETURNING id`;
    return rows.length ? { deleted: true } : notFound();
  },
};

const saved: Methods = {
  GET: async ({ user, request }) => {
    const type = oneOf(param(request, "type") ?? undefined, "type", SAVED_TYPES, true);
    const rows = type
      ? await sql`SELECT * FROM saved_items WHERE user_id = ${user.id} AND type = ${type} ORDER BY created_at DESC`
      : await sql`SELECT * FROM saved_items WHERE user_id = ${user.id} ORDER BY created_at DESC`;
    return { saved: rows };
  },
  POST: async ({ user, request }) => {
    const b = await body(request);
    const [row] = await sql`
      INSERT INTO saved_items (user_id, type, key, title, subtitle)
      VALUES (${user.id}, ${oneOf(b.type, "Tipo", SAVED_TYPES)}, ${text(b.key, "Chave", { max: 200 })},
              ${text(b.title, "Título", { max: 300 })}, ${text(b.subtitle, "Subtítulo", { max: 200, optional: true })})
      ON CONFLICT (user_id, type, key) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle
      RETURNING *`;
    return { item: row };
  },
};

const savedById: Methods = {
  DELETE: async ({ user, id }) => {
    const rows = await sql`DELETE FROM saved_items WHERE id = ${uuid(id)} AND user_id = ${user.id} RETURNING id`;
    return rows.length ? { deleted: true } : notFound();
  },
};

const progress: Methods = {
  GET: async ({ user }) => ({
    progress: await sql`SELECT * FROM reading_progress WHERE user_id = ${user.id} ORDER BY updated_at DESC`,
  }),
  PUT: async ({ user, request }) => {
    const b = await body(request);
    const total = int(b.total, "total", 1);
    const step = Math.min(int(b.step, "step"), total);
    const [row] = await sql`
      INSERT INTO reading_progress (user_id, plan_key, plan_title, step, total)
      VALUES (${user.id}, ${text(b.plan_key, "Plano", { max: 120 })}, ${text(b.plan_title, "Título", { max: 200 })}, ${step}, ${total})
      ON CONFLICT (user_id, plan_key) DO UPDATE SET
        plan_title = EXCLUDED.plan_title, step = EXCLUDED.step, total = EXCLUDED.total, updated_at = now()
      RETURNING *`;
    return { progress: row };
  },
};

export const COLLECTIONS: Record<string, Methods> = {
  profile,
  preferences,
  intentions,
  journal,
  reminders,
  saved,
  progress,
};

export const ITEMS: Record<string, Methods> = {
  intentions: intentionById,
  journal: journalById,
  reminders: reminderById,
  saved: savedById,
};
