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
        ? { u: "admin", p: "admin" } // Ajusta según tus credenciales reales de BD
        : { u: "test_user", p: "admin123" };

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
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <span className="text-[10px] font-black uppercase text-blue-500">
                Acceso
              </span>
              <span className="text-sm font-bold text-slate-700">ADMIN</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("USER")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-slate-100 hover:border-slate-500 hover:bg-slate-50 transition-all group"
            >
              <span className="text-[10px] font-black uppercase text-slate-400">
                Acceso
              </span>
              <span className="text-sm font-bold text-slate-700">USER</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-300">
                O ingresa manual
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
