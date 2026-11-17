import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { sql } from "./db.js";
import { hashPassword, verifyPassword } from "./password.js";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const SESSION_TTL = "30d";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definida.`);
  return value;
}

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  tradition: string | null;
};

export class AuthError extends Error {}

/** Erro de validação de entrada (400). */
export class InputError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/** Valida o ID token emitido pelo Google (web ou Android) para o nosso cliente Web. */
export async function verifyGoogleIdToken(idToken: string) {
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience: requireEnv("GOOGLE_WEB_CLIENT_ID"),
    });
    if (!payload.sub || typeof payload.email !== "string" || payload.email_verified !== true) {
      throw new AuthError("Conta Google sem e-mail verificado.");
    }
    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: typeof payload.name === "string" ? payload.name : null,
      picture: typeof payload.picture === "string" ? payload.picture : null,
    };
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("Token do Google inválido.");
  }
}

export async function upsertGoogleUser(g: Awaited<ReturnType<typeof verifyGoogleIdToken>>) {
  const [user] = (await sql`
    INSERT INTO users (google_id, email, name, avatar_url, email_verified, last_login_at)
    VALUES (${g.googleId}, ${g.email}, ${g.name}, ${g.picture}, true, now())
    ON CONFLICT (email) DO UPDATE SET
      google_id      = EXCLUDED.google_id,
      name           = COALESCE(users.name, EXCLUDED.name),
      avatar_url     = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      -- O Google provou que o e-mail é desta pessoa. Uma senha criada antes por quem
      -- não provou ser dono do e-mail é descartada (evita sequestro de conta).
      password_hash  = CASE WHEN users.email_verified THEN users.password_hash ELSE NULL END,
      email_verified = true,
      last_login_at  = now(),
      updated_at     = now()
    RETURNING id, email, name, avatar_url, tradition
  `) as User[];
  return user;
}

// ---------- e-mail e senha ----------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function credentials(body: Record<string, unknown>) {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!EMAIL_RE.test(email) || email.length > 254) throw new InputError("Informe um e-mail válido.");
  if (!password) throw new InputError("Informe a senha.");
  if (password.length > 128) throw new InputError("A senha passa de 128 caracteres.");
  return { email, password };
}

export async function registerWithPassword(body: Record<string, unknown>) {
  const { email, password } = credentials(body);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) throw new InputError("Informe seu nome.");
  if (name.length > 80) throw new InputError("O nome passa de 80 caracteres.");
  if (password.length < 8) throw new InputError("A senha precisa ter pelo menos 8 caracteres.");

  const hash = await hashPassword(password);
  const [user] = (await sql`
    INSERT INTO users (email, name, password_hash, last_login_at)
    VALUES (${email}, ${name}, ${hash}, now())
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, name, avatar_url, tradition
  `) as User[];
  if (!user) throw new InputError("Este e-mail já tem uma conta. Entre com a senha ou com o Google.", 409);
  return user;
}

export async function loginWithPassword(body: Record<string, unknown>) {
  const { email, password } = credentials(body);
  const [row] = (await sql`
    SELECT id, email, name, avatar_url, tradition, password_hash, google_id FROM users WHERE email = ${email}
  `) as (User & { password_hash: string | null; google_id: string | null })[];

  if (!(await verifyPassword(password, row?.password_hash ?? null))) {
    if (row && !row.password_hash && row.google_id) {
      throw new InputError("Esta conta foi criada com o Google. Use “Continuar com o Google”.", 401);
    }
    throw new InputError("E-mail ou senha incorretos.", 401);
  }

  await sql`UPDATE users SET last_login_at = now() WHERE id = ${row.id}`;
  const { password_hash: _h, google_id: _g, ...user } = row;
  return user as User;
}

function sessionKey() {
  return new TextEncoder().encode(requireEnv("SESSION_SECRET"));
}

export async function createSessionToken(user: User) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(sessionKey());
}

/** Lê o "Authorization: Bearer <token>" e devolve o usuário da sessão. */
export async function getSessionUser(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AuthError("Sessão ausente.");

  let userId: string | undefined;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ["HS256"] });
    userId = payload.sub;
  } catch {
    throw new AuthError("Sessão inválida ou expirada.");
  }

  const [user] = (await sql`
    SELECT id, email, name, avatar_url, tradition FROM users WHERE id = ${userId}
  `) as User[];
  if (!user) throw new AuthError("Usuário não encontrado.");
  return user;
}

export function errorResponse(err: unknown) {
  if (err instanceof AuthError) {
    return Response.json({ ok: false, error: err.message }, { status: 401 });
  }
  if (err instanceof InputError) {
    return Response.json({ ok: false, error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ ok: false, error: "Erro interno." }, { status: 500 });
}
