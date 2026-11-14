export function StatCard({
  titulo,
  valor,
  detalle,
  icon: Icon,
  color,
}: {
  titulo: string;
  valor: string | number;
  detalle: string;
  icon: (props: { className?: string }) => React.ReactElement;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{valor}</p>
      <p className="text-sm font-semibold text-slate-700">{titulo}</p>
      <p className="text-xs text-slate-500">{detalle}</p>
    </div>
  );
}
