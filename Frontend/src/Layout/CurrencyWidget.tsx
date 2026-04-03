import { useConfig } from "../Context/ConfigContext";

export function CurrencyWidget() {
  const { tasa } = useConfig();

  // 1. Verificamos si la tasa existe y es un número antes de usar .toFixed()
  const tasaNumerica = typeof tasa === "number" ? tasa : parseFloat(tasa);
  const tasaValida = !isNaN(tasaNumerica) ? tasaNumerica : 0;

  return (
    <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all hover:bg-emerald-100">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter leading-none">
          Tasa BCV
        </span>
        <span className="text-sm font-black text-emerald-700 leading-tight">
          {/* Si la tasa no ha cargado, mostramos un guión en lugar de romper la app */}
          {tasaValida > 0 ? `Bs. ${tasaValida.toFixed(2)}` : "Cargando..."}
        </span>
      </div>

      {/* Un pequeño indicador visual de "En vivo" */}
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
    </div>
  );
}
