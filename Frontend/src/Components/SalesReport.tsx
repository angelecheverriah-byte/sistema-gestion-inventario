import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { API_URL } from "../Auth/ApiURL";

export default function SalesReport() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("2026-04");
  const [stats, setStats] = useState({
    totalMensual: 0,
    ventasTotales: 0,
    ticketPromedio: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Enviamos la fecha seleccionada completa (YYYY-MM) para que el backend filtre correctamente
      const response = await fetch(
        `${API_URL}/reports/sales-stats?month=${fechaSeleccionada}`,
      );

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      const data = await response.json();

      // Si el backend devuelve un array de días, calculamos los totales aquí
      if (Array.isArray(data) && data.length > 0) {
        const total = data.reduce(
          (acc, curr) => acc + Number(curr.total_usd || 0),
          0,
        );
        const cantidad = data.reduce(
          (acc, curr) => acc + Number(curr.cantidad_ventas || 0),
          0,
        );

        setStats({
          totalMensual: total,
          ventasTotales: cantidad,
          ticketPromedio: cantidad > 0 ? total / cantidad : 0,
        });
      } else {
        // Reset si no hay datos
        setStats({ totalMensual: 0, ventasTotales: 0, ticketPromedio: 0 });
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fechaSeleccionada]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Análisis de Ingresos
            </h1>
            <p className="text-slate-500">
              Resultados operativos del mes seleccionado.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-xl shadow-sm border border-slate-200">
            {loading ? (
              <Loader2 className="animate-spin text-blue-500" size={20} />
            ) : (
              <Calendar className="text-blue-500" size={20} />
            )}
            <input
              type="month"
              className="outline-none text-sm font-bold text-slate-700 bg-transparent cursor-pointer"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </div>

        {/* TARJETAS (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Mensual
                </p>
                <h2 className="text-2xl font-black text-slate-800">
                  $
                  {stats.totalMensual.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ventas Totales
                </p>
                <h2 className="text-2xl font-black text-slate-800">
                  {stats.ventasTotales}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-hover hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ticket Promedio
                </p>
                <h2 className="text-2xl font-black text-slate-800">
                  ${stats.ticketPromedio.toFixed(2)}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* GRÁFICO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" /> Comparativo
            Mensual
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              debounce={50}
            >
              <BarChart
                data={[{ name: fechaSeleccionada, total: stats.totalMensual }]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                  barSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
