import axios, { type InternalAxiosRequestConfig } from "axios";

// Ruta relativa: el navegador llama al frontend (puerto 3000) y Next.js
// reenvia internamente al backend (puerto 8080) mediante el route handler
// de src/app/api/[...path]/route.ts. Asi el sistema funciona igual dentro
// o fuera de tu red.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api";

const ESPERA_REINTENTO_MS = 2500;

export const api = axios.create({
  baseURL: API_URL,
  // El plan gratuito de Render suspende el backend y tarda ~1 minuto en
  // despertarlo. Damos margen suficiente para no rendirnos antes.
  timeout: 150_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agrega el token automáticamente a cada petición (solo en el navegador)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Si el servidor gratuito está arrancando (502/503/504) o la red falla un
// instante, reintenta las consultas GET. No reintentamos POST/PUT/DELETE
// para no duplicar datos.
api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const config = error?.config as
      | (InternalAxiosRequestConfig & { __reintentos?: number })
      | undefined;
    const status = error?.response?.status as number | undefined;
    const esFallaDeRed = !error?.response;
    const reintentable =
      esFallaDeRed || status === 502 || status === 503 || status === 504;
    const metodo = (config?.method ?? "get").toLowerCase();
    const intentos = config?.__reintentos ?? 0;

    if (config && metodo === "get" && reintentable && intentos < 2) {
      config.__reintentos = intentos + 1;
      await esperar(ESPERA_REINTENTO_MS * config.__reintentos);
      return api.request(config);
    }

    return Promise.reject(error);
  }
);

function esperar(ms: number) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

let despertando: Promise<boolean> | null = null;

/**
 * Despierta el backend gratuito de Render (se suspende a los 15 minutos
 * sin uso). Sondea /api/salud y reintenta durante ~2 minutos.
 *
 * Es seguro llamarla varias veces: mientras hay un intento en curso, las
 * llamadas siguientes comparten la misma espera.
 */
export function despertarBackend(
  onIntento?: (intento: number) => void
): Promise<boolean> {
  if (!despertando) {
    despertando = despertarInterno(onIntento).finally(() => {
      despertando = null;
    });
  }
  return despertando;
}

async function despertarInterno(
  onIntento?: (intento: number) => void
): Promise<boolean> {
  for (let intento = 1; intento <= 2; intento++) {
    onIntento?.(intento);

    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), 110_000);
    try {
      const respuesta = await fetch("/api/salud", {
        cache: "no-store",
        signal: control.signal,
      });
      // Cualquier respuesta del backend (incluido 401/404) significa que
      // ya está despierto.
      if (respuesta.status < 500) return true;
    } catch {
      // Red o tiempo agotado: se reintenta.
    } finally {
      clearTimeout(temporizador);
    }

    if (intento < 2) await esperar(3000);
  }
  return false;
}

/** Indica si un error es del arranque del servidor o de la red. */
export function esFallaDeArranque(error: unknown): boolean {
  const respuesta = (error as { response?: { status?: number } })?.response;
  if (!respuesta) return true;
  const status = respuesta.status ?? 0;
  return status === 502 || status === 503 || status === 504;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  rol: string;
  mensaje: string;
  token: string;
  tipo: string;
  expiraEn: number;
}

export interface UsuarioActual {
  id: number;
  username: string;
  email: string | null;
  rol: string;
  nombres: string | null;
  apellidos: string | null;
  estado: string;
}

/**
 * Trae el nombre completo del usuario autenticado y lo deja guardado
 * para mostrarlo en la barra superior. Si el servidor está arrancando,
 * devuelve null sin romper la sesión.
 */
export async function cargarNombreUsuario(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!localStorage.getItem("token")) return null;
  try {
    const { data } = await api.get<UsuarioActual>("/auth/yo", {
      timeout: 8000,
    });
    const nombre = [data.nombres, data.apellidos]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (nombre) {
      localStorage.setItem("nombreUsuario", nombre);
      return nombre;
    }
  } catch {
    // Sin conexión o servidor iniciando: se reintenta en la próxima carga.
  }
  return null;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export function guardarSesion(data: LoginResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", data.token);
  localStorage.setItem("rol", data.rol);
  localStorage.setItem("username", data.username);
  localStorage.setItem("usuarioId", String(data.id));
  localStorage.removeItem("nombreUsuario");
}

export function cerrarSesion() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("username");
  localStorage.removeItem("usuarioId");
  localStorage.removeItem("nombreUsuario");
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
