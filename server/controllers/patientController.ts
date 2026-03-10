import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

export async function addPatient(req: Request, res: Response) {
  const { name, age, gender, phone, email, address } = req.body ?? {};

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO patients (full_name, age, gender, phone, email, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, age ?? null, gender ?? null, phone ?? null, email ?? null, address ?? null],
    );

    res.status(201).json({ patientId: result.insertId });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "email already exists" });
    }
    console.error("addPatient error", err);
    res.status(500).json({ error: "failed to create patient" });
  }
}

export async function getPatientPredictions(req: Request, res: Response) {
  const patientId = Number(req.params.patientId);
  if (Number.isNaN(patientId)) {
    return res.status(400).json({ error: "invalid patientId" });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         p.prediction_id,
         p.prediction_result,
         p.confidence_score,
         p.disease_stage,
         p.created_at AS analysis_date,
         p.spiral_image_path,
         p.audio_file_path,
         d.doctor_id,
         d.full_name AS doctor_name,
         r.report_id,
         r.report_summary,
         r.precautions,
         r.recommended_therapy,
         r.created_at AS report_created_at
       FROM predictions p
       LEFT JOIN doctors d ON p.doctor_id = d.doctor_id
       LEFT JOIN reports r ON p.prediction_id = r.prediction_id
       WHERE p.patient_id = ?
       ORDER BY p.created_at DESC`,
      [patientId],
    );

    res.json({ patientId, predictions: rows });
  } catch (err) {
    console.error("getPatientPredictions error", err);
    res.status(500).json({ error: "failed to fetch prediction history" });
  }
}
