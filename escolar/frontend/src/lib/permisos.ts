// Permisos por módulo, alineados con el menú del shell y con el backend.
export const PERMISOS = {
  dashboard: ["Director", "Maestro", "Alumno", "Tutor"],
  alumnos: ["Director", "Maestro"],
  notas: ["Director", "Maestro", "Alumno", "Tutor"],
  asistencias: ["Director", "Maestro", "Alumno", "Tutor"],
  tareas: ["Director", "Maestro", "Alumno", "Tutor"],
  materiales: ["Director", "Maestro", "Alumno", "Tutor"],
  mensajes: ["Director", "Maestro", "Alumno", "Tutor"],
  reuniones: ["Director", "Maestro", "Tutor"],
  justificaciones: ["Director", "Maestro", "Alumno", "Tutor"],
  matriculas: ["Director", "Maestro", "Alumno", "Tutor"],
  usuarios: ["Director"],
  grados: ["Director", "Maestro", "Alumno", "Tutor"],
  asignacionesDocentes: ["Director"],
} as const;

export type Modulo = keyof typeof PERMISOS;

/**
 * Lee el rol de la sesión actual y responde si puede usar el módulo.
 * Se usa antes de disparar peticiones para no golpear endpoints denegados.
 */
export function rolPermitido(modulo: Modulo): boolean {
  if (typeof window === "undefined") return false;
  const rol = window.localStorage.getItem("rol");
  return !!rol && (PERMISOS[modulo] as readonly string[]).includes(rol);
}
