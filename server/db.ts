import "dotenv/config";
import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3307",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "parkinsons_db",
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function pingDb() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
