/**
 * Prueba de humo: valida que el esquema que Spring Boot crea en PostgreSQL
 * es compatible con las entidades JPA, y que el SQL de datos generado
 * (datos-postgres.sql) se puede cargar.
 *
 * Usa una base PostgreSQL gratuita temporal de Neon (sin cuenta).
 */
const { Client } = require("pg");

// Base de datos de pruebas gratuita (Neon) - se crea sola si no existe.
const CONN = process.env.PG_CONN;

async function main() {
  if (!CONN) {
    console.log("Falta la variable PG_CONN");
    return;
  }

  const client = new Client({
    connectionString: CONN,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Conectado a PostgreSQL");

  const r = await client.query("SELECT version()");
  console.log("Version:", r.rows[0].version.split(",")[0]);

  // Listar tablas
  const t = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log("\nTablas:", t.rows.length);
  t.rows.forEach((row) => console.log("  -", row.table_name));

  // Contar registros si hay datos
  console.log("\nRegistros por tabla:");
  for (const row of t.rows) {
    const c = await client.query(
      `SELECT COUNT(*)::int AS n FROM "${row.table_name}"`
    );
    if (c.rows[0].n > 0) {
      console.log(`  ${row.table_name.padEnd(28)} ${c.rows[0].n}`);
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
