import { dispatch } from "../lib/router.js";

// /api/profile, /api/preferences, /api/intentions, /api/journal, /api/reminders, /api/saved, /api/progress
export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;

export function OPTIONS() {
  return new Response(null, { status: 204 });
}
