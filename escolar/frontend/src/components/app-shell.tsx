"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cerrarSesion, obtenerToken } from "@/lib/api";
import { PERMISOS } from "@/lib/permisos";
import { Badge } from "@/components/ui/badge";
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
    ],
  },
];

const NAV: NavItem[] = GRUPOS_NAV.flatMap((grupo) => grupo.items);

function primerNombre(username: string) {
  const base = username.split(/[._\s-]/)[0] ?? username;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

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
  const [autorizado, setAutorizado] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    setSesion({
      username: localStorage.getItem("username") ?? "Usuario",
      rol: localStorage.getItem("rol") ?? "Sin rol",
    });
    setAutorizado(true);
  }, [router]);

  // Cierra el sidebar móvil al cambiar de ruta
  useEffect(() => {
    setSidebarAbierto(false);
  }, [pathname]);

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

      {/* Olas azul marino */}
      <WavesBackground />

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
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-slate-300 shadow-2xl transition-all duration-300",
          colapsado ? "lg:w-[5.5rem]" : "lg:w-72",
          sidebarAbierto ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"
        )}
      >
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

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
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

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={salir}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/15 hover:text-red-200",
              colapsado && "justify-center px-0"
            )}
            title="Cerrar sesión"
          >
            <LogOutIcon className="h-5 w-5 shrink-0" />
            {!colapsado && "Cerrar sesión"}
          </button>
        </div>
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

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-900"
                aria-label="Mensajes"
              >
                <MessageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-900"
                aria-label="Notificaciones"
              >
                <BellIcon className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-fuchsia-500 ring-2 ring-white" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight text-slate-900">
                  {primerNombre(sesion.username)}
                </p>
                <p className="text-[11px] text-slate-500">{sesion.rol}</p>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
                <UserCircleIcon className="h-6 w-6" />
              </div>
              <Badge variant="brand" className="hidden md:inline-flex">
                {sesion.rol}
              </Badge>
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

        <footer className="border-t border-slate-200 bg-white/60 px-4 py-4 text-center text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} Colegio Otto de la Rocha · Sistema de
          Gestión Escolar
        </footer>
      </div>
    </div>
  );
}
