import { dispatch } from "../../lib/router.js";

// /api/intentions/:id, /api/journal/:id, /api/reminders/:id, /api/saved/:id
export const GET = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
