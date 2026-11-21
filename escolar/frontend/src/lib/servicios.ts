import { api } from "@/lib/api";
import type {
  Alumno,
  AlumnoActualizarRequest,
  AlumnoCrearRequest,
  AlumnoTutor,
  AnioEscolar,
  AsignacionDocente,
  Asignatura,
  Asistencia,
  AsistenciaActualizarRequest,
  AsistenciaCrearRequest,
  Conversacion,
  ConversacionParticipante,
  EntregaTarea,
  Evaluacion,
  GradoResumen,
  JustificacionActualizarRequest,
  JustificacionAusencia,
  JustificacionCrearRequest,
  Material,
  MaterialActualizarRequest,
  MaterialCrearRequest,
  Matricula,
  MatriculaActualizarRequest,
  MatriculaCrearRequest,
  Mensaje,
  Nota,
  NotaActualizarRequest,
  NotaCrearRequest,
  Reunion,
  ReunionActualizarRequest,
  ReunionCrearRequest,
  Seccion,
  Tarea,
  TareaRequest,
  Usuario,
} from "@/lib/types";

async function obtener<T>(ruta: string): Promise<T> {
  const { data } = await api.get<T>(ruta);
  return data;
}

// Catálogos y listados permitidos por el backend según el rol autenticado.
export const listarAlumnos = () => obtener<Alumno[]>("/alumnos");
export const listarAlumnoTutores = () => obtener<AlumnoTutor[]>("/alumno-tutores");
export const listarNotas = () => obtener<Nota[]>("/notas");
export const listarEvaluaciones = () => obtener<Evaluacion[]>("/evaluaciones");
export const listarMatriculas = () => obtener<Matricula[]>("/matriculas");
export const listarAsistencias = () => obtener<Asistencia[]>("/asistencias");
export const listarReuniones = () => obtener<Reunion[]>("/reuniones");
export const listarAsignaciones = () =>
  obtener<AsignacionDocente[]>("/asignaciones-docentes");
export const listarAsignaturas = () => obtener<Asignatura[]>("/asignaturas");
export const listarSecciones = () => obtener<Seccion[]>("/secciones");
export const listarGrados = () => obtener<GradoResumen[]>("/grados");

