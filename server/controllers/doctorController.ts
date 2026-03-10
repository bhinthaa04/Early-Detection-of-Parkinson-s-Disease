import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

export async function addDoctor(req: Request, res: Response) {
  const { name, email, password, specialization, hospitalName, hospital_name } = req.body ?? {};
  const hospital = hospitalName ?? hospital_name ?? null;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO doctors (full_name, email, password_hash, specialization, hospital_name)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, specialization ?? null, hospital],
    );

    res.status(201).json({ doctorId: result.insertId });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT doctor_id FROM doctors WHERE email = ? LIMIT 1`,
        [email],
      );
      if (rows[0]?.doctor_id) {
        return res.status(200).json({ doctorId: rows[0].doctor_id, reused: true });
      }
      return res.status(409).json({ error: "email already exists" });
    }
    console.error("addDoctor error", err);
    res.status(500).json({ error: "failed to create doctor" });
  }
}
