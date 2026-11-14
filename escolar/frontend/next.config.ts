import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // El proxy de la API vive en src/app/api/[...path]/route.ts.
  // Se usa un route handler (y no un rewrite) porque permite reenviar la
  // peticion al backend SIN el header Origin, que el backend rechaza
  // cuando el sistema se accede por un tunel (403 Invalid CORS request).
  //
  // En produccion (Vercel) la variable BACKEND_URL apunta al backend
  // desplegado en Render. En local se usa http://localhost:8080.
};

export default nextConfig;
