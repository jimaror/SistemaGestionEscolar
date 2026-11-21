"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Cargando, ErrorEstado, Vacio } from "@/components/data-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listarAsignaciones,
  listarAsignaturas,
  listarMaestros,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  AsignacionDocente,
  Asignatura,
  MaestroResumen,
  Seccion,
} from "@/lib/types";
import { ClockIcon, UsersIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const BLOQUES_MATUTINO = [
  { clave: "h1", etiqueta: "8:00 - 8:45", tipo: "clase" },
  { clave: "h2", etiqueta: "8:45 - 9:30", tipo: "clase" },
  { clave: "rec1", etiqueta: "RECREO", tipo: "recreo" },
  { clave: "h3", etiqueta: "9:45 - 10:30", tipo: "clase" },
  { clave: "h4", etiqueta: "10:30 - 11:15", tipo: "clase" },
  { clave: "h5", etiqueta: "11:15 - 12:00", tipo: "clase" },
];

const BLOQUES_VESPERTINO = [
  { clave: "h6", etiqueta: "1:00 - 1:45", tipo: "clase" },
  { clave: "h7", etiqueta: "1:45 - 2:30", tipo: "clase" },
  { clave: "rec2", etiqueta: "RECREO", tipo: "recreo" },
  { clave: "h8", etiqueta: "2:45 - 3:30", tipo: "clase" },
  { clave: "h9", etiqueta: "3:30 - 4:15", tipo: "clase" },
  { clave: "h10", etiqueta: "4:15 - 5:00", tipo: "clase" },
];

const colorClase = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes("lengua")) return "bg-indigo-100 border-indigo-200 text-indigo-800";
  if (n.includes("matem")) return "bg-fuchsia-100 border-fuchsia-200 text-fuchsia-800";
  if (n.includes("ciencias") || n.includes("biología") || n.includes("biologia")) return "bg-emerald-100 border-emerald-200 text-emerald-800";
  if (n.includes("social") || n.includes("conviv") || n.includes("civismo")) return "bg-amber-100 border-amber-200 text-amber-800";
  if (n.includes("ingl")) return "bg-blue-100 border-blue-200 text-blue-800";
  if (n.includes("geograf")) return "bg-teal-100 border-teal-200 text-teal-800";
  if (n.includes("historia")) return "bg-violet-100 border-violet-200 text-violet-800";
  if (n.includes("física") || n.includes("fisica")) return "bg-cyan-100 border-cyan-200 text-cyan-800";
  if (n.includes("química") || n.includes("quimica")) return "bg-rose-100 border-rose-200 text-rose-800";
  if (n.includes("inform")) return "bg-purple-100 border-purple-200 text-purple-800";
  if (n.includes("educación física") || n.includes("educacion fisica")) return "bg-orange-100 border-orange-200 text-orange-800";
  if (n.includes("educación artística") || n.includes("educacion artistica")) return "bg-lime-100 border-lime-200 text-lime-800";
  return "bg-slate-100 border-slate-200 text-slate-800";
};

