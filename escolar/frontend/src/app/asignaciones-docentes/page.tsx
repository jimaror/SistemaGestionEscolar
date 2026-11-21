"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Cargando, ErrorEstado, Vacio } from "@/components/data-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  crearAsignacionDocente,
  eliminarAsignacionDocente,
  listarAsignaciones,
  listarAsignaturas,
  listarMaestros,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  AsignacionDocente,
  AsignacionDocenteCrearRequest,
  Asignatura,
  MaestroResumen,
  Seccion,
} from "@/lib/types";
import { PlusIcon, TrashIcon, ClockIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const HORAS = ["7:00-8:00", "8:00-9:00", "9:00-10:00", "10:00-11:00", "11:00-12:00"];

const colorPorMateria = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes("lengua")) return "from-indigo-500 to-blue-600 text-indigo-100 border-indigo-200";
  if (n.includes("matem")) return "from-fuchsia-500 to-pink-600 text-fuchsia-100 border-fuchsia-200";
  if (n.includes("ciencias") || n.includes("biología") || n.includes("biologia")) return "from-emerald-500 to-teal-600 text-emerald-100 border-emerald-200";
  if (n.includes("social") || n.includes("conviv") || n.includes("civismo")) return "from-amber-500 to-orange-600 text-amber-100 border-amber-200";
  if (n.includes("ingl")) return "from-blue-500 to-sky-600 text-blue-100 border-blue-200";
  if (n.includes("geograf")) return "from-teal-500 to-cyan-600 text-teal-100 border-teal-200";
  if (n.includes("historia")) return "from-violet-500 to-purple-600 text-violet-100 border-violet-200";
  if (n.includes("física") || n.includes("fisica")) return "from-cyan-500 to-sky-600 text-cyan-100 border-cyan-200";
  if (n.includes("química") || n.includes("quimica")) return "from-rose-500 to-pink-600 text-rose-100 border-rose-200";
  if (n.includes("inform")) return "from-purple-500 to-fuchsia-600 text-purple-100 border-purple-200";
  if (n.includes("educación física") || n.includes("educacion fisica")) return "from-orange-500 to-red-600 text-orange-100 border-orange-200";
  if (n.includes("educación artística") || n.includes("educacion artistica")) return "from-lime-500 to-green-600 text-lime-100 border-lime-200";
  return "from-slate-500 to-gray-600 text-slate-100 border-slate-200";
};

