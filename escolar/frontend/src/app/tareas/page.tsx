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
  actualizarTarea,
  crearTarea,
  eliminarTarea,
  indexarPor,
  listarAsignaciones,
  listarAsignaturas,
  listarEntregas,
  listarSecciones,
  listarTareas,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  AsignacionDocente,
  Asignatura,
  EntregaTarea,
  Seccion,
  Tarea,
} from "@/lib/types";
import {
  formatearFechaHora,
  iniciales,
  normalizar,
  nombreCompleto,
} from "@/lib/format";
import {
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  FileTextIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface FilaTarea {
  id: number;
  titulo: string;
  descripcion: string;
  materia: string;
  seccion: string;
  docente: string;
  fechaLimite: string;
  fechaLimiteTexto: string;
  publicadaTexto: string;
  puntos: number | null;
  activa: boolean;
  vencida: boolean;
  proxima: boolean;
  entregas: EntregaTarea[];
  entregaPropia: EntregaTarea | null;
}

function varianteEntrega(estado: string | null | undefined) {
  const valor = normalizar(estado);
  if (valor.includes("calific") || valor.includes("aprob")) return "success" as const;
  if (valor.includes("revis") || valor.includes("entreg")) return "info" as const;
  if (valor.includes("tard") || valor.includes("rechaz")) return "danger" as const;
  return "default" as const;
}

function varianteTarea(fila: FilaTarea) {
  if (!fila.activa) return "default" as const;
  if (fila.vencida) return "danger" as const;
  if (fila.proxima) return "warning" as const;
  return "success" as const;
}

function etiquetaTarea(fila: FilaTarea) {
  if (!fila.activa) return "Cerrada";
  if (fila.vencida) return "Vencida";
  if (fila.proxima) return "Por vencer";
  return "Activa";
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [materiaFiltro, setMateriaFiltro] = useState("todas");
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [pestana, setPestana] = useState<"pendientes" | "entregadas" | "todas">("pendientes");
  const [seleccionada, setSeleccionada] = useState<FilaTarea | null>(null);
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    asignacionDocenteId: "",
    evaluacionId: "",
    titulo: "",
    descripcion: "",
    fechaLimite: "",
    valorPuntos: "",
    archivoAdjunto: "",
    estado: true,
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("tareas")) return;
    setCargando(true);
    setError(null);
    try {
      const [t, e, asig, asigt, s] = await Promise.all([
        listarTareas(),
        listarEntregas(),
        listarAsignaciones(),
        listarAsignaturas(),
        listarSecciones(),
      ]);
      setTareas(t);
      setEntregas(e);
      setAsignaciones(asig);
      setAsignaturas(asigt);
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

  const filas = useMemo<FilaTarea[]>(() => {
    const ahora = Date.now();
    const enSieteDias = ahora + 7 * 24 * 60 * 60 * 1000;

    return tareas
      .map((tarea) => {
        const asignacion = tarea.asignacionDocente;
        const materia = asignacion?.asignatura?.nombre ?? "Sin materia";
        const seccion = asignacion?.seccion
          ? `${asignacion.seccion.nombre} · ${asignacion.seccion.turno}`
          : "Sin sección";
        const docente = asignacion?.maestro
          ? nombreCompleto(asignacion.maestro.nombre, asignacion.maestro.apellido)
          : "Sin docente";
        const limite = tarea.fechaLimite ? new Date(tarea.fechaLimite).getTime() : 0;
        const activa = tarea.estado !== false && limite >= ahora;
        const vencida = limite > 0 && limite < ahora;
        const proxima = !vencida && limite > 0 && limite <= enSieteDias;
        const propias = entregas.filter((entrega) => entrega.tareaId === tarea.id);

        return {
          id: tarea.id,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion ?? "Sin descripción",
          materia,
          seccion,
          docente,
          fechaLimite: tarea.fechaLimite ?? "",
          fechaLimiteTexto: formatearFechaHora(tarea.fechaLimite),
          publicadaTexto: formatearFechaHora(tarea.fechaPublicacion),
          puntos: tarea.valorPuntos,
          activa,
          vencida,
          proxima,
          entregas: propias,
          entregaPropia: propias[0] ?? null,
        };
      })
      .sort((a, b) =>
        a.fechaLimite < b.fechaLimite ? 1 : a.fechaLimite > b.fechaLimite ? -1 : 0
      );
  }, [tareas, entregas]);

  const materias = useMemo(
    () =>
      Array.from(new Set(filas.map((f) => f.materia))).filter(
        (m) => m !== "Sin materia"
      ),
    [filas]
  );

  const esAlumno = rol === "Alumno";
  const esTutor = rol === "Tutor";
  const puedeGestionar = rol === "Director" || rol === "Maestro";

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      // Filtro de pestaña para alumnos y tutores
      if (esAlumno || esTutor) {
        if (pestana === "pendientes" && (fila.entregaPropia || fila.vencida)) return false;
        if (pestana === "entregadas" && !fila.entregaPropia) return false;
      }

      const texto = normalizar(
        `${fila.titulo} ${fila.descripcion} ${fila.materia} ${fila.seccion} ${fila.docente}`
      );
      const coincideTexto = !q || texto.includes(q);
      const coincideMateria = materiaFiltro === "todas" || fila.materia === materiaFiltro;
      const coincideEstado =
        estadoFiltro === "todas" ||
        (estadoFiltro === "activas" && fila.activa) ||
        (estadoFiltro === "vencidas" && fila.vencida) ||
        (estadoFiltro === "cerradas" && !fila.activa);
      return coincideTexto && coincideMateria && coincideEstado;
    });
  }, [filas, busqueda, materiaFiltro, estadoFiltro, pestana, esAlumno, esTutor]);

  // Opciones para los selects del formulario
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
      evaluacionId: "",
      titulo: "",
      descripcion: "",
      fechaLimite: "",
      valorPuntos: "",
      archivoAdjunto: "",
      estado: true,
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!puedeGestionar) return;
    setModoCreacion(true);
    setTareaEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (fila: FilaTarea) => {
    if (!puedeGestionar) return;
    const tarea = tareas.find((t) => t.id === fila.id);
    if (!tarea) return;
    setModoCreacion(false);
    setTareaEditando(tarea);
    setForm({
      asignacionDocenteId: String(tarea.asignacionDocenteId ?? ""),
      evaluacionId: tarea.evaluacionId ? String(tarea.evaluacionId) : "",
      titulo: tarea.titulo,
      descripcion: tarea.descripcion ?? "",
      fechaLimite: tarea.fechaLimite ? tarea.fechaLimite.slice(0, 16) : "",
      valorPuntos: tarea.valorPuntos !== null ? String(tarea.valorPuntos) : "",
      archivoAdjunto: tarea.archivoAdjunto ?? "",
      estado: tarea.estado !== false,
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (!form.asignacionDocenteId) {
      errores.asignacionDocenteId = "Seleccioná la materia y sección.";
    }
    if (!form.titulo.trim()) {
      errores.titulo = "El título es obligatorio.";
    }
    if (!form.fechaLimite) {
      errores.fechaLimite = "La fecha límite es obligatoria.";
    }
    if (
      form.valorPuntos !== "" &&
      (Number.isNaN(Number(form.valorPuntos)) || Number(form.valorPuntos) < 0)
    ) {
      errores.valorPuntos = "Ingresá un puntaje válido.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        asignacionDocenteId: Number(form.asignacionDocenteId),
        evaluacionId: form.evaluacionId ? Number(form.evaluacionId) : null,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion || null,
        fechaPublicacion: modoCreacion ? new Date().toISOString() : null,
        fechaLimite: new Date(form.fechaLimite).toISOString(),
        valorPuntos: form.valorPuntos === "" ? null : Number(form.valorPuntos),
        archivoAdjunto: form.archivoAdjunto || null,
        estado: form.estado,
      };
      if (modoCreacion) {
        await crearTarea(payload);
      } else if (tareaEditando) {
        await actualizarTarea(tareaEditando.id, payload);
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
      await eliminarTarea(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  const resumen = useMemo(() => {
    const activas = filas.filter((f) => f.activa).length;
    const vencidas = filas.filter((f) => f.vencida).length;
    const totalEntregas = esAlumno || esTutor
      ? filas.filter((f) => f.entregaPropia).length
      : entregas.length;
    const sinEntrega = esAlumno || esTutor
      ? filas.filter((f) => !f.entregaPropia).length
      : filas.filter((f) => f.entregas.length === 0).length;
    return { total: filas.length, activas, vencidas, totalEntregas, sinEntrega };
  }, [filas, entregas, esAlumno, esTutor]);

  return (
    <AppShell
      titulo={esAlumno ? "Mis tareas" : "Tareas"}
      subtitulo={
        esAlumno
          ? "Trabajos asignados y estado de tus entregas"
          : "Trabajos publicados por materia, sección y docente"
      }
      acciones={
        <>
          <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
            <RefreshIcon className="h-4 w-4" />
            Actualizar
          </Button>
          {puedeGestionar && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" />
              Nueva tarea
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Tareas"
            valor={resumen.total}
            detalle="Trabajos publicados"
            icon={FileTextIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Activas"
            valor={resumen.activas}
            detalle="Dentro del plazo de entrega"
            icon={ClockIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo={esAlumno || esTutor ? "Entregadas" : "Entregas"}
            valor={resumen.totalEntregas}
            detalle={
              esAlumno || esTutor
                ? "Tareas que ya entregaste"
                : "Entregas recibidas en total"
            }
            icon={CheckCircleIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Vencidas"
            valor={resumen.vencidas}
            detalle={`${resumen.sinEntrega} sin entrega registrada`}
            icon={ClockIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Pestañas estilo MariaPaz */}
          {(esAlumno || esTutor) && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <button
                type="button"
                onClick={() => setPestana("pendientes")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  pestana === "pendientes"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                )}
              >
                <span>📌 Pendientes de entrega</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    pestana === "pendientes"
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  {filas.filter((f) => !f.entregaPropia && !f.vencida).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPestana("entregadas")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  pestana === "entregadas"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                )}
              >
                <span>✅ Entregadas y Calificadas</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-bold",
                    pestana === "entregadas"
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  {filas.filter((f) => !!f.entregaPropia).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPestana("todas")}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all",
                  pestana === "todas"
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                )}
              >
                <span>Todas ({filas.length})</span>
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar tarea, materia o docente…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={materiaFiltro}
                onChange={(e) => setMateriaFiltro(e.target.value)}
                className="w-48"
                aria-label="Filtrar por materia"
              >
                <option value="todas">Todas las materias</option>
                {materias.map((materia) => (
                  <option key={materia} value={materia}>
                    {materia}
                  </option>
                ))}
              </Select>
              <Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-44"
                aria-label="Filtrar por estado"
              >
                <option value="todas">Todos los estados</option>
                <option value="activas">Activas</option>
                <option value="vencidas">Vencidas</option>
                <option value="cerradas">Cerradas</option>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            {cargando ? (
              <Cargando texto="Cargando tareas…" />
            ) : error ? (
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            ) : filtradas.length === 0 ? (
              <Vacio
                titulo="Sin tareas"
                descripcion="No hay tareas que coincidan con los filtros seleccionados."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filtradas.map((fila) => (
                  <article
                    key={fila.id}
                    className="card-hover group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
                          <FileTextIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-tight text-slate-900">
                            {fila.titulo}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Entrega: {fila.fechaLimiteTexto}
                          </p>
                        </div>
                      </div>
                      <Badge variant={varianteTarea(fila)}>{etiquetaTarea(fila)}</Badge>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {fila.descripcion}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="brand">{fila.materia}</Badge>
                      <Badge variant="info">{fila.seccion}</Badge>
                      {fila.puntos !== null && fila.puntos !== undefined && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <FileTextIcon className="h-3.5 w-3.5" />
                          {fila.puntos} pts
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="inline-flex min-w-0 items-center gap-1 text-xs text-slate-500">
                        <UsersIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{fila.docente}</span>
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {esAlumno || esTutor ? (
                          <Badge
                            variant={
                              fila.entregaPropia
                                ? varianteEntrega(fila.entregaPropia.estado)
                                : "warning"
                            }
                          >
                            {fila.entregaPropia
                              ? fila.entregaPropia.estado ?? "Entregada"
                              : "Pendiente"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {fila.entregas.length}{" "}
                            {fila.entregas.length === 1 ? "entrega" : "entregas"}
                          </span>
                        )}
                        {puedeGestionar && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirEditar(fila)}
                            >
                              <EditIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => solicitarEliminar(fila.id)}
                              disabled={rol !== "Director"}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSeleccionada(fila)}
                        >
                          Ver detalle
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {!cargando && !error && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Mostrando {filtradas.length} de {filas.length} tareas
            </p>
          )}
        </section>
      </div>

      <Modal
        abierto={seleccionada !== null}
        onCerrar={() => setSeleccionada(null)}
        titulo={seleccionada?.titulo ?? "Detalle de la tarea"}
        descripcion="Información del trabajo y sus entregas"
      >
        {seleccionada && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/20 text-white ring-white/30">
                  {seleccionada.materia}
                </Badge>
                <Badge className="bg-white/20 text-white ring-white/30">
                  {seleccionada.seccion}
                </Badge>
                <Badge
                  variant={varianteTarea(seleccionada)}
                  className="ml-auto bg-white/90"
                >
                  {etiquetaTarea(seleccionada)}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-indigo-100">
                {seleccionada.descripcion}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Docente
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.docente}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Fecha límite
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.fechaLimiteTexto}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Publicada
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.publicadaTexto}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Valor
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.puntos !== null && seleccionada.puntos !== undefined
                    ? `${seleccionada.puntos} puntos`
                    : "Sin puntaje"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                {esAlumno || esTutor ? "Tu entrega" : "Entregas recibidas"}
              </h3>
              {(esAlumno || esTutor
                ? seleccionada.entregaPropia
                  ? [seleccionada.entregaPropia]
                  : []
                : seleccionada.entregas
              ).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-center text-sm text-slate-500">
                  {esAlumno || esTutor
                    ? "Todavía no registraste una entrega para esta tarea."
                    : "Esta tarea aún no tiene entregas registradas."}
                </div>
              ) : (
                <ul className="space-y-2">
                  {(esAlumno || esTutor
                    ? seleccionada.entregaPropia
                      ? [seleccionada.entregaPropia]
                      : []
                    : seleccionada.entregas
                  ).map((entrega) => (
                    <li
                      key={entrega.id}
                      className="rounded-xl border border-slate-100 bg-white p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                          {entrega.alumno
                            ? iniciales(entrega.alumno.nombre, entrega.alumno.apellido)
                            : "?"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {entrega.alumno
                              ? nombreCompleto(
                                  entrega.alumno.nombre,
                                  entrega.alumno.apellido
                                )
                              : "Estudiante"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatearFechaHora(entrega.fechaEntrega)}
                          </p>
                        </div>
                        <Badge variant={varianteEntrega(entrega.estado)}>
                          {entrega.estado ?? "Sin estado"}
                        </Badge>
                      </div>
                      {entrega.contenido && (
                        <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                          {entrega.contenido}
                        </p>
                      )}
                      {entrega.observacionProfesor && (
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="font-semibold">Observación:</span>{" "}
                          {entrega.observacionProfesor}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de crear/editar tarea */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Publicar nueva tarea" : "Editar tarea"}
        descripcion={
          modoCreacion
            ? "Los estudiantes verán la tarea en su panel con la fecha límite."
            : "Los estudiantes verán los cambios de inmediato."
        }
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="asignacionTarea">Materia y sección</Label>
            <Select
              id="asignacionTarea"
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

          <div className="space-y-1.5">
            <Label htmlFor="tituloTarea">Título</Label>
            <Input
              id="tituloTarea"
              placeholder="Ej: Guía de ejercicios 3"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            {erroresForm.titulo && (
              <p className="text-xs text-red-600">{erroresForm.titulo}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcionTarea">Descripción</Label>
            <Input
              id="descripcionTarea"
              placeholder="Ej: Resolver los ejercicios del 1 al 10"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fechaLimiteTarea">Fecha límite</Label>
              <Input
                id="fechaLimiteTarea"
                type="datetime-local"
                value={form.fechaLimite}
                onChange={(e) =>
                  setForm({ ...form, fechaLimite: e.target.value })
                }
              />
              {erroresForm.fechaLimite && (
                <p className="text-xs text-red-600">{erroresForm.fechaLimite}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="puntosTarea">Valor en puntos (opcional)</Label>
              <Input
                id="puntosTarea"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 10"
                value={form.valorPuntos}
                onChange={(e) =>
                  setForm({ ...form, valorPuntos: e.target.value })
                }
              />
              {erroresForm.valorPuntos && (
                <p className="text-xs text-red-600">{erroresForm.valorPuntos}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="estadoTarea"
              type="checkbox"
              checked={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
            />
            <Label htmlFor="estadoTarea" className="cursor-pointer">
              Tarea visible para los estudiantes
            </Label>
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
                  ? "Publicar tarea"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar tarea"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar esta tarea? Se eliminarán también sus
            referencias en las entregas de los estudiantes.
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
