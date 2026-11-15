"use client";

import { useEffect } from "react";

const INTERVALO_MS = 4 * 60 * 1000;

/**
 * Mantiene despiertos el frontend y el backend mientras haya una pestaña
 * abierta. Render suspende los servicios gratuitos a los 15 minutos sin
 * trafico, y el primer pedido despues de eso tarda ~1 minuto.
 *
 * No guarda nada ni cambia datos: solo consulta /api/salud.
 */
export function Heartbeat() {
  useEffect(() => {
    let enCurso = false;

    const latir = async () => {
      if (enCurso || document.visibilityState === "hidden") return;
      enCurso = true;

      const control = new AbortController();
      const temporizador = setTimeout(() => control.abort(), 30_000);
      try {
        await fetch("/api/salud", {
          cache: "no-store",
          signal: control.signal,
        });
      } catch {
        // Si falla, el proximo latido lo reintenta.
      } finally {
        clearTimeout(temporizador);
        enCurso = false;
      }
    };

    const primerLatido = setTimeout(latir, 5000);
    const intervalo = setInterval(latir, INTERVALO_MS);
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") void latir();
    };

    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      clearTimeout(primerLatido);
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, []);

  return null;
}
