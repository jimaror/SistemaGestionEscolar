"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { Cargando, ErrorEstado, Vacio } from "@/components/data-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  crearMensaje,
  listarConversaciones,
  listarMaestros,
  listarMensajes,
  listarParticipantes,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  Conversacion,
  ConversacionParticipante,
  MaestroResumen,
  Mensaje,
} from "@/lib/types";
import { formatearFechaHora, normalizar } from "@/lib/format";
import {
  MessageIcon,
  RefreshIcon,
  SearchIcon,
  SendIcon,
  UsersIcon,
} from "@/components/icons";

function momento(valor: string | null | undefined): number {
  if (!valor) return 0;
  const tiempo = new Date(valor).getTime();
  return Number.isNaN(tiempo) ? 0 : tiempo;
}

export default function MensajesPage() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [participantes, setParticipantes] = useState<ConversacionParticipante[]>([]);
  const [maestros, setMaestros] = useState<MaestroResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const hiloRef = useRef<HTMLDivElement | null>(null);

  const cargar = useCallback(async () => {
    if (!rolPermitido("mensajes")) return;
    setCargando(true);
    setError(null);
    setErrorEnvio(null);
    try {
      const [convs, msgs, parts, maes] = await Promise.all([
        listarConversaciones(),
        listarMensajes(),
        listarParticipantes(),
        listarMaestros(),
      ]);
      const ordenadas = [...convs].sort((a, b) => {
        const ultimoA = Math.max(
          ...msgs
            .filter((m) => m.conversacionId === a.id)
            .map((m) => momento(m.fechaEnvio)),
          momento(a.fechaCreacion)
        );
        const ultimoB = Math.max(
          ...msgs
            .filter((m) => m.conversacionId === b.id)
            .map((m) => momento(m.fechaEnvio)),
          momento(b.fechaCreacion)
        );
        return ultimoB - ultimoA;
      });
      setConversaciones(ordenadas);
      setMensajes(msgs);
      setParticipantes(parts);
      setMaestros(maes);
      setSeleccionada((actual) =>
        actual && ordenadas.some((c) => c.id === actual)
          ? actual
          : ordenadas[0]?.id ?? null
      );
      const idGuardado = Number(localStorage.getItem("usuarioId"));
      setUsuarioId(Number.isFinite(idGuardado) && idGuardado > 0 ? idGuardado : null);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const mensajesPorConversacion = useMemo(() => {
    const mapa = new Map<number, Mensaje[]>();
    mensajes.forEach((mensaje) => {
      const lista = mapa.get(mensaje.conversacionId) ?? [];
      lista.push(mensaje);
      mapa.set(mensaje.conversacionId, lista);
    });
    mapa.forEach((lista) =>
      lista.sort((a, b) => momento(a.fechaEnvio) - momento(b.fechaEnvio))
    );
    return mapa;
  }, [mensajes]);

  const participantesPorConversacion = useMemo(() => {
    const mapa = new Map<number, ConversacionParticipante[]>();
    participantes.forEach((participante) => {
      const lista = mapa.get(participante.conversacionId) ?? [];
      lista.push(participante);
      mapa.set(participante.conversacionId, lista);
    });
    return mapa;
  }, [participantes]);

  const conversacionActual = useMemo(
    () => conversaciones.find((c) => c.id === seleccionada) ?? null,
    [conversaciones, seleccionada]
  );

  const hilo = useMemo(
    () => (seleccionada ? mensajesPorConversacion.get(seleccionada) ?? [] : []),
    [mensajesPorConversacion, seleccionada]
  );

  const destinatarioActual = useMemo(() => {
    if (!seleccionada) return null;
    const participantesConv = participantesPorConversacion.get(seleccionada) ?? [];
    const destinatario =
      participantesConv.find((p) => p.usuarioId !== usuarioId) ??
      participantesConv.find((p) => p.usuarioId != null) ??
      participantesConv[0] ??
      null;
    if (!destinatario) return null;
    const maestro = maestros.find((m) => m.idUsuario === destinatario.usuarioId);
    const nombreMaestro = maestro ? `${maestro.nombre} ${maestro.apellido}`.trim() : null;
    const nombreParticipante =
      [destinatario.usuarioNombre, destinatario.usuarioApellidos]
        .filter(Boolean)
        .join(" ")
        .trim() || nombreMaestro;
    return { ...destinatario, nombre: nombreParticipante };
  }, [participantesPorConversacion, seleccionada, usuarioId, maestros]);

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    if (!q) return conversaciones;
    return conversaciones.filter((conversacion) => {
      const mensajesConv = mensajesPorConversacion.get(conversacion.id) ?? [];
      const textoConv = mensajesConv.map((m) => m.contenido).join(" ");
      return normalizar(`${conversacion.titulo} ${conversacion.tipo ?? ""} ${textoConv}`).includes(q);
    });
  }, [conversaciones, mensajesPorConversacion, busqueda]);

  const noLeidos = useMemo(
    () =>
      mensajes.filter(
        (mensaje) => mensaje.leido === false && mensaje.remitenteId !== usuarioId
      ).length,
    [mensajes, usuarioId]
  );

  const noLeidosConversacion = useCallback(
    (conversacionId: number) =>
      (mensajesPorConversacion.get(conversacionId) ?? []).filter(
        (mensaje) => mensaje.leido === false && mensaje.remitenteId !== usuarioId
      ).length,
    [mensajesPorConversacion, usuarioId]
  );

  useEffect(() => {
    if (hiloRef.current) {
      hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
    }
  }, [hilo, seleccionada]);

  const enviar = async () => {
    const contenido = texto.trim();
    if (!contenido || !seleccionada || enviando) return;
    setEnviando(true);
    setErrorEnvio(null);
    try {
      const destinatarioParticipante =
        destinatarioActual ??
        (participantesPorConversacion.get(seleccionada) ?? [])[0] ??
        null;
      const destinatarioUsuarioId =
        destinatarioParticipante?.usuarioId ?? usuarioId ?? 0;
      const nuevo = await crearMensaje({
        conversacionId: seleccionada,
        destinatarioUsuarioId,
        contenido,
      });
      setMensajes((prev) => [...prev, nuevo]);
      setTexto("");
    } catch (err) {
      setErrorEnvio(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const etiquetaRemitente = (mensaje: Mensaje) => {
    if (mensaje.remitenteId === usuarioId) return "Tú";
    const participantesConv = participantesPorConversacion.get(
      mensaje.conversacionId
    ) ?? [];
    const participante = participantesConv.find(
      (p) => p.usuarioId === mensaje.remitenteId
    );
    return participante?.rolEnConversacion
      ? `${participante.rolEnConversacion}`
      : `Participante #${mensaje.remitenteId ?? "—"}`;
  };

  return (
    <AppShell
      titulo="Mensajes"
      subtitulo="Bandeja de conversaciones y mensajería interna del colegio"
      acciones={
        <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
          <RefreshIcon className="h-4 w-4" />
          Actualizar
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Conversaciones"
            valor={conversaciones.length}
            detalle="Hilos visibles para tu cuenta"
            icon={MessageIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Mensajes"
            valor={mensajes.length}
            detalle="Mensajes en tus conversaciones"
            icon={SendIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Sin leer"
            valor={noLeidos}
            detalle="Pendientes de revisar"
            icon={MessageIcon}
            color="from-amber-500 to-orange-500"
          />
          <StatCard
            titulo="Participantes"
            valor={participantes.length}
            detalle="Miembros en tus conversaciones"
            icon={UsersIcon}
            color="from-emerald-500 to-teal-500"
          />
        </section>

        {cargando ? (
          <Cargando texto="Cargando conversaciones…" />
        ) : error ? (
          <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
        ) : conversaciones.length === 0 ? (
          <Vacio
            titulo="Sin conversaciones"
            descripcion="Todavía no participás en ninguna conversación del colegio."
          />
        ) : (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
            {/* Bandeja */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar conversación…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="max-h-[420px] flex-1 overflow-y-auto lg:max-h-[560px]">
                {filtradas.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">
                    No hay conversaciones que coincidan con la búsqueda.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filtradas.map((conversacion) => {
                      const mensajesConv =
                        mensajesPorConversacion.get(conversacion.id) ?? [];
                      const ultimo = mensajesConv[mensajesConv.length - 1];
                      const pendientes = noLeidosConversacion(conversacion.id);
                      const activa = conversacion.id === seleccionada;
                      const miembros =
                        participantesPorConversacion.get(conversacion.id)?.length ?? 0;
                      return (
                        <li key={conversacion.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSeleccionada(conversacion.id);
                              setErrorEnvio(null);
                            }}
                            className={`flex w-full items-start gap-3 p-3 text-left transition ${
                              activa
                                ? "bg-indigo-50/80"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm">
                              <MessageIcon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {conversacion.titulo}
                                </p>
                                {pendientes > 0 && (
                                  <span className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 px-1.5 text-[10px] font-bold text-white">
                                    {pendientes}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                {ultimo
                                  ? `${ultimo.remitenteId === usuarioId ? "Tú: " : ""}${ultimo.contenido}`
                                  : "Sin mensajes todavía"}
                              </p>
                              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{conversacion.tipo ?? "Conversación"}</span>
                                <span>·</span>
                                <span>{miembros} participantes</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Hilo */}
            <div className="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
              {conversacionActual ? (
                <>
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
                      <MessageIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold text-slate-900">
                        {conversacionActual.titulo}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Creada el {formatearFechaHora(conversacionActual.fechaCreacion)}
                      </p>
                      {destinatarioActual && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Dirigido a:{" "}
                          <span className="font-semibold text-slate-700">
                            {destinatarioActual.nombre ??
                              destinatarioActual.rolEnConversacion ??
                              `Participante #${destinatarioActual.usuarioId ?? "—"}`}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">
                        {conversacionActual.tipo ?? "Conversación"}
                      </Badge>
                      <Badge variant="info">
                        {hilo.length} {hilo.length === 1 ? "mensaje" : "mensajes"}
                      </Badge>
                    </div>
                  </div>

                  <div
                    ref={hiloRef}
                    className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4"
                  >
                    {hilo.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-slate-500">
                          Esta conversación todavía no tiene mensajes. Escribí el primero.
                        </p>
                      </div>
                    ) : (
                      hilo.map((mensaje) => {
                        const propio = mensaje.remitenteId === usuarioId;
                        return (
                          <div
                            key={mensaje.id}
                            className={`flex ${propio ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                propio
                                  ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white"
                                  : "border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <p
                                className={`text-[11px] font-semibold ${
                                  propio ? "text-indigo-100" : "text-slate-500"
                                }`}
                              >
                                {etiquetaRemitente(mensaje)}
                              </p>
                              <p className="mt-1 whitespace-pre-wrap break-words">
                                {mensaje.contenido}
                              </p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  propio ? "text-indigo-200" : "text-slate-400"
                                }`}
                              >
                                {formatearFechaHora(mensaje.fechaEnvio)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-slate-100 p-3">
                    {errorEnvio && (
                      <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                        {errorEnvio}
                      </p>
                    )}
                    <div className="flex items-end gap-2">
                      <Textarea
                        placeholder="Escribí un mensaje…"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            void enviar();
                          }
                        }}
                        className="min-h-[52px]"
                        rows={2}
                      />
                      <Button
                        variant="gradient"
                        size="icon"
                        onClick={() => void enviar()}
                        disabled={!texto.trim() || enviando}
                        aria-label="Enviar mensaje"
                        title="Enviar mensaje"
                      >
                        <SendIcon className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Enter envía · Shift + Enter agrega una línea
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-6">
                  <p className="text-sm text-slate-500">
                    Seleccioná una conversación para ver sus mensajes.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
