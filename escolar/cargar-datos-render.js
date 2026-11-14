const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONN = process.env.RENDER_PG_URL || 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

async function main() {
  const sqlPath = path.join(__dirname, 'datos-postgres.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Conectando a Render PostgreSQL...');
  const client = new Client({
    connectionString: CONN,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Conectado. Cargando datos...');

  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let ok = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 5) console.log('Error en:', stmt.substring(0, 80), '->', e.message);
    }
  }

  console.log(`\nInserts OK: ${ok}, Errores: ${fail}`);

  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('\nTablas en la BD:');
  for (const row of tables.rows) {
    const count = await client.query(`SELECT COUNT(*)::int AS n FROM "${row.table_name}"`);
    console.log(`  ${row.table_name.padEnd(30)} ${count.rows[0].n} registros`);
  }

  await client.end();
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});