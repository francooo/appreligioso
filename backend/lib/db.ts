import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL não definida (configure em .env ou nas env vars da Vercel).");
}

export const sql = neon(databaseUrl);

export async function checkDatabase() {
  const [row] = await sql`SELECT now() AS now, version() AS version`;
  return row as { now: string; version: string };
}
