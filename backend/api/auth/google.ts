import {
  createSessionToken,
  errorResponse,
  upsertGoogleUser,
  verifyGoogleIdToken,
} from "../../lib/auth.js";

// POST /api/auth/google  { idToken }  ->  { ok, token, user }
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { idToken?: unknown } | null;
    if (typeof body?.idToken !== "string") {
      return Response.json({ ok: false, error: "idToken obrigatório." }, { status: 400 });
    }
    const google = await verifyGoogleIdToken(body.idToken);
    const user = await upsertGoogleUser(google);
    const token = await createSessionToken(user);
    return Response.json({ ok: true, token, user });
  } catch (err) {
    return errorResponse(err);
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
