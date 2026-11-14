const { Client } = require('pg');
const CONN = 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

(async () => {
  const c = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const r = await c.query(
    "SELECT conname, confrelid::regclass AS ref_table, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conname = 'fkrt1q0dtvbfkt3ds0k6k5g8uum'"
  );
  console.log('Constraint:', r.rows);

  const cols = await c.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'secciones' ORDER BY ordinal_position"
  );
  console.log('secciones columns:', cols.rows.map(r => r.column_name).join(', '));

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });