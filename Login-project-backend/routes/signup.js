const bcrypt = require("bcrypt");
const db = require("../conexion/dataBase");
const { jsonResponse } = require("../conexion/jsonResponse");
const router = require("express").Router();

/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Registro de usuario
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario creado
 *       400:
 *         description: Faltan datos
 *       409:
 *         description: Usuario ya existe
 */
router.post("/", async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json(
      jsonResponse(400, {
        error: "Fields are required",
      }),
    );
  }

  try {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    // Corregido: VALUES en plural es el estándar SQL
    const query =
      "INSERT INTO users (name, username, password) VALUES (?, ?, ?)";

    await db.execute(query, [name, username, hashedPassword]);

    return res
      .status(200)
      .json(jsonResponse(200, { message: "User created successfully" }));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json(jsonResponse(409, { error: "User already exists" }));
    }
    return res.status(500).json(jsonResponse(500, { error: "Internal error" }));
  }
});

module.exports = router;
