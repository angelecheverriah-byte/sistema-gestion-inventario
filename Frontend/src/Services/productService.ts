import { API_URL } from "../Auth/ApiURL";

// Definimos el tipo de la función que recibimos
type GetTokenFn = () => string | null;

export const productService = (getAccessToken: GetTokenFn) => {
  // Creamos una función interna para generar los headers dinámicamente
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessToken()}`,
  });

  return {
    getProducts: async (page: number, limit: number) => {
      const res = await fetch(
        `${API_URL}/products?page=${page}&limit=${limit}`,
        {
          headers: getHeaders(),
        },
      );
      return res.json();
    },
    updateProduct: async (id: number, data: any) => {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.ok;
    },
    deleteProduct: async (id: number) => {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return res.ok;
    },
  };
};
