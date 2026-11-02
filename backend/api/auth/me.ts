import { errorResponse, getSessionUser } from "../../lib/auth.js";

// GET /api/auth/me  (Authorization: Bearer <token>)  ->  { ok, user }
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    return Response.json({ ok: true, user });
  } catch (err) {
    return errorResponse(err);
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
