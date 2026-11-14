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
  actualizarMatricula,
  crearMatricula,
  eliminarMatricula,
  indexarPor,
  listarAlumnos,
  listarAniosEscolares,
  listarGrados,
  listarMatriculas,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Alumno,
  AnioEscolar,
  GradoResumen,
  Matricula,
  Seccion,
} from "@/lib/types";
import {
  esActivo,
  formatearFecha,
  iniciales,
  normalizar,
  nombreCompleto,
} from "@/lib/format";
import {
  CalendarIcon,
  EditIcon,
  GraduationCapIcon,
  IdIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/icons";

interface FilaMatricula {
  id: number;
  alumno: string;
  iniciales: string;
  codigoMined: string;
  seccion: string;
  grado: string;
  turno: string;
  anio: string;
  fechaMatricula: string;
  estado: string;
  activa: boolean;
  observaciones: string;
}

export default function MatriculasPage() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [grados, setGrados] = useState<GradoResumen[]>([]);
  const [anios, setAnios] = useState<AnioEscolar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todas");
  const [seccionFiltro, setSeccionFiltro] = useState("todas");
  const [seleccionada, setSeleccionada] = useState<FilaMatricula | null>(null);
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [matriculaEditando, setMatriculaEditando] = useState<Matricula | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    alumnoId: "",
    seccionId: "",
    anioEscolarId: "",
    fechaMatricula: "",
    estado: "Activa",
    observaciones: "",
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("matriculas")) return;
    setCargando(true);
    setError(null);
    try {
      const [mat, al, sec, grad, an] = await Promise.all([
        listarMatriculas(),
        listarAlumnos(),
        listarSecciones(),
        listarGrados(),
        listarAniosEscolares(),
      ]);
      setMatriculas(mat);
      setAlumnos(al);
      setSecciones(sec);
      setGrados(grad);
      setAnios(an);
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

  const filas = useMemo<FilaMatricula[]>(() => {
    const alumnosPorId = indexarPor(alumnos);
    const seccionesPorId = indexarPor(secciones);
    const gradosPorId = indexarPor(grados);
    const aniosPorId = indexarPor(anios);

    return matriculas
      .map((matricula) => {
        const alumno = alumnosPorId.get(matricula.alumnoId);
        const seccion = matricula.seccionId
          ? seccionesPorId.get(matricula.seccionId)
          : undefined;
        const grado = seccion?.gradoId
          ? gradosPorId.get(seccion.gradoId)
          : undefined;
        const anio = matricula.anioEscolarId
          ? aniosPorId.get(matricula.anioEscolarId)
          : undefined;

        return {
          id: matricula.id,
          alumno: alumno
            ? nombreCompleto(alumno.nombre, alumno.apellido)
            : `Alumno #${matricula.alumnoId}`,
          iniciales: alumno ? iniciales(alumno.nombre, alumno.apellido) : "?",
          codigoMined: alumno?.codigoMined ?? "—",
          seccion: seccion?.nombre ?? "Sin sección",
          grado: grado?.nombre ?? "Sin grado",
          turno: seccion?.turno ?? "—",
          anio: anio ? String(anio.anio) : "—",
          fechaMatricula: formatearFecha(matricula.fechaMatricula),
          estado: matricula.estado ?? "Sin estado",
          activa: esActivo(matricula.estado),
          observaciones: matricula.observaciones ?? "Sin observaciones",
        };
      })
      .sort((a, b) => a.alumno.localeCompare(b.alumno));
  }, [matriculas, alumnos, secciones, grados, anios]);

  const estados = useMemo(
    () => Array.from(new Set(filas.map((f) => f.estado))),
    [filas]
  );

  const opcionesSeccion = useMemo(
    () => Array.from(new Set(filas.map((f) => f.seccion))).filter((s) => s !== "Sin sección"),
    [filas]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const texto = normalizar(
        `${fila.alumno} ${fila.codigoMined} ${fila.seccion} ${fila.grado} ${fila.anio}`
      );
      return (
        (!q || texto.includes(q)) &&
        (estadoFiltro === "todas" || fila.estado === estadoFiltro) &&
        (seccionFiltro === "todas" || fila.seccion === seccionFiltro)
      );
    });
  }, [filas, busqueda, estadoFiltro, seccionFiltro]);

  const resumen = useMemo(() => {
    const activas = filas.filter((f) => f.activa).length;
    const seccionesConAlumnos = new Set(
      filas.map((f) => f.seccion).filter((s) => s !== "Sin sección")
    ).size;
    const aniosCubiertos = new Set(
      filas.map((f) => f.anio).filter((a) => a !== "—")
    ).size;
    return { total: filas.length, activas, seccionesConAlumnos, aniosCubiertos };
  }, [filas]);

  const esAlumno = rol === "Alumno";
  const esDirector = rol === "Director";
  // El director matricula a cualquier alumno; un alumno puede matricularse a sí mismo.
  const puedeCrear = esDirector || esAlumno;

  const ESTADOS_MATRICULA = useMemo(
    () =>
      Array.from(
        new Set(["Activa", "Inactiva", "Retirada", "Egresada", ...estados]),
      ),
    [estados]
  );

  // Opciones para los selects del formulario
  const opcionesAlumno = useMemo(() => {
    return alumnos.map((a) => ({
      id: a.id,
      etiqueta: `${nombreCompleto(a.nombre, a.apellido)}${a.codigoMined ? ` · ${a.codigoMined}` : ""}`,
    }));
  }, [alumnos]);

  const opcionesSeccionForm = useMemo(() => {
    const gradosPorId = indexarPor(grados);
    return secciones.map((s) => {
      const grado = s.gradoId ? gradosPorId.get(s.gradoId) : undefined;
      return {
        id: s.id,
        etiqueta: `${s.nombre} · ${grado?.nombre ?? "Grado"} (${s.turno})`,
      };
    });
  }, [secciones, grados]);

  const opcionesAnio = useMemo(
    () =>
      anios.map((a) => ({
        id: a.id,
        etiqueta: String(a.anio),
      })),
    [anios]
  );

  const resetForm = () => {
    setForm({
      alumnoId: "",
      seccionId: "",
      anioEscolarId: "",
      fechaMatricula: new Date().toISOString().slice(0, 10),
      estado: "Activa",
      observaciones: "",
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!puedeCrear) return;
    setModoCreacion(true);
    setMatriculaEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (id: number) => {
    if (!esDirector) return;
    const matricula = matriculas.find((m) => m.id === id);
    if (!matricula) return;
    setModoCreacion(false);
    setMatriculaEditando(matricula);
    setForm({
      alumnoId: "",
      seccionId: "",
      anioEscolarId: "",
      fechaMatricula: "",
      estado: matricula.estado ?? "Activa",
      observaciones: matricula.observaciones ?? "",
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (modoCreacion) {
      if (!esAlumno && !form.alumnoId) {
        errores.alumnoId = "Seleccioná el estudiante.";
      }
      if (!form.seccionId) {
        errores.seccionId = "Seleccioná la sección.";
      }
      if (!form.anioEscolarId) {
        errores.anioEscolarId = "Seleccioná el año escolar.";
      }
      if (!form.fechaMatricula) {
        errores.fechaMatricula = "La fecha es obligatoria.";
      }
    }
    if (!form.estado.trim()) {
      errores.estado = "El estado es obligatorio.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      if (modoCreacion) {
        await crearMatricula({
          alumnoId: esAlumno ? 0 : Number(form.alumnoId),
          seccionId: Number(form.seccionId),
          anioEscolarId: Number(form.anioEscolarId),
          fechaMatricula: form.fechaMatricula,
          estado: form.estado.trim(),
          observaciones: form.observaciones || null,
        });
      } else if (matriculaEditando) {
        await actualizarMatricula(matriculaEditando.id, {
          estado: form.estado.trim(),
          observaciones: form.observaciones || null,
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
      await eliminarMatricula(idAEliminar);
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
      titulo={esAlumno ? "Mi matrícula" : "Matrículas"}
      subtitulo={
        esAlumno
          ? "Información de tu matrícula en el colegio"
          : "Registro de matrículas por estudiante, sección y año escolar"
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
              Nueva matrícula
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Matrículas"
            valor={resumen.total}
            detalle="Registros en el sistema"
            icon={IdIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Activas"
            valor={resumen.activas}
            detalle="Matrículas vigentes"
            icon={GraduationCapIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Secciones"
            valor={resumen.seccionesConAlumnos}
            detalle="Secciones con estudiantes"
            icon={UsersIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Años escolares"
            valor={resumen.aniosCubiertos}
            detalle="Periodos con matrícula"
            icon={CalendarIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar estudiante, código o sección…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={seccionFiltro}
                onChange={(e) => setSeccionFiltro(e.target.value)}
                className="w-44"
                aria-label="Filtrar por sección"
              >
                <option value="todas">Todas las secciones</option>
                {opcionesSeccion.map((seccion) => (
                  <option key={seccion} value={seccion}>
                    {seccion}
                  </option>
                ))}
              </Select>
              <Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-40"
                aria-label="Filtrar por estado"
              >
                <option value="todas">Todos los estados</option>
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
              <Cargando texto="Cargando matrículas…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin matrículas"
                descripcion="No hay matrículas que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Estudiante</th>
                      <th className="px-4 py-3 font-semibold">Sección</th>
                      <th className="px-4 py-3 font-semibold">Año escolar</th>
                      <th className="px-4 py-3 font-semibold">Matrícula</th>
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
                                {fila.codigoMined}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{fila.seccion}</p>
                          <p className="text-xs text-slate-500">
                            {fila.grado} · {fila.turno}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{fila.anio}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {fila.fechaMatricula}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={fila.activa ? "success" : "default"}>
                            {fila.estado}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {esDirector && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => abrirEditar(fila.id)}
                                >
                                  <EditIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => solicitarEliminar(fila.id)}
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
                              Ver ficha
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
                          <Badge variant={fila.activa ? "success" : "default"}>
                            {fila.estado}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {fila.seccion} · {fila.grado}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Año {fila.anio} · {fila.fechaMatricula}
                        </p>
                      </div>
                    </button>
                    {esDirector && (
                      <div className="mt-2 flex items-center justify-end gap-1">
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
              Mostrando {filtradas.length} de {filas.length} matrículas
            </div>
          )}
        </section>
      </div>

      <Modal
        abierto={seleccionada !== null}
        onCerrar={() => setSeleccionada(null)}
        titulo={seleccionada?.alumno ?? "Ficha de matrícula"}
        descripcion="Detalle del registro de matrícula"
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
                  {seleccionada.seccion} · {seleccionada.grado}
                </p>
              </div>
              <Badge
                variant={seleccionada.activa ? "success" : "default"}
                className="ml-auto shrink-0 bg-white/90"
              >
                {seleccionada.estado}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Código MINED
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.codigoMined}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Año escolar
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.anio}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Grado y turno
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.grado} · {seleccionada.turno}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Fecha de matrícula
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionada.fechaMatricula}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Observaciones
              </p>
              <p className="mt-1 text-sm text-slate-800">
                {seleccionada.observaciones}
              </p>
            </div>

            {esDirector && (
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSeleccionada(null);
                    abrirEditar(seleccionada.id);
                  }}
                >
                  <EditIcon className="h-4 w-4" />
                  Editar estado
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    solicitarEliminar(seleccionada.id);
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de crear/editar matrícula */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={
          modoCreacion
            ? esAlumno
              ? "Solicitar mi matrícula"
              : "Registrar nueva matrícula"
            : "Editar matrícula"
        }
        descripcion={
          modoCreacion
            ? esAlumno
              ? "El colegio validará la información antes de activar tu matrícula."
              : "Asigná el estudiante a una sección y año escolar."
            : "Solo se puede ajustar el estado y las observaciones."
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
              {esDirector && (
                <div className="space-y-1.5">
                  <Label htmlFor="alumnoMatricula">Estudiante</Label>
                  <Select
                    id="alumnoMatricula"
                    value={form.alumnoId}
                    onChange={(e) =>
                      setForm({ ...form, alumnoId: e.target.value })
                    }
                  >
                    <option value="">Seleccioná un estudiante…</option>
                    {opcionesAlumno.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.etiqueta}
                      </option>
                    ))}
                  </Select>
                  {erroresForm.alumnoId && (
                    <p className="text-xs text-red-600">
                      {erroresForm.alumnoId}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="seccionMatricula">Sección</Label>
                  <Select
                    id="seccionMatricula"
                    value={form.seccionId}
                    onChange={(e) =>
                      setForm({ ...form, seccionId: e.target.value })
                    }
                  >
                    <option value="">Seleccioná la sección…</option>
                    {opcionesSeccionForm.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.etiqueta}
                      </option>
                    ))}
                  </Select>
                  {erroresForm.seccionId && (
                    <p className="text-xs text-red-600">
                      {erroresForm.seccionId}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="anioMatricula">Año escolar</Label>
                  <Select
                    id="anioMatricula"
                    value={form.anioEscolarId}
                    onChange={(e) =>
                      setForm({ ...form, anioEscolarId: e.target.value })
                    }
                  >
                    <option value="">Seleccioná el año…</option>
                    {opcionesAnio.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.etiqueta}
                      </option>
                    ))}
                  </Select>
                  {erroresForm.anioEscolarId && (
                    <p className="text-xs text-red-600">
                      {erroresForm.anioEscolarId}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fechaMatricula">Fecha de matrícula</Label>
                <Input
                  id="fechaMatricula"
                  type="date"
                  value={form.fechaMatricula}
                  onChange={(e) =>
                    setForm({ ...form, fechaMatricula: e.target.value })
                  }
                />
                {erroresForm.fechaMatricula && (
                  <p className="text-xs text-red-600">
                    {erroresForm.fechaMatricula}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="estadoMatricula">Estado</Label>
            <Select
              id="estadoMatricula"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              {ESTADOS_MATRICULA.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Select>
            {erroresForm.estado && (
              <p className="text-xs text-red-600">{erroresForm.estado}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacionesMatricula">Observaciones</Label>
            <Input
              id="observacionesMatricula"
              placeholder="Ej: Matrícula con beca parcial"
              value={form.observaciones}
              onChange={(e) =>
                setForm({ ...form, observaciones: e.target.value })
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
                  ? "Guardar matrícula"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar matrícula"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar esta matrícula? Se borrarán también
            las notas, asistencias y entregas asociadas al estudiante en ese
            año escolar.
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
