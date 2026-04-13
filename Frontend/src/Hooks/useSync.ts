import { useEffect } from "react";
import { dbLocal } from "../Components/dbLocal";

export const useSync = (isAuthenticated: boolean) => {
  useEffect(() => {
    const syncData = async () => {
      // 1. Verificación de seguridad: solo si hay internet
      if (!navigator.onLine || !isAuthenticated) return;

      try {
        const pendientes = await dbLocal.ventasOffline
          .where("sincronizado")
          .equals(0)
          .toArray();

        if (pendientes.length > 0) {
          console.log(`🔄 Sincronizando ${pendientes.length} ventas...`);

          for (const venta of pendientes) {
            const res = await fetch("http://localhost:3100/api/ventas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(venta),
            });

            if (res.ok) {
              // Si el servidor confirma recepción, limpiamos la DB local
              await dbLocal.ventasOffline.delete(venta.id!);
              console.log(
                `✅ Venta ${venta.id} sincronizada y eliminada localmente`,
              );
            }
          }
        }
      } catch (err) {
        console.error("Fallo de red al sincronizar", err);
      }
    };

    // 2. Escuchar el evento de volver a estar online
    window.addEventListener("online", syncData);

    // 3. ¡IMPORTANTE! Intentar sincronizar apenas carga la app
    // Por si el usuario ya tiene conexión al entrar.
    syncData();

    return () => window.removeEventListener("online", syncData);
  }, [isAuthenticated]);
};
