const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONN = process.env.RENDER_PG_URL || 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

// Orden de carga respetando dependencias (padres primero)
const ORDER = [
  'roles','anios_escolares','grados','asignaturas','usuarios','maestros','alumnos','tutores',
  'secciones','alumno_tutor','matriculas','asignaciones_docentes','evaluaciones','notas','asistencias',
  'tareas','entregas_tareas','materiales','justificaciones_ausencia','reuniones','reunion_participantes',
  'conversaciones','conversacion_participantes','mensajes'
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
  for (const t of [...ORDER].reverse()) {
    try {
      await client.query(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE`);
    } catch (e) {
      console.log('  No se pudo truncar', t, '->', e.message.substring(0, 80));
    }
  }

  // Agrupar INSERTs por tabla
  const byTable = {};
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(s => s.includes('INSERT INTO'));
  for (const stmt of statements) {
    const m = stmt.match(/INSERT INTO (\w+)/);
    if (!m) continue;
    const t = m[1];
    if (!byTable[t]) byTable[t] = [];
    byTable[t].push(stmt);
  }

  console.log('\nCargando en orden de dependencias...');
  let ok = 0, fail = 0;
  for (const t of ORDER) {
    const stmts = byTable[t] || [];
    let tOk = 0, tFail = 0;
    for (const stmt of stmts) {
      try {
        await client.query(stmt);
        ok++; tOk++;
      } catch (e) {
        fail++; tFail++;
        if (tFail <= 3) console.log('  Error en', t, '->', e.message.substring(0, 100));
      }
    }
    console.log(`  ${t.padEnd(30)} ${tOk} ok, ${tFail} errores`);
  }

  console.log(`\nTotal inserts OK: ${ok}, Errores: ${fail}`);

  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
  );
  console.log('\nTablas:');
  let total = 0;
  for (const row of tables.rows) {
    const count = await client.query(`SELECT COUNT(*)::int AS n FROM "${row.table_name}"`);
    total += count.rows[0].n;
    console.log(`  ${row.table_name.padEnd(30)} ${count.rows[0].n}`);
  }
  console.log('\nTOTAL REGISTROS:', total);

  await client.end();
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});