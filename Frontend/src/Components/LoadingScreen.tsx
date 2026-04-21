export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[100]">
      {/* Contenedor del Icono con efecto de pulso */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 bg-blue-500/10 rounded-full animate-ping"></div>
        <div className="absolute w-20 h-20 bg-blue-500/5 rounded-full animate-pulse"></div>

        <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
      </div>

      {/* Texto y Barra de carga */}
      <div className="mt-10 text-center space-y-3">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          Sistema de Inventario
        </h2>
        <div className="flex flex-col items-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Optimizando Recursos
          </p>

          {/* Barra de progreso con animación personalizada de Tailwind v4 */}
          <div className="w-40 h-1 bg-slate-200 rounded-full mt-6 overflow-hidden">
            <div className="w-full h-full bg-blue-500 origin-left animate-[loading-bar_2s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
