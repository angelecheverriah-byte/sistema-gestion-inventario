import { type ReactNode } from "react";
import { useAuth } from "../Auth/AuthProvider";
import { CurrencyWidget } from "../Layout/CurrencyWidget";
import { Package, BarChart3, LogOut } from "lucide-react";

interface PortalLayoutProps {
  children: ReactNode;
  onSectionChange?: (section: string) => void;
  seccionActiva?: string;
}

export default function PortalLayout({
  children,
  onSectionChange,
  seccionActiva,
}: PortalLayoutProps) {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-50">
        <nav className="flex items-center gap-3">
          {/* Botón de Inventario */}
          <button
            onClick={() => onSectionChange?.("inventario")}
            className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl ${
              seccionActiva === "inventario"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <Package size={18} />
            Inventario
          </button>

          {/* Botón de Reportes */}
          <button
            onClick={() => onSectionChange?.("reportes")}
            className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl ${
              seccionActiva === "reportes"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <BarChart3 size={18} />
            Reportes
          </button>
        </nav>

        <div className="flex items-center gap-6">
          {/* Widget de Moneda */}
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
              className="group bg-red-50 hover:bg-red-500 hover:text-white text-red-600 text-xs font-bold py-2 px-4 rounded-lg transition-all active:scale-95 border border-red-100 flex items-center gap-2"
              onClick={signOut}
            >
              <LogOut
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; Angel Echeverria Developer FullStack - Sistema de Inventario
      </footer>
    </div>
  );
}
