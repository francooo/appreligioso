import "dotenv/config";

const { checkDatabase } = await import("../lib/db.js");

try {
  const { now, version } = await checkDatabase();
  console.log("Conectado ao Neon!");
  console.log("now():", now);
  console.log("version():", version);
} catch (err) {
  console.error("Falha ao conectar:", (err as Error).message);
  process.exitCode = 1;
}
