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
  actualizarGrado,
  crearGrado,
  eliminarGrado,
  listarGrados,
  mensajeDeError,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type { GradoResumen } from "@/lib/types";
import { normalizar } from "@/lib/format";
import {
  BookIcon,
  EditIcon,
  FolderIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";

interface FilaGrado {
  id: number;
  nombre: string;
  nivel: string;
  orden: number;
}

export default function GradosPage() {
  const [grados, setGrados] = useState<FilaGrado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [gradoEditando, setGradoEditando] = useState<FilaGrado | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    nivel: "",
    orden: 1,
  });

  const cargar = useCallback(async () => {
    if (!rolPermitido("grados")) return;
    setCargando(true);
    setError(null);
    try {
      const g = await listarGrados();
      setGrados(g.map((grado) => ({
        id: grado.id,
        nombre: grado.nombre,
        nivel: grado.nivel,
        orden: grado.orden ?? 0,
      })));
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

  const esDirector = rol === "Director";

  const resetForm = () => {
    setForm({ nombre: "", nivel: "", orden: 1 });
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!esDirector) return;
    setModoCreacion(true);
    setGradoEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (id: number) => {
    if (!esDirector) return;
    const grado = grados.find((g) => g.id === id);
    if (!grado) return;
    setModoCreacion(false);
    setGradoEditando(grado);
    setForm({ nombre: grado.nombre, nivel: grado.nivel, orden: grado.orden });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};
    if (!form.nombre.trim()) errores.nombre = "El nombre del grado es obligatorio.";
    if (!form.nivel.trim()) errores.nivel = "El nivel es obligatorio.";
    if (form.orden < 1) errores.orden = "El orden es obligatorio.";
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }
    setGuardando(true);
    try {
      if (modoCreacion) {
        await crearGrado({ nombre: form.nombre.trim(), nivel: form.nivel.trim(), orden: form.orden });
      } else if (gradoEditando) {
        await actualizarGrado(gradoEditando.id, { nombre: form.nombre.trim(), nivel: form.nivel.trim(), orden: form.orden });
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
      await eliminarGrado(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  const gradosOrdenados = useMemo(() => {
    return [...grados].sort((a, b) => a.orden - b.orden);
  }, [grados]);

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda);
    return gradosOrdenados.filter((fila) => {
      const texto = normalizar(`${fila.nombre} ${fila.nivel}`);
      return (!q || texto.includes(q));
    });
  }, [gradosOrdenados, busqueda]);

  const resumen = useMemo(() => ({ total: filtrados.length }), [filtrados]);

  return (
    <AppShell
      titulo="Grados"
      subtitulo="Niveles académicos del colegio"
      acciones={
        <>
          {esDirector && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" /> Nuevo grado
            </Button>
          )}
          <Button variant="outline" onClick={() => void cargar()}>
            <RefreshIcon className="h-4 w-4" /> Actualizar
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Grados"
            valor={resumen.total}
            detalle="Niveles académicos registrados"
            icon={FolderIcon}
            color="from-indigo-500 to-blue-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar grado o nivel..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {cargando ? (
            <div className="p-4"><Cargando texto="Cargando grados..." /></div>
          ) : error ? (
            <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
          ) : filtrados.length === 0 ? (
            <Vacio titulo="Sin grados" descripcion="No hay grados que coincidan con los filtros seleccionados." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtrados.map((fila) => (
                <article
                  key={fila.id}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-bg ${fila.orden <= 3 ? "from-emerald-500 to-teal-500" : fila.orden <= 6 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500"} text-white shadow-md`}>
                      <BookIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="mt-2 font-semibold leading-tight text-slate-900">{fila.nombre}</h3>
                      <p className="mt-1 text-xs text-slate-500">Nivel: {fila.nivel} · Orden: #{fila.orden}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <Badge variant="brand">{fila.nombre}</Badge>
                      <span>{fila.nivel}</span>
                    </div>
                    {esDirector && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => abrirEditar(fila.id)}>
                          <EditIcon className="h-3 w-3" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => solicitarEliminar(fila.id)} className="text-red-500 hover:bg-red-50">
                          <TrashIcon className="h-3 w-3" /> Eliminar
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {!cargando && !error && (
            <p className="mt-4 text-xs text-slate-500">
              Mostrando {filtrados.length} de {gradosOrdenados.length} grados
            </p>
          )}
        </section>
      </div>

      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Nuevo grado" : "Editar grado"}
        descripcion={modoCreacion ? "Los grados se usan para organizar las secciones y cursos del colegio." : "Los cambios se reflejan inmediatamente en el sistema."}
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void guardar(); }}>
          <div className="space-y-1.5">
            <Label htmlFor="gradoNombre">Nombre del grado</Label>
            <Input id="gradoNombre" placeholder="Ej: Primero Basico" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            {erroresForm.nombre && <p className="text-xs text-red-600">{erroresForm.nombre}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gradoNivel">Nivel</Label>
              <Input id="gradoNivel" placeholder="Ej: 1, 2, 3, etc." value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })} />
              {erroresForm.nivel && <p className="text-xs text-red-600">{erroresForm.nivel}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gradoOrden">Orden</Label>
              <Select id="gradoOrden" value={String(form.orden)} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </Select>
              {erroresForm.orden && <p className="text-xs text-red-600">{erroresForm.orden}</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="gradient" disabled={guardando}>
              {guardando ? "Guardando..." : modoCreacion ? "Crear grado" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar grado"
        descripcion="Esta accion no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Seguro que queres eliminar este grado? Los estudiantes y secciones asociadas deberan ser reasignados a otro grado.</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmarEliminar(false)} disabled={eliminandoId !== null}>Cancelar</Button>
            <Button variant="destructive" onClick={() => void eliminar()} disabled={eliminandoId !== null}>
              <TrashIcon className="h-4 w-4" />{eliminandoId !== null ? "Eliminando..." : "Si, eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}