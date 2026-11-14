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
  actualizarJustificacion,
  crearJustificacion,
  eliminarJustificacion,
  indexarPor,
  listarAlumnos,
  listarAsignaciones,
  listarAsignaturas,
  listarAsistencias,
  listarJustificaciones,
  listarMatriculas,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Alumno,
  AsignacionDocente,
  Asignatura,
  Asistencia,
  JustificacionAusencia,
  Matricula,
  Seccion,
} from "@/lib/types";
import {
  formatearFecha,
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
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";

interface FilaJustificacion {
  id: number;
  alumno: string;
  iniciales: string;
  motivo: string;
  materia: string;
  seccion: string;
  fechaAsistencia: string;
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
  documento: string | null;
  observacion: string | null;
  fechaAprobacion: string;
}

function varianteEstado(estado: string) {
  const valor = normalizar(estado);
  if (valor.includes("aprob")) return "success" as const;
  if (valor.includes("rechaz")) return "danger" as const;
  if (valor.includes("pend")) return "warning" as const;
  return "default" as const;
}

export default function JustificacionesPage() {
  const [justificaciones, setJustificaciones] = useState<JustificacionAusencia[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [seleccionada, setSeleccionada] = useState<FilaJustificacion | null>(null);
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [justificacionEditando, setJustificacionEditando] = useState<JustificacionAusencia | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    asistenciaId: "",
    motivo: "",
    fechaDesde: "",
    fechaHasta: "",
    documentoAdjunto: "",
    estado: "Pendiente",
    observacionAprobacion: "",
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("justificaciones")) return;
    setCargando(true);
    setError(null);
    try {
      const [j, asi, mat, al, asg, asig, sec] = await Promise.all([
        listarJustificaciones(),
        listarAsistencias(),
        listarMatriculas(),
        listarAlumnos(),
        listarAsignaciones(),
        listarAsignaturas(),
        listarSecciones(),
      ]);
      setJustificaciones(j);
      setAsistencias(asi);
      setMatriculas(mat);
      setAlumnos(al);
      setAsignaciones(asg);
      setAsignaturas(asig);
      setSecciones(sec);
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

  const filas = useMemo<FilaJustificacion[]>(() => {
    const asistenciasPorId = indexarPor(asistencias);
    const matriculasPorId = indexarPor(matriculas);
    const alumnosPorId = indexarPor(alumnos);
    const asignacionesPorId = indexarPor(asignaciones);
    const asignaturasPorId = indexarPor(asignaturas);
    const seccionesPorId = indexarPor(secciones);

    return justificaciones.map((justificacion) => {
      const asistencia = asistenciasPorId.get(justificacion.asistenciaId);
      const matricula = asistencia
        ? matriculasPorId.get(asistencia.matriculaId)
        : undefined;
      const alumno = matricula ? alumnosPorId.get(matricula.alumnoId) : undefined;
      const asignacion = asistencia
        ? asignacionesPorId.get(asistencia.asignacionDocenteId)
        : undefined;
      const asignatura = asignacion
        ? asignaturasPorId.get(asignacion.asignaturaId)
        : undefined;
      const seccion = asignacion
        ? seccionesPorId.get(asignacion.seccionId)
        : undefined;

      return {
        id: justificacion.id,
        alumno: alumno
          ? nombreCompleto(alumno.nombre, alumno.apellido)
          : `Matrícula #${asistencia?.matriculaId ?? "—"}`,
        iniciales: alumno ? iniciales(alumno.nombre, alumno.apellido) : "?",
        motivo: justificacion.motivo ?? "Sin motivo detallado",
        materia: asignatura?.nombre ?? "Sin materia",
        seccion: seccion ? `${seccion.nombre} · ${seccion.turno}` : "Sin sección",
        fechaAsistencia: formatearFecha(asistencia?.fecha),
        fechaDesde: formatearFecha(justificacion.fechaDesde),
        fechaHasta: formatearFecha(justificacion.fechaHasta),
        estado: justificacion.estado ?? "Sin estado",
        documento: justificacion.documentoAdjunto,
        observacion: justificacion.observacionAprobacion,
        fechaAprobacion: formatearFechaHora(justificacion.fechaAprobacion),
      };
    });
  }, [justificaciones, asistencias, matriculas, alumnos, asignaciones, asignaturas, secciones]);

  const estados = useMemo(
    () => Array.from(new Set(filas.map((f) => f.estado))),
    [filas]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const texto = normalizar(
        `${fila.alumno} ${fila.motivo} ${fila.materia} ${fila.seccion} ${fila.estado}`
      );
      return (
        (!q || texto.includes(q)) &&
        (estadoFiltro === "todos" || fila.estado === estadoFiltro)
      );
    });
  }, [filas, busqueda, estadoFiltro]);

  const resumen = useMemo(() => {
    const pendientes = filas.filter((f) =>
      normalizar(f.estado).includes("pend")
    ).length;
    const aprobadas = filas.filter((f) =>
      normalizar(f.estado).includes("aprob")
    ).length;
    const rechazadas = filas.filter((f) =>
      normalizar(f.estado).includes("rechaz")
    ).length;
    return { total: filas.length, pendientes, aprobadas, rechazadas };
  }, [filas]);

  const esAlumno = rol === "Alumno";
  const esTutor = rol === "Tutor";
  const esDirector = rol === "Director";
  // El maestro consulta pero no crea justificaciones; alumno y tutor solo las propias.
  const puedeCrear = esDirector || esAlumno || esTutor;
  // Alumno/tutor solo editan las propias mientras estén pendientes.
  const puedeEditar = (estado: string) =>
    esDirector || normalizar(estado).includes("pend") || estado === "Sin estado";

  const ESTADOS_JUSTIFICACION = ["Pendiente", "Aprobada", "Rechazada"];

  // Opciones de asistencia para el formulario (alumno/tutor solo ven las propias)
  const opcionesAsistencia = useMemo(() => {
    const matriculasPorId = indexarPor(matriculas);
    const alumnosPorId = indexarPor(alumnos);
    const asignacionesPorId = indexarPor(asignaciones);
    const asignaturasPorId = indexarPor(asignaturas);
    const seccionesPorId = indexarPor(secciones);
    return asistencias.map((a) => {
      const matricula = matriculasPorId.get(a.matriculaId);
      const alumno = matricula ? alumnosPorId.get(matricula.alumnoId) : undefined;
      const asignacion = asignacionesPorId.get(a.asignacionDocenteId);
      const asignatura = asignacion
        ? asignaturasPorId.get(asignacion.asignaturaId)
        : undefined;
      const seccion = asignacion ? seccionesPorId.get(asignacion.seccionId) : undefined;
      const quien = alumno
        ? nombreCompleto(alumno.nombre, alumno.apellido)
        : `Matrícula #${a.matriculaId}`;
      return {
        id: a.id,
        etiqueta: `${quien} · ${a.fecha} · ${a.estado} · ${asignatura?.nombre ?? "Materia"} (${seccion?.nombre ?? "Sección"})`,
      };
    });
  }, [asistencias, matriculas, alumnos, asignaciones, asignaturas, secciones]);

  const resetForm = () => {
    setForm({
      asistenciaId: "",
      motivo: "",
      fechaDesde: "",
      fechaHasta: "",
      documentoAdjunto: "",
      estado: "Pendiente",
      observacionAprobacion: "",
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!puedeCrear) return;
    setModoCreacion(true);
    setJustificacionEditando(null);
    const hoy = new Date().toISOString().slice(0, 10);
    setForm({
      asistenciaId: "",
      motivo: "",
      fechaDesde: hoy,
      fechaHasta: hoy,
      documentoAdjunto: "",
      estado: "Pendiente",
      observacionAprobacion: "",
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const abrirEditar = (id: number) => {
    const justificacion = justificaciones.find((j) => j.id === id);
    if (!justificacion) return;
    const estado = justificacion.estado ?? "Pendiente";
    if (!puedeEditar(estado)) return;
    setModoCreacion(false);
    setJustificacionEditando(justificacion);
    setForm({
      asistenciaId: "",
      motivo: justificacion.motivo ?? "",
      fechaDesde: justificacion.fechaDesde ? justificacion.fechaDesde.slice(0, 10) : "",
      fechaHasta: justificacion.fechaHasta ? justificacion.fechaHasta.slice(0, 10) : "",
      documentoAdjunto: justificacion.documentoAdjunto ?? "",
      estado,
      observacionAprobacion: justificacion.observacionAprobacion ?? "",
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (modoCreacion && !form.asistenciaId) {
      errores.asistenciaId = "Seleccioná la ausencia a justificar.";
    }
    if (!form.motivo.trim()) {
      errores.motivo = "El motivo es obligatorio.";
    }
    if (!form.fechaDesde) {
      errores.fechaDesde = "La fecha inicial es obligatoria.";
    }
    if (!form.fechaHasta) {
      errores.fechaHasta = "La fecha final es obligatoria.";
    }
    if (form.fechaDesde && form.fechaHasta && form.fechaHasta < form.fechaDesde) {
      errores.fechaHasta = "La fecha final no puede ser anterior a la inicial.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      if (modoCreacion) {
        await crearJustificacion({
          asistenciaId: Number(form.asistenciaId),
          motivo: form.motivo.trim(),
          fechaDesde: form.fechaDesde,
          fechaHasta: form.fechaHasta,
          documentoAdjunto: form.documentoAdjunto || null,
        });
      } else if (justificacionEditando) {
        await actualizarJustificacion(justificacionEditando.id, {
          motivo: form.motivo.trim(),
          fechaDesde: form.fechaDesde,
          fechaHasta: form.fechaHasta,
          documentoAdjunto: form.documentoAdjunto || null,
          estado: esDirector ? form.estado : null,
          observacionAprobacion: esDirector ? form.observacionAprobacion || null : null,
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
    if (!esDirector) return;
    setIdAEliminar(id);
    setConfirmarEliminar(true);
  };

  const eliminar = async () => {
    if (!idAEliminar) return;
    setEliminandoId(idAEliminar);
    try {
      await eliminarJustificacion(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      setSeleccionada(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  return (
    <AppShell
      titulo={esAlumno || esTutor ? "Mis justificaciones" : "Justificaciones"}
      subtitulo={
        esAlumno || esTutor
          ? "Justificaciones de ausencia registradas en tu expediente"
          : "Solicitudes de justificación de ausencias del colegio"
      }
      acciones={
        <>
          <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
            <RefreshIcon className="h-4 w-4" />
            Actualizar
          </Button>
          {puedeCrear && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" />
              Nueva justificación
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Justificaciones"
            valor={resumen.total}
            detalle="Solicitudes registradas"
            icon={FileTextIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Pendientes"
            valor={resumen.pendientes}
            detalle="Esperando revisión"
            icon={ClockIcon}
            color="from-amber-500 to-orange-500"
          />
          <StatCard
            titulo="Aprobadas"
            valor={resumen.aprobadas}
            detalle="Ausencias justificadas"
            icon={CheckCircleIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Rechazadas"
            valor={resumen.rechazadas}
            detalle="Solicitudes no aceptadas"
            icon={XIcon}
            color="from-red-500 to-rose-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar estudiante, motivo o materia…"
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

          {cargando ? (
            <div className="p-4">
              <Cargando texto="Cargando justificaciones…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin justificaciones"
                descripcion="No hay solicitudes que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Estudiante</th>
                      <th className="px-4 py-3 font-semibold">Motivo</th>
                      <th className="px-4 py-3 font-semibold">Periodo</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtradas.map((fila) => (
                      <tr key={fila.id} className="transition hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                              {fila.iniciales}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {fila.alumno}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {fila.materia} · {fila.seccion}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <p className="line-clamp-2 text-slate-700">{fila.motivo}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {fila.fechaDesde}
                          {fila.fechaHasta !== fila.fechaDesde && ` – ${fila.fechaHasta}`}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={varianteEstado(fila.estado)}>
                            {fila.estado}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {puedeEditar(fila.estado) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirEditar(fila.id)}
                              >
                                <EditIcon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {esDirector && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => solicitarEliminar(fila.id)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSeleccionada(fila)}
                            >
                              Ver detalle
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filtradas.map((fila) => (
                  <div key={fila.id} className="p-4">
                    <button
                      type="button"
                      onClick={() => setSeleccionada(fila)}
                      className="flex w-full items-start gap-3 text-left transition hover:bg-slate-50"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                        {fila.iniciales}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {fila.alumno}
                          </p>
                          <Badge variant={varianteEstado(fila.estado)}>
                            {fila.estado}
                          </Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {fila.motivo}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {fila.fechaDesde} · {fila.materia}
                        </p>
                      </div>
                    </button>
                    {(puedeEditar(fila.estado) || esDirector) && (
                      <div className="mt-2 flex items-center justify-end gap-1">
                        {puedeEditar(fila.estado) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEditar(fila.id)}
                          >
                            <EditIcon className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                        )}
                        {esDirector && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => solicitarEliminar(fila.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!cargando && !error && (
            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              Mostrando {filtradas.length} de {filas.length} justificaciones
            </div>
          )}
        </section>
      </div>

      <Modal
        abierto={seleccionada !== null}
        onCerrar={() => setSeleccionada(null)}
        titulo="Detalle de la justificación"
        descripcion="Información de la ausencia y su proceso de aprobación"
      >
        {seleccionada && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 text-white">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur">
                {seleccionada.iniciales}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{seleccionada.alumno}</p>
                <p className="text-sm text-indigo-100">
                  {seleccionada.materia} · {seleccionada.seccion}
                </p>
              </div>
              <Badge
                variant={varianteEstado(seleccionada.estado)}
                className="ml-auto shrink-0 bg-white/90"
              >
                {seleccionada.estado}
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Motivo
              </p>
              <p className="mt-1 text-sm text-slate-800">{seleccionada.motivo}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Fecha de la ausencia
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.fechaAsistencia}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Periodo justificado
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.fechaDesde} – {seleccionada.fechaHasta}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Fecha de aprobación
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.fechaAprobacion}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Documento adjunto
                </p>
                {seleccionada.documento ? (
                  <a
                    href={seleccionada.documento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Ver documento
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-900">Sin documento</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Observación de aprobación
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {seleccionada.observacion ?? "Sin observaciones registradas."}
              </p>
            </div>

            <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <UsersIcon className="h-3.5 w-3.5" />
              Justificación asociada al registro de asistencia del estudiante.
            </p>

            {(puedeEditar(seleccionada.estado) || esDirector) && (
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSeleccionada(null);
                    abrirEditar(seleccionada.id);
                  }}
                >
                  <EditIcon className="h-4 w-4" />
                  Editar
                </Button>
                {esDirector && (
                  <Button
                    variant="destructive"
                    onClick={() => solicitarEliminar(seleccionada.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de crear/editar justificación */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={
          modoCreacion ? "Justificar una ausencia" : "Editar justificación"
        }
        descripcion={
          modoCreacion
            ? "La solicitud nace como pendiente y el director la revisará."
            : esDirector
              ? "Como director podés corregir el motivo, las fechas y resolver la solicitud."
              : "Podés corregir el motivo, las fechas y el documento mientras siga pendiente."
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
              <Label htmlFor="asistenciaJustificacion">Ausencia a justificar</Label>
              <Select
                id="asistenciaJustificacion"
                value={form.asistenciaId}
                onChange={(e) =>
                  setForm({ ...form, asistenciaId: e.target.value })
                }
              >
                <option value="">Seleccioná la ausencia…</option>
                {opcionesAsistencia.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.etiqueta}
                  </option>
                ))}
              </Select>
              {erroresForm.asistenciaId && (
                <p className="text-xs text-red-600">
                  {erroresForm.asistenciaId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="motivoJustificacion">Motivo</Label>
            <Input
              id="motivoJustificacion"
              placeholder="Ej: Cita médica de urgencia"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
            {erroresForm.motivo && (
              <p className="text-xs text-red-600">{erroresForm.motivo}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fechaDesdeJustificacion">Desde</Label>
              <Input
                id="fechaDesdeJustificacion"
                type="date"
                value={form.fechaDesde}
                onChange={(e) =>
                  setForm({ ...form, fechaDesde: e.target.value })
                }
              />
              {erroresForm.fechaDesde && (
                <p className="text-xs text-red-600">
                  {erroresForm.fechaDesde}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fechaHastaJustificacion">Hasta</Label>
              <Input
                id="fechaHastaJustificacion"
                type="date"
                value={form.fechaHasta}
                onChange={(e) =>
                  setForm({ ...form, fechaHasta: e.target.value })
                }
              />
              {erroresForm.fechaHasta && (
                <p className="text-xs text-red-600">
                  {erroresForm.fechaHasta}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="documentoJustificacion">
              Enlace del documento adjunto (opcional)
            </Label>
            <Input
              id="documentoJustificacion"
              placeholder="https://…"
              value={form.documentoAdjunto}
              onChange={(e) =>
                setForm({ ...form, documentoAdjunto: e.target.value })
              }
            />
          </div>

          {!modoCreacion && esDirector && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="estadoJustificacion">Resolución</Label>
                <Select
                  id="estadoJustificacion"
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value })
                  }
                >
                  {ESTADOS_JUSTIFICACION.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="observacionAprobacion">
                  Observación de aprobación
                </Label>
                <Input
                  id="observacionAprobacion"
                  placeholder="Ej: Constancia médica verificada"
                  value={form.observacionAprobacion}
                  onChange={(e) =>
                    setForm({ ...form, observacionAprobacion: e.target.value })
                  }
                />
              </div>
            </>
          )}

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
                  ? "Enviar justificación"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar justificación"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar esta justificación? La ausencia
            quedará sin justificar en el expediente del estudiante.
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
