const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDatabase() {
  console.log("--- Iniciando Script de Base de Datos ---");

  // Usamos la URL completa (más fiable) o los datos sueltos
  const connectionConfig = process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };

  try {
    console.log("Intentando conectar...");
    // createConnection es mejor para scripts rápidos que createPool
    const connection = await mysql.createConnection(connectionConfig);
    console.log("✅ Conexión exitosa para inicialización.");

    // AQUÍ VAN TUS TABLAS (Ejemplo, asegúrate que coincidan con las tuyas)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'ADMIN') DEFAULT 'USER'
      )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS productos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL UNIQUE, 
            precio DECIMAL(10, 2) NOT NULL,
            cantidad INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

    // 2. Usamos INSERT IGNORE
    // Esto evitará que se dupliquen si el nombre ya existe
    await connection.query(`
        INSERT IGNORE INTO productos (nombre, precio, cantidad) VALUES 
            ('Producto Inicial', 100.00, 10),
            ('Laptop', 1300.50, 10),
            ('MouseBluetooh', 47.00, 50),
            ('Teclado', 79.99, 30),
            ('Monitor', 320.00, 15),
            ('Audifonos', 110.00, 25)
`);

    console.log("✅ Tablas verificadas/creadas correctamente.");
    await connection.end();
    process.exit(0); // Todo salió bien
  } catch (error) {
    console.error("❌ Error en setup.js:", error.message);
    if (error.code === "ENOTFOUND") {
      console.error(
        "CONSEJO: Asegúrate de que DATABASE_URL en Railway sea la URL PÚBLICA de MySQL.",
      );
    }
    process.exit(1); // Error
  }
}

setupDatabase();
