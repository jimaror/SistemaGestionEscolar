import { Button } from "@/components/ui/button";
import { AlertIcon, RefreshIcon, SparklesIcon } from "@/components/icons";

export function Cargando({ texto = "Cargando información…" }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      <p className="text-sm text-slate-500">{texto}</p>
    </div>
  );
}

export function ErrorEstado({
  mensaje,
  onReintentar,
}: {
  mensaje: string;
  onReintentar: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50/60 px-6 py-14 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertIcon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold text-slate-900">No se pudo cargar la información</p>
        <p className="mt-1 text-sm text-slate-600">{mensaje}</p>
      </div>
      <Button variant="outline" onClick={onReintentar}>
        <RefreshIcon className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}

export function Vacio({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <SparklesIcon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold text-slate-900">{titulo}</p>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>
    </div>
  );
}