// Subir un archivo al backend y obtener su URL para usar en materiales
export async function subirArchivo(archivo: File): Promise<string> {
  const formData = new FormData();
  formData.append("archivo", archivo);
  const { data } = await api.post<string>("/archivos/subir", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
export const listarGradosConOrden = () => obtener<GradoResumen[]>("/grados?ordenado=true");
export const listarMaestros = () => obtener<MaestroResumen[]>("/maestros");

// Funciones CRUD para Grados (solo Director puede crear/actualizar/eliminar)
export async function crearGrado(payload: { nombre: string; nivel: string; orden: number }): Promise<GradoResumen> {
  const { data } = await api.post<GradoResumen>("/grados", payload);
  return data;
}

export async function actualizarGrado(
  id: number,
  payload: { nombre: string; nivel: string; orden: number },
): Promise<GradoResumen> {
  const { data } = await api.put<GradoResumen>(`/grados/${id}`, payload);
  return data;
}

export async function eliminarGrado(id: number): Promise<void> {
  await api.delete<void>(`/grados/${id}`);
}
export const listarAniosEscolares = () => obtener<AnioEscolar[]>("/anios-escolares");

// Módulos académicos.
export const listarTareas = () => obtener<Tarea[]>("/tareas");
export const listarEntregas = () => obtener<EntregaTarea[]>("/entregas-tareas");
export const listarMateriales = () => obtener<Material[]>("/materiales");

// Mensajería interna.
export const listarConversaciones = () =>
  obtener<Conversacion[]>("/conversaciones");
export const listarMensajes = () => obtener<Mensaje[]>("/mensajes");
export const listarParticipantes = () =>
  obtener<ConversacionParticipante[]>("/conversacion-participantes");

export async function crearMensaje(payload: {
  conversacionId: number;
  contenido: string;
}): Promise<Mensaje> {
  const { data } = await api.post<Mensaje>("/mensajes", payload);
  return data;
}

// Justificaciones y gestión administrativa.
export const listarJustificaciones = () =>
  obtener<JustificacionAusencia[]>("/justificaciones-ausencia");
export const listarUsuarios = () => obtener<Usuario[]>("/usuarios");

// CRUD de alumnos (solo Director puede crear/actualizar/eliminar).
export async function crearAlumno(payload: AlumnoCrearRequest): Promise<Alumno> {
  const { data } = await api.post<Alumno>("/alumnos", payload);
  return data;
}

export async function actualizarAlumno(
  id: number,
  payload: AlumnoActualizarRequest,
): Promise<Alumno> {
  const { data } = await api.put<Alumno>(`/alumnos/${id}`, payload);
  return data;
}

export async function eliminarAlumno(id: number): Promise<void> {
  await api.delete<void>(`/alumnos/${id}`);
}

// CRUD de usuarios (solo Director puede crear/actualizar/eliminar).
export async function crearUsuario(payload: Usuario): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/usuarios", payload);
  return data;
}

export async function actualizarUsuario(id: number, payload: Usuario): Promise<Usuario> {
  const { data } = await api.put<Usuario>(`/usuarios/${id}`, payload);
  return data;
}

export async function eliminarUsuario(id: number): Promise<void> {
  await api.delete<void>(`/usuarios/${id}`);
}

// ===== CRUD de notas (Director y Maestro pueden crear/editar; solo Director elimina) =====
export async function crearNota(payload: NotaCrearRequest): Promise<Nota> {
  const { data } = await api.post<Nota>("/notas", payload);
  return data;
}

export async function actualizarNota(
  id: number,
  payload: NotaActualizarRequest,
): Promise<Nota> {
  const { data } = await api.put<Nota>(`/notas/${id}`, payload);
  return data;
}

export async function eliminarNota(id: number): Promise<void> {
  await api.delete<void>(`/notas/${id}`);
}

// ===== CRUD de asistencias =====
export async function crearAsistencia(
  payload: AsistenciaCrearRequest,
): Promise<Asistencia> {
  const { data } = await api.post<Asistencia>("/asistencias", payload);
  return data;
}

export async function actualizarAsistencia(
  id: number,
  payload: AsistenciaActualizarRequest,
): Promise<Asistencia> {
  const { data } = await api.put<Asistencia>(`/asistencias/${id}`, payload);
  return data;
}

export async function eliminarAsistencia(id: number): Promise<void> {
  await api.delete<void>(`/asistencias/${id}`);
}

// ===== CRUD de tareas (Director y Maestro) =====
export async function crearTarea(payload: TareaRequest): Promise<Tarea> {
  const { data } = await api.post<Tarea>("/tareas", payload);
  return data;
}

export async function actualizarTarea(
  id: number,
  payload: TareaRequest,
): Promise<Tarea> {
  const { data } = await api.put<Tarea>(`/tareas/${id}`, payload);
  return data;
}

export async function eliminarTarea(id: number): Promise<void> {
  await api.delete<void>(`/tareas/${id}`);
}

// ===== CRUD de materiales =====
export async function crearMaterial(
  payload: MaterialCrearRequest,
): Promise<Material> {
  const { data } = await api.post<Material>("/materiales", payload);
  return data;
}

export async function actualizarMaterial(
  id: number,
  payload: MaterialActualizarRequest,
): Promise<Material> {
  const { data } = await api.put<Material>(`/materiales/${id}`, payload);
  return data;
}

export async function eliminarMaterial(id: number): Promise<void> {
  await api.delete<void>(`/materiales/${id}`);
}

// ===== CRUD de matrículas (solo Director) =====
export async function crearMatricula(
  payload: MatriculaCrearRequest,
): Promise<Matricula> {
  const { data } = await api.post<Matricula>("/matriculas", payload);
  return data;
}

export async function actualizarMatricula(
  id: number,
  payload: MatriculaActualizarRequest,
): Promise<Matricula> {
  const { data } = await api.put<Matricula>(`/matriculas/${id}`, payload);
  return data;
}

export async function eliminarMatricula(id: number): Promise<void> {
  await api.delete<void>(`/matriculas/${id}`);
}

// ===== CRUD de justificaciones =====
export async function crearJustificacion(
  payload: JustificacionCrearRequest,
): Promise<JustificacionAusencia> {
  const { data } = await api.post<JustificacionAusencia>(
    "/justificaciones-ausencia",
    payload,
  );
  return data;
}

export async function actualizarJustificacion(
  id: number,
  payload: JustificacionActualizarRequest,
): Promise<JustificacionAusencia> {
  const { data } = await api.put<JustificacionAusencia>(
    `/justificaciones-ausencia/${id}`,
    payload,
  );
  return data;
}

export async function eliminarJustificacion(id: number): Promise<void> {
  await api.delete<void>(`/justificaciones-ausencia/${id}`);
}

// ===== CRUD de reuniones (Director y Maestro) =====
export async function crearReunion(
  payload: ReunionCrearRequest,
): Promise<Reunion> {
  const { data } = await api.post<Reunion>("/reuniones", payload);
  return data;
}

export async function actualizarReunion(
  id: number,
  payload: ReunionActualizarRequest,
): Promise<Reunion> {
  const { data } = await api.put<Reunion>(`/reuniones/${id}`, payload);
  return data;
}

export async function eliminarReunion(id: number): Promise<void> {
  await api.delete<void>(`/reuniones/${id}`);
}

/**
 * Traduce errores de axios/red a mensajes claros para el usuario.
 */
export function mensajeDeError(error: unknown): string {
  const respuesta = (
    error as {
      response?: { status?: number; data?: { mensaje?: string; error?: string } };
    }
  )?.response;
  const status = respuesta?.status;
  const detalle = respuesta?.data?.mensaje?.trim();

  if (!respuesta) {
    return "No pudimos conectar con el servidor. Revisá tu conexión y volvé a intentar.";
  }

  if (status === 401) return "Tu sesión expiró. Volvé a iniciar sesión.";
  if (status === 403) return "No tenés permisos para ver esta información.";
  if (status === 404) return "No se encontró la información solicitada.";

  // 502/503/504: el servicio gratuito está arrancando.
  if (status === 502 || status === 503 || status === 504) {
    return (
      detalle ??
      "El servidor está iniciando. Esperá unos segundos y volvé a intentar."
    );
  }

  if (status === 409) {
    return detalle ?? "No se pudo guardar porque hay un conflicto con los datos.";
  }

  if (status && status >= 400 && status < 500) {
    return detalle ?? "No se pudo completar la acción. Revisá los datos e intentá de nuevo.";
  }

  if (status && status >= 500) {
    return "El servidor tuvo un problema. Intentá de nuevo.";
  }

  return "No pudimos conectar con el servidor. Revisá tu conexión y volvé a intentar.";
}

export function indexarPor<T extends { id: number }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}
