const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  // Configuración de conexión única (específica para scripts de setup)
  const connectionConfig = {
    host: process.env.DB_HOST || "mysql-db",
    user: process.env.DB_USER || "user_dev",
    password: process.env.DB_PASSWORD || "password_dev",
    port: process.env.DB_PORT || 3306,
    // Eliminamos connectionLimit y waitForConnections porque son para Pools, no para conexiones directas
    ssl: {
      rejectUnauthorized: false, // Obligatorio para Aiven
    },
    // Aumentamos el tiempo de espera por si el servidor de Aiven está lento
    connectTimeout: 20000,
  };

  let connection;

  try {
    console.log("🛠️ Intentando conectar a la base de datos...");
    connection = await mysql.createConnection(connectionConfig);

    console.log(
      "✅ Conexión establecida. Iniciando configuración profesional...",
    );

    // Si estás en Aiven, la base de datos suele venir pre-creada (defaultdb)
    // Pero este comando asegura que usemos la que definiste en .env
    if (process.env.DB_NAME) {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
      );
      await connection.query(`USE ${process.env.DB_NAME}`);
    }

    // 1. Usuarios (Corregido y con Role)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'ADMIN') DEFAULT 'USER'
      )
    `);

    // 2. Productos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE, 
        precio_usd DECIMAL(10, 2) NOT NULL,
        cantidad INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Ventas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT,
        cantidad INT NOT NULL,
        total_usd DECIMAL(10, 2) NOT NULL,
        tasa_bs DECIMAL(10, 2) NOT NULL,
        total_bs DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
      )
    `);

    // 4. Configuración (Tasa)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave VARCHAR(50) PRIMARY KEY,
        valor DECIMAL(10, 2) NOT NULL
      )
    `);

    await connection.query(
      "INSERT IGNORE INTO configuracion (clave, valor) VALUES ('tasa_dolar', 36.50)",
    );

    // 5. Productos Iniciales
    const productosIniciales = [
      ["Laptop", 1300.5, 10],
      ["Mouse Bluetooth", 47.0, 50],
      ["Teclado", 79.99, 30],
      ["Monitor", 320.0, 15],
      ["Speakers", 59.1, 34],
      ["Auriculares", 23.5, 80],
    ];

    for (const p of productosIniciales) {
      await connection.query(
        "INSERT IGNORE INTO productos (nombre, precio_usd, cantidad) VALUES (?, ?, ?)",
        p,
      );
    }

    console.log("🚀 ¡Base de datos lista para el Portafolio!");
  } catch (error) {
    // Si el error es ENOTFOUND, damos un mensaje más claro
    if (error.code === "ENOTFOUND") {
      console.error(
        "❌ ERROR: No se encontró el host. Revisa que DB_HOST en Render coincida con Aiven.",
      );
    } else {
      console.error("❌ Error en setup:", error.message);
    }
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