export default function HorarioDocentePage() {
  const [maestros, setMaestros] = useState<MaestroResumen[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const usuarioId = Number(localStorage.getItem("usuarioId") ?? "0");

  const maestro = useMemo(
    () => maestros.find((m) => m.idUsuario === usuarioId) ?? null,
    [maestros, usuarioId],
  );

  const asignacionesDelMaestro = useMemo(
    () => asignaciones.filter((a) => a.maestroId === maestro?.id && a.estado),
    [asignaciones, maestro?.id],
  );

  const maestrosPorId = useMemo(() => new Map(maestros.map((m) => [m.id, m])), [maestros]);
  const asignaturasPorId = useMemo(() => new Map(asignaturas.map((a) => [a.id, a])), [asignaturas]);
  const seccionesPorId = useMemo(() => new Map(secciones.map((s) => [s.id, s])), [secciones]);

  const cargar = useCallback(async () => {
    if (!rolPermitido("horarioDocente")) return;
    setCargando(true);
    setError(null);
    try {
      const [m, a, asig, s] = await Promise.all([
        listarMaestros(),
        listarAsignaciones(),
        listarAsignaturas(),
        listarSecciones(),
      ]);
      setMaestros(m);
      setAsignaciones(a);
      setAsignaturas(asig);
      setSecciones(s);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const construirTurno = useCallback(
    (bloques: typeof BLOQUES_MATUTINO) => {
      const mapa: Record<string, Record<string, string>> = {};
      DIAS.forEach((d) => {
        mapa[d] = {};
        bloques.forEach((f) => { mapa[d][f.clave] = ""; });
      });
      const bloquesClase = bloques.filter((f) => f.tipo === "clase").map((f) => f.clave);
      const lista = [...asignacionesDelMaestro].sort(
        (a, b) => a.asignaturaId - b.asignaturaId,
      );
      let idx = 0;
      const total = lista.length;
      if (total === 0) return mapa;
      for (const dia of DIAS) {
        for (const clave of bloquesClase) {
          const a = lista[idx % total];
          const mat = asignaturasPorId.get(a.asignaturaId)?.nombre ?? "Materia";
          const sec = seccionesPorId.get(a.seccionId);
          const grado = sec?.grado?.nombre ?? "—";
          const seccionNombre = sec?.nombre ?? "—";
          const turno = sec?.turno ?? "—";
          mapa[dia][clave] = `${mat} — ${grado} ${seccionNombre} (${turno})`;
          idx++;
        }
      }
      return mapa;
    },
    [asignacionesDelMaestro, asignaturasPorId, seccionesPorId],
  );

  const horarioMatutino = useMemo(() => construirTurno(BLOQUES_MATUTINO), [construirTurno]);
  const horarioVespertino = useMemo(() => construirTurno(BLOQUES_VESPERTINO), [construirTurno]);

  const totalClases = asignacionesDelMaestro.length;

  if (cargando) {
    return (
      <AppShell titulo="Mi Horario" subtitulo="Clases que te toca dar esta semana">
        <Cargando texto="Cargando tu horario…" />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell titulo="Mi Horario" subtitulo="Clases que te toca dar esta semana">
        <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      titulo="Mi Horario de Clases"
      subtitulo={
        maestro
          ? `${maestro.nombre} ${maestro.apellido} — ${totalClases} asignación${
              totalClases !== 1 ? "es" : ""
            }`
          : "No se pudo identificar tu perfil de docente"
      }
      acciones={
        <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
          <ClockIcon className="h-4 w-4" /> Actualizar
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Perfil del docente */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
                <UsersIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {maestro ? `${maestro.nombre} ${maestro.apellido}` : "Docente"}
                </h2>
                <p className="text-sm text-slate-500">
                  {maestro?.especialidad ? `Especialidad: ${maestro.especialidad}` : ""}
                  {maestro && totalClases > 0
                    ? ` · ${totalClases} clase${totalClases !== 1 ? "s" : ""} esta semana`
                    : ""}
                </p>
              </div>
            </div>
            {!maestro && (
              <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-500 text-center border border-slate-100">
                No se encontró tu perfil de maestro asociado a este usuario.
              </div>
            )}
          </div>
        </section>

        {!maestro && (
          <div className="p-8 rounded-3xl bg-slate-50 text-sm text-slate-500 text-center border border-slate-100">
            <Vacio
              titulo="Sin horario disponible"
              descripcion="No se pudo identificar tu perfil de docente. Contactá a la dirección del colegio."
            />
          </div>
        )}

        {maestro && totalClases === 0 && (
          <div className="p-8 rounded-3xl bg-slate-50 text-sm text-slate-500 text-center border border-slate-100">
            <Vacio
              titulo="Sin clases asignadas"
              descripcion="Todavía no tienes materias asignadas. La dirección te las asignará en Asignaciones Docentes."
            />
          </div>
        )}

        {maestro && totalClases > 0 && (
          <>
            {/* Turno Matutino */}
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50 shadow-sm overflow-hidden">
              <div className="border-b border-emerald-100 bg-emerald-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-emerald-600" />
                  <span className="text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    Turno Matutino · 8:00 - 12:00
                  </span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">
                  Tus clases de la mañana, ordenadas por hora y día.
                </p>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-emerald-700 uppercase tracking-wider text-left border-b border-emerald-200 bg-emerald-100 sticky top-0 z-10">
                        Horas
                      </th>
                      {DIAS.map((dia) => (
                        <th
                          key={dia}
                          className="px-4 py-3 text-[10px] font-bold text-emerald-700 uppercase tracking-wider text-center border-b border-emerald-200 bg-emerald-100 sticky top-0 z-10"
                        >
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {BLOQUES_MATUTINO.map((fila) => {
                      const esEspecial = fila.tipo !== "clase";
                      return (
                        <tr key={fila.clave} className="hover:bg-emerald-50/30 transition">
                          <td className="px-4 py-3 text-[10px] font-semibold text-emerald-700 border-b border-emerald-100 whitespace-nowrap bg-emerald-50/40">
                            {fila.etiqueta}
                          </td>
                          {DIAS.map((dia) => {
                            const contenido = horarioMatutino[dia][fila.clave];
                            const tieneContenido = contenido && contenido.trim() !== "";
                            return (
                              <td
                                key={dia}
                                className={cn(
                                  "px-4 py-3 text-[10px] border-b border-emerald-100 text-center rounded-lg",
                                  esEspecial
                                    ? "bg-emerald-50 text-emerald-300 italic font-light"
                                    : tieneContenido
                                      ? "bg-white text-slate-800 font-medium shadow-sm"
                                      : "bg-emerald-50 text-emerald-200"
                                )}
                              >
                                {esEspecial
                                  ? fila.etiqueta
                                  : tieneContenido
                                    ? contenido
                                    : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Turno Vespertino */}
            <section className="rounded-3xl border border-orange-200 bg-orange-50 shadow-sm overflow-hidden">
              <div className="border-b border-orange-100 bg-orange-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-orange-600" />
                  <span className="text-orange-900 font-bold text-xs uppercase tracking-wider">
                    Turno Vespertino · 1:00 - 5:00
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Tus clases de la tarde, ordenadas por hora y día.
                </p>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold text-orange-700 uppercase tracking-wider text-left border-b border-orange-200 bg-orange-100 sticky top-0 z-10">
                        Horas
                      </th>
                      {DIAS.map((dia) => (
                        <th
                          key={dia}
                          className="px-4 py-3 text-[10px] font-bold text-orange-700 uppercase tracking-wider text-center border-b border-orange-200 bg-orange-100 sticky top-0 z-10"
                        >
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {BLOQUES_VESPERTINO.map((fila) => {
                      const esEspecial = fila.tipo !== "clase";
                      return (
                        <tr key={fila.clave} className="hover:bg-orange-50/30 transition">
                          <td className="px-4 py-3 text-[10px] font-semibold text-orange-700 border-b border-orange-100 whitespace-nowrap bg-orange-50/40">
                            {fila.etiqueta}
                          </td>
                          {DIAS.map((dia) => {
                            const contenido = horarioVespertino[dia][fila.clave];
                            const tieneContenido = contenido && contenido.trim() !== "";
                            return (
                              <td
                                key={dia}
                                className={cn(
                                  "px-4 py-3 text-[10px] border-b border-orange-100 text-center rounded-lg",
                                  esEspecial
                                    ? "bg-orange-50 text-orange-300 italic font-light"
                                    : tieneContenido
                                      ? "bg-white text-slate-800 font-medium shadow-sm"
                                      : "bg-orange-50 text-orange-200"
                                )}
                              >
                                {esEspecial
                                  ? fila.etiqueta
                                  : tieneContenido
                                    ? contenido
                                    : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mx-5 mt-2 text-xs text-orange-500">
                Este horario se genera automáticamente con las materias que la dirección te ha asignado.
              </p>
            </section>

            {/* Resumen de materias */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-indigo-600" />
                  Tus materias asignadas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[...new Set(asignacionesDelMaestro.map((a) => a.asignaturaId))].map(
                    (asigId) => {
                      const mat = asignaturasPorId.get(asigId);
                      const secIds = asignacionesDelMaestro
                        .filter((a) => a.asignaturaId === asigId)
                        .map((a) => a.seccionId);
                      const seccionesNombres = secIds
                        .map((sid) => {
                          const s = seccionesPorId.get(sid);
                          return s ? `${s.grado?.nombre ?? ""} ${s.nombre ?? ""}` : "";
                        })
                        .join(", ");
                      return (
                        <div key={asigId} className={cn("rounded-xl border p-3 flex items-center gap-3 shadow-sm", colorClase(mat?.nombre ?? ""))}>
                          <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-sm">
                            {mat?.nombre ?? "Materia"}
                          </span>
                          <span className="text-xs text-slate-700">
                            {seccionesNombres || "Sin sección"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
