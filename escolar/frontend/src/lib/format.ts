export function normalizar(texto: string | null | undefined): string {
  if (!texto) return "";
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor.length <= 10 ? `${valor}T00:00:00` : valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatearFechaHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function iniciales(
  nombre: string | null | undefined,
  apellido: string | null | undefined
): string {
  const n = (nombre ?? "").trim().charAt(0);
  const a = (apellido ?? "").trim().charAt(0);
  return `${n}${a}`.toUpperCase() || "?";
}

export function nombreCompleto(
  nombre: string | null | undefined,
  apellido: string | null | undefined
): string {
  const completo = `${nombre ?? ""} ${apellido ?? ""}`.trim();
  return completo || "Sin nombre";
}

/** El backend legacy devuelve el estado como "1" o "Activo". */
export function esActivo(estado: string | null | undefined): boolean {
  if (!estado) return false;
  const valor = normalizar(estado);
  return valor === "1" || valor === "activo" || valor === "activa" || valor === "true";
}

export function formatearNumero(
  valor: number | null | undefined,
  decimales = 1
): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return valor.toFixed(decimales).replace(".", ",");
}

export function porcentaje(parte: number, total: number): number {
  if (!total) return 0;
  return Math.round((parte / total) * 100);
}
