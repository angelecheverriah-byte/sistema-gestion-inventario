const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
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
});

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
    process.exit(1);
  });

module.exports = pool;
