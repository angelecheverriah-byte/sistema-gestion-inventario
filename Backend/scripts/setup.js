const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  // Configuración de conexión flexible para Docker
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "mysql-db",
    user: process.env.DB_USER || "user_dev",
    password: process.env.DB_PASSWORD || "password_dev",
  });

  try {
    console.log("🛠️ Iniciando configuración profesional...");

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    );
    await connection.query(`USE ${process.env.DB_NAME}`);

    // 1. Usuarios (Con Role) - Corregida la coma que faltaba
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'ADMIN') DEFAULT 'USER'
      )
    `);

    // 2. Productos (Precio base en USD para estabilidad)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE, 
        precio_usd DECIMAL(10, 2) NOT NULL,
        cantidad INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. NUEVA: Tabla de Ventas (Para los reportes de Recharts)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT,
        cantidad INT NOT NULL,
        total_usd DECIMAL(10, 2) NOT NULL,
        tasa_bs DECIMAL(10, 2) NOT NULL,
        total_bs DECIMAL(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      )
    `);

    // 4. NUEVA: Tabla de Configuración (Tasa del dólar en Venezuela)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave VARCHAR(50) PRIMARY KEY,
        valor DECIMAL(10, 2) NOT NULL
      )
    `);

    // INSERTAR TASA INICIAL (Solo si no existe)
    await connection.query(
      "INSERT IGNORE INTO configuracion (clave, valor) VALUES ('tasa_dolar', 36.50)",
    );

    // 5. INSERTAR PRODUCTOS SIN DUPLICAR
    // Usamos INSERT IGNORE + nombre UNIQUE para que no se repitan
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
    console.error("❌ Error en setup:", error.message);
  } finally {
    await connection.end();
  }
}

setupDatabase();
