const { Client } = require('pg');
const CONN = 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

(async () => {
  const c = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const r = await c.query(
    "SELECT id_usuario, username, nombre, rol_id, password FROM usuarios WHERE username IN ('maestro1', 'director1', 'alumno_juan') ORDER BY username"
  );
  console.log('Usuarios:');
  r.rows.forEach(u => console.log(`  ${u.username} | id=${u.id_usuario} | rol=${u.rol_id} | pass=${u.password}`));

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });