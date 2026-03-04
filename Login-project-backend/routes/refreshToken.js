const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { jsonResponse } = require("../conexion/jsonResponse");
const { generateAccessToken } = require("../libs/generateTokens");

/**
 * @swagger
 * /api/refresh-token:
 *   get:
 *     summary: Renovar token
 *     tags:
 *       - Autenticación
 *     responses:
 *       200:
 *         description: Nuevo token
 *       401:
 *         description: Token inválido
 */
router.get("/", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json(jsonResponse(401, { error: "No token provided" }));
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const userPayload = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };
    const accessToken = generateAccessToken(userPayload);

    return res.status(200).json(
      jsonResponse(200, {
        user: userPayload,
        accessToken: accessToken,
      }),
    );
  } catch (error) {
    return res
      .status(401)
      .json(jsonResponse(401, { error: "Token expired or invalid" }));
  }
});

module.exports = router;
