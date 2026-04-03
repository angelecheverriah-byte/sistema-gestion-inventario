import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider";
import { CurrencyWidget } from "../Layout/CurrencyWidget";

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
        <nav className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-blue-50"
          >
            Dashboard
          </Link>
          {/* Aquí puedes añadir más links a futuro */}
        </nav>

        <div className="flex items-center gap-6">
          {/* Widget de Moneda - Se asume que tiene su propio diseño */}
          <div className="hidden md:block">
            <CurrencyWidget />
          </div>

          {/* Sección de Usuario */}
          <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 leading-none">
                {user?.username}
              </p>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {user?.role}
              </span>
            </div>

            <button
              className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 px-4 rounded-lg transition-all active:scale-95 border border-red-100"
              onClick={signOut}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Footer Simple Opcional */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; 2026 Codiva Services - Sistema de Inventario
      </footer>
    </div>
  );
}
