const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

require("dotenv").config();

const port = process.env.PORT || 3100;

const SERVER_URL = process.env.RAILWAY_STATIC_URL
  ? `https://${process.env.RAILWAY_STATIC_URL}`
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
        url: SERVER_URL,
        description: process.env.RAILWAY_STATIC_URL
          ? "Servidor Producción"
          : "Servidor Local",
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
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"], // Agregamos variable para el front en la nube
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

app.get("/", (req, res) => {
  res.send("Hello Word!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
