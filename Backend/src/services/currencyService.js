const axios = require("axios");
const db = require("../conexion/dataBase");

const syncTasaBCV = async () => {
  try {
    // Usamos una API pública confiable para el BCV
    const response = await axios.get(
      "https://ve.dolarapi.com/v1/dolares/oficial",
    );
    const nuevaTasa = response.data.promedio;

    if (nuevaTasa) {
      await db.query(
        "UPDATE configuracion SET valor = ? WHERE clave = 'tasa_dolar'",
        [nuevaTasa],
      );
      console.log(`✅ Tasa BCV actualizada automáticamente: ${nuevaTasa} Bs.`);
    }
  } catch (error) {
    console.error("❌ Error al sincronizar con la API del BCV:", error.message);
    // Si la API falla, el sistema seguirá usando la última tasa guardada en la DB.
  }
};

module.exports = { syncTasaBCV };
