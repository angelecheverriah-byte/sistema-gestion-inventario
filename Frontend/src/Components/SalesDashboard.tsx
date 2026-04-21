import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  ShoppingBag,
  Activity,
  Loader2,
  Package,
  ArrowRight,
  Clock,
  AlertCircle,
  FileDown,
} from "lucide-react";

// Importación del generador de PDF que creamos en Components
import { exportDailySalesPDF } from "./pdfGenerator";

// Interfaces para tipado estricto
interface SalesStat {
  etiqueta: string;
  fecha_db: string;
  total_usd: number;
  total_bs: number;
  cantidad_ventas: number;
}

interface SaleDetail {
  producto: string;
  precio_unitario: number | string;
  cantidad: number;
  total_usd: number | string;
  total_bs: number | string;
  hora: string;
}

const API_URL = "http://localhost:3100/api";

export default function SalesDashboard() {
  // --- ESTADOS ---
  const [data, setData] = useState<SalesStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSeleccionado, setMesSeleccionado] = useState("2026-04");
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<
    string | null
  >(null);
  const [detalleDia, setDetalleDia] = useState<SaleDetail[]>([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // --- EFECTOS ---
  useEffect(() => {
    fetchStats();
  }, [mesSeleccionado]);

  // --- FUNCIONES DE CARGA ---
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/reports/sales-stats?month=${mesSeleccionado}`,
      );
      const result = await response.json();
      const cleanData = Array.isArray(result)
        ? result.map((item: any) => ({
            ...item,
            total_usd: parseFloat(item.total_usd) || 0,
            total_bs: parseFloat(item.total_bs) || 0,
            cantidad_ventas: parseInt(item.cantidad_ventas) || 0,
          }))
        : [];
      setData(cleanData);
      setDiaSeleccionado(null);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyDetails = async (fechaDb: string, etiqueta: string) => {
    if (!fechaDb) return;
    setLoadingDetalle(true);
    setDiaSeleccionado(fechaDb);
    setEtiquetaSeleccionada(etiqueta);
    setDetalleDia([]);

    try {
      const response = await fetch(
        `${API_URL}/reports/daily-details?date=${fechaDb}`,
      );
      const result = await response.json();
      setDetalleDia(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error al cargar detalles diarios:", error);
      setDetalleDia([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // --- CÁLCULOS DE CABECERA (KPIs) ---
  const totalUsd = data.reduce(
    (acc, curr) => acc + (Number(curr.total_usd) || 0),
    0,
  );
  const totalBs = data.reduce(
    (acc, curr) => acc + (Number(curr.total_bs) || 0),
    0,
  );
  const totalVentas = data.reduce(
    (acc, curr) => acc + (Number(curr.cantidad_ventas) || 0),
    0,
  );
  const promedio = totalVentas > 0 ? totalUsd / totalVentas : 0;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* HEADER Y FILTRO DE MES */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase text-slate-800">
              Dashboard de Ventas
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Visualización de ingresos mensuales
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <Calendar className="text-blue-500" size={18} />
            <input
              type="month"
              className="outline-none bg-transparent text-sm font-bold text-slate-700 cursor-pointer"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
            />
          </div>
        </div>

        {/* TARJETAS DE INDICADORES (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Mensual"
            value={`$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            icon={<DollarSign />}
            color="blue"
            subtitle={`${totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} VES`}
          />
          <StatCard
            title="Ventas Realizadas"
            value={totalVentas}
            icon={<ShoppingBag />}
            color="indigo"
            subtitle="Total facturas emitidas"
          />
          <StatCard
            title="Ticket Promedio"
            value={`$${promedio.toFixed(2)}`}
            icon={<Activity />}
            color="emerald"
            subtitle="Ingreso medio por venta"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* GRÁFICO DE BARRAS */}
          <div className="flex-1 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold mb-8 flex items-center gap-2 text-slate-700">
              <TrendingUp size={20} className="text-blue-500" /> Rendimiento
              Diario ($)
            </h3>
            <div className="h-80 w-full relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="etiqueta"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="total_usd"
                      barSize={32}
                      radius={[6, 6, 0, 0]}
                      onClick={(p: any) => {
                        if (p && p.payload)
                          fetchDailyDetails(
                            p.payload.fecha_db,
                            p.payload.etiqueta,
                          );
                      }}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            diaSeleccionado === entry.fecha_db
                              ? "#1e40af"
                              : "#3b82f6"
                          }
                          className="cursor-pointer transition-all duration-300 hover:opacity-80"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* SIDEBAR: DETALLES DEL DÍA SELECCIONADO */}
          <div className="w-full lg:w-[400px] bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
            {/* CABECERA DEL SIDEBAR CON BOTÓN PDF */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-slate-400" /> Detalle de
                Operaciones
              </h3>

              {diaSeleccionado && detalleDia.length > 0 && (
                <button
                  onClick={() =>
                    exportDailySalesPDF(detalleDia, etiquetaSeleccionada || "")
                  }
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-black transition-all border border-emerald-100 shadow-sm"
                >
                  <FileDown size={14} /> PDF
                </button>
              )}
            </div>

            <div
              className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[450px]"
              style={{ maxHeight: "500px" }}
            >
              {loadingDetalle ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 className="animate-spin mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Cargando...
                  </span>
                </div>
              ) : diaSeleccionado ? (
                <>
                  <div className="mb-4 bg-blue-50 p-3 rounded-2xl flex items-center justify-center gap-2 text-blue-600">
                    <Clock size={14} />
                    <p className="text-[10px] font-black uppercase tracking-wider">
                      Ventas de: {etiquetaSeleccionada}
                    </p>
                  </div>

                  {detalleDia.length > 0 ? (
                    detalleDia.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 transition-all shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm font-black text-slate-800 uppercase leading-tight flex-1">
                            {item.producto}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                            {item.hora}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                              Precio Unit.
                            </p>
                            <p className="text-xs font-bold text-slate-600">
                              ${Number(item.precio_unitario).toFixed(2)}
                            </p>
                          </div>
                          <div className="h-6 w-[1px] bg-slate-100"></div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">
                              Cantidad
                            </p>
                            <p className="text-xs font-bold text-blue-600">
                              {item.cantidad} Und.
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-dashed border-slate-100 flex justify-between items-center">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400">
                              Total USD
                            </p>
                            <p className="text-sm font-black text-emerald-600">
                              ${Number(item.total_usd).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase font-bold text-slate-400">
                              Total BS
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                              {Number(item.total_bs).toLocaleString("es-VE")}{" "}
                              <span className="text-[8px]">BS</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-slate-300">
                      <AlertCircle className="mx-auto mb-2" size={32} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Sin registros
                      </p>
                    </div>
                  )}

                  {/* FOOTER DEL SIDEBAR: CIERRE TOTAL */}
                  {detalleDia.length > 0 && (
                    <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t">
                      <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-[1.5rem] shadow-xl">
                        <span className="text-[8px] font-black uppercase opacity-60 tracking-[0.2em]">
                          Cierre Diario
                        </span>
                        <span className="text-2xl font-black">
                          $
                          {detalleDia
                            .reduce(
                              (acc, c) => acc + (Number(c.total_usd) || 0),
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                  <Activity size={64} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] px-10 leading-loose">
                    Selecciona un día en el gráfico
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTE DE TARJETA ESTADÍSTICA
function StatCard({ title, value, icon, color, subtitle }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-4 rounded-2xl ${colors[color]} shadow-sm`}>
          {icon}
        </div>
        <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.15em]">
          {title}
        </span>
      </div>
      <div className="text-4xl font-black text-slate-800 tracking-tighter mb-1">
        {value}
      </div>
      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wide">
        <ArrowRight size={12} className="text-slate-300" /> {subtitle}
      </div>
    </div>
  );
}
