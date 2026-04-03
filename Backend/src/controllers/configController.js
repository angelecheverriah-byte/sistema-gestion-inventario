const pool = require("../conexion/dataBase");

// Obtener la tasa guardada en la DB
exports.getTasa = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT valor FROM configuracion WHERE clave = 'tasa_dolar'",
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Tasa no configurada" });
    }
    res.json({ tasa: rows[0].valor });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la tasa", error: error.message });
  }
};

// Actualizar la tasa manualmente (Para el Admin)
exports.updateTasa = async (req, res) => {
  const { nuevaTasa } = req.body;
  if (!nuevaTasa || isNaN(nuevaTasa)) {
    return res.status(400).json({ message: "Tasa inválida" });
  }

  try {
    await pool.query(
      "UPDATE configuracion SET valor = ? WHERE clave = 'tasa_dolar'",
      [nuevaTasa],
    );
    res.json({ message: "Tasa actualizada manualmente", nuevaTasa });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar", error: error.message });
  }
};
