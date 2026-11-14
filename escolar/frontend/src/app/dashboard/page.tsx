"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertIcon,
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  MessageIcon,
  RefreshIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/icons";
import {
  indexarPor,
  listarAlumnos,
  listarAsignaciones,
  listarAsignaturas,
  listarAsistencias,
  listarEvaluaciones,
  listarNotas,
  listarReuniones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Alumno,
  AsignacionDocente,
  Asignatura,
  Asistencia,
  Evaluacion,
  Nota,
  Reunion,
} from "@/lib/types";
import {
  esActivo,
  formatearNumero,
  normalizar,
  porcentaje,
} from "@/lib/format";

interface Clase {
  materia: string;
  dia: string;
  hora: string;
  aula: string;
  color: string;
}

const proximasClases: Clase[] = [
  { materia: "Matemática", dia: "Lunes", hora: "07:00 - 08:30", aula: "Aula 3B", color: "from-indigo-500 to-blue-500" },
  { materia: "Ciencias Naturales", dia: "Lunes", hora: "08:45 - 10:15", aula: "Laboratorio", color: "from-emerald-500 to-teal-500" },
  { materia: "Lengua y Literatura", dia: "Martes", hora: "07:00 - 08:30", aula: "Aula 3B", color: "from-fuchsia-500 to-purple-500" },
];

const tareas = [
  { titulo: "Ejercicios de álgebra", materia: "Matemática", entrega: "Hoy, 6:00 pm", estado: "Pendiente" },
  { titulo: "Ensayo sobre el modernismo", materia: "Lengua", entrega: "Viernes", estado: "En progreso" },
  { titulo: "Maqueta del sistema solar", materia: "Ciencias", entrega: "Próxima semana", estado: "Sin iniciar" },
];

const anuncios = [
  { titulo: "Reunión de padres de familia", fecha: "08 nov", detalle: "Entrega de calificaciones del II corte." },
  { titulo: "Feria científica 2026", fecha: "15 nov", detalle: "Inscripciones abiertas en secretaría." },
  { titulo: "Jornada de limpieza", fecha: "22 nov", detalle: "Participación de todos los grados." },
];

const equipoDocente = [
  { nombre: "Prof. Ana López", materia: "Matemática", iniciales: "AL", color: "from-indigo-500 to-blue-500" },
  { nombre: "Prof. Carlos Ruiz", materia: "Lengua", iniciales: "CR", color: "from-fuchsia-500 to-purple-500" },
  { nombre: "Prof. María Díaz", materia: "Ciencias", iniciales: "MD", color: "from-emerald-500 to-teal-500" },
];

const paletaMaterias = [
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-cyan-500",
  "from-rose-500 to-pink-500",
];

export default function DashboardPage() {
  const router = useRouter();

  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [reuniones, setReuniones] = useState<Reunion[]>([]);

  const fecha = useMemo(
    () =>
      new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const cargar = useCallback(async () => {
    const rolActual = localStorage.getItem("rol") ?? "";
    setRol(rolActual);
    setCargando(true);
    setError(null);
    try {
      const [n, a, ev, asg, mat, al, re] = await Promise.all([
        listarNotas(),
        listarAsistencias(),
        listarEvaluaciones(),
        listarAsignaciones(),
        listarAsignaturas(),
        rolPermitido("alumnos") ? listarAlumnos() : Promise.resolve([] as Alumno[]),
        rolPermitido("reuniones") ? listarReuniones() : Promise.resolve([] as Reunion[]),
      ]);
      setNotas(n);
      setAsistencias(a);
      setEvaluaciones(ev);
      setAsignaciones(asg);
      setAsignaturas(mat);
      setAlumnos(al);
      setReuniones(re);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const resumen = useMemo(() => {
    const totalNotas = notas.length;
    const promedio = totalNotas
      ? notas.reduce((suma, nota) => suma + nota.calificacion, 0) / totalNotas
      : 0;
    const aprobadas = notas.filter((nota) => nota.calificacion >= 60).length;

    const totalAsistencias = asistencias.length;
    const presentes = asistencias.filter((a) =>
      normalizar(a.estado).includes("present")
    ).length;
    const ausentes = asistencias.filter((a) =>
      normalizar(a.estado).includes("ausent")
    ).length;

    const activos = alumnos.filter((a) => esActivo(a.estado)).length;
    const programadas = reuniones.filter((r) =>
      normalizar(r.estado).includes("program")
    ).length;

    return {
      totalNotas,
      promedio,
      aprobadas,
      totalAsistencias,
      presentes,
      ausentes,
      asistencia: porcentaje(presentes, totalAsistencias),
      totalAlumnos: alumnos.length,
      activos,
      totalReuniones: reuniones.length,
      programadas,
    };
  }, [notas, asistencias, alumnos, reuniones]);

  const progresoAsignaturas = useMemo(() => {
    const evaluacionesPorId = indexarPor(evaluaciones);
    const asignacionesPorId = indexarPor(asignaciones);
    const asignaturasPorId = indexarPor(asignaturas);
    const acumulado = new Map<string, { suma: number; cantidad: number }>();

    notas.forEach((nota) => {
      const evaluacion = evaluacionesPorId.get(nota.evaluacionId);
      if (!evaluacion) return;
      const asignacion = asignacionesPorId.get(evaluacion.asignacionDocenteId);
      if (!asignacion) return;
      const asignatura = asignaturasPorId.get(asignacion.asignaturaId);
      if (!asignatura) return;
      const actual = acumulado.get(asignatura.nombre) ?? { suma: 0, cantidad: 0 };
      actual.suma += nota.calificacion;
      actual.cantidad += 1;
      acumulado.set(asignatura.nombre, actual);
    });

    return Array.from(acumulado.entries())
      .map(([materia, valores], indice) => ({
        materia,
        porcentaje: Math.round(valores.suma / valores.cantidad),
        cantidad: valores.cantidad,
        color: paletaMaterias[indice % paletaMaterias.length],
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }, [notas, evaluaciones, asignaciones, asignaturas]);

  const cortes = useMemo(() => {
    const evaluacionesPorId = indexarPor(evaluaciones);
    const acumulado = new Map<string, { suma: number; cantidad: number }>();

    notas.forEach((nota) => {
      const periodo =
        nota.periodo ??
        (evaluacionesPorId.get(nota.evaluacionId)?.periodo || "Sin periodo");
      const actual = acumulado.get(periodo) ?? { suma: 0, cantidad: 0 };
      actual.suma += nota.calificacion;
      actual.cantidad += 1;
      acumulado.set(periodo, actual);
    });

    return Array.from(acumulado.entries())
      .map(([corte, valores]) => ({
        corte,
        nota: valores.suma / valores.cantidad,
        cantidad: valores.cantidad,
      }))
      .sort((a, b) => a.corte.localeCompare(b.corte));
  }, [notas, evaluaciones]);

  const tieneAlumnos = rol === "Director" || rol === "Maestro";
  const tieneReuniones = rol === "Director" || rol === "Maestro" || rol === "Tutor";
  const esAlumno = rol === "Alumno";

  const metricas = [
    {
      titulo: "Asistencia",
      valor: cargando ? "—" : `${resumen.asistencia}%`,
      detalle: cargando
        ? "Calculando…"
        : `${resumen.presentes} de ${resumen.totalAsistencias} registros`,
      icon: ClipboardIcon,
      color: "from-emerald-500 to-teal-500",
      nota: `${resumen.ausentes} ausencias`,
      href: "/asistencias",
    },
    {
      titulo: "Promedio académico",
      valor: cargando ? "—" : formatearNumero(resumen.promedio),
      detalle: "Escala de 0 a 100",
      icon: TrendingUpIcon,
      color: "from-blue-600 to-blue-800",
      nota: `${resumen.aprobadas} aprobadas`,
      href: "/notas",
    },
    tieneAlumnos
      ? {
          titulo: "Alumnos",
          valor: cargando ? "—" : resumen.totalAlumnos,
          detalle: "Expedientes registrados",
          icon: UsersIcon,
          color: "from-fuchsia-500 to-purple-500",
          nota: `${resumen.activos} activos`,
          href: "/alumnos",
        }
      : {
          titulo: "Notas registradas",
          valor: cargando ? "—" : resumen.totalNotas,
          detalle: esAlumno ? "En tu expediente" : "En tus secciones",
          icon: BookIcon,
          color: "from-fuchsia-500 to-purple-500",
          nota: `${progresoAsignaturas.length} materias`,
          href: "/notas",
        },
    tieneReuniones
      ? {
          titulo: "Reuniones",
          valor: cargando ? "—" : resumen.programadas,
          detalle: "Programadas",
          icon: CalendarIcon,
          color: "from-amber-500 to-orange-500",
          nota: `${resumen.totalReuniones} en total`,
          href: "/reuniones",
        }
      : {
          titulo: "Materias",
          valor: cargando ? "—" : progresoAsignaturas.length,
          detalle: "Con calificaciones",
          icon: MessageIcon,
          color: "from-amber-500 to-orange-500",
          nota: "Este ciclo",
          href: "/notas",
        },
  ];

  return (
    <AppShell titulo="Mi escritorio" subtitulo="Resumen general de la institución">
      <div className="space-y-6">
        {/* Hero principal */}
        <section className="relative animate-gradient overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-950 to-blue-800 p-6 shadow-xl shadow-blue-900/30 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                <SparklesIcon className="h-3.5 w-3.5" />
                Colegio Otto de la Rocha
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                ¡Bienvenido de nuevo! 👋
              </h2>
              <p className="mt-2 max-w-xl text-sm text-indigo-100 sm:text-base">
                Este es tu resumen del día. Consultá tus clases, tareas,
                calificaciones, mensajes y novedades del colegio desde un solo lugar.
              </p>
              <p className="mt-4 text-xs font-medium capitalize text-white/80 sm:text-sm">
                {fecha}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/30 bg-white/15 text-white hover:bg-white/25"
                onClick={() => router.push("/notas")}
              >
                <BookIcon className="h-4 w-4" />
                Ver notas
              </Button>
              <Button
                variant="default"
                className="bg-white text-indigo-700 hover:bg-white/90"
                onClick={() => router.push("/asistencias")}
              >
                <ClipboardIcon className="h-4 w-4" />
                Asistencia
              </Button>
            </div>
          </div>

          <p className="relative mt-6 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-white/60 sm:text-left">
            Nicaragua · América Central
          </p>

          {/* Franjas de la bandera al pie del hero */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-3 flex-col"
            aria-hidden="true"
          >
            <div className="flex-1 bg-indigo-500/70" />
            <div className="flex-1 bg-white/80" />
            <div className="flex-1 bg-indigo-500/70" />
          </div>
        </section>

        {error && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <AlertIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  No se pudieron cargar las métricas
                </p>
                <p className="text-xs text-slate-600">{error}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
              <RefreshIcon className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        )}

        {/* Métricas clicables */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricas.map((m) => (
            <button
              key={m.titulo}
              type="button"
              onClick={() => router.push(m.href)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md`}
                >
                  <m.icon className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-blue-200">
                  <SparklesIcon className="h-3 w-3" />
                  {cargando ? "…" : m.nota}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">{m.valor}</p>
              <p className="text-sm font-semibold text-slate-700">{m.titulo}</p>
              <p className="text-xs text-slate-500">{m.detalle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
                Ver detalle <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </section>

        {/* Grilla principal */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {/* Próximas clases */}
          <Card className="xl:col-span-1">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Próximas clases</CardTitle>
                <CardDescription>Tu horario más cercano</CardDescription>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ClockIcon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {proximasClases.map((clase) => (
                <div
                  key={`${clase.materia}-${clase.hora}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                >
                  <span
                    className={`inline-flex h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${clase.color}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {clase.materia}
                    </p>
                    <p className="text-xs text-slate-500">
                      {clase.dia} · {clase.hora}
                    </p>
                  </div>
                  <Badge variant="info">{clase.aula}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tareas */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Tareas recientes</CardTitle>
                <CardDescription>Entregas próximas</CardDescription>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                <BookIcon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {tareas.map((tarea) => (
                <div
                  key={tarea.titulo}
                  className="rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {tarea.titulo}
                    </p>
                    <Badge
                      variant={
                        tarea.estado === "Pendiente"
                          ? "warning"
                          : tarea.estado === "En progreso"
                            ? "info"
                            : "default"
                      }
                    >
                      {tarea.estado}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {tarea.materia} · Entrega: {tarea.entrega}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progreso por asignatura */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Progreso por asignatura</CardTitle>
                <CardDescription>Promedio real por materia</CardDescription>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUpIcon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {cargando ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Cargando promedios…
                </p>
              ) : progresoAsignaturas.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Todavía no hay notas registradas.
                </p>
              ) : (
                progresoAsignaturas.map((asignatura) => (
                  <div key={asignatura.materia}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        {asignatura.materia}
                        <span className="ml-1 text-slate-400">
                          ({asignatura.cantidad})
                        </span>
                      </span>
                      <span className="font-semibold text-slate-900">
                        {asignatura.porcentaje}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${asignatura.color}`}
                        style={{ width: `${asignatura.porcentaje}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Anuncios */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Anuncios del colegio</CardTitle>
                <CardDescription>Comunicados institucionales recientes</CardDescription>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <MessageIcon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                {anuncios.map((anuncio) => (
                  <li key={anuncio.titulo} className="relative">
                    <span className="absolute -left-[1.6rem] top-1 inline-flex h-3 w-3 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {anuncio.titulo}
                      </p>
                      <Badge variant="brand">{anuncio.fecha}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{anuncio.detalle}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Calificaciones por corte */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Calificaciones por periodo</CardTitle>
                <CardDescription>Promedio real por corte</CardDescription>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ClipboardIcon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              {cargando ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Cargando periodos…
                </p>
              ) : cortes.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Todavía no hay periodos con notas.
                </p>
              ) : (
                cortes.map((corte) => (
                  <div
                    key={corte.corte}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{corte.corte}</p>
                      <p className="text-[11px] text-slate-500">
                        {corte.cantidad} {corte.cantidad === 1 ? "nota" : "notas"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">
                        {formatearNumero(corte.nota)}
                      </span>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                          corte.nota >= 60
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <TrendingUpIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Equipo docente */}
          <Card className="xl:col-span-3">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Mi equipo docente</CardTitle>
                <CardDescription>Docentes asignados al grado</CardDescription>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                <UsersIcon className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equipoDocente.map((docente) => (
                <div
                  key={docente.nombre}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50/60"
                >
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${docente.color} text-sm font-bold text-white shadow-md`}
                  >
                    {docente.iniciales}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {docente.nombre}
                    </p>
                    <p className="text-xs text-slate-500">{docente.materia}</p>
                  </div>
                  <CheckIcon className="ml-auto h-4 w-4 text-emerald-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

      </div>
    </AppShell>
  );
}
