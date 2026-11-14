/**
 * Exporta los datos del sistema (via la API) a un archivo SQL compatible
 * con PostgreSQL, para cargarlos en la base de datos de la nube.
 *
 * Como el esquema lo crea Hibernate (ddl-auto=update en la nube), aqui solo
 * se generan los INSERTs. Los nombres de columna y las claves foraneas se
 * leen del archivo esquema-entities.json, que genera extraer-esquema.js
 * a partir de las entidades JPA. Asi el volcado siempre coincide con el
 * esquema real.
 *
 * Uso:  node extraer-esquema.js && node exportar-datos.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const TOKEN = fs.readFileSync(
  "C:/Users/JMarkz/AppData/Local/Temp/opencode/token.txt",
  "utf8"
).trim();

const BASE = process.env.API_BASE || "http://localhost:8080";
const ESQUEMA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "esquema-entities.json"), "utf8")
);

/**
 * Tablas a exportar, en orden de dependencia.
 *   tabla = nombre real en la base de datos
 *   api   = endpoint del backend (si falta, es una tabla fija)
 */
const TABLAS = [
  { tabla: "roles", fija: [
      { id: 1, nombre: "Director" },
      { id: 2, nombre: "Maestro" },
      { id: 3, nombre: "Alumno" },
      { id: 4, nombre: "Tutor" },
    ] },
  { tabla: "anios_escolares", api: "anios-escolares" },
  { tabla: "grados", api: "grados" },
  { tabla: "secciones", api: "secciones" },
  { tabla: "asignaturas", api: "asignaturas" },
  { tabla: "usuarios", api: "usuarios" },
  { tabla: "maestros", api: "maestros" },
  { tabla: "alumnos", api: "alumnos" },
  { tabla: "tutores", api: "tutores" },
  { tabla: "alumno_tutor", api: "alumno-tutores" },
  { tabla: "matriculas", api: "matriculas" },
  { tabla: "asignaciones_docentes", api: "asignaciones-docentes" },
  { tabla: "evaluaciones", api: "evaluaciones" },
  { tabla: "notas", api: "notas" },
  { tabla: "asistencias", api: "asistencias" },
  { tabla: "tareas", api: "tareas" },
  { tabla: "entregas_tareas", api: "entregas-tareas" },
  { tabla: "materiales", api: "materiales" },
  { tabla: "justificaciones_ausencia", api: "justificaciones-ausencia" },
  { tabla: "reuniones", api: "reuniones" },
  { tabla: "reunion_participantes", api: "reunion-participantes" },
  { tabla: "conversaciones", api: "conversaciones" },
  { tabla: "conversacion_participantes", api: "conversacion-participantes" },
  { tabla: "mensajes", api: "mensajes" },
];

/**
 * Columnas que la API devuelve con otro nombre que la columna real.
 * La clave es "tabla.campoApi" y el valor la columna real
 * (null = la API lo agrega pero no es una columna).
 */
