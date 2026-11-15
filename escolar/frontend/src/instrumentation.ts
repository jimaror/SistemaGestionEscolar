/**
 * Se ejecuta una vez al arrancar el servidor de Next.js (por ejemplo,
 * cuando Render lo despierta). Intenta despertar el backend en segundo
 * plano, para que ya este iniciando mientras el usuario carga la pagina.
 *
 * No bloquea el arranque: se lanza sin await.
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const crudo = (process.env.BACKEND_URL ?? "http://localhost:8080")
    .trim()
    .replace(/\/+$/, "");
  const base = /^https?:\/\//i.test(crudo) ? crudo : `https://${crudo}`;
  const url = `${base}/api/salud`;

  void (async () => {
    for (let intento = 0; intento < 6; intento++) {
      const control = new AbortController();
      const temporizador = setTimeout(() => control.abort(), 30_000);
      try {
        const respuesta = await fetch(url, {
          cache: "no-store",
          signal: control.signal,
        });
        if (respuesta.status < 500) return;
      } catch {
        // Se reintenta.
      } finally {
        clearTimeout(temporizador);
      }
      await new Promise((resolver) => setTimeout(resolver, 5000));
    }
  })();
}
