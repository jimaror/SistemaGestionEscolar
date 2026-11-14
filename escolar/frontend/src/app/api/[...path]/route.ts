import { NextRequest } from "next/server";

// El backend (Spring Boot) corre en el puerto 8080 y solo acepta peticiones
// cuyo header Origin este en su lista de CORS configurada.
//
// Cuando el sistema se abre via un tunel (Cloudflare/ngrok), el navegador
// envia Origin: https://<subdominio>.trycloudflare.com, y el backend lo
// rechaza con 403 "Invalid CORS request".
//
// Este route handler hace de proxy: reenvia la peticion al backend
// eliminiando el header Origin (el proxy es servidor-a-servidor, asi que
// no aplica CORS). De ese modo el backend nunca se expone a internet y
// solo hay que tunelear el frontend.

// URL del backend Spring Boot.
//
// - En desarrollo local: http://localhost:8080
// - En la nube: la variable de entorno BACKEND_URL
//   (Render entrega solo el host, sin protocolo; Vercel entrega la URL
//    completa). Se normaliza para que funcione en ambos casos.
//
// El valor se lee en tiempo de ejecucion (no en build), asi que el mismo
// build sirve para local y para produccion.
function urlDelBackend(): string {
  const crudo = process.env.BACKEND_URL?.trim();
  if (!crudo) return "http://localhost:8080";
  const conProtocolo = /^https?:\/\//i.test(crudo) ? crudo : `https://${crudo}`;
  return conProtocolo.replace(/\/+$/, "");
}

const BACKEND = urlDelBackend();

// Headers que nunca se deben reenviar al backend.
const HEADERS_A_OMITIR = new Set([
  "origin",
  "referer",
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "cookie",
  "content-length",
  "accept-encoding",
]);

async function proxear(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const destino = `${BACKEND}/api/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  request.headers.forEach((valor, clave) => {
    if (!HEADERS_A_OMITIR.has(clave.toLowerCase())) {
      headers.set(clave, valor);
    }
  });
  // Origin fijo permitido por el backend (proxy servidor-a-servidor).
  // El valor debe estar en CORS_ORIGENES del backend.
  headers.set("origin", "http://localhost:3000");
  const tieneCuerpo =
    request.method !== "GET" && request.method !== "HEAD";

  try {
    const respuesta = await fetch(destino, {
      method: request.method,
      headers,
      body: tieneCuerpo ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    const nuevosHeaders = new Headers();
    respuesta.headers.forEach((valor, clave) => {
      const k = clave.toLowerCase();
      if (
        k === "content-encoding" ||
        k === "content-length" ||
        k === "transfer-encoding" ||
        k === "connection" ||
        k === "access-control-allow-origin" ||
        k === "access-control-allow-credentials" ||
        k === "access-control-allow-methods" ||
        k === "access-control-allow-headers" ||
        k === "access-control-expose-headers" ||
        k === "access-control-max-age"
      ) {
        return;
      }
      nuevosHeaders.set(clave, valor);
    });

    return new Response(respuesta.body, {
      status: respuesta.status,
      statusText: respuesta.statusText,
      headers: nuevosHeaders,
    });
  } catch (error) {
    console.error("[proxy] Error al reenviar a", destino, error);
    return new Response(
      JSON.stringify({
        error: "No se pudo conectar con el servidor",
        mensaje: "Verifica que el backend este corriendo en el puerto 8080.",
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const GET = proxear;
export const POST = proxear;
export const PUT = proxear;
export const PATCH = proxear;
export const DELETE = proxear;
export const HEAD = proxear;
export const OPTIONS = proxear;
