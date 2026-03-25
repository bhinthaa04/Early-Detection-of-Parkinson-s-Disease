import "dotenv/config";
import mysql from "mysql2/promise";

const dbHost = (process.env.DB_HOST || "127.0.0.1").trim();
const dbPort = Number((process.env.DB_PORT || "3306").trim());
const dbUser = (process.env.DB_USER || "root").trim();
const dbPassword = process.env.DB_PASSWORD || "root";   // your MySQL root password
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
    console.log("✅ Connected to MySQL database successfully");

    // Auto-create patient_tests table if missing
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patient_tests (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        patient_id INT UNSIGNED NOT NULL,
        test_date DATETIME NOT NULL,
        confidence_score DECIMAL(5,2) NOT NULL,
        risk_level VARCHAR(20) NOT NULL,
        result VARCHAR(20) NOT NULL,
        stage VARCHAR(80) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_patient_tests_patient_id (patient_id),
        KEY idx_patient_tests_test_date (test_date),
        CONSTRAINT fk_patient_tests_patient
          FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      )
    `);
    console.log("✅ patient_tests table ready");
  } catch (error) {
    console.error("❌ MySQL connection or table creation failed:", error);
  } finally {
    connection.release();
  }
}

export default pool;