const RENOMBRE = {
  "usuarios.password": "password_hash",
  "usuarios.rol": null,            // la API lo agrega, no es una columna
  "usuarios.rolId": "id_rol",
  "usuarios.codigoUnico": "codigo_unico",
  "usuarios.createdAt": "created_at",
  "usuarios.fechaNacimiento": "fecha_nacimiento",
  "usuarios.telefonoAlterno": "telefono_alterno",
  "usuarios.fotoPerfil": "foto_perfil",

  "alumnos.codigoMined": "codigo_mined",
  "alumnos.colegioProcedencia": "colegio_procedencia",
  "alumnos.necesidadEspecial": "necesidad_especial",
  "alumnos.fechaIngreso": "fecha_ingreso",
  "alumnos.idUsuario": "id_usuario",
  "alumnos.nombre": "nombre",
  "alumnos.apellido": "apellido",
  "alumnos.correo": "correo",
  "alumnos.estado": "estado",

  "secciones.nombre": "nombre",
  "secciones.turno": "turno",
  "secciones.idAnioEscolar": "id_anio_escolar",
  "secciones.idGrado": "id_grado",
  "secciones.idMaestroGuia": "id_maestro_guia",

  "grados.nivel": "nivel",
  "grados.nombre": "nombre",
  "grados.orden": "orden",

  "anios_escolares.anio": "anio",
  "anios_escolares.fechaInicio": "fecha_inicio",
  "anios_escolares.fechaFin": "fecha_fin",

  "asignaturas.nombre": "nombre",
  "asignaturas.codigo": "codigo",
  "asignaturas.abreviatura": "abreviatura",
  "asignaturas.activo": "activo",

  "matriculas.fechaMatricula": "fecha_matricula",
  "matriculas.estado": "estado",
  "matriculas.observaciones": "observaciones",
  "matriculas.idAlumno": "id_alumno",
  "matriculas.idSeccion": "id_seccion",
  "matriculas.idAnioEscolar": "id_anio_escolar",

  "asignaciones_docentes.horasSemanales": "horas_semanales",
  "asignaciones_docentes.estado": "estado",
  "asignaciones_docentes.idAsignatura": "id_asignatura",
  "asignaciones_docentes.idSeccion": "id_seccion",
  "asignaciones_docentes.idMaestro": "id_maestro",

  "evaluaciones.titulo": "titulo",
  "evaluaciones.descripcion": "descripcion",
  "evaluaciones.tipo": "tipo",
  "evaluaciones.periodo": "periodo",
  "evaluaciones.puntajeMaximo": "puntaje_maximo",
  "evaluaciones.fechaPublicacion": "fecha_publicacion",
  "evaluaciones.fechaCierre": "fecha_cierre",
  "evaluaciones.estado": "estado",
  "evaluaciones.idAsignacionDocente": "id_asignacion_docente",

  "notas.calificacion": "calificacion",
  "notas.periodo": "periodo",
  "notas.observacion": "observacion",
  "notas.fechaRegistro": "fecha_registro",
  "notas.fechaModificacion": "fecha_modificacion",
  "notas.registradoPor": "registrado_por",
  "notas.idMatricula": "id_matricula",
  "notas.idEvaluacion": "id_evaluacion",

  "asistencias.fecha": "fecha",
  "asistencias.estado": "estado",
  "asistencias.observacion": "observacion",
  "asistencias.fechaRegistro": "fecha_registro",
  "asistencias.registradoPor": "registrado_por",
  "asistencias.idMatricula": "id_matricula",
  "asistencias.idAsignacionDocente": "id_asignacion_docente",

  "tareas.titulo": "titulo",
  "tareas.descripcion": "descripcion",
  "tareas.fechaLimite": "fecha_limite",
  "tareas.valorPuntos": "valor_puntos",
  "tareas.archivoAdjunto": "archivo_adjunto",
  "tareas.estado": "estado",
  "tareas.idAsignacionDocente": "id_asignacion_docente",
  "tareas.idEvaluacion": "id_evaluacion",

  "entregas_tareas.contenido": "contenido",
  "entregas_tareas.archivoEntrega": "archivo_entrega",
  "entregas_tareas.observacionProfesor": "observacion_profesor",
  "entregas_tareas.fechaEntrega": "fecha_entrega",
  "entregas_tareas.estado": "estado",
  "entregas_tareas.idTarea": "id_tarea",
  "entregas_tareas.idAlumno": "id_alumno",

  "materiales.titulo": "titulo",
  "materiales.descripcion": "descripcion",
  "materiales.tipo": "tipo",
  "materiales.rutaArchivo": "ruta_archivo",
  "materiales.fechaPublicacion": "fecha_publicacion",
  "materiales.idAsignacionDocente": "id_asignacion_docente",

  "justificaciones_ausencia.motivo": "motivo",
  "justificaciones_ausencia.fechaDesde": "fecha_desde",
  "justificaciones_ausencia.fechaHasta": "fecha_hasta",
  "justificaciones_ausencia.documentoAdjunto": "documento_adjunto",
  "justificaciones_ausencia.fechaAprobacion": "fecha_aprobacion",
  "justificaciones_ausencia.observacionAprobacion": "observacion_aprobacion",
  "justificaciones_ausencia.estado": "estado",
  "justificaciones_ausencia.idAsistencia": "id_asistencia",
  "justificaciones_ausencia.aprobadoPor": "aprobado_por",

  "reuniones.titulo": "titulo",
  "reuniones.descripcion": "descripcion",
  "reuniones.enlace": "enlace",
  "reuniones.fechaHora": "fecha_hora",
  "reuniones.duracionMinutos": "duracion_minutos",
  "reuniones.estado": "estado",
  "reuniones.fechaCreacion": "fecha_creacion",
  "reuniones.idAsignacionDocente": "id_asignacion_docente",
  "reuniones.creadaPor": "creada_por",

  "reunion_participantes.confirmado": "confirmado",
  "reunion_participantes.asistio": "asistio",
  "reunion_participantes.observacion": "observacion",
  "reunion_participantes.idReunion": "id_reunion",
  "reunion_participantes.idUsuario": "id_usuario",

  "conversaciones.titulo": "titulo",
  "conversaciones.tipo": "tipo",
  "conversaciones.creadaPor": "creada_por",
  "conversaciones.fechaCreacion": "fecha_creacion",

  "conversacion_participantes.fechaUltimaLectura": "fecha_ultima_lectura",
  "conversacion_participantes.idConversacion": "id_conversacion",
  "conversacion_participantes.idUsuario": "id_usuario",

  "mensajes.contenido": "contenido",
  "mensajes.fechaEnvio": "fecha_envio",
  "mensajes.leido": "leido",
  "mensajes.idConversacion": "id_conversacion",
  "mensajes.idRemitente": "id_remitente",

  "maestros.numeroInss": "numero_inss",
  "maestros.especialidad": "especialidad",
  "maestros.titulo": "titulo",
  "maestros.fechaIngreso": "fecha_ingreso",
  "maestros.correo": "correo",
  "maestros.telefono": "telefono",
  "maestros.idUsuario": "id_usuario",

  "tutores.ocupacion": "ocupacion",
  "tutores.lugarTrabajo": "lugar_trabajo",
  "tutores.telefonoTrabajo": "telefono_trabajo",
  "tutores.correoPersonal": "correo_personal",
  "tutores.direccionTrabajo": "direccion_trabajo",
  "tutores.horarioAtencion": "horario_atencion",
  "tutores.idUsuario": "id_usuario",

  "alumno_tutor.parentesco": "parentesco",
  "alumno_tutor.esPrincipal": "es_principal",
  "alumno_tutor.idAlumno": "id_alumno",
  "alumno_tutor.idTutor": "id_tutor",
};

/** Nombre de la clave primaria de cada tabla. */
const PK = {
  alumnos: "id_alumno",
  alumno_tutor: "id_alumno_tutor",
  anios_escolares: "id_anio_escolar",
  asignaciones_docentes: "id_asignacion",
  asignaturas: "id_asignatura",
  asistencias: "id_asistencia",
  conversaciones: "id_conversacion",
  conversacion_participantes: "id_participante",
  entregas_tareas: "id_entrega",
  evaluaciones: "id_evaluacion",
  grados: "id_grado",
  justificaciones_ausencia: "id_justificacion",
  maestros: "id_maestro",
  materiales: "id_material",
  matriculas: "id_matricula",
  mensajes: "id_mensaje",
  notas: "id_nota",
  reuniones: "id_reunion",
  reunion_participantes: "id_registro",
  roles: "id_rol",
  secciones: "id_seccion",
  tareas: "id_tarea",
  tutores: "id_tutor",
  usuarios: "id_usuario",
};

/**
 * Columnas de clave foranea por tabla: columna -> tabla destino.
 * Se deduce del tipo del campo en la entidad.
 */
function tablaDestino(tipo) {
  const t = tipo.replace(/\s/g, "");
  const mapa = {
    Alumno: "alumnos",
    Maestro: "maestros",
    Tutor: "tutores",
    Usuario: "usuarios",
    Rol: "roles",
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
  return mapa[t] || null;
}

/** Construye: tabla -> { columnaFk: tablaDestino } */
const FK_MAP = {};
for (const [tabla, info] of Object.entries(ESQUEMA)) {
  FK_MAP[tabla] = info.fkDestino || {};
}

/**
 * Para cada tabla: nombre de la columna PK y, para cada columna FK,
 * el nombre del campo que la API devuelve con ese valor.
 */
const ESTRUCTURA = {};
for (const [tabla, info] of Object.entries(ESQUEMA)) {
  const pk = PK[tabla];
  const campos = {};
  for (const col of info.columnas) {
    campos[col.nombre] = col.campo; // columna real -> campo de la API
  }
  // Los @JoinColumn no aparecen en @Column, se agregan aparte.
  for (const [colFk, campo] of Object.entries(info.fks || {})) {
    if (!campos[colFk]) campos[colFk] = campo;
  }
  ESTRUCTURA[tabla] = { pk, campos, fks: FK_MAP[tabla] || {} };
}

function pedir(ruta) {
  return new Promise((resolve) => {
    const u = new URL(BASE + "/api/" + ruta);
    const opts = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.pathname + u.search,
      method: "GET",
      headers: { Authorization: "Bearer " + TOKEN },
      timeout: 20000,
    };
    const r = http.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try {
          const j = JSON.parse(d);
          resolve(Array.isArray(j) ? j : j.content || []);
        } catch (e) {
          resolve([]);
        }
      });
    });
    r.on("timeout", () => { r.destroy(); resolve([]); });
    r.on("error", () => resolve([]));
    r.end();
  });
}

/** Escapa un valor para SQL de PostgreSQL. */
function esc(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  let s = String(v);
  // Marca los timestamps con 'T' para que Postgres no los ambiguamente
  // interprete como 'YYYY-MM-DD HH:MM:SS'.
  if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) {
    s = "T" + s.replace(" ", "T");
  }
  return "'" + s.replace(/'/g, "''") + "'";
}

/**
 * Busca en el objeto de la API el valor de una columna.
 * Primero prueba el campo mapeado; si no esta, busca variantes
 * (idAlumno, alumno, id_alumno, etc.).
 */
function valorDe(fila, columna, campoMapeado) {
  if (campoMapeado && fila[campoMapeado] !== undefined) return fila[campoMapeado];

  // Variantes por convencion de nombres.
  const variantes = [
    columna,
    columna.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
    "id" + columna.charAt(0).toUpperCase() + columna.slice(1),
  ];
  for (const v of variantes) {
    if (fila[v] !== undefined) return fila[v];
  }
  // Busca cualquier clave que termine con el nombre de la columna.
  for (const clave of Object.keys(fila)) {
    if (clave.toLowerCase().endsWith(columna.toLowerCase())) return fila[clave];
  }
  return undefined;
}

/**
 * Devuelve el nombre del campo que la API usa para una columna real.
 * Invierte el mapa RENOMBRE: tabla.columna -> campo API.
 */
const CAMPO_API = {};
for (const [tabla, info] of Object.entries(ESQUEMA)) {
  CAMPO_API[tabla] = {};
  for (const [columna, campo] of Object.entries(info.campos || {})) {
    // El valor por defecto es el propio nombre de la columna.
    let campoApi = columna;
    // Busca en RENOMBRE el caso inverso.
    for (const [clave, valor] of Object.entries(RENOMBRE)) {
      if (!clave.startsWith(tabla + ".")) continue;
      const col = clave.slice(tabla.length + 1);
      if (valor === columna) campoApi = col;
    }
    CAMPO_API[tabla][columna] = campoApi;
  }
}

(async () => {
  const mapas = {}; // tabla -> { idOriginal: idNuevo }
  const sql = [];

  sql.push("-- ============================================================");
  sql.push("--  COLEGIO OTTO DE LA ROCHA - Datos exportados");
  sql.push("--  Generado: " + new Date().toISOString());
  sql.push("--");
  sql.push("--  1) El backend en la nube crea el esquema (ddl-auto=update).");
  sql.push("--  2) Cargar estos datos en PostgreSQL:");
  sql.push("--       psql \"postgresql://USER:PASS@HOST/escolar\" -f datos-postgres.sql");
  sql.push("-- ==============================================================");
  sql.push("");
  sql.push("SET client_encoding = 'UTF8';");
  sql.push("SET foreign_keys = OFF;");
  sql.push("");

  let total = 0;
  let advertencias = 0;

  for (const t of TABLAS) {
    const est = ESTRUCTURA[t.tabla];
    if (!est) {
      console.log("  ?? tabla sin esquema conocido: " + t.tabla);
      continue;
    }

    const filas = t.fija ? t.fija : await pedir(t.api);
    if (!filas || filas.length === 0) {
      console.log("  (vacio) " + t.tabla);
      continue;
    }

    // Mapa de ids: original -> nuevo (1..N)
    const mapa = {};
    filas.forEach((f, i) => {
      const idOrig = f.id !== undefined ? f.id : f[est.pk.replace(/^id_/, "")];
      if (idOrig !== undefined) mapa[idOrig] = i + 1;
    });
    mapas[t.tabla] = mapa;

    sql.push("-- ---------------------------------------------------------");
    sql.push("--  " + t.tabla + " (" + filas.length + " registros)");
    sql.push("-- ---------------------------------------------------------");

    for (const fila of filas) {
      const cols = [est.pk];
      const vals = [];

      // Valor de la PK: se remapea a 1..N
      const idOrig = fila.id !== undefined ? fila.id : fila[est.pk.replace(/^id_/, "")];
      vals.push(mapa[idOrig] !== undefined ? String(mapa[idOrig]) : "NULL");

      // Resto de columnas del esquema
      for (const defCol of ESQUEMA[t.tabla].columnas) {
        const columna = defCol.nombre;
        if (columna === est.pk) continue;

        // Campo que usa la API para esta columna.
        const campoApi = CAMPO_API[t.tabla][columna] || columna;

        // Si el mapeo dice que esta columna no existe, se omite.
        if (RENOMBRE[t.tabla + "." + campoApi] === null) continue;

        const valor = valorDe(fila, columna, campoApi);
        if (valor === undefined) continue;

        // Si es clave foranea, remapear el id.
        const destino = est.fks[columna];
        if (destino && mapas[destino] && typeof valor === "number") {
          const nuevo = mapas[destino][valor];
          cols.push(columna);
          vals.push(nuevo === undefined ? "NULL" : String(nuevo));
        } else if (valor !== null && typeof valor === "object") {
          // Objetos anidados: usar su id.
          const idObj = valor.id;
          if (idObj !== undefined && destino && mapas[destino]) {
            cols.push(columna);
            vals.push(
              mapas[destino][idObj] !== undefined ? String(mapas[destino][idObj]) : "NULL"
            );
          }
        } else {
          cols.push(columna);
          vals.push(esc(valor));
        }
      }

      sql.push(
        "INSERT INTO " + t.tabla + " (" + cols.join(", ") + ") VALUES (" +
        vals.join(", ") + ");"
      );
    }

    // Ajusta la secuencia para los INSERTs futuros.
    sql.push(
      "SELECT setval(pg_get_serial_sequence('" + t.tabla + "', '" + est.pk + "'), " +
      (filas.length + 1) + ", false);"
    );
    sql.push("");

    total += filas.length;
    console.log("  OK  " + t.tabla + " -> " + filas.length + " registros");
  }

  sql.push("SET foreign_keys = ON;");
  sql.push("");
  sql.push("-- Fin de la carga. Total de registros: " + total);

  const salida = path.join(__dirname, "datos-postgres.sql");
  fs.writeFileSync(salida, sql.join("\n"), "utf8");
  console.log("\nArchivo generado: datos-postgres.sql (" + total + " registros)");
})();
