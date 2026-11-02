import {
  createSessionToken,
  errorResponse,
  getSessionUser,
  upsertGoogleUser,
  verifyGoogleIdToken,
} from "../../lib/auth.js";

// Todas as rotas /api/auth/* numa só função (limite de funções do plano Hobby da Vercel).
//   POST /api/auth/google  { idToken }  ->  { ok, token, user }
//   GET  /api/auth/me      (Authorization: Bearer <token>)  ->  { ok, user }

function actionOf(request: Request) {
  return new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
}

function notFound() {
  return Response.json({ ok: false, error: "Rota não encontrada." }, { status: 404 });
}

async function readJson<T>(request: Request): Promise<Partial<T>> {
  return ((await request.json().catch(() => null)) ?? {}) as Partial<T>;
}

export async function POST(request: Request) {
  try {
    switch (actionOf(request)) {
      case "google": {
        const { idToken } = await readJson<{ idToken: string }>(request);
        if (typeof idToken !== "string") {
          return Response.json({ ok: false, error: "idToken obrigatório." }, { status: 400 });
        }
        const user = await upsertGoogleUser(await verifyGoogleIdToken(idToken));
        return Response.json({ ok: true, token: await createSessionToken(user), user });
      }
      default:
        return notFound();
    }
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(request: Request) {
  try {
    switch (actionOf(request)) {
      case "me":
        return Response.json({ ok: true, user: await getSessionUser(request) });
      default:
        return notFound();
    }
  } catch (err) {
    return errorResponse(err);
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
