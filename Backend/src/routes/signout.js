const router = require("express").Router();
const { jsonResponse } = require("../conexion/jsonResponse");

/**
 * @swagger
 * /api/signout:
 *   delete:
 *     summary: Cerrar sesión
 *     tags:
 *       - Autenticación
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.delete("/", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // true en producción con HTTPS
    sameSite: "Lax",
  });

  res.status(200).json(jsonResponse(200, { message: "Session closed" }));
});

module.exports = router;
