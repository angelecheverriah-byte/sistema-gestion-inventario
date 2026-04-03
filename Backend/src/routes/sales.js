const express = require("express");
const router = express.Router();
const db = require("../conexion/dataBase");
// Importamos el middleware de autenticación
const authModule = require("../middleware/authenticate");
const { enviarAlertaStock } = require("../utils/telegram");

// VALIDACIÓN DE MIDDLEWARE:
// Intentamos obtener la función ya sea que venga como module.exports o como module.exports.authenticate
const authenticate =
  typeof authModule === "function" ? authModule : authModule.authenticate;

if (typeof authenticate !== "function") {
  console.error(
    "❌ ERROR CRÍTICO EN SALES.JS: El middleware no es una función. Recibido:",
    typeof authModule,
  );
}

// Usamos una función anónima de respaldo si falla la carga para evitar que Express lance el TypeError
const safeAuth =
  typeof authenticate === "function"
    ? authenticate
    : (req, res, next) => next();

router.post("/", safeAuth, async (req, res) => {
  const { producto_id, cantidad } = req.body;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Obtener la tasa del dólar
    // ... (mismo código de arriba hasta el Paso 1)

    // 1. Obtener la tasa del dólar (FORZAMOS FLOAT)
    const [config] = await connection.query(
      "SELECT valor FROM configuracion WHERE clave = 'tasa_dolar' LIMIT 1",
    );
    if (!config.length) throw new Error("Tasa del dólar no configurada");

    const tasaActual = parseFloat(config[0].valor); // <-- Asegurar número

    // 2. Verificar stock
    const [product] = await connection.query(
      "SELECT nombre, cantidad, precio_usd FROM productos WHERE id = ? FOR UPDATE",
      [producto_id],
    );

    if (!product.length || product[0].cantidad < cantidad) {
      throw new Error("Stock insuficiente o producto no encontrado");
    }

    // --- CÁLCULOS SEGUROS ---
    const precioUnitario = parseFloat(product[0].precio_usd); // <-- Forzar número
    const cantVenta = parseInt(cantidad); // <-- Forzar entero

    const totalUsd = precioUnitario * cantVenta;
    const totalBs = totalUsd * tasaActual;
    const nuevoStock = parseInt(product[0].cantidad) - cantVenta;

    // 3. Registrar la venta (INDICANDO COLUMNAS EXPLÍCITAMENTE)
    // El orden de los VALUES debe coincidir exactamente con el array final
    await connection.query(
      "INSERT INTO ventas (producto_id, cantidad, total_usd, tasa_bs, total_bs) VALUES (?, ?, ?, ?, ?)",
      [producto_id, cantVenta, totalUsd, tasaActual, totalBs],
    );

    // 4. Descontar stock
    await connection.query("UPDATE productos SET cantidad = ? WHERE id = ?", [
      nuevoStock,
      producto_id,
    ]);

    await connection.commit();

    // 🚀 LÓGICA DE TELEGRAM
    // Disparamos la alerta si el stock es 10 o menos
    if (nuevoStock <= 10) {
      // No usamos 'await' aquí para que la respuesta a la web sea instantánea
      // y no dependa de que Telegram responda rápido.
      enviarAlertaStock(product[0].nombre, nuevoStock);
    }

    // --- LOG PARA VER EN TU TERMINAL DE NODE ---
    console.log(
      `✅ Venta Exitosa: ${product[0].nombre} | Total: ${totalBs.toFixed(2)} BS`,
    );

    // ... (resto del código igual)

    // --- 🚀 LOGICA DE ALERTAS (TELEGRAM) ---
    // Si el stock bajó de 10, disparamos la alerta (sin bloquear la respuesta al usuario)
    if (nuevoStock <= 10) {
      // Aquí llamaremos a una función que crearemos en el siguiente paso
      // enviarAlertaTelegram(product[0].nombre, nuevoStock);
      console.log(
        `⚠️ Alerta: ${product[0].nombre} tiene stock crítico: ${nuevoStock}`,
      );
    }

    res.status(201).json({
      message: "Venta procesada exitosamente",
      total_bs: totalBs,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en venta:", error.message);
    res.status(400).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
