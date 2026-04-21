import { useEffect, useState, useMemo } from "react";
import TablePagination from "@mui/material/TablePagination";
import { useAuth } from "../Auth/AuthProvider";
import { useConfig } from "../Context/ConfigContext";
import { SalesModal } from "../Components/SalesModal";
import { CreateProductForm } from "../Components/CreateProductForm";
import { productService } from "../Services/productService"; // Importamos el servicio

interface Producto {
  id: number;
  nombre: string;
  precio_usd: number;
  cantidad: number;
}

export default function ProductsList() {
  const { getAccessToken, user } = useAuth();
  const { formatBs } = useConfig();
  const service = productService(getAccessToken);

  // ESTADOS
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState(""); // <--- ESTADO PARA BUSQUEDA

  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    precio_usd: 0,
    cantidad: 0,
  });

  // 1. CARGA DE DATOS
  const fetchProductos = async () => {
    const json = await service.getProducts(page, rowsPerPage);
    setProductos(json.body?.items ?? []);
    setTotal(json.body?.total ?? 0);
  };

  useEffect(() => {
    fetchProductos();
  }, [page, rowsPerPage]);

  // 2. LÓGICA DE BÚSQUEDA (Reactiva)
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [productos, searchTerm]);

  // 3. ACCIONES (Usando el servicio)
  const handleSaveEdit = async (id: number) => {
    if (await service.updateProduct(id, editFormData)) {
      setEditingId(null);
      fetchProductos();
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm("¿Eliminar producto?") &&
      (await service.deleteProduct(id))
    ) {
      fetchProductos();
    }
  };

  return (
    <div className="space-y-6 p-2 md:p-0 animate-in fade-in duration-500">
      {/* CABECERA Y BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">
          Gestión de Inventario
        </h2>

        {/* CONTENEDOR DEL BUSCADOR */}
        <div className="relative w-full md:w-80 group">
          {/* Icono de Lupa con SVG para mayor nitidez y control */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input Estilizado */}
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl 
               text-sm font-medium text-slate-700 placeholder-slate-400
               shadow-sm shadow-slate-100
               focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 
               transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {user?.role === "ADMIN" && (
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <CreateProductForm onProductCreated={fetchProductos} />
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="px-6 py-5">Producto</th>
                <th className="px-6 py-5">Precio USD</th>
                <th className="hidden sm:table-cell px-6 py-5">Precio BS</th>
                <th className="px-6 py-5 text-center">Stock</th>
                <th className="px-6 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {productosFiltrados.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-blue-50/20 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {editingId === p.id ? (
                      <input
                        className="border p-2 rounded w-full"
                        value={editFormData.nombre}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            nombre: e.target.value,
                          })
                        }
                      />
                    ) : (
                      p.nombre
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        className="border p-2 rounded w-24"
                        value={editFormData.precio_usd}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            precio_usd: parseFloat(e.target.value),
                          })
                        }
                      />
                    ) : (
                      `$${Number(p.precio_usd).toFixed(2)}`
                    )}
                  </td>

                  <td className="hidden sm:table-cell px-6 py-4 font-black text-blue-600">
                    {formatBs(
                      editingId === p.id
                        ? editFormData.precio_usd
                        : p.precio_usd,
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.cantidad > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                      {p.cantidad} unidades
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {/* Botones de Vender / Editar / Borrar (Simplificados) */}
                    <div className="flex justify-end gap-2">
                      {editingId === p.id ? (
                        <button
                          onClick={() => handleSaveEdit(p.id)}
                          className="text-emerald-600 font-bold"
                        >
                          GUARDAR
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedProduct(p)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 transition-all"
                          >
                            Vender
                          </button>
                          {user?.role === "ADMIN" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(p.id);
                                  setEditFormData(p);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-600"
                              >
                                ✏️
                              </button>

                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-2 text-slate-400 hover:text-rose-600"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[5, 10]}
          labelRowsPerPage="Filas:"
        />
      </div>

      {selectedProduct && (
        <SalesModal
          producto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            setSelectedProduct(null);
            fetchProductos();
          }}
        />
      )}
    </div>
  );
}