export default function AsignacionesDocentesPage() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [maestros, setMaestros] = useState<MaestroResumen[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const [form, setForm] = useState({
    maestroId: "",
    asignaturaId: "",
    horasSemanales: 3,
    estado: true,
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("asignacionesDocentes")) return;
    setCargando(true);
    setError(null);
    try {
      const [s, m, a] = await Promise.all([
        listarSecciones(),
        listarMaestros(),
        listarAsignaturas(),
      ]);
      setSecciones(s);
      setMaestros(m);
      setAsignaturas(a);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const cargarAsignaciones = useCallback(async () => {
    if (!seccionSeleccionada) return;
    setCargando(true);
    try {
      const data = await listarAsignaciones();
      const filtradas = data.filter((a) => a.seccionId === seccionSeleccionada);
      setAsignaciones(filtradas);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [seccionSeleccionada, cargarAsignaciones]);

  useEffect(() => {
    void cargarAsignaciones();
  }, [seccionSeleccionada, cargarAsignaciones]);

  const seccionActual = useMemo(
    () => secciones.find((s) => s.id === seccionSeleccionada) ?? null,
    [secciones, seccionSeleccionada],
  );

  const maestrosPorId = useMemo(() => new Map(maestros.map((m) => [m.id, m])), [maestros]);
  const asignaturasPorId = useMemo(() => new Map(asignaturas.map((a) => [a.id, a])), [asignaturas]);

  const agregar = async () => {
    if (!seccionSeleccionada || !form.maestroId || !form.asignaturaId) return;
    setGuardando(true);
    try {
      const payload: AsignacionDocenteCrearRequest = {
        maestroId: Number(form.maestroId),
        asignaturaId: Number(form.asignaturaId),
        seccionId: seccionSeleccionada,
        horasSemanales: Number(form.horasSemanales) || 3,
        estado: form.estado,
      };
      await crearAsignacionDocente(payload);
      setForm({ maestroId: "", asignaturaId: "", horasSemanales: 3, estado: true });
      void cargarAsignaciones();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    setEliminandoId(id);
    try {
      await eliminarAsignacionDocente(id);
      void cargarAsignaciones();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEliminandoId(null);
    }
  };

  // ---- Horario semanal simple (distribución automática de las materias asignadas) ----
  const horario = useMemo(() => {
    const grid: Record<string, Record<string, string>> = {};
    DIAS.forEach((d) => {
      HORAS.forEach((h) => { grid[d] = grid[d] ?? {}; grid[d][h] = ""; });
    });
    const lista = [...asignaciones].sort((a, b) => a.asignaturaId - b.asignaturaId);
    let idx = 0;
    for (const dia of DIAS) {
      for (const hora of HORAS) {
        if (idx >= lista.length) break;
        const a = lista[idx];
        const mat = asignaturasPorId.get(a.asignaturaId)?.nombre ?? "Materia";
        const m = maestrosPorId.get(a.maestroId);
        const nom = m ? `${m.nombre} ${m.apellido}`.trim() : "Maestro";
        grid[dia][hora] = `${mat} — ${nom}`;
        idx++;
      }
    }
    return grid;
  }, [asignaciones, asignaturasPorId, maestrosPorId]);

  if (cargando) {
    return (
      <AppShell titulo="Asignaciones Docentes" subtitulo="Materias por sección y maestro">
        <Cargando texto="Cargando catálogos…" />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell titulo="Asignaciones Docentes" subtitulo="Materias por sección y maestro">
        <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      titulo="Asignaciones Docentes"
      subtitulo={
        seccionActual
          ? `${seccionActual.grado?.nombre ?? "Grado"} ${seccionActual.nombre} · ${seccionActual.turno}`
          : "Seleccioná una sección para asignar materias y maestros"
      }
      acciones={
        <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
          <ClockIcon className="h-4 w-4" /> Actualizar
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Selector de sección */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Label htmlFor="seccionSelect">Sección (Grado · Sección · Turno)</Label>
              <select
                id="seccionSelect"
                value={String(seccionSeleccionada ?? "")}
                onChange={(e) => {
                  setSeccionSeleccionada(e.target.value === "" ? null : Number(e.target.value));
                }}
                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Seleccioná una sección…</option>
                {secciones
                  .slice()
                  .sort(
                    (a, b) =>
                      (a.grado?.orden ?? 99) - (b.grado?.orden ?? 99) ||
                      a.nombre.localeCompare(b.nombre),
                  )
                  .map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {`${s.grado?.nombre ?? "Grado"} · ${s.nombre} · ${s.turno}`}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </section>

        {!seccionActual && (
          <div className="p-8 rounded-3xl bg-slate-50 text-sm text-slate-500 text-center border border-slate-100">
            Seleccioná una sección para ver y gestionar sus materias asignadas.
          </div>
        )}

        {seccionActual && (
          <>
            {/* Tarjetas de materias asignadas (vista vistosa) */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-indigo-600" />
                  Materias asignadas
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cada tarjeta es una materia impartida por un maestro en esta sección.
                </p>
              </div>

              <div className="p-5">
                {asignaciones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Vacio
                      titulo="Sin materias asignadas"
                      descripcion={
                        "Esta sección todavía no tiene materias. Usá el formulario de abajo para agregar."
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {asignaciones.map((a) => {
                      const materia = asignaturasPorId.get(a.asignaturaId);
                      const maestro = maestrosPorId.get(a.maestroId);
                      const gradiente = colorPorMateria(materia?.nombre ?? "");
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            "rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-default group",
                            gradiente.replace("text-", "text-slate-900"),
                          )
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm", gradiente)}>
                              {materia?.nombre ?? "Materia"}
                            </span>
                            <Badge
                              variant={a.estado ? "success" : "default"}
                              className="text-[10px]"
                            >
                              {a.estado ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            {maestro ? `${maestro.nombre} ${maestro.apellido}` : `Maestro #${a.maestroId}`}
                          </p>
                          <p className="text-xs text-slate-500 mb-3">
                            {a.horasSemanales ?? "-"} horas / semana
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => eliminar(a.id)}
                            disabled={eliminandoId === a.id}
                            className="w-full"
                          >
                            {eliminandoId === a.id ? "Eliminando…" : "Eliminar materia"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Formulario agregar */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                  Agregar nueva materia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="maestroSelect">Maestro</Label>
                    <select
                      id="maestroSelect"
                      value={String(form.maestroId ?? "")}
                      onChange={(e) => setForm({ ...form, maestroId: e.target.value })}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Seleccioná un maestro…</option>
                      {maestros.map((m) => (
                        <option key={m.id} value={String(m.id)}>
                          {`${m.nombre} ${m.apellido}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="asignaturaSelect">Materia</Label>
                    <select
                      id="asignaturaSelect"
                      value={String(form.asignaturaId ?? "")}
                      onChange={(e) => setForm({ ...form, asignaturaId: e.target.value })}
                      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Seleccioná una materia…</option>
                      {asignaturas.map((a) => (
                        <option key={a.id} value={String(a.id)}>{a.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="horasInput">Horas semanales</Label>
                    <Input
                      id="horasInput"
                      type="number"
                      min="1"
                      max="20"
                      value={String(form.horasSemanales)}
                      onChange={(e) =>
                        setForm({ ...form, horasSemanales: Number(e.target.value) || 3 })
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="estadoToggle"
                      type="checkbox"
                      checked={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.checked })}
                      className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="estadoToggle" className="text-sm text-slate-700">
                      Activa
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={() => void agregar()}
                    disabled={
                      guardando ||
                      !seccionSeleccionada ||
                      !form.maestroId ||
                      !form.asignaturaId
                    }
                    className="rounded-xl px-6 py-3"
                  >
                    {guardando ? "Guardando…" : (
                      <>
                        <PlusIcon className="h-4 w-4" /> Agregar asignación
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>

            {/* HORARIO SEMANAL */}
            <section className="rounded-3xl border border-indigo-200 bg-indigo-50 shadow-sm overflow-hidden">
              <div className="border-b border-indigo-100 bg-indigo-100 px-6 py-4">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-indigo-600" />
                  Horario Semanal (vista sugerida)
                </h3>
                <p className="text-xs text-indigo-700 mt-1">
                  Las materias asignadas se distribuyen de Lunes a Viernes por bloques de hora.
                </p>
              </div>
              <div className="p-5 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-indigo-700 uppercase tracking-wider text-left border-b border-indigo-200 bg-indigo-100 sticky top-0 z-10">
                        Hora
                      </th>
                      {DIAS.map((dia) => (
                        <th
                          key={dia}
                          className="px-4 py-3 text-xs font-bold text-indigo-700 uppercase tracking-wider text-center border-b border-indigo-200 bg-indigo-100 sticky top-0 z-10"
                        >
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {HORAS.map((hora) => (
                      <tr key={hora} className="hover:bg-indigo-50/50 transition">
                        <td className="px-4 py-3 text-xs font-semibold text-indigo-600 border-b border-indigo-100 whitespace-nowrap">
                          {hora}
                        </td>
                        {DIAS.map((dia) => (
                          <td
                            key={dia}
                            className={cn(
                              "px-4 py-3 text-xs border-b border-indigo-100 text-center rounded-lg",
                              horario[dia][hora]
                                ? "bg-white text-slate-800 font-medium shadow-sm"
                                : "bg-indigo-50 text-indigo-300 italic"
                            )}
                          >
                            {horario[dia][hora] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mx-5 mt-2 text-xs text-indigo-500">
                Este horario es una vista sugerida basada en las materias asignadas. Los horarios exactos y aulas se pueden coordinar con la dirección.
              </p>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
