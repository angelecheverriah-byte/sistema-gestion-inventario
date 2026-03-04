import React, { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { useAuth } from "../Auth/AuthProvider";
import { API_URL } from "../Auth/ApiURL";
import "../Stily/ProductsList.css";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export default function ProductsList() {
  const { getAccessToken } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    precio: 0,
    cantidad: 0,
  });
  const [newProductData, setNewProductData] = useState({
    nombre: "",
    precio: 0,
    cantidad: 0,
  });

  useEffect(() => {
    fetchProductos();
  }, [page, rowsPerPage]);

  const fetchProductos = async () => {
    try {
      const response = await fetch(
        `${API_URL}/products?page=${page}&limit=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        },
      );
      const json = await response.json();
      setProductos(json.body.items);
      setTotal(json.body.total);
    } catch (error) {
      console.error("Error cargando productos", error);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(newProductData),
      });

      if (response.ok) {
        setNewProductData({ nombre: "", precio: 0, cantidad: 0 });
        fetchProductos();
        alert("Producto creado con éxito");
      }
    } catch (error) {
      console.error("Error al crear:", error);
    }
  };

  const startEditing = (p: Producto) => {
    setEditingId(p.id);
    setEditFormData({
      nombre: p.nombre,
      precio: p.precio,
      cantidad: p.cantidad,
    });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setEditingId(null);
        fetchProductos();
      }
    } catch (error) {
      console.error("Error al editar:", error);
    }
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reiniciar a la primera página cuando cambia el límite
  };

  const deleteProducto = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;

    try {
      const token = getAccessToken();
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProductos();
        alert("Producto eliminado");
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="table-container">
      {/* FORMULARIO DE CREACIÓN (Solo ADMIN) */}
      {user?.role === "ADMIN" && (
        <form
          className="create-form"
          onSubmit={handleCreateProduct}
          style={{ marginBottom: "20px" }}
        >
          <h3>Añadir Nuevo Producto</h3>
          <input
            type="text"
            placeholder="Nombre"
            required
            value={newProductData.nombre}
            onChange={(e) =>
              setNewProductData({ ...newProductData, nombre: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Precio"
            required
            value={newProductData.precio || ""}
            onChange={(e) =>
              setNewProductData({
                ...newProductData,
                precio: parseFloat(e.target.value),
              })
            }
          />
          <input
            type="number"
            placeholder="Cantidad"
            required
            value={newProductData.cantidad || ""}
            onChange={(e) =>
              setNewProductData({
                ...newProductData,
                cantidad: parseInt(e.target.value),
              })
            }
          />
          <button type="submit" className="btn-add">
            Añadir
          </button>
        </form>
      )}
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            {user?.role === "ADMIN" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>

              {/* Celda NOMBRE */}
              <td>
                {editingId === p.id ? (
                  <input
                    type="text"
                    value={editFormData.nombre}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nombre: e.target.value,
                      })
                    }
                    className="input-edit"
                  />
                ) : (
                  p.nombre
                )}
              </td>

              {/* Celda PRECIO */}
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    value={editFormData.precio}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        precio: parseFloat(e.target.value),
                      })
                    }
                    className="input-edit"
                  />
                ) : (
                  `$${p.precio}`
                )}
              </td>

              {/* Celda CANTIDAD */}
              <td>
                {editingId === p.id ? (
                  <input
                    type="number"
                    value={editFormData.cantidad}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        cantidad: parseInt(e.target.value),
                      })
                    }
                    className="input-edit"
                  />
                ) : (
                  p.cantidad
                )}
              </td>

              {/* Celda ACCIONES */}
              <td>
                {user?.role === "ADMIN" &&
                  (editingId === p.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(p.id)}
                        className="btn-save"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="btn-cancel"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(p)}
                        className="btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteProducto(p.id)}
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    </>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
        {/* LA PAGINACIÓN DEBE IR DENTRO DE LA TABLA O USAR UN COMPONENTE DIFERENTE */}
        <tfoot>
          <tr>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              // Agregamos 'component' para que no pelee con el HTML
              component="td"
            />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
