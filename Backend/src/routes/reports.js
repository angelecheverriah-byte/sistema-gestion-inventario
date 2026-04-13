const express = require("express");
const router = express.Router();
const db = require("../conexion/dataBase");

// 1. Ruta para las estadísticas del gráfico (Mensual)
router.get("/sales-stats", async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || !month.includes("-")) {
      return res
        .status(400)
        .json({ error: "Formato de mes requerido: YYYY-MM" });
    }

    const [year, monthNum] = month.split("-");

    const sql = `
      SELECT 
        DATE_FORMAT(fecha, '%d/%m') as etiqueta, 
        DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_db, 
        SUM(total_usd) as total_usd, 
        SUM(IFNULL(total_bs, 0)) as total_bs, 
        COUNT(*) as cantidad_ventas 
      FROM ventas 
      WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? 
      GROUP BY DATE(fecha), etiqueta, fecha_db
      ORDER BY DATE(fecha) ASC
    `;

    const [rows] = await db.query(sql, [parseInt(monthNum), parseInt(year)]);
    res.json(rows || []);
  } catch (error) {
    console.error("❌ Error en MySQL Stats:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 2. Ruta para el detalle al hacer clic (Diario)
router.get("/daily-details", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Fecha requerida" });

    const sql = `
      SELECT 
        p.nombre as producto, 
        p.precio_usd as precio_unitario, -- Traído directo de la tabla productos
        v.cantidad,
        v.total_usd, 
        v.total_bs,
        DATE_FORMAT(v.fecha, '%H:%i') as hora
      FROM ventas v
      INNER JOIN productos p ON v.producto_id = p.id
      WHERE DATE(v.fecha) = ?
      ORDER BY v.fecha DESC
    `;

    const [rows] = await db.query(sql, [date]);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en SQL:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
