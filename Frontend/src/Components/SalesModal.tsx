import React, { useState } from "react";
import { useAuth } from "../Auth/AuthProvider";
import { API_URL } from "../Auth/ApiURL";
import { useConfig } from "../Context/ConfigContext";

interface Producto {
  id: number;
  nombre: string;
  precio_usd: number;
  cantidad: number;
}

interface Props {
  producto: Producto;
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesModal: React.FC<Props> = ({
  producto,
  onClose,
  onSuccess,
}) => {
  const { getAccessToken } = useAuth();
  const { formatBs } = useConfig();
  const [cantidadVenta, setCantidadVenta] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalUSD = producto.precio_usd * cantidadVenta;

  const handleConfirmarVenta = async () => {
    if (cantidadVenta > producto.cantidad)
      return alert("No hay suficiente stock");
    if (cantidadVenta <= 0) return alert("Cantidad no válida");

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          producto_id: producto.id,
          cantidad: cantidadVenta,
          precio_unitario: producto.precio_usd,
          total: totalUSD,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const err = await response.json();
        alert(err.message || "Error al procesar la venta");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100">
        {/* CABECERA */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Confirmar Venta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Producto
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {producto.nombre}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Stock
              </p>
              <p
                className={`text-sm font-bold ${producto.cantidad < 5 ? "text-rose-500" : "text-slate-600"}`}
              >
                {producto.cantidad} disponibles
              </p>
            </div>
          </div>

          {/* INPUT DE CANTIDAD */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
              Cantidad a vender
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCantidadVenta(Math.max(1, cantidadVenta - 1))}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-xl font-bold transition-all shadow-sm"
              >
                -
              </button>
              <input
                type="number"
                className="w-20 text-center bg-transparent text-2xl font-bold outline-none text-slate-900"
                value={cantidadVenta}
                onChange={(e) =>
                  setCantidadVenta(parseInt(e.target.value) || 1)
                }
              />
              <button
                onClick={() =>
                  setCantidadVenta(
                    Math.min(producto.cantidad, cantidadVenta + 1),
                  )
                }
                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black text-xl font-bold transition-all shadow-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* RESUMEN DE PRECIOS */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total en Dólares:</span>
              <span className="font-bold text-slate-900">
                ${totalUSD.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg border-t border-slate-100 pt-2">
              <span className="font-semibold text-slate-800">
                Total a cobrar:
              </span>
              <span className="font-extrabold text-emerald-600 italic tracking-tight">
                {formatBs(totalUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="px-6 py-4 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-white transition-all"
          >
            Cancelar
          </button>
          <button
            disabled={loading || producto.cantidad === 0}
            onClick={handleConfirmarVenta}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {loading ? "Procesando..." : "Finalizar Venta"}
          </button>
        </div>
      </div>
    </div>
  );
};
