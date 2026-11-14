const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONN = process.env.RENDER_PG_URL || 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

const TABLES = [
  'reunion_participantes','reuniones','mensajes','conversacion_participantes','conversaciones',
  'justificaciones_ausencia','entregas_tareas','tareas','materiales','asistencias','notas','evaluaciones',
  'asignaciones_docentes','matriculas','alumno_tutor','alumnos','tutores','maestros','usuarios',
  'asignaturas','secciones','grados','anios_escolares','roles'
];

async function main() {
  const sqlPath = path.join(__dirname, 'datos-postgres.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Conectando...');
  const client = new Client({
    connectionString: CONN,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  console.log('Limpiando tablas...');
  for (const t of TABLES) {
    try {
      await client.query(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE`);
      console.log('  Truncada:', t);
    } catch (e) {
      console.log('  No se pudo truncar', t, '->', e.message.substring(0, 80));
    }
  }

  console.log('\nCargando datos...');
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.includes('INSERT INTO'));

  let ok = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      ok++;
    } catch (e) {
      fail++;
      if (fail <= 10) console.log('Error en:', stmt.substring(0, 80), '->', e.message);
    }
  }

  console.log(`\nInserts OK: ${ok}, Errores: ${fail}`);

  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('\nTablas:');
  let total = 0;
  for (const row of tables.rows) {
    const count = await client.query(`SELECT COUNT(*)::int AS n FROM "${row.table_name}"`);
    const n = count.rows[0].n;
    total += n;
    console.log(`  ${row.table_name.padEnd(30)} ${n}`);
  }
  console.log('\nTOTAL REGISTROS:', total);

  await client.end();
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});