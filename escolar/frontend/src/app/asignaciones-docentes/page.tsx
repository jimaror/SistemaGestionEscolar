"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Cargando, ErrorEstado, Vacio } from "@/components/data-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { PlusIcon, TrashIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function AsignacionesDocentesPage() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [maestros, setMaestros] = useState<MaestroResumen[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<number | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  // Formulario de nueva asignación
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
      const filtradas = data.filter(
        (a) => a.seccionId === seccionSeleccionada,
      );
      setAsignaciones(filtradas);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, [seccionSeleccionada]);

  useEffect(() => {
    void cargarAsignaciones();
  }, [seccionSeleccionada, cargarAsignaciones]);

  const seccionActual = useMemo(
    () => secciones.find((s) => s.id === seccionSeleccionada) ?? null,
    [secciones, seccionSeleccionada],
  );

  const maestrosPorId = useMemo(
    () => new Map(maestros.map((m) => [m.id, m])),
    [maestros],
  );
  const asignaturasPorId = useMemo(
    () => new Map(asignaturas.map((a) => [a.id, a])),
    [asignaturas],
  );

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
          ? `Materias asignadas a ${seccionActual.grado?.nombre ?? "Grado"} ${seccionActual.nombre} (${seccionActual.turno})`
          : "Seleccioná una sección para asignar materias y maestros"
      }
      acciones={
        <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
          Actualizar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Selector de sección */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:max-w-md">
                <Label htmlFor="seccionSelect">Sección (Grado · Sección · Turno)</Label>
                <Select
                  id="seccionSelect"
                  value={seccionSeleccionada ?? ""}
                  onValueChange={(value) => {
                    setSeccionSeleccionada(
                      value === "" ? null : Number(value),
                    );
                  }}
                >
                  <option value="">Seleccioná una sección…</option>
                  {secciones
                    .slice()
                    .sort(
                      (a, b) =>
                        (a.grado?.orden ?? 99) -
                        (b.grado?.orden ?? 99) ||
                        a.nombre.localeCompare(b.nombre),
                    )
                    .map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {`${s.grado?.nombre ?? "Grado"} · ${s.nombre} · ${s.turno}`}
                      </option>
                    ))}
                </Select>
              </div>
            </div>

            {!seccionActual && (
              <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-500">
                Seleccioná una sección de la lista para ver y gestionar sus
                materias asignadas.
              </div>
            )}
          </div>
        </section>

        {/* Gestión de asignaciones de la sección seleccionada */}
        {seccionActual && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <h3 className="font-semibold text-slate-900">
                  Materias asignadas
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cada fila representa una materia impartida por un maestro en
                  esta sección.
                </p>
              </div>

              <div className="overflow-x-auto">
                {asignaciones.length === 0 ? (
                  <div className="p-8 text-center">
                    <Vacio
                      titulo="Sin materias asignadas"
                      descripcion={
                        "Esta sección todavía no tiene materias asignadas. Usá el formulario de abajo para agregar una."
                      }
                    />
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-3 font-semibold">Materia</th>
                        <th className="px-5 py-3 font-semibold">Maestro</th>
                        <th className="px-5 py-3 font-semibold text-right">Horas / sem.</th>
                        <th className="px-5 py-3 font-semibold text-center">Estado</th>
                        <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {asignaciones.map((a) => {
                        const materia = asignaturasPorId.get(a.asignaturaId);
                        const maestro = maestrosPorId.get(a.maestroId);
                        return (
                          <tr key={a.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3">
                              <span className="font-medium text-slate-900">
                                {materia?.nombre ?? "Materia"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-slate-700">
                                {maestro
                                  ? `${maestro.nombre} ${maestro.apellido}`
                                  : `Maestro #${a.maestroId}`}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-slate-700">
                              {a.horasSemanales ?? "-"}
                            </td>
                            <td className="px-5 py-3 text-center">
                              <Badge
                                variant={a.estado ? "success" : "default"}
                              >
                                {a.estado ? "Activa" : "Inactiva"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => eliminar(a.id)}
                                disabled={eliminandoId === a.id}
                              >
                                {eliminandoId === a.id ? "Eliminando…" : (
                                  <>
                                    <TrashIcon className="h-4 w-4" /> Eliminar
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* Formulario para agregar nueva asignación */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">
                  Agregar nueva materia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="maestroSelect">Maestro</Label>
                    <Select
                      id="maestroSelect"
                      value={form.maestroId}
                      onValueChange={(value) =>
                        setForm({ ...form, maestroId: value })
                      }
                    >
                      <option value="">Seleccioná un maestro…</option>
                      {maestros.map((m) => (
                        <option key={m.id} value={String(m.id)}>
                          {`${m.nombre} ${m.apellido}`}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <Label htmlFor="asignaturaSelect">Materia</Label>
                    <Select
                      id="asignaturaSelect"
                      value={form.asignaturaId}
                      onValueChange={(value) =>
                        setForm({ ...form, asignaturaId: value })
                      }
                    >
                      <option value="">Seleccioná una materia…</option>
                      {asignaturas.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.nombre}
                        </option>
                      ))}
                    </Select>
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
                        setForm({
                          ...form,
                          horasSemanales: Number(e.target.value) || 3,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="estadoToggle"
                      type="checkbox"
                      checked={form.estado}
                      onChange={(e) =>
                        setForm({ ...form, estado: e.target.checked })
                      }
                    />
                    <Label htmlFor="estadoToggle" className="text-sm">
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
          </>
        )}
      </div>
    </AppShell>
  );
}
