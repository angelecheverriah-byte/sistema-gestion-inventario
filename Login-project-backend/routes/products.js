const router = require("express").Router();
const authenticate = require("../Middleware/authenticate");
const db = require("../conexion/dataBase");
const isAdmin = require("../Middleware/isAdmin");
const { jsonResponse } = require("../conexion/jsonResponse");

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *       properties:
 *         nombre:
 *           type: string
 *         precio:
 *           type: number
 *         cantidad:
 *           type: integer
 * tags:
 *   - name: Productos
 *     description: Gestión del inventario
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           description: Página (empieza en 0)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           description: Cantidad por página
 *     responses:
 *       200:
 *         description: Lista obtenida exitosamente
 */
router.get("/", authenticate, async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 5;
  const offset = page * limit;

  try {
    const [rows] = await db.query(
      "SELECT * FROM productos ORDER BY id ASC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    const [totalRows] = await db.query(
      "SELECT COUNT(*) as total FROM productos",
    );
    const total = totalRows[0].total;

    res.json({
      body: {
        items: rows,
        total: total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(jsonResponse({ error: "Error en el servidor" }));
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear producto
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       201:
 *         description: Creado con éxito
 *       403:
 *         description: Solo administradores
 */
router.post("/", authenticate, isAdmin, async (req, res) => {
  const { nombre, precio, cantidad } = req.body;

  if (!nombre || !precio || !cantidad) {
    return res
      .status(400)
      .json(jsonResponse(400, { error: "Todos los campos son obligatorios" }));
  }

  try {
    await db.query(
      "INSERT INTO productos (nombre, precio, cantidad) VALUES (?, ?, ?)",
      [nombre, precio, cantidad],
    );
    res
      .status(201)
      .json(jsonResponse(201, { message: "Producto creado con éxito" }));
  } catch (error) {
    res
      .status(500)
      .json(jsonResponse(500, { error: "Error al crear el producto" }));
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *     responses:
 *       200:
 *         description: Actualizado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.put("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, cantidad } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE productos SET nombre = ?, precio = ?, cantidad = ? WHERE id = ?",
      [nombre, precio, cantidad, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(jsonResponse(404, { error: "Producto no encontrado" }));
    }

    res
      .status(200)
      .json(
        jsonResponse(200, { message: "Producto actualizado correctamente" }),
      );
  } catch (error) {
    res
      .status(500)
      .json(jsonResponse(500, { error: "Error al actualizar el producto" }));
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM productos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(jsonResponse(404, { error: "Producto no encontrado" }));
    }
    res
      .status(200)
      .json(jsonResponse(200, { message: "Producto eliminado correctamente" }));
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json(jsonResponse(500, { error: "Error al eliminar el producto" }));
  }
});

module.exports = router;
