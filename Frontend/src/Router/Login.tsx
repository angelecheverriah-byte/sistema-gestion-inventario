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

  const Auth = useAuth();
  const goto = useNavigate();

  async function handleSumit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorResponse(""); // Limpiamos errores previos al intentar de nuevo

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
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
      console.log(error);
      setErrorResponse("Error de conexión con el servidor");
    }
  }

  if (Auth.isAuthenticated) {
    return <Navigate to="/Dashboard" />;
  }

  return (
    <DefaultLayout>
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <form
          className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6"
          onSubmit={handleSumit}
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Bienvenido
            </h1>
            <p className="text-slate-400 text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {errorResponse && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium animate-shake">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                placeholder="Ej. admin123"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] cursor-pointer">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
}

export default Login;
