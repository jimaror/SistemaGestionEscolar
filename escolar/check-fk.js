const { Client } = require('pg');
const CONN = 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

(async () => {
  const c = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const r = await c.query(
    "SELECT conname, confrelid::regclass AS table_name FROM pg_constraint WHERE conname = 'fk43ey3n3iowf57279nrqbge64t'"
  );
  console.log('Constraint:', r.rows);

  const a = await c.query('SELECT id_anio_escolar FROM anios_escolares ORDER BY id_anio_escolar');
  console.log('anios_escolares IDs:', a.rows.map(r => r.id_anio_escolar).join(', '));

  const g = await c.query('SELECT id_grado FROM grados ORDER BY id_grado');
  console.log('grados IDs:', g.rows.map(r => r.id_grado).join(', '));

  const m = await c.query('SELECT id_maestro FROM maestros ORDER BY id_maestro');
  console.log('maestros IDs:', m.rows.map(r => r.id_maestro).join(', '));

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });