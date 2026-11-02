import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const { sql } = await import("../lib/db.js");

const dir = join(import.meta.dirname, "..", "db", "migrations");

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
  name       text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const applied = new Set(
  ((await sql`SELECT name FROM schema_migrations`) as { name: string }[]).map((r) => r.name)
);

const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const text = await readFile(join(dir, file), "utf8");
  const statements = text
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
  await sql.transaction([
    ...statements.map((s) => sql.query(s)),
    sql`INSERT INTO schema_migrations (name) VALUES (${file})`,
  ]);
  console.log(`aplicada: ${file}`);
}

console.log("migrations em dia.");
