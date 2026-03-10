import "dotenv/config";
import mysql from "mysql2/promise";

const dbHost = (process.env.DB_HOST || "127.0.0.1").trim();
const dbPort = Number((process.env.DB_PORT || "3307").trim());
const dbUser = (process.env.DB_USER || "root").trim();
const dbPassword = process.env.DB_PASSWORD ?? "";
const dbName = (process.env.DB_NAME || "parkinsons_db").trim();

export const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function checkDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("Connected to MySQL");
  } finally {
    connection.release();
  }
}

export default pool;
