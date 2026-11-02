import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { sql } from "./db.js";

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
    INSERT INTO users (google_id, email, name, avatar_url, last_login_at)
    VALUES (${g.googleId}, ${g.email}, ${g.name}, ${g.picture}, now())
    ON CONFLICT (email) DO UPDATE SET
      google_id     = EXCLUDED.google_id,
      name          = COALESCE(EXCLUDED.name, users.name),
      avatar_url    = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      last_login_at = now(),
      updated_at    = now()
    RETURNING id, email, name, avatar_url, tradition
  `) as User[];
  return user;
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
