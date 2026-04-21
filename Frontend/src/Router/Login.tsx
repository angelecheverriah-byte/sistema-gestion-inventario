import React, { useState } from "react";
import DefaultLayout from "../Layout/DefaultLayout";
import { useAuth } from "../Auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import { API_URL } from "../Auth/ApiURL";
import type { AuthResponse, AuthResponseError } from "../Types/types";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorResponse, setErrorResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para feedback visual

  const Auth = useAuth();
  const goto = useNavigate();

  // Función genérica para el login que podemos reutilizar
  async function performLogin(u: string, p: string) {
    setIsLoading(true);
    setErrorResponse("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password: p }),
      });

      if (response.ok) {
        const json = (await response.json()) as AuthResponse;
        if (json.body.accessToken) {
          Auth.saveUser(json);
          goto("/Dashboard");
        }
      } else {
        const json = (await response.json()) as AuthResponseError;
        setErrorResponse(json.body.error);
      }
    } catch (error) {
      setErrorResponse("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSumit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await performLogin(username, password);
  }

  // ESTA ES LA FUNCIÓN CLAVE PARA EL RECLUTADOR
  const handleDemoLogin = async (role: "ADMIN" | "USER") => {
    const creds =
      role === "ADMIN"
        ? { u: "admin", p: "admin123" } // Ajusta según tus credenciales reales de BD
        : { u: "user", p: "user123" };

    setUsername(creds.u);
    setPassword(creds.p);

    // Pequeño delay para que el reclutador vea cómo se llenan los campos
    setTimeout(async () => {
      await performLogin(creds.u, creds.p);
    }, 500);
  };

  if (Auth.isAuthenticated) {
    return <Navigate to="/Dashboard" />;
  }

  return (
    <DefaultLayout>
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Bienvenido
            </h1>
            <p className="text-slate-400 text-sm">
              Prueba el sistema con un solo clic
            </p>
          </div>

          {/* BOTONES DE ACCESO RÁPIDO PARA RECLUTADORES */}
          {/* Grid de Accesos Rápidos - Rediseñado para ser Elegante y Profesional */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 text-center">
              Probar el sistema (Modo Demo)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleDemoLogin("ADMIN")}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* Icono sutil de Admin */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span className="text-sm font-extrabold text-slate-800">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-600 transition-colors">
                  Gestión del inventario
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin("USER")}
                className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* Icono sutil de Usuario */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-400 group-hover:text-slate-600"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-sm font-extrabold text-slate-800">
                    VENDEDOR
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
                  Ver Inventario y Vender
                </span>
              </button>
            </div>
          </div>

          {/* Separador Elegante con Línea */}
          <div className="relative py-4">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                o ingresa tus credenciales
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSumit}>
            {errorResponse && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium">
                {errorResponse}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Login;
