const { jsonResponse } = require("../conexion/jsonResponse");
const db = require("../conexion/dataBase");
const router = require("express").Router();
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../libs/generateTokens");
const bcrypt = require("bcrypt");

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Éxito
 *       401:
 *         description: Error
 */
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json(
      jsonResponse(400, {
        error: "Fields are required",
      }),
    );
  }

  const query = "SELECT * FROM users WHERE username = ?";
  const [rows] = await db.execute(query, [username]);

  if (rows.length === 0) {
    return res
      .status(401)
      .json(jsonResponse(401, { error: "Username or password incorrect" }));
  }

  const user = rows[0];
  const correctPassword = await bcrypt.compare(password, user.password);

  if (correctPassword) {
    const userPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 60 * 1000,
    });

    res.status(200).json(jsonResponse(200, { user: userPayload, accessToken }));
  } else {
    res
      .status(400)
      .json(jsonResponse(400, { error: "Username or password incorrect" }));
  }
});

module.exports = router;
