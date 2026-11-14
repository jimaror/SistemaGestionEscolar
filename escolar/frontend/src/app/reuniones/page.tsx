"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { Cargando, ErrorEstado, Vacio } from "@/components/data-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import {
  actualizarReunion,
  crearReunion,
  eliminarReunion,
  indexarPor,
  listarAsignaciones,
  listarAsignaturas,
  listarReuniones,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type { AsignacionDocente, Asignatura, Reunion, Seccion } from "@/lib/types";
import { formatearFechaHora, normalizar } from "@/lib/format";
import {
  BookIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  EditIcon,
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons";

interface FilaReunion {
  id: number;
  titulo: string;
  descripcion: string;
  materia: string;
  seccion: string;
  fechaHora: string;
  fechaTexto: string;
  duracion: number;
  estado: string;
  enlace: string | null;
}

function varianteEstado(estado: string) {
  const valor = normalizar(estado);
  if (valor.includes("program")) return "info" as const;
  if (valor.includes("realiz") || valor.includes("complet") || valor.includes("finaliz"))
    return "success" as const;
  if (valor.includes("cancel")) return "danger" as const;
  return "default" as const;
}

export default function ReunionesPage() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [reunionEditando, setReunionEditando] = useState<Reunion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    asignacionDocenteId: "",
    titulo: "",
    descripcion: "",
    enlace: "",
    fechaHora: "",
    duracionMinutos: "",
    estado: "Programada",
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("reuniones")) return;
    setCargando(true);
    setError(null);
    try {
      const [r, a, asig, s] = await Promise.all([
        listarReuniones(),
        listarAsignaciones(),
        listarAsignaturas(),
        listarSecciones(),
      ]);
      setReuniones(r);
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
    setRol(localStorage.getItem("rol") ?? "");
    void cargar();
  }, [cargar]);

  const puedeGestionar = rol === "Director" || rol === "Maestro";

  // Opciones para el select de asignación del formulario
  const opcionesAsignacion = useMemo(() => {
    const asignaturasPorId = indexarPor(asignaturas);
    const seccionesPorId = indexarPor(secciones);
    return asignaciones.map((a) => {
      const asignatura = asignaturasPorId.get(a.asignaturaId);
      const seccion = seccionesPorId.get(a.seccionId);
      return {
        id: a.id,
        etiqueta: `${asignatura?.nombre ?? "Asignatura"} · ${seccion ? `${seccion.nombre} (${seccion.turno})` : `Sección #${a.seccionId}`}`,
      };
    });
  }, [asignaciones, asignaturas, secciones]);

  const resetForm = () => {
    setForm({
      asignacionDocenteId: "",
      titulo: "",
      descripcion: "",
      enlace: "",
      fechaHora: "",
      duracionMinutos: "",
      estado: "Programada",
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!puedeGestionar) return;
    setModoCreacion(true);
    setReunionEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (id: number) => {
    if (!puedeGestionar) return;
    const reunion = reuniones.find((r) => r.id === id);
    if (!reunion) return;
    setModoCreacion(false);
    setReunionEditando(reunion);
    setForm({
      asignacionDocenteId: "",
      titulo: reunion.titulo,
      descripcion: reunion.descripcion ?? "",
      enlace: reunion.enlace ?? "",
      fechaHora: reunion.fechaHora ? reunion.fechaHora.slice(0, 16) : "",
      duracionMinutos:
        reunion.duracionMinutos !== null ? String(reunion.duracionMinutos) : "",
      estado: reunion.estado ?? "Programada",
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (modoCreacion && !form.asignacionDocenteId) {
      errores.asignacionDocenteId = "Seleccioná la materia y sección.";
    }
    if (!form.titulo.trim()) {
      errores.titulo = "El título es obligatorio.";
    }
    if (!form.enlace.trim()) {
      errores.enlace = "El enlace es obligatorio.";
    }
    if (!form.fechaHora) {
      errores.fechaHora = "La fecha y hora son obligatorias.";
    }
    if (
      form.duracionMinutos !== "" &&
      (Number.isNaN(Number(form.duracionMinutos)) ||
        Number(form.duracionMinutos) <= 0)
    ) {
      errores.duracionMinutos = "Ingresá una duración en minutos.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      if (modoCreacion) {
        await crearReunion({
          asignacionDocenteId: Number(form.asignacionDocenteId),
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || null,
          enlace: form.enlace.trim(),
          fechaHora: new Date(form.fechaHora).toISOString(),
          duracionMinutos:
            form.duracionMinutos === "" ? null : Number(form.duracionMinutos),
          estado: form.estado,
        });
      } else if (reunionEditando) {
        await actualizarReunion(reunionEditando.id, {
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || null,
          enlace: form.enlace.trim(),
          fechaHora: new Date(form.fechaHora).toISOString(),
          duracionMinutos:
            form.duracionMinutos === "" ? null : Number(form.duracionMinutos),
          estado: form.estado,
        });
      }
      setModalAbierto(false);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const solicitarEliminar = (id: number) => {
    if (rol !== "Director") return;
    setIdAEliminar(id);
    setConfirmarEliminar(true);
  };

  const eliminar = async () => {
    if (!idAEliminar) return;
    setEliminandoId(idAEliminar);
    try {
      await eliminarReunion(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  const filas = useMemo<FilaReunion[]>(() => {
    const asignacionesPorId = indexarPor(asignaciones);
    const asignaturasPorId = indexarPor(asignaturas);
    const seccionesPorId = indexarPor(secciones);

    return reuniones
      .map((reunion) => {
        const asignacion = asignacionesPorId.get(reunion.asignacionDocenteId);
        const asignatura = asignacion
          ? asignaturasPorId.get(asignacion.asignaturaId)
          : undefined;
        const seccion = asignacion
          ? seccionesPorId.get(asignacion.seccionId)
          : undefined;
        return {
          id: reunion.id,
          titulo: reunion.titulo,
          descripcion: reunion.descripcion ?? "Sin descripción",
          materia: asignatura?.nombre ?? "—",
          seccion: seccion ? `${seccion.nombre} · ${seccion.turno}` : "—",
          fechaHora: reunion.fechaHora ?? "",
          fechaTexto: formatearFechaHora(reunion.fechaHora),
          duracion: reunion.duracionMinutos ?? 0,
          estado: reunion.estado ?? "Sin estado",
          enlace: reunion.enlace,
        };
      })
      .sort((a, b) => (a.fechaHora < b.fechaHora ? 1 : a.fechaHora > b.fechaHora ? -1 : 0));
  }, [reuniones, asignaciones, asignaturas, secciones]);

  const estados = useMemo(
    () => Array.from(new Set(filas.map((f) => f.estado))),
    [filas]
  );

  const ESTADOS_REUNION = useMemo(
    () =>
      Array.from(new Set(["Programada", "Realizada", "Cancelada", ...estados])),
    [estados]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const coincideTexto =
        !q ||
        normalizar(`${fila.titulo} ${fila.descripcion} ${fila.materia} ${fila.seccion}`).includes(q);
      return coincideTexto && (estadoFiltro === "todos" || fila.estado === estadoFiltro);
    });
  }, [filas, busqueda, estadoFiltro]);

  const resumen = useMemo(() => {
    const programadas = filas.filter((f) =>
      normalizar(f.estado).includes("program")
    ).length;
    const realizadas = filas.filter((f) =>
      normalizar(f.estado).includes("realiz")
    ).length;
    const canceladas = filas.filter((f) =>
      normalizar(f.estado).includes("cancel")
    ).length;
    return { total: filas.length, programadas, realizadas, canceladas };
  }, [filas]);

  return (
    <AppShell
      titulo="Reuniones"
      subtitulo="Encuentros programados con docentes, estudiantes y tutores"
      acciones={
        <>
          <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
            <RefreshIcon className="h-4 w-4" />
            Actualizar
          </Button>
          {puedeGestionar && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" />
              Nueva reunión
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Reuniones"
            valor={resumen.total}
            detalle="Encuentros registrados"
            icon={CalendarIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Programadas"
            valor={resumen.programadas}
            detalle="Pendientes de realizar"
            icon={ClockIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Realizadas"
            valor={resumen.realizadas}
            detalle="Encuentros completados"
            icon={CheckIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Canceladas"
            valor={resumen.canceladas}
            detalle="Encuentros suspendidos"
            icon={XIcon}
            color="from-red-500 to-rose-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar reunión, materia o sección…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-44"
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4">
            {cargando ? (
              <Cargando texto="Cargando reuniones…" />
            ) : error ? (
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            ) : filtradas.length === 0 ? (
              <Vacio
                titulo="Sin reuniones"
                descripcion="No hay reuniones que coincidan con los filtros seleccionados."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filtradas.map((fila) => (
                  <article
                    key={fila.id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
                          <CalendarIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-semibold leading-tight text-slate-900">
                            {fila.titulo}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">{fila.fechaTexto}</p>
                        </div>
                      </div>
                      <Badge variant={varianteEstado(fila.estado)}>{fila.estado}</Badge>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {fila.descripcion}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="brand">{fila.materia}</Badge>
                      <Badge variant="info">{fila.seccion}</Badge>
                      {fila.duracion > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {fila.duracion} min
                        </span>
                      )}
                    </div>

                    {puedeGestionar && (
                      <div className="mt-3 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => abrirEditar(fila.id)}
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => solicitarEliminar(fila.id)}
                          disabled={rol !== "Director"}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <BookIcon className="h-3.5 w-3.5" />
                        Reunión académica
                      </span>
                      {fila.enlace ? (
                        <a
                          href={fila.enlace}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          Unirse
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Sin enlace</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {!cargando && !error && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Mostrando {filtradas.length} de {filas.length} reuniones
            </p>
          )}
        </section>
      </div>

      {/* Modal de crear/editar reunión */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Programar nueva reunión" : "Editar reunión"}
        descripcion={
          modoCreacion
            ? "Los tutores y estudiantes de la sección verán la reunión con su enlace."
            : "Los cambios se reflejan de inmediato para los invitados."
        }
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
        >
          {modoCreacion && (
            <div className="space-y-1.5">
              <Label htmlFor="asignacionReunion">Materia y sección</Label>
              <Select
                id="asignacionReunion"
                value={form.asignacionDocenteId}
                onChange={(e) =>
                  setForm({ ...form, asignacionDocenteId: e.target.value })
                }
              >
                <option value="">Seleccioná la materia y sección…</option>
                {opcionesAsignacion.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.etiqueta}
                  </option>
                ))}
              </Select>
              {erroresForm.asignacionDocenteId && (
                <p className="text-xs text-red-600">
                  {erroresForm.asignacionDocenteId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tituloReunion">Título</Label>
            <Input
              id="tituloReunion"
              placeholder="Ej: Reunión de padres - Primer trimestre"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            {erroresForm.titulo && (
              <p className="text-xs text-red-600">{erroresForm.titulo}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcionReunion">Descripción</Label>
            <Input
              id="descripcionReunion"
              placeholder="Ej: Revisión de avances académicos"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="enlaceReunion">Enlace de la reunión</Label>
            <Input
              id="enlaceReunion"
              placeholder="https://meet.google.com/…"
              value={form.enlace}
              onChange={(e) => setForm({ ...form, enlace: e.target.value })}
            />
            {erroresForm.enlace && (
              <p className="text-xs text-red-600">{erroresForm.enlace}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fechaHoraReunion">Fecha y hora</Label>
              <Input
                id="fechaHoraReunion"
                type="datetime-local"
                value={form.fechaHora}
                onChange={(e) =>
                  setForm({ ...form, fechaHora: e.target.value })
                }
              />
              {erroresForm.fechaHora && (
                <p className="text-xs text-red-600">{erroresForm.fechaHora}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duracionReunion">Duración (minutos)</Label>
              <Input
                id="duracionReunion"
                type="number"
                min={1}
                placeholder="Ej: 45"
                value={form.duracionMinutos}
                onChange={(e) =>
                  setForm({ ...form, duracionMinutos: e.target.value })
                }
              />
              {erroresForm.duracionMinutos && (
                <p className="text-xs text-red-600">
                  {erroresForm.duracionMinutos}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estadoReunion">Estado</Label>
            <Select
              id="estadoReunion"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              {ESTADOS_REUNION.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" disabled={guardando}>
              {guardando
                ? "Guardando…"
                : modoCreacion
                  ? "Programar reunión"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar reunión"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar esta reunión? Los invitados ya no
            verán el enlace en su panel.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmarEliminar(false)}
              disabled={eliminandoId !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void eliminar()}
              disabled={eliminandoId !== null}
            >
              <TrashIcon className="h-4 w-4" />
              {eliminandoId !== null ? "Eliminando…" : "Sí, eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
