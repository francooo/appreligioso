import { errorResponse, getSessionUser } from "./auth.js";
import { COLLECTIONS, ITEMS } from "./resources.js";

/** Despacha /api/<recurso> e /api/<recurso>/<id> para os handlers de lib/resources.ts. */
export async function dispatch(request: Request) {
  try {
    const [, resource, id] = new URL(request.url).pathname.split("/").filter(Boolean); // ["api", recurso, id?]
    const table = id ? ITEMS : COLLECTIONS;
    const methods = table[resource ?? ""];
    if (!methods) return Response.json({ ok: false, error: "Rota não encontrada." }, { status: 404 });

    const handler = methods[request.method as keyof typeof methods];
    if (!handler) return Response.json({ ok: false, error: "Método não permitido." }, { status: 405 });

    const user = await getSessionUser(request);
    const result = await handler({ user, request, id });
    return Response.json({ ok: true, ...(result as object) });
  } catch (err) {
    return errorResponse(err);
  }
}
