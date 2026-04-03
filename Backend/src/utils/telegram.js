const axios = require("axios");

const TELEGRAM_TOKEN = "8216666426:AAGhZ75aWHvfZjmY9N30AIoZMkBuiDQY3sY";
const CHAT_ID = "7779533037";

/**
 * Envía una notificación de stock bajo a Telegram
 * @param {string} nombreProducto
 * @param {number} stockRestante
 */
const enviarAlertaStock = async (nombreProducto, stockRestante) => {
  const mensaje =
    `⚠️ *ALERTA DE INVENTARIO BAJO*\n\n` +
    `📦 *Producto:* ${nombreProducto}\n` +
    `📉 *Stock actual:* ${stockRestante} unidades\n\n` +
    `_Favor reponer mercancía pronto._`;

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: mensaje,
        parse_mode: "Markdown",
      },
    );
    console.log("✅ Notificación de Telegram enviada");
  } catch (error) {
    console.error(
      "❌ Error en Telegram:",
      error.response?.data || error.message,
    );
  }
};

// Exportación correcta para Node.js (CommonJS)
module.exports = { enviarAlertaStock };
