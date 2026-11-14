const { Client } = require('pg');
const fs = require('fs');
const CONN = 'postgresql://escolar_dxpd_user:9mAw3Yrt9aWJJ8nOyuQ9tLe45ig2Al85@dpg-dbrt4orrjlhs73cgo8r0-a.oregon-postgres.render.com/escolar_dxpd';

(async () => {
  const c = new Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await c.connect();

  // Get all boolean columns
  const r = await c.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE data_type = 'boolean' AND table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  console.log('Boolean columns:');
  const boolMap = {};
  for (const row of r.rows) {
    console.log(`  ${row.table_name}.${row.column_name}`);
    if (!boolMap[row.table_name]) boolMap[row.table_name] = [];
    boolMap[row.table_name].push(row.column_name);
  }

  // Read SQL
  let sql = fs.readFileSync('datos-postgres.sql', 'utf8');

  // Remove brackets
  sql = sql.replace(/\[/g, '').replace(/\]/g, '');

  // Remove SET foreign_keys lines
  sql = sql.replace(/SET foreign_keys = (ON|OFF);/g, '');

  // Fix boolean columns: replace , 1) and , 0) with true/false for boolean tables/columns
  // Simpler: for each table, find INSERT lines and fix boolean columns
  const lines = sql.split('\n');
  const out = [];
  for (const line of lines) {
    let fixed = line;
    const m = line.match(/^INSERT INTO (\w+) \(/);
    if (m) {
      const table = m[1];
      const boolCols = boolMap[table] || [];
      if (boolCols.length > 0) {
        // Parse column list
        const colMatch = line.match(/INSERT INTO \w+ \(([^)]+)\)/);
        if (colMatch) {
          const cols = colMatch[1].split(',').map(s => s.trim());
          // Find positions of boolean columns
          const boolPositions = [];
          cols.forEach((col, i) => {
            if (boolCols.includes(col)) boolPositions.push(i);
          });
          if (boolPositions.length > 0) {
            // Parse values
            const valMatch = line.match(/VALUES \((.*)\);\s*$/);
            if (valMatch) {
              const vals = valMatch[1].split(',').map(s => s.trim());
              for (const pos of boolPositions) {
                if (vals[pos] === '1') vals[pos] = 'true';
                else if (vals[pos] === '0') vals[pos] = 'false';
              }
              fixed = line.substring(0, line.indexOf('VALUES')) + 'VALUES (' + vals.join(', ') + ');';
            }
          }
        }
      }
    }
    out.push(fixed);
  }

  fs.writeFileSync('datos-postgres.sql', out.join('\n'), 'utf8');
  console.log('\nSQL fixed and saved.');

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });