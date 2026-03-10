import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { Router } from "express";
import pool from "../db.js";

const router = Router();
const scrypt = promisify(scryptCallback);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

router.post("/", async (req, res) => {
  const { full_name, name, email, password, specialization, hospital_name } = req.body ?? {};
  const doctorName = full_name ?? name;

  if (!doctorName || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  try {
    const passwordHash = await hashPassword(password);

    const [result] = await pool.execute(
      `INSERT INTO doctors (full_name, email, password_hash, specialization, hospital_name)
       VALUES (?, ?, ?, ?, ?)`,
      [doctorName, email, passwordHash, specialization ?? null, hospital_name ?? null],
    );

    res.status(201).json({
      message: "Doctor created successfully",
      doctor_id: result.insertId,
    });
  } catch (error) {
    console.error("Failed to create doctor:", error);

    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Doctor email already exists" });
    }

    res.status(500).json({ error: "Failed to create doctor" });
  }
});

export default router;
