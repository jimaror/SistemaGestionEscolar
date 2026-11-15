"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { Cargando, ErrorEstado, Vacio } from "@/components/data-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import {
  actualizarAlumno,
  crearAlumno,
  crearMatricula,
  eliminarAlumno,
  listarAlumnoTutores,
  listarAlumnos,
  listarGrados,
  listarMatriculas,
  listarSecciones,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Alumno,
  AlumnoActualizarRequest,
  AlumnoCrearRequest,
  AlumnoTutor,
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
  AlertIcon,
  ArrowRightIcon,
  BookIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon,
  EyeIcon,
  GraduationCapIcon,
  IdIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/icons";

function tieneDato(valor: string | null | undefined) {
  if (!valor) return false;
  const v = normalizar(valor);
  return v !== "" && v !== "ninguna" && v !== "ninguno" && v !== "no" && v !== "n/a";
}

function puntajeMatricula(matricula: Matricula) {
  return (esActivo(matricula.estado) ? 100000 : 0) + (matricula.anioEscolarId ?? 0);
}

function nombreTutor(vinculo: AlumnoTutor) {
  const usuario = vinculo.tutor?.usuario;
  const nombre = `${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`.trim();
  return nombre || `Tutor #${vinculo.tutorId}`;
}

// Reintenta una petición una vez: el plan gratuito de Render puede tardar
// en despertar y rechazar peticiones simultáneas durante el arranque.
async function conReintento<T>(peticion: () => Promise<T>, intentos = 2): Promise<T> {
  try {
    return await peticion();
  } catch (err) {
    if (intentos <= 1) throw err;
    await new Promise((resolver) => setTimeout(resolver, 1200));
    return conReintento(peticion, intentos - 1);
  }
}

type InfoAcademica = {
  matricula: Matricula | null;
  seccion: Seccion | null;
  grado: GradoResumen | null;
  gradoNombre: string;
  seccionNombre: string;
  turno: string;
  anio: number | null;
};

type Grupo = {
  key: string;
  gradoNombre: string;
  gradoOrden: number;
  seccionNombre: string;
  turno: string;
  anio: number | null;
  alumnos: Alumno[];
};

function Dato({
  icon: Icon,
  etiqueta,
  valor,
}: {
  icon: React.ReactElement;
  etiqueta: string;
  valor: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {React.cloneElement(Icon as React.ReactElement<any>, {
          className: "h-3.5 w-3.5",
        })}
        {etiqueta}
      </p>
      <p className="mt-1 break-words text-sm text-slate-800">
        {tieneDato(valor) ? String(valor) : "—"}
      </p>
    </div>
  );
}

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [grados, setGrados] = useState<GradoResumen[]>([]);
  const [vinculos, setVinculos] = useState<AlumnoTutor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [gradoFiltro, setGradoFiltro] = useState("todos");
  const [seccionFiltro, setSeccionFiltro] = useState("todas");
  const [vista, setVista] = useState<"secciones" | "lista">("secciones");
  const [gruposCerrados, setGruposCerrados] = useState<Record<string, boolean>>({});
  const [seleccionado, setSeleccionado] = useState<Alumno | null>(null);

  // CRUD state
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [alumnoEditando, setAlumnoEditando] = useState<Alumno | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  // Form state (todos los campos opcionales para facilitar create/edit)
  type AlumnoForm = {
    idUsuario?: number;
    seccionId?: number;
    codigoMined: string;
    colegioProcedencia: string;
    necesidadEspecial: string;
    fechaIngreso: string;
    transporte: string;
    alergias: string;
    enfermedades: string;
    medicamentos: string;
    correo: string;
    direccion: string;
    telefono: string;
  };
  const [form, setForm] = useState<AlumnoForm>({
    idUsuario: undefined,
    seccionId: undefined,
    codigoMined: "",
    colegioProcedencia: "",
    necesidadEspecial: "",
    fechaIngreso: "",
    transporte: "",
    alergias: "",
    enfermedades: "",
    medicamentos: "",
    correo: "",
    direccion: "",
    telefono: "",
  });
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    if (!rolPermitido("alumnos")) return;
    setCargando(true);
    setError(null);
    try {
      // Primero se despierta el backend con la petición principal; después se
      // cargan los catálogos de apoyo con reintento para no quedar sin ellos.
      setAlumnos(await listarAlumnos());

      const [matriculasRes, seccionesRes, gradosRes, vinculosRes] = await Promise.allSettled([
        conReintento(listarMatriculas),
        conReintento(listarSecciones),
        conReintento(listarGrados),
        conReintento(listarAlumnoTutores),
      ]);

      const fallos: string[] = [];
      if (matriculasRes.status === "fulfilled") setMatriculas(matriculasRes.value);
      else fallos.push("matrículas");
      if (seccionesRes.status === "fulfilled") setSecciones(seccionesRes.value);
      else fallos.push("secciones");
      if (gradosRes.status === "fulfilled") setGrados(gradosRes.value);
      else fallos.push("grados");
      if (vinculosRes.status === "fulfilled") setVinculos(vinculosRes.value);
      else fallos.push("tutores");

      if (fallos.length > 0) {
        setAviso(
          `No se pudieron cargar ${fallos.join(", ")}. El listado se muestra sin esa información; probá con "Actualizar".`,
        );
      }
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Rol en estado: se lee tras el montaje para no romper el render en servidor
  const [rolActual, setRolActual] = useState<string | null>(null);

  useEffect(() => {
    setRolActual(localStorage.getItem("rol"));
  }, []);

  const esDirector = rolActual === "Director";

  // ----- Índices de grado / sección / matrícula -----

  const seccionPorId = useMemo(
    () => new Map(secciones.map((seccion) => [seccion.id, seccion])),
    [secciones],
  );

  const gradoPorId = useMemo(
    () => new Map(grados.map((grado) => [grado.id, grado])),
    [grados],
  );

  // Se queda con la matrícula vigente de cada alumno (activa y del año más reciente).
  const matriculaPorAlumno = useMemo(() => {
    const mapa = new Map<number, Matricula>();
    for (const matricula of matriculas) {
      const actual = mapa.get(matricula.alumnoId);
      if (!actual || puntajeMatricula(matricula) > puntajeMatricula(actual)) {
        mapa.set(matricula.alumnoId, matricula);
      }
    }
    return mapa;
  }, [matriculas]);

  const infoDe = useCallback(
    (alumnoId: number): InfoAcademica => {
      const matricula = matriculaPorAlumno.get(alumnoId) ?? null;
      const seccion =
        matricula?.seccionId != null ? seccionPorId.get(matricula.seccionId) ?? null : null;
      const grado =
        seccion?.grado ??
        (seccion?.gradoId != null ? gradoPorId.get(seccion.gradoId) ?? null : null);
      return {
        matricula,
        seccion,
        grado,
        gradoNombre: grado?.nombre ?? "Sin grado",
        seccionNombre: seccion?.nombre ?? "Sin sección",
        turno: seccion?.turno ?? "Sin turno",
        anio: seccion?.anioEscolar?.anio ?? null,
      };
    },
    [matriculaPorAlumno, seccionPorId, gradoPorId],
  );

  const etiquetaAcademica = (alumnoId: number) => {
    const info = infoDe(alumnoId);
    if (!info.seccion) return "Sin matrícula asignada";
    return `${info.gradoNombre} · Sección ${info.seccionNombre} · ${info.turno}`;
  };

  const seccionesOrdenadas = useMemo(
    () =>
      [...secciones].sort((a, b) => {
        const ordenA = a.grado?.orden ?? gradoPorId.get(a.gradoId ?? -1)?.orden ?? 99;
        const ordenB = b.grado?.orden ?? gradoPorId.get(b.gradoId ?? -1)?.orden ?? 99;
        return ordenA - ordenB || a.nombre.localeCompare(b.nombre);
      }),
    [secciones, gradoPorId],
  );

  const seccionesDisponibles = useMemo(
    () =>
      gradoFiltro === "todos"
        ? seccionesOrdenadas
        : seccionesOrdenadas.filter(
            (seccion) => String(seccion.gradoId ?? seccion.grado?.id ?? "") === gradoFiltro,
          ),
    [seccionesOrdenadas, gradoFiltro],
  );

  // Si cambia el grado y la sección elegida ya no pertenece a ese grado, se limpia.
  useEffect(() => {
    if (seccionFiltro === "todas" || seccionFiltro === "sin") return;
    if (!seccionesDisponibles.some((seccion) => String(seccion.id) === seccionFiltro)) {
      setSeccionFiltro("todas");
    }
  }, [seccionesDisponibles, seccionFiltro]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return alumnos.filter((alumno) => {
      const info = infoDe(alumno.id);
      const texto = normalizar(
        `${alumno.nombre} ${alumno.apellido} ${alumno.codigoMined ?? ""} ${alumno.correo ?? ""} ${
          alumno.telefono ?? ""
        } grado ${info.gradoNombre} seccion ${info.seccionNombre} ${info.turno} ${
          info.anio ?? ""
        }`,
      );
      const coincideGrado =
        gradoFiltro === "todos" || String(info.grado?.id ?? "") === gradoFiltro;
      const coincideSeccion =
        seccionFiltro === "todas" ||
        (seccionFiltro === "sin"
          ? !info.matricula?.seccionId
          : String(info.matricula?.seccionId ?? "") === seccionFiltro);
      const coincideEstado =
        estadoFiltro === "todos" ||
        (estadoFiltro === "activos" && esActivo(alumno.estado)) ||
        (estadoFiltro === "inactivos" && !esActivo(alumno.estado));
      return (!q || texto.includes(q)) && coincideGrado && coincideSeccion && coincideEstado;
    });
  }, [alumnos, busqueda, estadoFiltro, gradoFiltro, seccionFiltro, infoDe]);

  const grupos = useMemo(() => {
    const mapa = new Map<string, Grupo>();
    for (const alumno of filtrados) {
      const info = infoDe(alumno.id);
      const key = info.seccion ? `seccion-${info.seccion.id}` : "sin-seccion";
      let grupo = mapa.get(key);
      if (!grupo) {
        grupo = {
          key,
          gradoNombre: info.gradoNombre,
          gradoOrden: info.grado?.orden ?? 999,
          seccionNombre: info.seccionNombre,
          turno: info.turno,
          anio: info.anio,
          alumnos: [],
        };
        mapa.set(key, grupo);
      }
      grupo.alumnos.push(alumno);
    }
    return [...mapa.values()].sort(
      (a, b) => a.gradoOrden - b.gradoOrden || a.seccionNombre.localeCompare(b.seccionNombre),
    );
  }, [filtrados, infoDe]);

  const resumen = useMemo(() => {
    const actuales = [...matriculaPorAlumno.values()];
    const idsSeccion = new Set(
      actuales
        .map((matricula) => matricula.seccionId)
        .filter((id): id is number => typeof id === "number"),
    );
    const idsGrado = new Set(
      actuales
        .map((matricula) =>
          matricula.seccionId != null ? seccionPorId.get(matricula.seccionId) : undefined,
        )
        .map((seccion) => seccion?.gradoId ?? seccion?.grado?.id)
        .filter((id): id is number => typeof id === "number"),
    );
    return {
      total: alumnos.length,
      activos: alumnos.filter((alumno) => esActivo(alumno.estado)).length,
      secciones: idsSeccion.size,
      grados: idsGrado.size,
      conAlertas: alumnos.filter(
        (alumno) =>
          tieneDato(alumno.alergias) ||
          tieneDato(alumno.enfermedades) ||
          tieneDato(alumno.medicamentos),
      ).length,
    };
  }, [alumnos, matriculaPorAlumno, seccionPorId]);

  // ----- Tutores y hermanos del alumno seleccionado -----

  const vinculosDelAlumno = useMemo(
    () => (seleccionado ? vinculos.filter((v) => v.alumnoId === seleccionado.id) : []),
    [vinculos, seleccionado],
  );

  const hermanos = useMemo(() => {
    if (!seleccionado || vinculosDelAlumno.length === 0) return [];
    const tutores = new Set(vinculosDelAlumno.map((v) => v.tutorId));
    const ids = new Set<number>();
    for (const vinculo of vinculos) {
      if (vinculo.alumnoId !== seleccionado.id && tutores.has(vinculo.tutorId)) {
        ids.add(vinculo.alumnoId);
      }
    }
    return alumnos.filter((alumno) => ids.has(alumno.id));
  }, [alumnos, vinculos, vinculosDelAlumno, seleccionado]);

  const alternarGrupo = (key: string) => {
    setGruposCerrados((previo) => ({ ...previo, [key]: !previo[key] }));
  };

  // Sin grados ni secciones no se puede agrupar: se usa la lista plana.
  const catalogosListos = secciones.length > 0 && grados.length > 0;
  const vistaEfectiva = catalogosListos ? vista : "lista";

  // ----- Form helpers -----

  const resetForm = () => {
    setForm({
      idUsuario: undefined,
      seccionId: undefined,
      codigoMined: "",
      colegioProcedencia: "",
      necesidadEspecial: "",
      fechaIngreso: "",
      transporte: "",
      alergias: "",
      enfermedades: "",
      medicamentos: "",
      correo: "",
      direccion: "",
      telefono: "",
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!esDirector) return;
    setAviso(null);
    setModoCreacion(true);
    setAlumnoEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (alumno: Alumno) => {
    if (!esDirector) return;
    const info = infoDe(alumno.id);
    setModoCreacion(false);
    setAlumnoEditando(alumno);
    setForm({
      idUsuario: alumno.idUsuario,
      seccionId: info.seccion?.id,
      codigoMined: alumno.codigoMined ?? "",
      colegioProcedencia: alumno.colegioProcedencia ?? "",
      necesidadEspecial: alumno.necesidadEspecial ?? "",
      fechaIngreso: alumno.fechaIngreso ?? "",
      transporte: alumno.transporte ?? "",
      alergias: alumno.alergias ?? "",
      enfermedades: alumno.enfermedades ?? "",
      medicamentos: alumno.medicamentos ?? "",
      correo: alumno.correo ?? "",
      direccion: alumno.direccion ?? "",
      telefono: alumno.telefono ?? "",
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    setAviso(null);
    const errores: Record<string, string> = {};

    if (!form.correo || !form.correo.includes("@")) {
      errores.correo = "Ingresá un correo válido.";
    }
    if (!form.fechaIngreso) {
      errores.fechaIngreso = "La fecha de ingreso es obligatoria.";
    }
    if (modoCreacion && (!form.idUsuario || form.idUsuario <= 0)) {
      errores.idUsuario = "El ID de usuario es obligatorio.";
    }

    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    try {
      if (modoCreacion) {
        const payload: AlumnoCrearRequest = {
          idUsuario: form.idUsuario ?? 0,
          codigoMined: form.codigoMined || null,
          colegioProcedencia: form.colegioProcedencia || null,
          necesidadEspecial: form.necesidadEspecial || null,
          fechaIngreso: form.fechaIngreso,
          transporte: form.transporte || null,
          alergias: form.alergias || null,
          enfermedades: form.enfermedades || null,
          medicamentos: form.medicamentos || null,
          correo: form.correo,
          direccion: form.direccion || null,
          telefono: form.telefono || null,
        };
        const nuevo = await crearAlumno(payload);

        // Si se eligió grado/sección, se crea la matrícula del año de esa sección.
        if (form.seccionId) {
          const seccion = secciones.find((s) => s.id === form.seccionId);
          if (seccion?.anioEscolarId) {
            try {
              await crearMatricula({
                alumnoId: nuevo.id,
                seccionId: form.seccionId,
                anioEscolarId: seccion.anioEscolarId,
                fechaMatricula: new Date().toISOString().slice(0, 10),
                estado: "Activa",
                observaciones: "Matrícula creada desde el expediente del alumno",
              });
            } catch (errMatricula) {
              setAviso(
                `El alumno se guardó, pero no se pudo asignar la sección: ${mensajeDeError(
                  errMatricula,
                )}`,
              );
            }
          }
        }
      } else {
        const payload: AlumnoActualizarRequest = {
          codigoMined: form.codigoMined || null,
          colegioProcedencia: form.colegioProcedencia || null,
          necesidadEspecial: form.necesidadEspecial || null,
          fechaIngreso: form.fechaIngreso || null,
          transporte: form.transporte || null,
          alergias: form.alergias || null,
          enfermedades: form.enfermedades || null,
          medicamentos: form.medicamentos || null,
          correo: form.correo || null,
          direccion: form.direccion || null,
          telefono: form.telefono || null,
        };
        if (alumnoEditando?.id) {
          await actualizarAlumno(alumnoEditando.id, payload);
        }
      }
      setModalAbierto(false);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
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
      await eliminarAlumno(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  const infoSeleccionado = seleccionado ? infoDe(seleccionado.id) : null;

  return (
    <AppShell
      titulo="Alumnos"
      subtitulo="Expedientes estudiantiles organizados por grado y sección"
      acciones={
        <>
          <Button
            variant="outline"
            onClick={() => {
              setAviso(null);
              void cargar();
            }}
            disabled={cargando}
          >
            <RefreshIcon className="h-4 w-4" />
            Actualizar
          </Button>
          {esDirector && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" />
              Nuevo alumno
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {aviso && (
          <div className="flex flex-wrap items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="min-w-0 flex-1">{aviso}</p>
            <button
              type="button"
              onClick={() => setAviso(null)}
              className="text-xs font-semibold underline"
            >
              Ocultar
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Alumnos"
            valor={resumen.total}
            detalle="Expedientes registrados"
            icon={UsersIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Activos"
            valor={resumen.activos}
            detalle="Expedientes habilitados"
            icon={IdIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Secciones"
            valor={resumen.secciones}
            detalle={`${resumen.grados} grados con alumnos matriculados`}
            icon={BookIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Alertas médicas"
            valor={resumen.conAlertas}
            detalle="Alergias / enfermedades / medicamentos"
            icon={AlertIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-3 border-b border-slate-100 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, código MINED, grado o sección…"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setVista("secciones")}
                  disabled={!catalogosListos}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    vistaEfectiva === "secciones"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Por grado y sección
                </button>
                <button
                  type="button"
                  onClick={() => setVista("lista")}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    vistaEfectiva === "lista"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Lista completa
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Select
                value={gradoFiltro}
                onChange={(e) => setGradoFiltro(e.target.value)}
                aria-label="Filtrar por grado"
              >
                <option value="todos">Todos los grados</option>
                {grados
                  .slice()
                  .sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
                  .map((grado) => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre}
                    </option>
                  ))}
              </Select>
              <Select
                value={seccionFiltro}
                onChange={(e) => setSeccionFiltro(e.target.value)}
                aria-label="Filtrar por sección"
              >
                <option value="todas">Todas las secciones</option>
                {seccionesDisponibles.map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.grado?.nombre ?? gradoPorId.get(seccion.gradoId ?? -1)?.nombre ?? ""} ·
                    Sección {seccion.nombre} · {seccion.turno}
                  </option>
                ))}
                <option value="sin">Sin matrícula asignada</option>
              </Select>
              <Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </Select>
            </div>
          </div>

          {cargando ? (
            <div className="p-4">
              <Cargando texto="Cargando alumnos, grados y secciones…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado
                mensaje={error}
                onReintentar={() => {
                  setAviso(null);
                  void cargar();
                }}
              />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin alumnos"
                descripcion="No hay alumnos que coincidan con los filtros seleccionados."
              />
            </div>
          ) : vistaEfectiva === "secciones" ? (
            <div className="divide-y divide-slate-100">
              {grupos.map((grupo) => {
                const abierto = !gruposCerrados[grupo.key];
                return (
                  <div key={grupo.key}>
                    <button
                      type="button"
                      onClick={() => alternarGrupo(grupo.key)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50/80"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                        <GraduationCapIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-900">
                          {grupo.gradoNombre}
                          {grupo.key !== "sin-seccion" && ` · Sección ${grupo.seccionNombre}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {grupo.key === "sin-seccion"
                            ? "Asigná la sección desde el módulo Matrículas"
                            : `Turno ${grupo.turno}${grupo.anio ? ` · Año escolar ${grupo.anio}` : ""}`}
                        </p>
                      </div>
                      <Badge variant="brand">
                        {grupo.alumnos.length} {grupo.alumnos.length === 1 ? "alumno" : "alumnos"}
                      </Badge>
                      <ArrowRightIcon
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          abierto ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {abierto && (
                      <div className="divide-y divide-slate-100 bg-slate-50/50">
                        {grupo.alumnos.map((alumno) => (
                          <div
                            key={alumno.id}
                            className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-white"
                          >
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                              {iniciales(alumno.nombre, alumno.apellido)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSeleccionado(alumno)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <p className="truncate font-semibold text-slate-900">
                                {nombreCompleto(alumno.nombre, alumno.apellido)}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {alumno.codigoMined ?? "Sin código MINED"} ·{" "}
                                {alumno.correo ?? "Sin correo"} · {alumno.telefono ?? "Sin teléfono"}
                              </p>
                            </button>
                            <Badge variant={esActivo(alumno.estado) ? "success" : "default"}>
                              {esActivo(alumno.estado) ? "Activo" : "Inactivo"}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSeleccionado(alumno)}
                              >
                                <EyeIcon className="h-3.5 w-3.5" />
                                Ver ficha
                              </Button>
                              {esDirector && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => abrirEditar(alumno)}
                                    className="text-slate-500 hover:text-indigo-600"
                                    aria-label="Editar alumno"
                                  >
                                    <EditIcon className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => solicitarEliminar(alumno.id)}
                                    className="text-red-500 hover:bg-red-50"
                                    aria-label="Eliminar alumno"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Estudiante</th>
                      <th className="px-4 py-3 font-semibold">Código MINED</th>
                      <th className="px-4 py-3 font-semibold">Grado y sección</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.map((alumno) => {
                      const info = infoDe(alumno.id);
                      return (
                        <tr key={alumno.id} className="transition hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                                {iniciales(alumno.nombre, alumno.apellido)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {nombreCompleto(alumno.nombre, alumno.apellido)}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {alumno.correo ?? "Sin correo"} ·{" "}
                                  {alumno.telefono ?? "Sin teléfono"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {alumno.codigoMined ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {info.seccion ? (
                              <>
                                <p className="font-medium text-slate-800">{info.gradoNombre}</p>
                                <p className="text-xs text-slate-500">
                                  Sección {info.seccionNombre} · {info.turno}
                                </p>
                              </>
                            ) : (
                              <Badge variant="warning">Sin matrícula</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={esActivo(alumno.estado) ? "success" : "default"}>
                              {esActivo(alumno.estado) ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSeleccionado(alumno)}
                              >
                                <EyeIcon className="h-3.5 w-3.5" />
                                Ver
                              </Button>
                              {esDirector && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => abrirEditar(alumno)}
                                    className="text-slate-500 hover:text-indigo-600"
                                    aria-label="Editar alumno"
                                  >
                                    <EditIcon className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => solicitarEliminar(alumno.id)}
                                    className="text-red-500 hover:bg-red-50"
                                    aria-label="Eliminar alumno"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filtrados.map((alumno) => {
                  const info = infoDe(alumno.id);
                  return (
                    <div
                      key={alumno.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSeleccionado(alumno)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSeleccionado(alumno);
                        }
                      }}
                      className="flex w-full cursor-pointer items-start gap-3 p-4 text-left transition hover:bg-slate-50"
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                        {iniciales(alumno.nombre, alumno.apellido)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {nombreCompleto(alumno.nombre, alumno.apellido)}
                          </p>
                          <Badge variant={esActivo(alumno.estado) ? "success" : "default"}>
                            {esActivo(alumno.estado) ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-indigo-700">
                          {info.seccion
                            ? `${info.gradoNombre} · Sección ${info.seccionNombre} · ${info.turno}`
                            : "Sin matrícula asignada"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {alumno.codigoMined ?? "Sin código MINED"}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {alumno.correo ?? "Sin correo"} · {alumno.telefono ?? "Sin teléfono"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEditar(alumno);
                          }}
                          disabled={!esDirector}
                          className="text-slate-500 hover:text-indigo-600"
                          aria-label="Editar alumno"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            solicitarEliminar(alumno.id);
                          }}
                          disabled={!esDirector}
                          className="text-red-500 hover:bg-red-50"
                          aria-label="Eliminar alumno"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!cargando && !error && (
            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              Mostrando {filtrados.length} de {alumnos.length} alumnos
              {vistaEfectiva === "secciones" &&
                ` · ${grupos.length} ${grupos.length === 1 ? "sección" : "secciones"}`}
            </div>
          )}
        </section>
      </div>

      {/* Modal: ver ficha */}
      <Modal
        abierto={seleccionado !== null}
        onCerrar={() => setSeleccionado(null)}
        titulo={
          seleccionado
            ? nombreCompleto(seleccionado.nombre, seleccionado.apellido)
            : "Ficha del alumno"
        }
        descripcion="Información del expediente estudiantil"
      >
        {seleccionado && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 text-white">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur">
                {iniciales(seleccionado.nombre, seleccionado.apellido)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">
                  {nombreCompleto(seleccionado.nombre, seleccionado.apellido)}
                </p>
                <p className="text-sm text-indigo-100">
                  {seleccionado.codigoMined ?? "Sin código MINED"}
                </p>
              </div>
              <Badge
                variant={esActivo(seleccionado.estado) ? "success" : "default"}
                className="ml-auto shrink-0 bg-white/90"
              >
                {esActivo(seleccionado.estado) ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {infoSeleccionado?.seccion ? (
                <>
                  <Badge variant="brand">
                    <GraduationCapIcon className="h-3.5 w-3.5" />
                    {infoSeleccionado.gradoNombre}
                  </Badge>
                  <Badge variant="info">
                    <BookIcon className="h-3.5 w-3.5" />
                    Sección {infoSeleccionado.seccionNombre}
                  </Badge>
                  <Badge>
                    <ClockIcon className="h-3.5 w-3.5" />
                    Turno {infoSeleccionado.turno}
                  </Badge>
                  {infoSeleccionado.anio && (
                    <Badge>
                      <CalendarIcon className="h-3.5 w-3.5" />
                      Año {infoSeleccionado.anio}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="warning">Sin matrícula asignada</Badge>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Dato
                icon={<IdIcon className="h-4 w-4" />}
                etiqueta="Código MINED"
                valor={seleccionado.codigoMined}
              />
              <Dato
                icon={<CalendarIcon className="h-4 w-4" />}
                etiqueta="Fecha de ingreso"
                valor={formatearFecha(seleccionado.fechaIngreso)}
              />
              <Dato
                icon={<GraduationCapIcon className="h-4 w-4" />}
                etiqueta="Grado"
                valor={infoSeleccionado?.seccion ? infoSeleccionado.gradoNombre : null}
              />
              <Dato
                icon={<BookIcon className="h-4 w-4" />}
                etiqueta="Sección"
                valor={
                  infoSeleccionado?.seccion
                    ? `Sección ${infoSeleccionado.seccionNombre}`
                    : null
                }
              />
              <Dato
                icon={<ClockIcon className="h-4 w-4" />}
                etiqueta="Turno"
                valor={infoSeleccionado?.seccion ? infoSeleccionado.turno : null}
              />
              <Dato
                icon={<CalendarIcon className="h-4 w-4" />}
                etiqueta="Año escolar"
                valor={infoSeleccionado?.anio ? String(infoSeleccionado.anio) : null}
              />
              <Dato
                icon={<MailIcon className="h-4 w-4" />}
                etiqueta="Correo"
                valor={seleccionado.correo}
              />
              <Dato
                icon={<PhoneIcon className="h-4 w-4" />}
                etiqueta="Teléfono"
                valor={seleccionado.telefono}
              />
              <Dato
                icon={<MapPinIcon className="h-4 w-4" />}
                etiqueta="Dirección"
                valor={seleccionado.direccion}
              />
              <Dato
                icon={<UsersIcon className="h-4 w-4" />}
                etiqueta="Transporte"
                valor={seleccionado.transporte}
              />
              <Dato
                icon={<AlertIcon className="h-4 w-4" />}
                etiqueta="Alergias"
                valor={seleccionado.alergias}
              />
              <Dato
                icon={<AlertIcon className="h-4 w-4" />}
                etiqueta="Enfermedades"
                valor={seleccionado.enfermedades}
              />
              <Dato
                icon={<AlertIcon className="h-4 w-4" />}
                etiqueta="Medicamentos"
                valor={seleccionado.medicamentos}
              />
              <Dato
                icon={<IdIcon className="h-4 w-4" />}
                etiqueta="Necesidad especial"
                valor={seleccionado.necesidadEspecial}
              />
              <Dato
                icon={<MapPinIcon className="h-4 w-4" />}
                etiqueta="Colegio de procedencia"
                valor={seleccionado.colegioProcedencia}
              />
              <Dato
                icon={<IdIcon className="h-4 w-4" />}
                etiqueta="Usuario vinculado"
                valor={`#${seleccionado.idUsuario}`}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">Tutores y hermanos</h4>
              </div>

              {vinculosDelAlumno.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  Este alumno no tiene tutores vinculados.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {vinculosDelAlumno.map((vinculo) => (
                    <li
                      key={vinculo.id}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                        {nombreTutor(vinculo)}
                        <Badge variant="brand">{vinculo.parentesco}</Badge>
                        {vinculo.esPrincipal && <Badge variant="success">Principal</Badge>}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {vinculo.tutor?.usuario?.telefono ?? "Sin teléfono"} ·{" "}
                        {vinculo.tutor?.usuario?.email ??
                          vinculo.tutor?.correoPersonal ??
                          "Sin correo"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 border-t border-slate-200 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Hermanos en el colegio
                </p>
                {hermanos.length === 0 ? (
                  <p className="mt-1 text-xs text-slate-500">
                    No hay otros alumnos vinculados a los mismos tutores.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {hermanos.map((hermano) => {
                      const info = infoDe(hermano.id);
                      return (
                        <li
                          key={hermano.id}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"
                        >
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white">
                            {iniciales(hermano.nombre, hermano.apellido)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {nombreCompleto(hermano.nombre, hermano.apellido)}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {info.seccion
                                ? `${info.gradoNombre} · Sección ${info.seccionNombre} · ${info.turno}`
                                : "Sin matrícula asignada"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSeleccionado(hermano)}
                          >
                            Ver ficha
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: crear / editar alumno */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Nuevo alumno" : "Editar alumno"}
        descripcion={
          modoCreacion
            ? "Registrá un nuevo expediente estudiantil"
            : `Editando ${nombreCompleto(alumnoEditando?.nombre, alumnoEditando?.apellido)}`
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Usuario vinculado (ID)
              </label>
              <Input
                type="number"
                placeholder="Ej: 10"
                value={form.idUsuario ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    idUsuario: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                disabled={!modoCreacion}
              />
              {modoCreacion && (
                <p className="text-[11px] text-slate-400">
                  ID de la cuenta de usuario ya creada en el sistema.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Código MINED
              </label>
              <Input
                placeholder="Ej: 2025-001"
                value={form.codigoMined}
                onChange={(e) => setForm({ ...form, codigoMined: e.target.value })}
              />
              {erroresForm.codigoMined && (
                <p className="text-[11px] text-red-600">{erroresForm.codigoMined}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-600">
              Grado y sección
            </label>
            {modoCreacion ? (
              <>
                <Select
                  value={form.seccionId ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seccionId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                >
                  <option value="">Sin asignar (se puede hacer luego en Matrículas)</option>
                  {seccionesOrdenadas.map((seccion) => (
                    <option key={seccion.id} value={seccion.id}>
                      {seccion.grado?.nombre ??
                        gradoPorId.get(seccion.gradoId ?? -1)?.nombre ??
                        "Grado"}{" "}
                      · Sección {seccion.nombre} · {seccion.turno}
                      {seccion.anioEscolar?.anio ? ` · ${seccion.anioEscolar.anio}` : ""}
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] text-slate-400">
                  Al guardar se crea la matrícula en el año escolar de la sección elegida.
                </p>
              </>
            ) : (
              <>
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {alumnoEditando
                    ? etiquetaAcademica(alumnoEditando.id)
                    : "Sin matrícula asignada"}
                </p>
                <p className="text-[11px] text-slate-400">
                  Para mover al alumno de grado o sección usá el módulo Matrículas.
                </p>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Correo electrónico *
              </label>
              <Input
                type="email"
                placeholder="alumno@colegio.edu.ni"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
              {erroresForm.correo && (
                <p className="text-[11px] text-red-600">{erroresForm.correo}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Fecha de ingreso *
              </label>
              <Input
                type="date"
                value={form.fechaIngreso}
                onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
              />
              {erroresForm.fechaIngreso && (
                <p className="text-[11px] text-red-600">{erroresForm.fechaIngreso}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Colegio de procedencia
              </label>
              <Input
                placeholder="Nombre del colegio"
                value={form.colegioProcedencia}
                onChange={(e) => setForm({ ...form, colegioProcedencia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Transporte
              </label>
              <Input
                placeholder="Ej: Autobús escolar"
                value={form.transporte}
                onChange={(e) => setForm({ ...form, transporte: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Teléfono
              </label>
              <Input
                type="tel"
                placeholder="Ej: 2250-1234"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Dirección
              </label>
              <Input
                placeholder="Dirección domiciliar"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-slate-600">
              Necesidad especial
            </label>
            <Input
              placeholder="Observaciones"
              value={form.necesidadEspecial}
              onChange={(e) => setForm({ ...form, necesidadEspecial: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Alergias
              </label>
              <Textarea
                value={form.alergias}
                onChange={(e) => setForm({ ...form, alergias: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Enfermedades
              </label>
              <Textarea
                value={form.enfermedades}
                onChange={(e) => setForm({ ...form, enfermedades: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase text-slate-600">
                Medicamentos
              </label>
              <Textarea
                value={form.medicamentos}
                onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" disabled={cargando}>
              {modoCreacion ? "Registrar alumno" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: confirmar eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar alumno"
        descripcion="Esta acción no se puede deshacer y quitará el expediente del sistema."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            ¿Estás seguro de que deseas eliminar este alumno?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmarEliminar(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={eliminar}
              disabled={eliminandoId !== null}
            >
              {eliminandoId !== null ? "Eliminando…" : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
