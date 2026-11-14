import axios from "axios";

// Ruta relativa: el navegador llama al frontend (puerto 3000) y Next.js
// reenvia internamente al backend (puerto 8080) mediante el rewrite de
// next.config.ts. Asi el sistema funciona igual dentro o fuera de tu red.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "/api";

export const api = axios.create({
  baseURL: API_URL,
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
}

export function cerrarSesion() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("username");
  localStorage.removeItem("usuarioId");
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
