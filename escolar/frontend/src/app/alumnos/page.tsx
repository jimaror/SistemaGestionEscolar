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
  crearAlumno,
  eliminarAlumno,
  listarAlumnos,
  actualizarAlumno,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Alumno,
  AlumnoActualizarRequest,
  AlumnoCrearRequest,
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
  IdIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
  EditIcon,
  PlusIcon,
} from "@/components/icons";

const paletas = [
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

function colorPorId(id: number) {
  return paletas[id % paletas.length];
}

function tieneDato(valor: string | null | undefined) {
  if (!valor) return false;
  const v = normalizar(valor);
  return v !== "" && v !== "ninguna" && v !== "ninguno" && v !== "no" && v !== "n/a";
}

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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
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
      setAlumnos(await listarAlumnos());
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

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return alumnos.filter((alumno) => {
      const texto = normalizar(
        `${alumno.nombre} ${alumno.apellido} ${alumno.codigoMined ?? ""} ${alumno.correo ?? ""} ${alumno.telefono ?? ""}`,
      );
      return (
        (!q || texto.includes(q)) &&
        (estadoFiltro === "todos" ||
          (estadoFiltro === "activos" && esActivo(alumno.estado)) ||
          (estadoFiltro === "inactivos" && !esActivo(alumno.estado)))
      );
    });
  }, [alumnos, busqueda, estadoFiltro]);

  const resumen = useMemo(() => {
    const activos = alumnos.filter((a) => esActivo(a.estado)).length;
    const conTransporte = alumnos.filter((a) => tieneDato(a.transporte)).length;
    const conAlertas = alumnos.filter(
      (a) => tieneDato(a.alergias) || tieneDato(a.enfermedades) || tieneDato(a.medicamentos),
    ).length;
    return { total: alumnos.length, activos, conTransporte, conAlertas };
  }, [alumnos]);

  // ----- Form helpers -----

  const resetForm = () => {
    setForm({
      idUsuario: undefined,
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
    setModoCreacion(true);
    setAlumnoEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (alumno: Alumno) => {
    if (!esDirector) return;
    setModoCreacion(false);
    setAlumnoEditando(alumno);
    setForm({
      idUsuario: alumno.idUsuario,
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
        await crearAlumno(payload);
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

  return (
    <AppShell
      titulo="Alumnos"
      subtitulo="Expedientes estudiantiles del colegio"
      acciones={
        <>
          <Button
            variant="outline"
            onClick={() => void cargar()}
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
            titulo="Con transporte"
            valor={resumen.conTransporte}
            detalle="Usan servicio de transporte"
            icon={MapPinIcon}
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
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar alumno, código MINED, correo o teléfono…"
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
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </Select>
          </div>

          {cargando ? (
            <div className="p-4">
              <Cargando texto="Cargando alumnos…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin alumnos"
                descripcion="No hay alumnos que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Estudiante</th>
                      <th className="px-4 py-3 font-semibold">Código MINED</th>
                      <th className="px-4 py-3 font-semibold">Contacto</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.map((alumno) => (
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
                          <p className="text-sm text-slate-700">
                            {nombreCompleto(alumno.nombre, alumno.apellido)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {alumno.direccion ?? "Sin dirección"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={esActivo(alumno.estado) ? "success" : "default"}>
                            {esActivo(alumno.estado) ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSeleccionado(alumno)}
                            >
                              <EditIcon className="h-3.5 w-3.5" />
                              Ver
                            </Button>
                            {esDirector && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => abrirEditar(alumno)}
                                  className="text-slate-500 hover:text-indigo-600"
                                >
                                  <EditIcon className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => solicitarEliminar(alumno.id)}
                                  className="text-red-500 hover:bg-red-50"
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filtrados.map((alumno) => (
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
                        onClick={() => abrirEditar(alumno)}
                        disabled={!esDirector}
                        className="text-slate-500 hover:text-indigo-600"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => solicitarEliminar(alumno.id)}
                        disabled={!esDirector}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!cargando && !error && (
            <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              Mostrando {filtrados.length} de {alumnos.length} alumnos
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

            <div className="grid gap-3 sm:grid-cols-2">
              <Dato
                icon={<IdIcon className="h-4 w-4" />}
                etiqueta="Código MINED"
                valor={seleccionado.codigoMined}
              />
              <Dato
                icon={<UsersIcon className="h-4 w-4" />}
                etiqueta="Fecha de ingreso"
                valor={formatearFecha(seleccionado.fechaIngreso)}
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
        <form onSubmit={(e) => { e.preventDefault(); void guardar(); }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Usuario vinculado (ID)
              </label>
              <Input
                type="number"
                placeholder="Ej: 10"
                value={form.idUsuario ?? ""}
                onChange={(e) =>
                  setForm({ ...form, idUsuario: e.target.value ? Number(e.target.value) : undefined })
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
              <label className="block text-xs font-semibold text-slate-600 uppercase">
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Correo electrónico *
              </label>
              <Input
                type="email"
                placeholder="alumno@colegio.edu.ni"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
              />
              {erroresForm.correo && <p className="text-[11px] text-red-600">{erroresForm.correo}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
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
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Colegio de procedencia
              </label>
              <Input
                placeholder="Nombre del colegio"
                value={form.colegioProcedencia}
                onChange={(e) => setForm({ ...form, colegioProcedencia: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
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
              <label className="block text-xs font-semibold text-slate-600 uppercase">
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
              <label className="block text-xs font-semibold text-slate-600 uppercase">
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
            <label className="block text-xs font-semibold text-slate-600 uppercase">
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
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Alergias
              </label>
              <Textarea
                value={form.alergias}
                onChange={(e) => setForm({ ...form, alergias: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Enfermedades
              </label>
              <Textarea
                value={form.enfermedades}
                onChange={(e) => setForm({ ...form, enfermedades: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Medicamentos
              </label>
              <Textarea
                value={form.medicamentos}
                onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={cargando}
            >
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
