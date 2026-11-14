const { Client } = require('pg');
const CONN = 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

(async () => {
  const c = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  try {
    await c.query("INSERT INTO anios_escolares (id_anio_escolar,anio,fecha_inicio,fecha_fin,activo) VALUES (1, 2026, '2026-02-02', '2026-11-27', true)");
    console.log('Insert OK');
  } catch (e) {
    console.log('Error:', e.message);
  }

  const r = await c.query('SELECT id_anio_escolar, anio, activo FROM anios_escolares ORDER BY id_anio_escolar');
  console.log('anios_escolares:', r.rows);

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });