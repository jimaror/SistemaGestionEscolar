// Tipos que reflejan exactamente los DTO de respuesta del backend Spring Boot.

export interface Alumno {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  codigoMined: string | null;
  colegioProcedencia: string | null;
  necesidadEspecial: string | null;
  fechaIngreso: string | null;
  transporte: string | null;
  alergias: string | null;
  enfermedades: string | null;
  medicamentos: string | null;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  estado: string | null;
}

// Vínculo entre un alumno y su tutor (padre/madre/encargado).
export interface TutorResumen {
  id: number;
  ocupacion: string | null;
  lugarTrabajo: string | null;
  telefonoTrabajo: string | null;
  correoPersonal: string | null;
  horarioAtencion: string | null;
  direccionTrabajo: string | null;
  usuario?: Usuario | null;
}

export interface AlumnoTutor {
  id: number;
  alumnoId: number;
  tutorId: number;
  parentesco: string;
  esPrincipal: boolean;
  tutor?: TutorResumen | null;
}

export interface Nota {
  id: number;
  calificacion: number;
  periodo: string | null;
  matriculaId: number;
  evaluacionId: number;
  observacion: string | null;
  registradoPorId: number | null;
}

export interface Evaluacion {
  id: number;
  asignacionDocenteId: number;
  titulo: string;
  descripcion: string | null;
  tipo: string | null;
  periodo: string | null;
  puntajeMaximo: number | null;
  fechaPublicacion: string | null;
  fechaCierre: string | null;
  estado: boolean | null;
}

export interface Matricula {
  id: number;
  alumnoId: number;
  seccionId: number | null;
  anioEscolarId: number | null;
  fechaMatricula: string | null;
  estado: string | null;
  observaciones: string | null;
}

export interface Asistencia {
  id: number;
  matriculaId: number;
  asignacionDocenteId: number;
  fecha: string | null;
  estado: string | null;
  observacion: string | null;
  registradoPorId: number | null;
  fechaRegistro: string | null;
}

export interface Reunion {
  id: number;
  asignacionDocenteId: number;
  titulo: string;
  descripcion: string | null;
  enlace: string | null;
  fechaHora: string | null;
  duracionMinutos: number | null;
  estado: string | null;
  creadaPorId: number | null;
  fechaCreacion: string | null;
}

export interface AsignacionDocente {
  id: number;
  asignaturaId: number;
  seccionId: number;
  maestroId: number;
  horasSemanales: number | null;
  estado: boolean | null;
}

export interface AsignacionDocenteCrearRequest {
  asignaturaId: number;
  seccionId: number;
  maestroId: number;
  horasSemanales: number;
  estado: boolean;
}

export interface Asignatura {
  id: number;
  nombre: string;
  abreviatura: string | null;
  codigo: string | null;
  activo: boolean | null;
}

export interface Seccion {
  id: number;
  anioEscolarId: number | null;
  gradoId: number | null;
  nombre: string;
  turno: string;
  maestroGuiaId: number | null;
  cupoMaximo: number | null;
  estado: string | null;
  grado?: GradoResumen | null;
  anioEscolar?: { id: number; anio: number } | null;
  maestroGuia?: DocenteResumen | null;
}

export interface GradoResumen {
  id: number;
  nombre: string;
  nivel: string;
  orden?: number;
}

export interface MaestroResumen {
  id: number;
  nombre: string;
  apellido: string;
  especialidad: string | null;
}

export interface DocenteResumen {
  id: number;
  nombre: string;
  apellido: string;
  correo: string | null;
  usuario?: {
    id: number;
    username: string;
    email: string | null;
    rol: string;
  } | null;
}

export interface SeccionResumen {
  id: number;
  nombre: string;
  turno: string;
  gradoId?: number | null;
  grado?: GradoResumen | null;
  anioEscolarId?: number | null;
  anioEscolar?: { id: number; anio: number } | null;
}

export interface AsignacionDetalle {
  id: number;
  asignaturaId: number;
  seccionId: number;
  maestroId: number;
  asignatura?: Asignatura | null;
  seccion?: SeccionResumen | null;
  maestro?: DocenteResumen | null;
}

export interface Tarea {
  id: number;
  asignacionDocenteId: number | null;
  evaluacionId: number | null;
  titulo: string;
  descripcion: string | null;
  fechaPublicacion: string | null;
  fechaLimite: string;
  valorPuntos: number | null;
  archivoAdjunto: string | null;
  estado: boolean | null;
  asignacionDocente?: AsignacionDetalle | null;
  evaluacion?: {
    id: number;
    titulo: string;
    periodo: string | null;
    tipo: string | null;
  } | null;
}

export interface EntregaTarea {
  id: number;
  tareaId: number | null;
  alumnoId: number | null;
  contenido: string | null;
  archivoEntrega: string | null;
  fechaEntrega: string | null;
  estado: string | null;
  observacionProfesor: string | null;
  alumno?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
  tarea?: Tarea | null;
}

export interface Material {
  id: number;
  asignacionDocenteId: number;
  titulo: string;
  descripcion: string | null;
  tipo: string | null;
  rutaArchivo: string | null;
  fechaPublicacion: string | null;
  visible: boolean | null;
}

export interface Mensaje {
  id: number;
  conversacionId: number;
  remitenteId: number | null;
  contenido: string;
  fechaEnvio: string | null;
  leido: boolean | null;
}

export interface Conversacion {
  id: number;
  titulo: string;
  tipo: string | null;
  estado: boolean | null;
  creadaPorId: number | null;
  fechaCreacion: string | null;
}

export interface JustificacionAusencia {
  id: number;
  asistenciaId: number;
  motivo: string | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
  documentoAdjunto: string | null;
  estado: string | null;
  aprobadoPorId: number | null;
  fechaAprobacion: string | null;
  observacionAprobacion: string | null;
}

export interface Usuario {
  id: number;
  username: string;
  nombres: string | null;
  apellidos: string | null;
  email: string | null;
  rol: string | null;
  rolId: number | null;
  estado: string | null;
  telefono: string | null;
  telefonoAlterno: string | null;
  cedula: string | null;
  codigoUnico: string | null;
  fechaNacimiento: string | null;
  sexo: string | null;
  zona: string | null;
  direccion: string | null;
  barrio: string | null;
  referencias: string | null;
  fotoPerfil: string | null;
  createdAt: string | null;
}

export interface AnioEscolar {
  id: number;
  anio: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean | null;
}

export interface ConversacionParticipante {
  id: number;
  conversacionId: number;
  usuarioId: number;
  rolEnConversacion: string | null;
  fechaUltimaLectura: string | null;
  activo: boolean | null;
}

export interface AlumnoCrearRequest {
  idUsuario: number;
  codigoMined: string | null;
  colegioProcedencia: string | null;
  necesidadEspecial: string | null;
  fechaIngreso: string;
  transporte: string | null;
  alergias: string | null;
  enfermedades: string | null;
  medicamentos: string | null;
  correo: string;
  direccion: string | null;
  telefono: string | null;
}

export interface AlumnoActualizarRequest {
  codigoMined: string | null;
  colegioProcedencia: string | null;
  necesidadEspecial: string | null;
  fechaIngreso: string | null;
  transporte: string | null;
  alergias: string | null;
  enfermedades: string | null;
  medicamentos: string | null;
  correo: string | null;
  direccion: string | null;
  telefono: string | null;
}

// ===== Notas =====
export interface NotaCrearRequest {
  matriculaId: number;
  evaluacionId: number;
  calificacion: number;
  periodo: string | null;
  observacion: string | null;
}

export interface NotaActualizarRequest {
  calificacion: number;
  periodo: string | null;
  observacion: string | null;
}

// ===== Asistencias =====
export interface AsistenciaCrearRequest {
  matriculaId: number;
  asignacionDocenteId: number;
  fecha: string;
  estado: string;
  observacion: string | null;
}

export interface AsistenciaActualizarRequest {
  fecha: string;
  estado: string;
  observacion: string | null;
}

// ===== Tareas (el backend recibe la entidad) =====
export interface TareaRequest {
  id?: number;
  asignacionDocenteId: number;
  evaluacionId: number | null;
  titulo: string;
  descripcion: string | null;
  fechaPublicacion: string | null;
  fechaLimite: string;
  valorPuntos: number | null;
  archivoAdjunto: string | null;
  estado: boolean | null;
}

// ===== Materiales =====
export interface MaterialCrearRequest {
  asignacionDocenteId: number;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  rutaArchivo: string | null;
  visible: boolean;
}

export interface MaterialActualizarRequest {
  titulo: string | null;
  descripcion: string | null;
  tipo: string | null;
  rutaArchivo: string | null;
  visible: boolean | null;
}

// ===== Matrículas =====
export interface MatriculaCrearRequest {
  alumnoId: number;
  seccionId: number;
  anioEscolarId: number;
  fechaMatricula: string;
  estado: string;
  observaciones: string | null;
}

export interface MatriculaActualizarRequest {
  estado: string | null;
  observaciones: string | null;
}

// ===== Justificaciones =====
export interface JustificacionCrearRequest {
  asistenciaId: number;
  motivo: string;
  fechaDesde: string;
  fechaHasta: string;
  documentoAdjunto: string | null;
}

export interface JustificacionActualizarRequest {
  motivo: string | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
  documentoAdjunto: string | null;
  estado: string | null;
  observacionAprobacion: string | null;
}

// ===== Reuniones =====
export interface ReunionCrearRequest {
  asignacionDocenteId: number;
  titulo: string;
  descripcion: string | null;
  enlace: string;
  fechaHora: string;
  duracionMinutos: number | null;
  estado: string;
}

export interface ReunionActualizarRequest {
  titulo: string | null;
  descripcion: string | null;
  enlace: string | null;
  fechaHora: string | null;
  duracionMinutos: number | null;
  estado: string | null;
}
