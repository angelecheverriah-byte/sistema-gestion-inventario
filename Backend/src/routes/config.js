const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

// 1. Importamos sin desestructurar para inspeccionar el objeto
const authModule = require("../middleware/authenticate");
const adminModule = require("../middleware/isAdmin");

// 2. Diagnóstico manual (Saldrá en tus logs de Docker)
console.log("--- CHEQUEO DE MÓDULOS ---");
console.log("Tipo de authModule:", typeof authModule);
console.log("Contenido de authModule:", authModule);
console.log("Tipo de adminModule:", typeof adminModule);
console.log("--- FIN DEL CHEQUEO ---");

// 3. Asignación segura
const authenticate =
  typeof authModule === "function" ? authModule : authModule.authenticate;
const isAdmin =
  typeof adminModule === "function" ? adminModule : adminModule.isAdmin;

router.get("/tasa", configController.getTasa);

// 4. Protección de ruta
if (typeof authenticate === "function" && typeof isAdmin === "function") {
  router.put("/tasa", authenticate, isAdmin, configController.updateTasa);
} else {
  console.error(
    "❌ ERROR: No se pudo cargar una de las funciones de middleware.",
  );
}

module.exports = router;
