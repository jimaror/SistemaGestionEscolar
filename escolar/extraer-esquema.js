const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'src', 'main', 'java', 'com', 'unmrma', 'escolar', 'modelo');

// Extrae de cada entidad:
//   tabla -> columnas (con tipo simple) y claves foraneas (columna -> tabla destino)
const tablas = {};

for (const archivo of fs.readdirSync(DIR)) {
  if (!archivo.endsWith('.java')) continue;
  const texto = fs.readFileSync(path.join(DIR, archivo), 'utf8');

  const mTabla = texto.match(/@Table\(\s*name\s*=\s*"([^"]+)"/);
  if (!mTabla) continue;
  const tabla = mTabla[1];

  // Tipo de la clave primaria (para el cast en el SQL)
  let tipoId = 'Integer';
  const mId = texto.match(/@Id[\s\S]{0,200}?private\s+(\w+)\s+id;/);
  if (mId) tipoId = mId[1];

  // Columnas simples: @Column(name = "x") ... private Tipo campo;
  const columnas = [];
  const reCol = /@Column\(\s*name\s*=\s*"([^"]+)"[^)]*\)\s*(?:@NotNull[^;]*?)?private\s+([\w<>.,\s]+?)\s+(\w+)\s*;/gs;
  let m;
  while ((m = reCol.exec(texto)) !== null) {
    columnas.push({ nombre: m[1], tipo: m[2].trim(), campo: m[3] });
  }

  // Relaciones: @JoinColumn(name = "x") private Tipo campo;
  const fks = {};
  const reFk = /@JoinColumn\(\s*name\s*=\s*"([^"]+)"[^)]*\)\s*private\s+([\w<>.,\s]+?)\s+(\w+)\s*;/gs;
  while ((m = reFk.exec(texto)) !== null) {
    fks[m[1]] = m[3]; // columna -> nombre del campo de la relacion
    // La columna de la FK tambien es una columna real de la tabla.
    if (!columnas.some((c) => c.nombre === m[1])) {
      columnas.push({ nombre: m[1], tipo: m[2].trim(), campo: m[3], esFk: true });
    }
  }

  tablas[tabla] = { archivo, tipoId, columnas, fks };
}

// Deduce la tabla destino de cada FK a partir del tipo declarado
// en el @JoinColumn (por ejemplo "Usuario" -> tabla "usuarios").
const SINGULAR = {
  Usuario: "usuarios",
  Rol: "roles",
  Alumno: "alumnos",
  Maestro: "maestros",
  Tutor: "tutores",
  Grado: "grados",
  Seccion: "secciones",
  Asignatura: "asignaturas",
  AnioEscolar: "anios_escolares",
  Matricula: "matriculas",
  AsignacionDocente: "asignaciones_docentes",
  Evaluacion: "evaluaciones",
  Asistencia: "asistencias",
  Tarea: "tareas",
  EntregaTarea: "entregas_tareas",
  Material: "materiales",
  JustificacionAusencia: "justificaciones_ausencia",
  Reunion: "reuniones",
  ReunionParticipante: "reunion_participantes",
  Conversacion: "conversaciones",
  ConversacionParticipante: "conversacion_participantes",
  Mensaje: "mensajes",
};

const tipoATabla = {};
for (const info of Object.values(tablas)) {
  for (const [col, campo] of Object.entries(info.fks || {})) {
    const defCol = info.columnas.find((c) => c.campo === campo);
    if (!defCol) continue;
    // El tipo viene de la declaracion del campo de la relacion.
    const tipo = defCol.tipo.replace(/\s/g, '');
    if (SINGULAR[tipo]) tipoATabla[tipo] = SINGULAR[tipo];
  }
}

console.log('=== TABLAS DETECTADAS ===');
for (const [t, info] of Object.entries(tablas)) {
  console.log('\n' + t + '  (id: ' + info.tipoId + ')');
  console.log('  columnas: ' + info.columnas.map((c) => c.nombre).join(', '));

  // Guarda el destino de cada FK dentro del JSON para que el exportador
  // no tenga que deducirlo otra vez.
  info.fkDestino = {};
  const fks = Object.entries(info.fks).map(([c, campo]) => {
    const col2 = info.columnas.find((x) => x.campo === campo);
    const destino = col2 ? (tipoATabla[col2.tipo.replace(/\s/g, '')] || null) : null;
    if (destino) info.fkDestino[c] = destino;
    return c + ' -> ' + (destino || '?');
  });
  if (fks.length) console.log('  FKs: ' + fks.join(', '));
}

fs.writeFileSync(
  path.join(__dirname, 'esquema-entities.json'),
  JSON.stringify(tablas, null, 2),
  'utf8'
);
console.log('\n(esquema-entities.json generado)');
