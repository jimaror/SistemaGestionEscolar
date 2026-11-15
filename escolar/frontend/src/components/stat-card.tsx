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
    <div className="card-hover group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{valor}</p>
      <p className="text-sm font-bold text-slate-700">{titulo}</p>
      <p className="text-xs text-slate-500">{detalle}</p>
    </div>
  );
}
