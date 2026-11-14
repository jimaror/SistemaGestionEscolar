const { Client } = require('pg');
const fs = require('fs');
const CONN = 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

(async () => {
  const c = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const sql = fs.readFileSync('datos-postgres.sql', 'utf8');
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

  const aniosStmts = statements.filter(s => s.startsWith('INSERT INTO anios_escolares'));
  console.log('Anios statements found:', aniosStmts.length);
  aniosStmts.forEach((s, i) => {
    console.log(`\n[${i}] ${s.substring(0, 120)}`);
  });

  // Try inserting the first one
  try {
    await c.query(aniosStmts[0]);
    console.log('\nInsert [0] OK');
  } catch (e) {
    console.log('\nInsert [0] Error:', e.message);
  }

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });