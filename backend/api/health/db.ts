import { checkDatabase } from "../../lib/db.js";

// GET /api/health/db
export async function GET() {
  try {
    const { now, version } = await checkDatabase();
    return Response.json({ ok: true, now, version });
  } catch (err) {
    console.error(err);
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
