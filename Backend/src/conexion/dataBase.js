const mysql = require("mysql2/promise");
require("dotenv").config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Agregamos SSL condicionalmente: si hay un host externo, activamos SSL
  ssl:
    process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "mysql-db"
      ? { rejectUnauthorized: false }
      : false,
};

const pool = mysql.createPool(poolConfig);

pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Successful connection to the MySQL pool");
    connection.release();
  })
  .catch((err) => {
    console.error(
      "❌ Critical error: Could not connect to MySQL:",
      err.message,
    );
    // No hagas process.exit(1) aquí si quieres que el servidor intente reconectar luego
  });

module.exports = pool;
