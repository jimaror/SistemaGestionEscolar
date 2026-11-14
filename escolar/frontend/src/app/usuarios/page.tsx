"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
  actualizarUsuario,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type { Usuario } from "@/lib/types";
import {
  esActivo,
  formatearFecha,
  formatearFechaHora,
  iniciales,
  normalizar,
  nombreCompleto,
} from "@/lib/format";
import {
  CalendarIcon,
  IdIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  TrashIcon,
  UsersIcon,
  EditIcon,
  PlusIcon,
} from "@/components/icons";

interface FilaUsuario {
  id: number;
  username: string;
  nombre: string;
  iniciales: string;
  rol: string;
  email: string;
  telefono: string;
  estado: string;
  activo: boolean;
  cedula: string;
  fechaNacimiento: string;
  sexo: string;
  zona: string;
  direccion: string;
  barrio: string;
  creado: string;
}

function varianteRol(rol: string) {
  const valor = normalizar(rol);
  if (valor === "director") return "brand" as const;
  if (valor === "maestro") return "info" as const;
  if (valor === "alumno") return "success" as const;
  if (valor === "tutor") return "warning" as const;
  return "default" as const;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("todos");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [seleccionado, setSeleccionado] = useState<FilaUsuario | null>(null);

  // CRUD state
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<Usuario>>({
    username: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    telefonoAlterno: "",
    cedula: "",
    codigoUnico: "",
    fechaNacimiento: "",
    sexo: "",
    zona: "",
    direccion: "",
    barrio: "",
    rol: "",
    rolId: undefined,
    estado: "",
    referencias: "",
    fotoPerfil: null,
  });
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    if (!rolPermitido("usuarios")) return;
    setCargando(true);
    setError(null);
    try {
      setUsuarios(await listarUsuarios());
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

  const resetForm = () => {
    setForm({
      username: "",
      nombres: "",
      apellidos: "",
      email: "",
      telefono: "",
      telefonoAlterno: "",
      cedula: "",
      codigoUnico: "",
      fechaNacimiento: "",
      sexo: "",
      zona: "",
      direccion: "",
      barrio: "",
      rol: "",
      rolId: undefined,
      estado: "",
      referencias: "",
      fotoPerfil: null,
    });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!esDirector) return;
    setModoCreacion(true);
    setUsuarioEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (usuario: Usuario) => {
    if (!esDirector) return;
    setModoCreacion(false);
    setUsuarioEditando(usuario);
    setForm({
      username: usuario.username,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      telefonoAlterno: usuario.telefonoAlterno,
      cedula: usuario.cedula,
      codigoUnico: usuario.codigoUnico,
      fechaNacimiento: usuario.fechaNacimiento,
      sexo: usuario.sexo,
      zona: usuario.zona,
      direccion: usuario.direccion,
      barrio: usuario.barrio,
      rol: usuario.rol,
      rolId: usuario.rolId,
      estado: usuario.estado,
      referencias: usuario.referencias,
      fotoPerfil: usuario.fotoPerfil,
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (!form.username?.trim()) {
      errores.username = "El nombre de usuario es obligatorio.";
    }
    if (!form.nombres?.trim()) {
      errores.nombres = "El nombre es obligatorio.";
    }
    if (!form.apellidos?.trim()) {
      errores.apellidos = "El apellido es obligatorio.";
    }
    if (form.email && !form.email.includes("@")) {
      errores.email = "Ingresá un correo válido.";
    }

    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    try {
      const payload: Usuario = {
        id: usuarioEditando?.id ?? 0,
        username: form.username?.trim() ?? "",
        nombres: form.nombres?.trim() ?? null,
        apellidos: form.apellidos?.trim() ?? null,
        email: form.email?.trim() || null,
        telefono: form.telefono || null,
        telefonoAlterno: form.telefonoAlterno || null,
        cedula: form.cedula || null,
        codigoUnico: form.codigoUnico || null,
        fechaNacimiento: form.fechaNacimiento || null,
        sexo: form.sexo || null,
        zona: form.zona || null,
        direccion: form.direccion || null,
        barrio: form.barrio || null,
        rol: esDirector ? (form.rol ?? null) : null,
        rolId: esDirector ? (form.rolId ?? null) : null,
        estado: esDirector ? (form.estado ?? null) : null,
        referencias: form.referencias || null,
        fotoPerfil: form.fotoPerfil ?? null,
        createdAt: usuarioEditando?.createdAt ?? null,
      };

      if (modoCreacion) {
        await crearUsuario(payload);
      } else if (usuarioEditando?.id) {
        await actualizarUsuario(usuarioEditando.id, payload);
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
      await eliminarUsuario(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  const filas = useMemo<FilaUsuario[]>(
    () =>
      usuarios
        .map((usuario) => ({
          id: usuario.id,
          username: usuario.username,
          nombre: nombreCompleto(usuario.nombres, usuario.apellidos),
          iniciales: iniciales(usuario.nombres, usuario.apellidos),
          rol: usuario.rol ?? "Sin rol",
          email: usuario.email ?? "—",
          telefono: usuario.telefono ?? "—",
          estado: usuario.estado ?? "Sin estado",
          activo: esActivo(usuario.estado),
          cedula: usuario.cedula ?? "—",
          fechaNacimiento: formatearFecha(usuario.fechaNacimiento),
          sexo: usuario.sexo ?? "—",
          zona: usuario.zona ?? "—",
          direccion: usuario.direccion ?? "—",
          barrio: usuario.barrio ?? "—",
          creado: formatearFechaHora(usuario.createdAt),
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [usuarios]
  );

  const roles = useMemo(
    () => Array.from(new Set(filas.map((f) => f.rol))),
    [filas]
  );

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const texto = normalizar(
        `${fila.username} ${fila.nombre} ${fila.rol} ${fila.email} ${fila.telefono} ${fila.cedula}`,
      );
      return (
        (!q || texto.includes(q)) &&
        (rolFiltro === "todos" || fila.rol === rolFiltro) &&
        (estadoFiltro === "todos" ||
          (estadoFiltro === "activos" && fila.activo) ||
          (estadoFiltro === "inactivos" && !fila.activo))
      );
    });
  }, [filas, busqueda, rolFiltro, estadoFiltro]);

  const resumen = useMemo(() => {
    const activos = filas.filter((f) => f.activo).length;
    const conCorreo = filas.filter((f) => f.email !== "—").length;
    const conTelefono = filas.filter((f) => f.telefono !== "—").length;
    return {
      total: filas.length,
      activos,
      roles: roles.length,
      conCorreo,
      conTelefono,
    };
  }, [filas, roles]);

  return (
    <AppShell
      titulo="Usuarios"
      subtitulo="Cuentas, roles y datos de contacto del personal y estudiantes"
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
              Nuevo usuario
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Usuarios"
            valor={resumen.total}
            detalle="Cuentas registradas"
            icon={UsersIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Activos"
            valor={resumen.activos}
            detalle="Cuentas habilitadas"
            icon={ShieldIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Roles"
            valor={resumen.roles}
            detalle="Perfiles en el sistema"
            icon={IdIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Con correo"
            valor={resumen.conCorreo}
            detalle={`${resumen.conTelefono} con teléfono`}
            icon={MailIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar usuario, nombre, correo o cédula…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={rolFiltro}
                onChange={(e) => setRolFiltro(e.target.value)}
                className="w-40"
                aria-label="Filtrar por rol"
              >
                <option value="todos">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </Select>
              <Select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="w-40"
                aria-label="Filtrar por estado"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </Select>
            </div>
          </div>

          {cargando ? (
            <div className="p-4">
              <Cargando texto="Cargando usuarios…" />
            </div>
          ) : error ? (
            <div className="p-4">
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-4">
              <Vacio
                titulo="Sin usuarios"
                descripcion="No hay cuentas que coincidan con los filtros seleccionados."
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Usuario</th>
                      <th className="px-4 py-3 font-semibold">Rol</th>
                      <th className="px-4 py-3 font-semibold">Contacto</th>
                      <th className="px-4 py-3 font-semibold">Creado</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtrados.map((fila) => (
                      <tr key={fila.id} className="transition hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                              {fila.iniciales}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {fila.nombre}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                @{fila.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={varianteRol(fila.rol)}>{fila.rol}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="truncate text-slate-700">{fila.email}</p>
                          <p className="text-xs text-slate-500">{fila.telefono}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{fila.creado}</td>
                        <td className="px-4 py-3">
                          <Badge variant={fila.activo ? "success" : "default"}>
                            {fila.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSeleccionado(fila)}
                            >
                              <EditIcon className="h-3.5 w-3.5" />
                              Ver
                            </Button>
                            {esDirector && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const u = usuarios.find((u) => u.id === fila.id);
                                    if (u) abrirEditar(u);
                                  }}
                                  className="text-slate-500 hover:text-indigo-600"
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filtrados.map((fila) => (
                  <div
                    key={fila.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSeleccionado(fila)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSeleccionado(fila);
                      }
                    }}
                    className="flex w-full cursor-pointer items-start gap-3 p-4 text-left transition hover:bg-slate-50"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[11px] font-bold text-white">
                      {fila.iniciales}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold text-slate-900">
                          {fila.nombre}
                        </p>
                        <Badge variant={fila.activo ? "success" : "default"}>
                          {fila.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        @{fila.username} · {fila.rol}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {fila.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const u = usuarios.find((u) => u.id === fila.id);
                          if (u) abrirEditar(u);
                        }}
                        disabled={!esDirector}
                        className="text-slate-500 hover:text-indigo-600"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => solicitarEliminar(fila.id)}
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
              Mostrando {filtrados.length} de {filas.length} usuarios
            </div>
          )}
        </section>
      </div>

      {/* Modal: ver ficha */}
      <Modal
        abierto={seleccionado !== null}
        onCerrar={() => setSeleccionado(null)}
        titulo={seleccionado?.nombre ?? "Ficha de usuario"}
        descripcion="Datos de la cuenta y contacto registrado"
      >
        {seleccionado && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 text-white">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur">
                {seleccionado.iniciales}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{seleccionado.nombre}</p>
                <p className="text-sm text-indigo-100">@{seleccionado.username}</p>
              </div>
              <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                <Badge variant={varianteRol(seleccionado.rol)} className="bg-white/90">
                  {seleccionado.rol}
                </Badge>
                <Badge
                  variant={seleccionado.activo ? "success" : "default"}
                  className="bg-white/90"
                >
                  {seleccionado.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <MailIcon className="h-3.5 w-3.5" />
                  Correo
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                  {seleccionado.email}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <PhoneIcon className="h-3.5 w-3.5" />
                  Teléfono
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionado.telefono}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <IdIcon className="h-3.5 w-3.5" />
                  Cédula
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionado.cedula}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Fecha de nacimiento
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionado.fechaNacimiento}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  Dirección
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                  {seleccionado.direccion}
                  {seleccionado.barrio !== "—" && ` · ${seleccionado.barrio}`}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:col-span-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Cuenta creada
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {seleccionado.creado}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: crear / editar usuario */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Nuevo usuario" : "Editar usuario"}
        descripcion={
          modoCreacion
            ? "Registrá una nueva cuenta en el sistema"
            : `Editando ${nombreCompleto(usuarioEditando?.nombres, usuarioEditando?.apellidos)}`
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void guardar(); }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Nombre de usuario *
              </label>
              <Input
                placeholder="Ej: maestra_ana"
                value={form.username ?? ""}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              {erroresForm.username && (
                <p className="text-[11px] text-red-600">{erroresForm.username}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Nombres *
              </label>
              <Input
                placeholder="Ana María"
                value={form.nombres ?? ""}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              />
              {erroresForm.nombres && (
                <p className="text-[11px] text-red-600">{erroresForm.nombres}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Apellidos *
              </label>
              <Input
                placeholder="Pérez López"
                value={form.apellidos ?? ""}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              />
              {erroresForm.apellidos && (
                <p className="text-[11px] text-red-600">{erroresForm.apellidos}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="ana@colegio.edu.ni"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {erroresForm.email && (
                <p className="text-[11px] text-red-600">{erroresForm.email}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Teléfono
              </label>
              <Input
                type="tel"
                placeholder="2250-1234"
                value={form.telefono ?? ""}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Cédula
              </label>
              <Input
                placeholder="12345678"
                value={form.cedula ?? ""}
                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Fecha de nacimiento
              </label>
              <Input
                type="date"
                value={form.fechaNacimiento ?? ""}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Sexo
              </label>
              <Select
                value={form.sexo ?? ""}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Zona
              </label>
              <Input
                placeholder="Zona residencial"
                value={form.zona ?? ""}
                onChange={(e) => setForm({ ...form, zona: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase">
                Barrio
              </label>
              <Input
                placeholder="Nombre del barrio"
                value={form.barrio ?? ""}
                onChange={(e) => setForm({ ...form, barrio: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 uppercase">
              Dirección
            </label>
            <Input
              placeholder="Dirección completa"
              value={form.direccion ?? ""}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
          </div>

          {esDirector && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">
                    Rol
                  </label>
                  <Select
                    value={form.rol ?? ""}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Director">Director</option>
                    <option value="Maestro">Maestro</option>
                    <option value="Alumno">Alumno</option>
                    <option value="Tutor">Tutor</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">
                    Estado
                  </label>
                  <Select
                    value={form.estado ?? ""}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase">
                  Teléfono alterno
                </label>
                <Input
                  type="tel"
                  placeholder="Teléfono alterno"
                  value={form.telefonoAlterno ?? ""}
                  onChange={(e) => setForm({ ...form, telefonoAlterno: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase">
                  Código único
                </label>
                <Input
                  placeholder="Código único institucional"
                  value={form.codigoUnico ?? ""}
                  onChange={(e) => setForm({ ...form, codigoUnico: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 uppercase">
                  Referencias
                </label>
                <Textarea
                  value={form.referencias ?? ""}
                  onChange={(e) => setForm({ ...form, referencias: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}

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
              {modoCreacion ? "Registrar usuario" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: confirmar eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar usuario"
        descripcion="Esta acción no se puede deshacer y quitará la cuenta del sistema."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            ¿Estás seguro de que deseas eliminar este usuario?
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
