const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const cron = require("node-cron"); // 1. Importar Cron
const { syncTasaBCV } = require("./services/currencyService"); // 2. Importar Servicio

require("dotenv").config();

const port = process.env.PORT || 3100;

const SERVER_URL = process.env.RENDER_EXTERNAL_URL
  ? process.env.RENDER_EXTERNAL_URL
  : `http://localhost:${port}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Inventario - Proyecto Express",
      version: "1.0.0",
      description:
        "Documentación interactiva de los endpoints de autenticación y productos",
      contact: {
        name: "Soporte API",
      },
    },
    servers: [
      {
        url:
          process.env.RENDER_EXTERNAL_URL ||
          "https://sistema-inventario-backend-cwmm.onrender.com",
        description: process.env.RENDER_EXTERNAL_URL
          ? "Servidor Producción (Render)"
          : "Servidor Local (Desarrollo)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./routes/*.js", "./Backend/src/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api/login", require("./routes/login"));
app.use("/api/signup", require("./routes/signup"));
app.use("/api/signout", require("./routes/signout"));
app.use("/api/user", require("./routes/user"));
app.use("/api/todos", require("./routes/todos"));
app.use("/api/refresh-token", require("./routes/refreshToken"));
app.use("/api/products", require("./routes/products"));
app.use("/api/config", require("./routes/config"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/reports", require("./routes/reports"));
cron.schedule("0 9 * * 1-5", () => {
  syncTasaBCV();
});

app.get("/", (req, res) => {
  res.send("Server Status: Online 🚀");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server is running on port: ${port}`);

  // Ejecutar sincronización inicial sin bloquear el inicio del servidor
  // Esperamos 3 segundos para que la DB en Docker termine de estabilizarse
  setTimeout(async () => {
    try {
      console.log("🔄 Intentando sincronización de tasa inicial...");
      await syncTasaBCV();
      console.log("✨ Tasa sincronizada exitosamente.");
    } catch (error) {
      console.error(
        "⚠️ No se pudo sincronizar la tasa inicial (posible falta de internet):",
        error.message,
      );
    }
  }, 3000);
});
