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
  actualizarMaterial,
  crearMaterial,
  eliminarMaterial,
  indexarPor,
  listarAsignaciones,
  listarAsignaturas,
  listarMateriales,
  listarSecciones,
  mensajeDeError,
  subirArchivo,
} from "@/lib/servicios";
import { rolPermitido } from "@/lib/permisos";
import type {
  AsignacionDocente,
  Asignatura,
  Material,
  Seccion,
} from "@/lib/types";
import { formatearFecha, normalizar } from "@/lib/format";
import {
  BookIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  FolderIcon,
  LinkIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";

interface FilaMaterial {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  materia: string;
  seccion: string;
  fechaPublicacion: string;
  fechaTexto: string;
  visible: boolean;
  rutaArchivo: string | null;
}

const paletas = [
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

function colorPorId(id: number) {
  return paletas[id % paletas.length];
}

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDocente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [rol, setRol] = useState("");

  // Estado del formulario CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoCreacion, setModoCreacion] = useState(true);
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    asignacionDocenteId: "",
    titulo: "",
    descripcion: "",
    tipo: "Documento",
    rutaArchivo: "",
    visible: true,
  });
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);

  const cargar = useCallback(async () => {
    if (!rolPermitido("materiales")) return;
    setCargando(true);
    setError(null);
    try {
      const [m, a, asig, s] = await Promise.all([
        listarMateriales(),
        listarAsignaciones(),
        listarAsignaturas(),
        listarSecciones(),
      ]);
      setMateriales(m);
      setAsignaciones(a);
      setAsignaturas(asig);
      setSecciones(s);
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

  const esGestor = rol === "Director" || rol === "Maestro";

  // Opciones para el select de asignación del formulario
  const opcionesAsignacion = useMemo(() => {
    const asignaturasPorId = indexarPor(asignaturas);
    const seccionesPorId = indexarPor(secciones);
    return asignaciones.map((a) => {
      const asignatura = asignaturasPorId.get(a.asignaturaId);
      const seccion = seccionesPorId.get(a.seccionId);
      return {
        id: a.id,
        etiqueta: `${asignatura?.nombre ?? "Asignatura"} · ${seccion ? `${seccion.nombre} (${seccion.turno})` : `Sección #${a.seccionId}`}`,
      };
    });
  }, [asignaciones, asignaturas, secciones]);

  const resetForm = () => {
    setForm({
      asignacionDocenteId: "",
      titulo: "",
      descripcion: "",
      tipo: "Documento",
      rutaArchivo: "",
      visible: true,
    });
    setArchivoSeleccionado(null);
    setErroresForm({});
  };

  const abrirCrear = () => {
    if (!esGestor) return;
    setModoCreacion(true);
    setMaterialEditando(null);
    resetForm();
    setModalAbierto(true);
  };

  const abrirEditar = (id: number) => {
    if (!esGestor) return;
    const material = materiales.find((m) => m.id === id);
    if (!material) return;
    setModoCreacion(false);
    setMaterialEditando(material);
    setForm({
      asignacionDocenteId: "",
      titulo: material.titulo,
      descripcion: material.descripcion ?? "",
      tipo: material.tipo ?? "Documento",
      rutaArchivo: material.rutaArchivo ?? "",
      visible: material.visible !== false,
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const guardar = async () => {
    setErroresForm({});
    const errores: Record<string, string> = {};

    if (modoCreacion && !form.asignacionDocenteId) {
      errores.asignacionDocenteId = "Seleccioná la materia y sección.";
    }
    if (!form.titulo.trim()) {
      errores.titulo = "El título es obligatorio.";
    }
    if (!form.tipo.trim()) {
      errores.tipo = "El tipo es obligatorio.";
    }
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setGuardando(true);
    try {
      let rutaArchivo = form.rutaArchivo || null;
      // Si hay un archivo seleccionado, subirlo primero
      if (archivoSeleccionado) {
        setSubiendo(true);
        rutaArchivo = await subirArchivo(archivoSeleccionado);
        setSubiendo(false);
      }
      if (modoCreacion) {
        await crearMaterial({
          asignacionDocenteId: Number(form.asignacionDocenteId),
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || null,
          tipo: form.tipo.trim(),
          rutaArchivo,
          visible: form.visible,
        });
      } else if (materialEditando) {
        await actualizarMaterial(materialEditando.id, {
          titulo: form.titulo.trim(),
          descripcion: form.descripcion || null,
          tipo: form.tipo.trim(),
          rutaArchivo,
          visible: form.visible,
        });
      }
      setModalAbierto(false);
      setArchivoSeleccionado(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
      setSubiendo(false);
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
      await eliminarMaterial(idAEliminar);
      setConfirmarEliminar(false);
      setIdAEliminar(null);
      setEliminandoId(null);
      void cargar();
    } catch (err) {
      setError(mensajeDeError(err));
      setEliminandoId(null);
    }
  };

  const filas = useMemo<FilaMaterial[]>(() => {
    const asignacionesPorId = indexarPor(asignaciones);
    const asignaturasPorId = indexarPor(asignaturas);
    const seccionesPorId = indexarPor(secciones);

    return materiales
      .map((material) => {
        const asignacion = asignacionesPorId.get(material.asignacionDocenteId);
        const asignatura = asignacion
          ? asignaturasPorId.get(asignacion.asignaturaId)
          : undefined;
        const seccion = asignacion
          ? seccionesPorId.get(asignacion.seccionId)
          : undefined;
        return {
          id: material.id,
          titulo: material.titulo,
          descripcion: material.descripcion ?? "Sin descripción",
          tipo: material.tipo ?? "Material",
          materia: asignatura?.nombre ?? "Sin materia",
          seccion: seccion ? `${seccion.nombre} · ${seccion.turno}` : "Sin sección",
          fechaPublicacion: material.fechaPublicacion ?? "",
          fechaTexto: formatearFecha(material.fechaPublicacion),
          visible: material.visible !== false,
          rutaArchivo: material.rutaArchivo,
        };
      })
      .filter((fila) => esGestor || fila.visible)
      .sort((a, b) =>
        a.fechaPublicacion < b.fechaPublicacion
          ? 1
          : a.fechaPublicacion > b.fechaPublicacion
            ? -1
            : 0
      );
  }, [materiales, asignaciones, asignaturas, secciones, esGestor]);

  const tipos = useMemo(
    () => Array.from(new Set(filas.map((f) => f.tipo))),
    [filas]
  );

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda);
    return filas.filter((fila) => {
      const texto = normalizar(
        `${fila.titulo} ${fila.descripcion} ${fila.materia} ${fila.seccion} ${fila.tipo}`
      );
      return (
        (!q || texto.includes(q)) &&
        (tipoFiltro === "todos" || fila.tipo === tipoFiltro)
      );
    });
  }, [filas, busqueda, tipoFiltro]);

  const resumen = useMemo(() => {
    const visibles = filas.filter((f) => f.visible).length;
    const materias = new Set(filas.map((f) => f.materia)).size;
    const conArchivo = filas.filter((f) => !!f.rutaArchivo).length;
    return { total: filas.length, visibles, materias, conArchivo };
  }, [filas]);

  return (
    <AppShell
      titulo="Materiales"
      subtitulo="Recursos didácticos publicados por asignatura y sección"
      acciones={
        <>
          <Button variant="outline" onClick={() => void cargar()} disabled={cargando}>
            <RefreshIcon className="h-4 w-4" />
            Actualizar
          </Button>
          {esGestor && (
            <Button variant="gradient" onClick={abrirCrear}>
              <PlusIcon className="h-4 w-4" />
              Nuevo material
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            titulo="Materiales"
            valor={resumen.total}
            detalle="Recursos publicados"
            icon={FolderIcon}
            color="from-indigo-500 to-blue-500"
          />
          <StatCard
            titulo="Visibles"
            valor={resumen.visibles}
            detalle="Disponibles para estudiantes"
            icon={CheckCircleIcon}
            color="from-emerald-500 to-teal-500"
          />
          <StatCard
            titulo="Con archivo"
            valor={resumen.conArchivo}
            detalle="Recursos descargables"
            icon={LinkIcon}
            color="from-fuchsia-500 to-purple-500"
          />
          <StatCard
            titulo="Materias"
            valor={resumen.materias}
            detalle="Asignaturas con material"
            icon={BookIcon}
            color="from-amber-500 to-orange-500"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar material, materia o tipo…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-48"
              aria-label="Filtrar por tipo"
            >
              <option value="todos">Todos los tipos</option>
              {tipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-4">
            {cargando ? (
              <Cargando texto="Cargando materiales…" />
            ) : error ? (
              <ErrorEstado mensaje={error} onReintentar={() => void cargar()} />
            ) : filtradas.length === 0 ? (
              <Vacio
                titulo="Sin materiales"
                descripcion="No hay recursos que coincidan con los filtros seleccionados."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtradas.map((fila) => (
                  <article
                    key={fila.id}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colorPorId(
                          fila.id
                        )} text-white shadow-md`}
                      >
                        <FolderIcon className="h-5 w-5" />
                      </span>
                      <Badge variant={fila.visible ? "success" : "default"}>
                        {fila.visible ? "Visible" : "Oculto"}
                      </Badge>
                    </div>

                    <h3 className="mt-4 font-semibold leading-tight text-slate-900">
                      {fila.titulo}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {fila.descripcion}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="brand">{fila.materia}</Badge>
                      <Badge variant="info">{fila.seccion}</Badge>
                      <Badge variant="warning">{fila.tipo}</Badge>
                    </div>

                    {esGestor && (
                      <div className="mt-3 flex items-center gap-1">
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
                          disabled={rol !== "Director"}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                          Eliminar
                        </Button>
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {fila.fechaTexto}
                      </span>
                      {fila.rutaArchivo ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            const url = fila.rutaArchivo!;
                            if (/^https?:/i.test(url)) {
                              // URL externa - abrir directamente
                              window.open(url, "_blank", "noopener,noreferrer");
                            } else {
                              // URL relativa del backend (ej: /api/archivos/uuid.pdf)
                              // Se abre contra el frontend: el rewrite de
                              // next.config.ts lo reenvia al backend.
                              const backendUrl = url.startsWith("/")
                                ? url
                                : `/${url}`;
                              window.open(backendUrl, "_blank", "noopener,noreferrer");
                            }
                          }}
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          <span className="sr-only">Abrir recurso</span>
                          Abrir recurso
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Sin archivo</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {!cargando && !error && (
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              Mostrando {filtradas.length} de {filas.length} materiales
            </p>
          )}
        </section>
      </div>

      {/* Modal de crear/editar material */}
      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={modoCreacion ? "Publicar nuevo material" : "Editar material"}
        descripcion={
          modoCreacion
            ? "Los estudiantes de la sección verán el recurso de inmediato."
            : "La materia y la sección no se pueden cambiar en un material publicado."
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
            <div className="space-y-1.5">
              <Label htmlFor="asignacionMaterial">Materia y sección</Label>
              <Select
                id="asignacionMaterial"
                value={form.asignacionDocenteId}
                onChange={(e) =>
                  setForm({ ...form, asignacionDocenteId: e.target.value })
                }
              >
                <option value="">Seleccioná la materia y sección…</option>
                {opcionesAsignacion.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.etiqueta}
                  </option>
                ))}
              </Select>
              {erroresForm.asignacionDocenteId && (
                <p className="text-xs text-red-600">
                  {erroresForm.asignacionDocenteId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="tituloMaterial">Título</Label>
            <Input
              id="tituloMaterial"
              placeholder="Ej: Guía de lectura - Capítulo 2"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            {erroresForm.titulo && (
              <p className="text-xs text-red-600">{erroresForm.titulo}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcionMaterial">Descripción</Label>
            <Input
              id="descripcionMaterial"
              placeholder="Ej: Material de apoyo para el examen"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tipoMaterial">Tipo</Label>
              <Input
                id="tipoMaterial"
                placeholder="Ej: Documento, Video, Enlace"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              />
              {erroresForm.tipo && (
                <p className="text-xs text-red-600">{erroresForm.tipo}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rutaMaterial">Enlace del archivo (opcional)</Label>
              <Input
                id="rutaMaterial"
                placeholder="https://…"
                value={form.rutaArchivo}
                onChange={(e) =>
                  setForm({ ...form, rutaArchivo: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="archivoMaterial">O subir un archivo</Label>
              <input
                id="archivoMaterial"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setArchivoSeleccionado(file);
                }}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {archivoSeleccionado && (
                <p className="text-xs text-slate-500">
                  Archivo seleccionado: {archivoSeleccionado.name} ({Math.round(archivoSeleccionado.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="visibleMaterial"
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30"
            />
            <Label htmlFor="visibleMaterial" className="cursor-pointer">
              Visible para los estudiantes
            </Label>
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
                  ? "Publicar material"
                  : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de eliminación */}
      <Modal
        abierto={confirmarEliminar}
        onCerrar={() => setConfirmarEliminar(false)}
        titulo="Eliminar material"
        descripcion="Esta acción no se puede deshacer."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            ¿Seguro que querés eliminar este material? Los estudiantes ya no
            podrán acceder al recurso.
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
