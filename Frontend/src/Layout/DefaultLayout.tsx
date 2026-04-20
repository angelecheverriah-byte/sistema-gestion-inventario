import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface DefaultLayoutProps {
  children: ReactNode;
}

export default function DefaultLayout({ children }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      {/* Navbar Simple y Elegante */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Un pequeño detalle visual para el logo */}
          <div className="w-12 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">IP</span>
          </div>
          <span className="font-bold text-slate-900 tracking-tight">
            InventarioPro
          </span>
        </div>

        <nav>
          <ul className="flex items-center gap-8">
            <li>
              <Link
                to="/"
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                Crear Cuenta
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Contenedor del Formulario (Login o Signup) */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {children}
      </main>

      {/* Footer minimalista */}
      <footer className="py-6 text-center">
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
          Powered by Angel Echeverria FullStack Developer &bull; 2026
        </p>
      </footer>
    </div>
  );
}
