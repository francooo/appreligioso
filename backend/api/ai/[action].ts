import { errorResponse, getSessionUser } from "../../lib/auth.js";
import { AI_ACTIONS } from "../../lib/ai.js";

// Todas as rotas /api/ai/* numa só função (limite de funções do plano Hobby da Vercel).
// Os handlers ficam em lib/ai.ts.

async function handle(request: Request) {
  try {
    const action = new URL(request.url).pathname.split("/").filter(Boolean).pop() ?? "";
    const methods = AI_ACTIONS[action];
    if (!methods) return Response.json({ ok: false, error: "Rota não encontrada." }, { status: 404 });
    const handler = methods[request.method as keyof typeof methods];
    if (!handler) return Response.json({ ok: false, error: "Método não permitido." }, { status: 405 });

    const user = await getSessionUser(request);
    const result = await handler({ user, request });
    return Response.json({ ok: true, ...(result as object) });
  } catch (err) {
    return errorResponse(err);
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
