import type { Request, Response } from "express";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import type { RowDataPacket } from "mysql2";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function addDoctor(req: Request, res: Response) {
  const { full_name, name, email, password, specialization, hospital_name } = req.body ?? {};

  const doctorName =
    typeof full_name === "string" && full_name.trim()
      ? full_name.trim()
      : typeof name === "string"
        ? name.trim()
        : "";
  const doctorEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const doctorPassword = typeof password === "string" ? password : "";
  const doctorSpecialization = typeof specialization === "string" ? specialization.trim() : null;
  const doctorHospital = typeof hospital_name === "string" ? hospital_name.trim() : null;

  if (!doctorName || !doctorEmail || !doctorPassword) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  try {
    const passwordHash = await hashPassword(doctorPassword);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO doctors (full_name, email, password_hash, specialization, hospital_name)
       VALUES (?, ?, ?, ?, ?)`,
      [doctorName, doctorEmail, passwordHash, doctorSpecialization, doctorHospital],
    );

    res.status(201).json({ doctorId: result.insertId });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "doctor email already exists" });
    }
    console.error("addDoctor error", err);
    res.status(500).json({ error: "failed to create doctor" });
  }
}

export async function getAllDoctors(req: Request, res: Response) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT doctor_id, full_name AS name, email, specialization, hospital_name, created_at
       FROM doctors
       ORDER BY doctor_id DESC`,
      [],
    );

    res.json(rows);
  } catch (err) {
    console.error("getAllDoctors error", err);
    res.status(500).json({ error: "failed to fetch doctors" });
  }
}
