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
  actualizarAsistencia,
  crearAsistencia,
  eliminarAsistencia,
  indexarPor,
  listarAlumnos,
  listarAsignaciones,
  listarAsignaturas,
  listarAsistencias,
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
  Matricula,
  Seccion,
} from "@/lib/types";
import {
  formatearFecha,
  iniciales,
  normalizar,
  nombreCompleto,
  porcentaje,
} from "@/lib/format";
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  EditIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  TrendingUpIcon,
} from "@/components/icons";

const ESTADOS_ASISTENCIA = ["Presente", "Ausente", "Tardanza", "Justificada"];

interface FilaAsistencia {
  id: number;
  estudiante: string;
  iniciales: string;
  seccion: string;
  fecha: string;
  fechaTexto: string;
  estado: string;
  observacion: string;
}

function varianteEstado(estado: string) {
  const valor = normalizar(estado);
  if (valor.includes("present")) return "success" as const;
  if (valor.includes("ausent")) return "danger" as const;
  if (valor.includes("tard")) return "warning" as const;
  if (valor.includes("justific")) return "info" as const;
  return "default" as const;
}

export default function AsistenciasPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [asistenciaEditando, setAsistenciaEditando] = useState<FilaAsistencia | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    matriculaId: "",
    asignacionDocenteId: "",
    fecha: "",
    estado: "Presente",
    observacion: "",
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("asistencias")) return;
    setCargando(true);
    setError(null);
    try {
      const [a, m, al, s, asig, asigt] = await Promise.all([
        listarAsistencias(),
        listarMatriculas(),
        listarAlumnos(),
        listarSecciones(),
        listarAsignaciones(),
        listarAsignaturas(),
      ]);
      setAsistencias(a);
      setMatriculas(m);
      setAlumnos(al);
      setSecciones(s);
      setAsignaciones(asig);
      setAsignaturas(asigt);
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

  const filas = useMemo<FilaAsistencia[]>(() => {
    const alumnosPorId = indexarPor(alumnos);
    const matriculasPorId = indexarPor(matriculas);
    const seccionesPorId = indexarPor(secciones);

    return asistencias
      .map((asistencia) => {
        const matricula = matriculasPorId.get(asistencia.matriculaId);
        const alumno = matricula ? alumnosPorId.get(matricula.alumnoId) : undefined;
        const seccion = matricula?.seccionId
          ? seccionesPorId.get(matricula.seccionId)
          : undefined;
        return {
          id: asistencia.id,
          estudiante: alumno
            ? nombreCompleto(alumno.nombre, alumno.apellido)
            : `Matrícula #${asistencia.matriculaId}`,
          iniciales: alumno ? iniciales(alumno.nombre, alumno.apellido) : "?",
          seccion: seccion ? `${seccion.nombre} · ${seccion.turno}` : "—",
          fecha: asistencia.fecha ?? "",
          fechaTexto: formatearFecha(asistencia.fecha),
          estado: asistencia.estado ?? "Sin estado",
          observacion: asistencia.observacion ?? "—",
        };
      })
      .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
  }, [asistencias, matriculas, alumnos, secciones]);

  const estados = useMemo(
    () => Array.from(new Set(filas.map((f) => f.estado))),
    [filas]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const coincideTexto =
        !q || normalizar(`${fila.estudiante} ${fila.seccion} ${fila.observacion}`).includes(q);
      const coincideEstado =
        estadoFiltro === "todos" || fila.estado === estadoFiltro;
      const coincideFecha = !fechaFiltro || fila.fecha === fechaFiltro;
      return coincideTexto && coincideEstado && coincideFecha;
    });
  }, [filas, busqueda, estadoFiltro, fechaFiltro]);

  const resumen = useMemo(() => {
    const total = filas.length;
    const presentes = filas.filter((f) =>
      normalizar(f.estado).includes("present")
    ).length;
    const ausentes = filas.filter((f) =>
      normalizar(f.estado).includes("ausent")
    ).length;
    const tardanzas = filas.filter((f) =>
      normalizar(f.estado).includes("tard")
    ).length;
    return { total, presentes, ausentes, tardanzas, asistencia: porcentaje(presentes, total) };
  }, [filas]);

  const esAlumno = rol === "Alumno";
  const puedeGestionar = rol === "Director" || rol === "Maestro";

  // Opciones para los selects del formulario
  const opcionesMatricula = useMemo(() => {
    const alumnosPorId = indexarPor(alumnos);
    return matriculas.map((m) => {
      const alumno = alumnosPorId.get(m.alumnoId);
      return {
        id: m.id,
        etiqueta: alumno
          ? `${nombreCompleto(alumno.nombre, alumno.apellido)} · Matrícula #${m.id}`
          : `Matrícula #${m.id}`,
      };
    });
  }, [matriculas, alumnos]);

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
      matriculaId: "",
      asignacionDocenteId: "",
      fecha: new Date().toISOString().slice(0, 10),
      estado: "Presente",
      observacion: "",
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!puedeGestionar) return;
    setModoCreacion(true);
    setAsistenciaEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (fila: FilaAsistencia) => {
    if (!puedeGestionar) return;
    setModoCreacion(false);
    setAsistenciaEditando(fila);
    setForm({
      matriculaId: "",
      asignacionDocenteId: "",
      fecha: fila.fecha,
      estado: fila.estado,
      observacion: fila.observacion === "—" ? "" : fila.observacion,
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (modoCreacion && !form.matriculaId) {
      errores.matriculaId = "Seleccioná el estudiante.";
    }
    if (modoCreacion && !form.asignacionDocenteId) {
      errores.asignacionDocenteId = "Seleccioná la asignación docente.";
    }
    if (!form.fecha) {
      errores.fecha = "La fecha es obligatoria.";
    }
    if (!form.estado) {
      errores.estado = "El estado es obligatorio.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      if (modoCreacion) {
        await crearAsistencia({
          matriculaId: Number(form.matriculaId),
          asignacionDocenteId: Number(form.asignacionDocenteId),
          fecha: form.fecha,
          estado: form.estado,
          observacion: form.observacion || null,
        });
      } else if (asistenciaEditando) {
        await actualizarAsistencia(asistenciaEditando.id, {
          fecha: form.fecha,
          estado: form.estado,
          observacion: form.observacion || null,
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
      await eliminarAsistencia(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  return (
    <AppShell
      titulo={esAlumno ? "Mi asistencia" : "Asistencias"}
      subtitulo={
        esAlumno
          ? "Registro de asistencia de tu expediente"
          : "Control diario de asistencia por estudiante"
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
              Registrar asistencia
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Registros"
            valor={resumen.total}
            detalle="Asistencias registradas"
            icon={ClipboardIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Presentes"
            valor={resumen.presentes}
            detalle="Estudiantes presentes"
            icon={CheckIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Ausentes"
            valor={resumen.ausentes}
            detalle="Faltas registradas"
            icon={AlertIcon}
            color="from-red-500 to-rose-500"
          />
          <StatCard
            titulo="Asistencia"
            valor={`${resumen.asistencia}%`}
            detalle={`${resumen.tardanzas} tardanzas`}
            icon={TrendingUpIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={esAlumno ? "Buscar por estado o fecha…" : "Buscar estudiante o sección…"}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="date"
                  value={fechaFiltro}
                  onChange={(e) => setFechaFiltro(e.target.value)}
                  className="w-44 pl-9"
                  aria-label="Filtrar por fecha"
                />
              </div>
              <Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-40"
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
          </div>

          {cargando ? (
            <div className="p-4">
              <Cargando texto="Cargando asistencias…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin registros"
                descripcion="No hay asistencias que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Estudiante</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 font-semibold">Observación</th>
                      {puedeGestionar && (
                        <th className="px-4 py-3 text-right font-semibold">
                          Acciones
                        </th>
                      )}
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
                                {fila.estudiante}
                              </p>
                              <p className="truncate text-xs text-slate-500">{fila.seccion}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{fila.fechaTexto}</td>
                        <td className="px-4 py-3">
                          <Badge variant={varianteEstado(fila.estado)}>{fila.estado}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{fila.observacion}</td>
                        {puedeGestionar && (
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
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
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filtradas.map((fila) => (
                  <div key={fila.id} className="flex items-start gap-3 p-4">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                      {fila.iniciales}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{fila.estudiante}</p>
                      <p className="text-xs text-slate-500">
                        {fila.fechaTexto} · {fila.seccion}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{fila.observacion}</p>
                      {puedeGestionar && (
                        <div className="flex items-center gap-1 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEditar(fila)}
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
                    </div>
                    <Badge variant={varianteEstado(fila.estado)}>{fila.estado}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {!cargando && !error && (
            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              Mostrando {filtradas.length} de {filas.length} registros
            </div>
          )}
        </section>
      </div>

      {/* Modal de crear/editar asistencia */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Registrar asistencia" : "Editar asistencia"}
        descripcion={
          modoCreacion
            ? "Registra la asistencia diaria de un estudiante."
            : "Ajustá la fecha, el estado y la observación."
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
            <>
              <div className="space-y-1.5">
                <Label htmlFor="matriculaAsistencia">Estudiante (matrícula)</Label>
                <Select
                  id="matriculaAsistencia"
                  value={form.matriculaId}
                  onChange={(e) =>
                    setForm({ ...form, matriculaId: e.target.value })
                  }
                >
                  <option value="">Seleccioná un estudiante…</option>
                  {opcionesMatricula.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.etiqueta}
                    </option>
                  ))}
                </Select>
                {erroresForm.matriculaId && (
                  <p className="text-xs text-red-600">{erroresForm.matriculaId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asignacionAsistencia">Asignación docente</Label>
                <Select
                  id="asignacionAsistencia"
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
            </>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fechaAsistencia">Fecha</Label>
              <Input
                id="fechaAsistencia"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
              {erroresForm.fecha && (
                <p className="text-xs text-red-600">{erroresForm.fecha}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="estadoAsistencia">Estado</Label>
              <Select
                id="estadoAsistencia"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
              >
                {ESTADOS_ASISTENCIA.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </Select>
              {erroresForm.estado && (
                <p className="text-xs text-red-600">{erroresForm.estado}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacionAsistencia">Observación</Label>
            <Input
              id="observacionAsistencia"
              placeholder="Ej: Llegó 10 minutos tarde"
              value={form.observacion}
              onChange={(e) =>
                setForm({ ...form, observacion: e.target.value })
              }
            />
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
                  ? "Guardar asistencia"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar asistencia"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar este registro de asistencia?
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
