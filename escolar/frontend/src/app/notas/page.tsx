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
  actualizarNota,
  crearNota,
  eliminarNota,
  indexarPor,
  listarAlumnos,
  listarAsignaciones,
  listarAsignaturas,
  listarEvaluaciones,
  listarMatriculas,
  listarNotas,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Alumno,
  AsignacionDocente,
  Asignatura,
  Evaluacion,
  Matricula,
  Nota,
  Seccion,
} from "@/lib/types";
import {
  formatearNumero,
  iniciales,
  normalizar,
  nombreCompleto,
} from "@/lib/format";
import {
  BookIcon,
  ClipboardIcon,
  EditIcon,
  FileTextIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";

interface FilaNota {
  id: number;
  estudiante: string;
  iniciales: string;
  evaluacion: string;
  tipo: string;
  materia: string;
  seccion: string;
  periodo: string;
  calificacion: number;
  puntajeMaximo: number;
  observacion: string;
}

interface Datos {
  notas: Nota[];
  evaluaciones: Evaluacion[];
  matriculas: Matricula[];
  alumnos: Alumno[];
  asignaciones: AsignacionDocente[];
  asignaturas: Asignatura[];
  secciones: Seccion[];
}

export default function NotasPage() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState("todos");
  const [materia, setMateria] = useState("todas");
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [notaEditando, setNotaEditando] = useState<FilaNota | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    matriculaId: "",
    evaluacionId: "",
    calificacion: "",
    periodo: "",
    observacion: "",
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("notas")) return;
    setCargando(true);
    setError(null);
    try {
      const [
        notas,
        evaluaciones,
        matriculas,
        alumnos,
        asignaciones,
        asignaturas,
        secciones,
      ] = await Promise.all([
        listarNotas(),
        listarEvaluaciones(),
        listarMatriculas(),
        listarAlumnos(),
        listarAsignaciones(),
        listarAsignaturas(),
        listarSecciones(),
      ]);
      setDatos({
        notas,
        evaluaciones,
        matriculas,
        alumnos,
        asignaciones,
        asignaturas,
        secciones,
      });
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

  const filas = useMemo<FilaNota[]>(() => {
    if (!datos) return [];
    const alumnosPorId = indexarPor(datos.alumnos);
    const matriculasPorId = indexarPor(datos.matriculas);
    const evaluacionesPorId = indexarPor(datos.evaluaciones);
    const asignacionesPorId = indexarPor(datos.asignaciones);
    const asignaturasPorId = indexarPor(datos.asignaturas);
    const seccionesPorId = indexarPor(datos.secciones);

    return datos.notas.map((nota) => {
      const matricula = matriculasPorId.get(nota.matriculaId);
      const alumno = matricula ? alumnosPorId.get(matricula.alumnoId) : undefined;
      const evaluacion = evaluacionesPorId.get(nota.evaluacionId);
      const asignacion = evaluacion
        ? asignacionesPorId.get(evaluacion.asignacionDocenteId)
        : undefined;
      const asignatura = asignacion
        ? asignaturasPorId.get(asignacion.asignaturaId)
        : undefined;
      const seccion = asignacion ? seccionesPorId.get(asignacion.seccionId) : undefined;

      return {
        id: nota.id,
        estudiante: alumno
          ? nombreCompleto(alumno.nombre, alumno.apellido)
          : `Matrícula #${nota.matriculaId}`,
        iniciales: alumno ? iniciales(alumno.nombre, alumno.apellido) : "?",
        evaluacion: evaluacion?.titulo ?? `Evaluación #${nota.evaluacionId}`,
        tipo: evaluacion?.tipo ?? "—",
        materia: asignatura?.nombre ?? "—",
        seccion: seccion ? `${seccion.nombre} · ${seccion.turno}` : "—",
        periodo: nota.periodo ?? evaluacion?.periodo ?? "—",
        calificacion: nota.calificacion,
        puntajeMaximo: evaluacion?.puntajeMaximo ?? 100,
        observacion: nota.observacion ?? "—",
      };
    });
  }, [datos]);

  const periodos = useMemo(
    () => Array.from(new Set(filas.map((f) => f.periodo))).filter((p) => p !== "—"),
    [filas]
  );

  const materias = useMemo(
    () => Array.from(new Set(filas.map((f) => f.materia))).filter((m) => m !== "—"),
    [filas]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const texto = normalizar(
        `${fila.estudiante} ${fila.evaluacion} ${fila.materia} ${fila.observacion}`
      );
      return (
        (!q || texto.includes(q)) &&
        (periodo === "todos" || fila.periodo === periodo) &&
        (materia === "todas" || fila.materia === materia)
      );
    });
  }, [filas, busqueda, periodo, materia]);

  const resumen = useMemo(() => {
    const total = filas.length;
    const promedio = total
      ? filas.reduce((suma, fila) => suma + fila.calificacion, 0) / total
      : 0;
    const aprobadas = filas.filter((fila) => fila.calificacion >= 60).length;
    const mejor = total ? Math.max(...filas.map((fila) => fila.calificacion)) : 0;
    return { total, promedio, aprobadas, mejor };
  }, [filas]);

  const esAlumno = rol === "Alumno";
  const puedeGestionar = rol === "Director" || rol === "Maestro";

  // Opciones para los selects del formulario
  const opcionesMatricula = useMemo(() => {
    if (!datos) return [];
    const alumnosPorId = indexarPor(datos.alumnos);
    return datos.matriculas.map((m) => {
      const alumno = alumnosPorId.get(m.alumnoId);
      return {
        id: m.id,
        etiqueta: alumno
          ? `${nombreCompleto(alumno.nombre, alumno.apellido)} · Matrícula #${m.id}`
          : `Matrícula #${m.id}`,
      };
    });
  }, [datos]);

  const opcionesEvaluacion = useMemo(() => {
    if (!datos) return [];
    const asignacionesPorId = indexarPor(datos.asignaciones);
    const asignaturasPorId = indexarPor(datos.asignaturas);
    return datos.evaluaciones.map((e) => {
      const asignacion = asignacionesPorId.get(e.asignacionDocenteId);
      const asignatura = asignacion
        ? asignaturasPorId.get(asignacion.asignaturaId)
        : undefined;
      return {
        id: e.id,
        etiqueta: `${e.titulo}${asignatura ? ` · ${asignatura.nombre}` : ""}`,
      };
    });
  }, [datos]);

  const resetForm = () => {
    setForm({
      matriculaId: "",
      evaluacionId: "",
      calificacion: "",
      periodo: "",
      observacion: "",
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!puedeGestionar) return;
    setModoCreacion(true);
    setNotaEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (fila: FilaNota) => {
    if (!puedeGestionar) return;
    setModoCreacion(false);
    setNotaEditando(fila);
    setForm({
      matriculaId: "",
      evaluacionId: "",
      calificacion: String(fila.calificacion),
      periodo: fila.periodo === "—" ? "" : fila.periodo,
      observacion: fila.observacion === "—" ? "" : fila.observacion,
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};
    const calificacion = Number(form.calificacion);

    if (modoCreacion && !form.matriculaId) {
      errores.matriculaId = "Seleccioná el estudiante.";
    }
    if (modoCreacion && !form.evaluacionId) {
      errores.evaluacionId = "Seleccioná la evaluación.";
    }
    if (
      form.calificacion === "" ||
      Number.isNaN(calificacion) ||
      calificacion < 0 ||
      calificacion > 100
    ) {
      errores.calificacion = "Ingresá una nota entre 0 y 100.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      if (modoCreacion) {
        await crearNota({
          matriculaId: Number(form.matriculaId),
          evaluacionId: Number(form.evaluacionId),
          calificacion,
          periodo: form.periodo || null,
          observacion: form.observacion || null,
        });
      } else if (notaEditando) {
        await actualizarNota(notaEditando.id, {
          calificacion,
          periodo: form.periodo || null,
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
      await eliminarNota(idAEliminar);
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
      titulo={esAlumno ? "Mis notas" : "Notas"}
      subtitulo={
        esAlumno
          ? "Calificaciones registradas en tu expediente"
          : "Calificaciones por evaluación, materia y periodo"
      }
      acciones={
        <>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            <FileTextIcon className="h-4 w-4" />
            Imprimir Boleta / PDF
          </Button>
          <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
            <RefreshIcon className="h-4 w-4" />
            Actualizar
          </Button>
          {puedeGestionar && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" />
              Nueva nota
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Notas registradas"
            valor={resumen.total}
            detalle="Evaluaciones calificadas"
            icon={BookIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Promedio general"
            valor={formatearNumero(resumen.promedio)}
            detalle="Escala 0 a 100"
            icon={TrendingUpIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Aprobadas"
            valor={resumen.aprobadas}
            detalle="Notas mayores o iguales a 60"
            icon={ClipboardIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Mejor nota"
            valor={formatearNumero(resumen.mejor)}
            detalle="Calificación más alta"
            icon={UsersIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={esAlumno ? "Buscar evaluación o materia…" : "Buscar alumno, evaluación o materia…"}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-40"
                aria-label="Filtrar por periodo"
              >
                <option value="todos">Todos los periodos</option>
                {periodos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
              <Select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="w-48"
                aria-label="Filtrar por materia"
              >
                <option value="todas">Todas las materias</option>
                {materias.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {cargando ? (
            <div className="p-4">
              <Cargando texto="Cargando calificaciones…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin calificaciones"
                descripcion="No hay notas que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Estudiante</th>
                      <th className="px-4 py-3 font-semibold">Evaluación</th>
                      <th className="px-4 py-3 font-semibold">Materia</th>
                      <th className="px-4 py-3 font-semibold">Periodo</th>
                      <th className="px-4 py-3 font-semibold">Nota</th>
                      {puedeGestionar && (
                        <th className="px-4 py-3 text-right font-semibold">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtradas.map((fila) => {
                      const porcentajeNota = Math.min(
                        100,
                        (fila.calificacion / (fila.puntajeMaximo || 100)) * 100
                      );
                      const aprobada = fila.calificacion >= 60;
                      return (
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
                                <p className="truncate text-xs text-slate-500">
                                  {fila.seccion}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{fila.evaluacion}</p>
                            <p className="text-xs text-slate-500">
                              {fila.tipo} · {fila.observacion}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{fila.materia}</td>
                          <td className="px-4 py-3">
                            <Badge variant="brand">{fila.periodo}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-base font-bold ${
                                  aprobada ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {formatearNumero(fila.calificacion)}
                              </span>
                              <span className="text-xs text-slate-400">
                                /{formatearNumero(fila.puntajeMaximo, 0)}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${
                                  aprobada
                                    ? "from-emerald-500 to-teal-500"
                                    : "from-red-500 to-rose-500"
                                }`}
                                style={{ width: `${porcentajeNota}%` }}
                              />
                            </div>
                          </td>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filtradas.map((fila) => (
                  <div key={fila.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{fila.evaluacion}</p>
                        <p className="text-xs text-slate-500">
                          {fila.estudiante} · {fila.materia}
                        </p>
                      </div>
                      <Badge variant={fila.calificacion >= 60 ? "success" : "danger"}>
                        {formatearNumero(fila.calificacion)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="brand">{fila.periodo}</Badge>
                      <span>{fila.tipo}</span>
                    </div>
                    <p className="text-xs text-slate-500">{fila.observacion}</p>
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
                ))}
              </div>
            </>
          )}

          {!cargando && !error && (
            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              Mostrando {filtradas.length} de {filas.length} notas
            </div>
          )}
        </section>
      </div>

      {/* Modal de crear/editar nota */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Registrar nueva nota" : "Editar nota"}
        descripcion={
          modoCreacion
            ? "Completá la calificación del estudiante en la evaluación seleccionada."
            : "Podés ajustar la calificación, el periodo y la observación."
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
                <Label htmlFor="matriculaId">Estudiante (matrícula)</Label>
                <Select
                  id="matriculaId"
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
                <Label htmlFor="evaluacionId">Evaluación</Label>
                <Select
                  id="evaluacionId"
                  value={form.evaluacionId}
                  onChange={(e) =>
                    setForm({ ...form, evaluacionId: e.target.value })
                  }
                >
                  <option value="">Seleccioná una evaluación…</option>
                  {opcionesEvaluacion.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.etiqueta}
                    </option>
                  ))}
                </Select>
                {erroresForm.evaluacionId && (
                  <p className="text-xs text-red-600">{erroresForm.evaluacionId}</p>
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="calificacion">
                Calificación (0 a {notaEditando?.puntajeMaximo ?? 100})
              </Label>
              <Input
                id="calificacion"
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder="Ej: 85"
                value={form.calificacion}
                onChange={(e) =>
                  setForm({ ...form, calificacion: e.target.value })
                }
              />
              {erroresForm.calificacion && (
                <p className="text-xs text-red-600">{erroresForm.calificacion}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="periodoNota">Periodo</Label>
              <Input
                id="periodoNota"
                placeholder="Ej: Primer Trimestre"
                value={form.periodo}
                onChange={(e) => setForm({ ...form, periodo: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacionNota">Observación</Label>
            <Input
              id="observacionNota"
              placeholder="Ej: Excelente desempeño en el examen"
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
              {guardando ? "Guardando…" : modoCreacion ? "Guardar nota" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar nota"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar esta calificación? El estudiante
            perderá el registro de la nota.
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
