"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cargarNombreUsuario, cerrarSesion, obtenerToken } from "@/lib/api";
import { PERMISOS, rolPermitido } from "@/lib/permisos";
import { listarJustificaciones, listarMensajes, listarReuniones } from "@/lib/servicios";
import type { JustificacionAusencia, Mensaje, Reunion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EscudoNicaragua } from "@/components/escudo";
import { cn } from "@/lib/utils";
import { WavesBackground } from "@/components/waves-background";
import {
  ArrowRightIcon,
  BellIcon,
  BookIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  FileTextIcon,
  FolderIcon,
  HomeIcon,
  IdIcon,
  LogOutIcon,
  MenuIcon,
  MessageIcon,
  SendIcon,
  ShieldIcon,
  UserCircleIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";

type Rol = "Director" | "Maestro" | "Alumno" | "Tutor" | string;

interface Sesion {
  username: string;
  rol: Rol;
}

interface NavItem {
  nombre: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
  roles: string[];
  badge?: string;
}

interface NavGroup {
  titulo: string;
  items: NavItem[];
}

const GRUPOS_NAV: NavGroup[] = [
  {
    titulo: "Principal",
    items: [
      {
        nombre: "Mi escritorio",
        href: "/dashboard",
        icon: HomeIcon,
        roles: [...PERMISOS.dashboard],
      },
    ],
  },
  {
    titulo: "Académico",
    items: [
      {
        nombre: "Alumnos",
        href: "/alumnos",
        icon: UsersIcon,
        roles: [...PERMISOS.alumnos],
      },
      {
        nombre: "Notas",
        href: "/notas",
        icon: BookIcon,
        roles: [...PERMISOS.notas],
      },
      {
        nombre: "Asistencias",
        href: "/asistencias",
        icon: ClipboardIcon,
        roles: [...PERMISOS.asistencias],
      },
      {
        nombre: "Tareas",
        href: "/tareas",
        icon: FileTextIcon,
        roles: [...PERMISOS.tareas],
      },
      {
        nombre: "Materiales",
        href: "/materiales",
        icon: FolderIcon,
        roles: [...PERMISOS.materiales],
      },
      {
        nombre: "Matrículas",
        href: "/matriculas",
        icon: IdIcon,
        roles: [...PERMISOS.matriculas],
      },
    ],
  },
  {
    titulo: "Comunicación",
    items: [
      {
        nombre: "Mensajes",
        href: "/mensajes",
        icon: SendIcon,
        roles: [...PERMISOS.mensajes],
      },
      {
        nombre: "Reuniones",
        href: "/reuniones",
        icon: CalendarIcon,
        roles: [...PERMISOS.reuniones],
      },
      {
        nombre: "Justificaciones",
        href: "/justificaciones",
        icon: CheckCircleIcon,
        roles: [...PERMISOS.justificaciones],
      },
    ],
  },
  {
    titulo: "Administración",
    items: [
      {
        nombre: "Usuarios",
        href: "/usuarios",
        icon: ShieldIcon,
        roles: [...PERMISOS.usuarios],
      },
      {
        nombre: "Asignaciones Docentes",
        href: "/asignaciones-docentes",
        icon: FolderIcon,
        roles: [...PERMISOS.asignacionesDocentes],
      },
      {
        nombre: "Mi Horario",
        href: "/horario-docente",
        icon: ClockIcon,
        roles: [...PERMISOS.horarioDocente],
      },
    ],
  },
];

const NAV: NavItem[] = GRUPOS_NAV.flatMap((grupo) => grupo.items);

export function AppShell({
  children,
  titulo,
  subtitulo,
  acciones,
}: {
  children: React.ReactNode;
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [colapsado, setColapsado] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState<"mensajes" | "notificaciones" | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [justificaciones, setJustificaciones] = useState<JustificacionAusencia[]>([]);
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [cargandoPanel, setCargandoPanel] = useState(false);
  const refPanelMensajes = useRef<HTMLDivElement | null>(null);
  const refPanelNotificaciones = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    setSesion({
      username: localStorage.getItem("username") ?? "Usuario",
      rol: localStorage.getItem("rol") ?? "Sin rol",
    });
    const nombreGuardado = localStorage.getItem("nombreUsuario");
    if (nombreGuardado) {
      setNombreUsuario(nombreGuardado);
    } else {
      cargarNombreUsuario().then((nombre) => {
        if (nombre) setNombreUsuario(nombre);
      });
    }
    setAutorizado(true);
  }, [router]);

  // Cierra el sidebar móvil al cambiar de ruta
  useEffect(() => {
    setSidebarAbierto(false);
  }, [pathname]);

  // Carga los mensajes y notificaciones cuando se abre un panel
  useEffect(() => {
    if (panelAbierto === null) return;
    let vivo = true;
    const cargar = async () => {
      setCargandoPanel(true);
      try {
        const [ms, js, rs] = await Promise.all([
          rolPermitido("mensajes") ? listarMensajes() : Promise.resolve<Mensaje[]>([]),
          rolPermitido("justificaciones")
            ? listarJustificaciones()
            : Promise.resolve<JustificacionAusencia[]>([]),
          rolPermitido("reuniones") ? listarReuniones() : Promise.resolve<Reunion[]>([]),
        ]);
        if (!vivo) return;
        setMensajes(ms);
        setJustificaciones(js);
        setReuniones(rs);
      } catch {
        if (vivo) {
          setMensajes([]);
          setJustificaciones([]);
          setReuniones([]);
        }
      } finally {
        if (vivo) setCargandoPanel(false);
      }
    };
    void cargar();
    return () => {
      vivo = false;
    };
  }, [panelAbierto]);

  // Cierra los paneles al hacer click afuera
  useEffect(() => {
    if (panelAbierto === null) return;
    const alClick = (evento: MouseEvent) => {
      const objetivo = evento.target as Node;
      if (refPanelMensajes.current?.contains(objetivo)) return;
      if (refPanelNotificaciones.current?.contains(objetivo)) return;
      setPanelAbierto(null);
    };
    document.addEventListener("mousedown", alClick);
    return () => document.removeEventListener("mousedown", alClick);
  }, [panelAbierto]);

  const mensajesSinLeer = useMemo(
    () => mensajes.filter((m) => m.leido === false).length,
    [mensajes]
  );

  const pendientesJustificaciones = useMemo(
    () =>
      justificaciones
        .filter((j) => j.estado === "Pendiente")
        .slice(0, 6)
        .map((j) => ({
          id: j.id,
          titulo: "Justificación pendiente",
          detalle: j.motivo ?? "Sin motivo registrado",
          href: "/justificaciones",
        })),
    [justificaciones]
  );

  const notificaciones = useMemo(
    () => [
      ...pendientesJustificaciones,
      ...reuniones.slice(0, 6).map((r) => ({
        id: r.id,
        titulo: "Reunión",
        detalle: r.titulo ?? "Reunión programada",
        href: "/reuniones",
      })),
    ],
    [pendientesJustificaciones, reuniones]
  );

  const notificacionesSinLeer = pendientesJustificaciones.length;

  const menu = useMemo(() => {
    if (!sesion) return GRUPOS_NAV;
    return GRUPOS_NAV.map((grupo) => ({
      ...grupo,
      items: grupo.items.filter((item) => item.roles.includes(sesion.rol)),
    })).filter((grupo) => grupo.items.length > 0);
  }, [sesion]);

  const rutaActual = useMemo(
    () =>
      NAV.find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`)
      ),
    [pathname]
  );

  const accesoPermitido = useMemo(() => {
    if (!sesion) return false;
    if (!rutaActual) return true;
    return rutaActual.roles.includes(sesion.rol);
  }, [sesion, rutaActual]);

  // Si el rol no tiene permiso para la ruta, vuelve al escritorio
  useEffect(() => {
    if (sesion && rutaActual && !accesoPermitido) {
      router.replace("/dashboard");
    }
  }, [sesion, rutaActual, accesoPermitido, router]);

  const salir = () => {
    cerrarSesion();
    router.replace("/login");
  };

  if (!autorizado || !sesion || (rutaActual && !accesoPermitido)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-sm text-slate-400">Cargando tu panel…</p>
        </div>
      </main>
    );
  }

  const activo = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-slate-100 relative z-10">
      {/* Fondo decorativo */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      {/* Overlay móvil */}
      {sidebarAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setSidebarAbierto(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          backgroundImage:
            "linear-gradient(180deg, #020617 0%, #0a1330 42%, #0e2350 74%, #0b2a5e 100%)",
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-white/10 text-slate-300 shadow-2xl transition-all duration-300",
          colapsado ? "lg:w-[5.5rem]" : "lg:w-72",
          sidebarAbierto ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Azul difuminado que baja hasta las olas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(120%_100%_at_50%_120%,rgba(37,99,235,0.35)_0%,rgba(37,99,235,0.14)_45%,rgba(37,99,235,0)_75%)]"
        />

        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-lg shadow-slate-950/40">
              <EscudoNicaragua className="h-full w-full" />
            </span>
            {!colapsado && (
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-bold text-white">
                  Otto de la Rocha
                </span>
                <span className="block truncate text-[11px] text-slate-400">
                  Gestión escolar
                </span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSidebarAbierto(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative z-10 flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {menu.map((grupo) => (
            <div key={grupo.titulo} className="space-y-1">
              {!colapsado && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {grupo.titulo}
                </p>
              )}
              {grupo.items.map((item) => {
                const Icon = item.icon;
                const activoItem = activo(item.href);
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    title={colapsado ? item.nombre : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      activoItem
                        ? "bg-gradient-to-r from-indigo-500/90 to-fuchsia-500/80 text-white shadow-lg shadow-indigo-900/40"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
                      colapsado && "justify-center px-0"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!colapsado && (
                      <>
                        <span className="flex-1 truncate text-left">
                          {item.nombre}
                        </span>
                        {item.badge && (
                          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                            {item.badge}
                          </span>
                        )}
                        {activoItem && (
                          <ArrowRightIcon className="h-4 w-4 opacity-80" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="relative z-10 border-t border-white/10 p-3 pb-20">
          <button
            type="button"
            onClick={salir}
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tracking-wide text-slate-200 transition hover:bg-red-500/15 hover:text-red-200",
              colapsado && "px-0"
            )}
            title="Cerrar sesión"
          >
            <LogOutIcon className="h-5 w-5 shrink-0" />
            {!colapsado && "Cerrar sesión"}
          </button>
        </div>

        {/* Olas decorativas al pie de la barra lateral */}
        <WavesBackground className="waves-sidebar" />
      </aside>

      {/* Contenido */}
      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          colapsado ? "lg:pl-[5.5rem]" : "lg:pl-72"
        )}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => setSidebarAbierto(true)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 lg:hidden"
              aria-label="Abrir menú"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setColapsado((v) => !v)}
              className="hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 lg:inline-flex"
              aria-label={colapsado ? "Expandir menú" : "Colapsar menú"}
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {titulo}
              </h1>
              {subtitulo && (
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {subtitulo}
                </p>
              )}
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              {nombreUsuario && (
                <span className="max-w-[17rem] truncate bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-600 bg-clip-text text-sm font-semibold leading-tight tracking-tight text-transparent">
                  {nombreUsuario}
                </span>
              )}
              <div className="relative" ref={refPanelMensajes}>
                <button
                  type="button"
                  onClick={() =>
                    setPanelAbierto((panel) =>
                      panel === "mensajes" ? null : "mensajes"
                    )
                  }
                  className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-900"
                  aria-label="Mensajes"
                >
                  <MessageIcon className="h-5 w-5" />
                  {mensajesSinLeer > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white">
                      {mensajesSinLeer > 9 ? "9+" : mensajesSinLeer}
                    </span>
                  )}
                </button>
                {panelAbierto === "mensajes" && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">
                        Mensajes recibidos
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPanelAbierto(null);
                          router.push("/mensajes");
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Ver todos
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {cargandoPanel ? (
                        <p className="px-4 py-6 text-center text-xs text-slate-400">
                          Cargando mensajes…
                        </p>
                      ) : mensajes.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-slate-400">
                          No recibiste mensajes todavía.
                        </p>
                      ) : (
                        mensajes.slice(0, 8).map((mensaje) => (
                          <button
                            key={mensaje.id}
                            type="button"
                            onClick={() => {
                              setPanelAbierto(null);
                              router.push("/mensajes");
                            }}
                            className="block w-full border-b border-slate-50 px-4 py-2.5 text-left transition hover:bg-slate-50 last:border-0"
                          >
                            <p className="truncate text-xs text-slate-700">
                              {mensaje.conversacionId
                                ? `Conversación #${mensaje.conversacionId}`
                                : "Mensaje"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {mensaje.contenido}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {mensaje.leido === false ? "No leído" : "Leído"} ·{" "}
                              {mensaje.fechaEnvio
                                ? new Date(mensaje.fechaEnvio).toLocaleString()
                                : ""}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={refPanelNotificaciones}>
                <button
                  type="button"
                  onClick={() =>
                    setPanelAbierto((panel) =>
                      panel === "notificaciones" ? null : "notificaciones"
                    )
                  }
                  className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-900"
                  aria-label="Notificaciones"
                >
                  <BellIcon className="h-5 w-5" />
                  {notificacionesSinLeer > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {notificacionesSinLeer > 9 ? "9+" : notificacionesSinLeer}
                    </span>
                  )}
                </button>
                {panelAbierto === "notificaciones" && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-slate-900">
                        Notificaciones
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPanelAbierto(null);
                          router.push("/justificaciones");
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Ver todas
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {cargandoPanel ? (
                        <p className="px-4 py-6 text-center text-xs text-slate-400">
                          Cargando notificaciones…
                        </p>
                      ) : notificaciones.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-slate-400">
                          No tenés notificaciones pendientes.
                        </p>
                      ) : (
                        notificaciones.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setPanelAbierto(null);
                              router.push(item.href);
                            }}
                            className="flex w-full items-start gap-2 border-b border-slate-50 px-4 py-2.5 text-left transition hover:bg-slate-50 last:border-0"
                          >
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                            <span className="min-w-0">
                              <span className="block truncate text-xs font-semibold text-slate-800">
                                {item.titulo}
                              </span>
                              <span className="block truncate text-xs text-slate-500">
                                {item.detalle}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
                <UserCircleIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            {acciones && (
              <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
                {acciones}
              </div>
            )}
            {children}
          </div>
        </main>

        <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur-md px-4 py-4 text-center text-xs text-slate-600 sm:px-6 relative z-10">
          © {new Date().getFullYear()} Colegio Otto de la Rocha · Sistema de
          Gestión Escolar
        </footer>
      </div>
    </div>
  );
}
