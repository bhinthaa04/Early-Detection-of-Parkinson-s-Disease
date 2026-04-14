import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

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

export async function getAllPatients(req: Request, res: Response) {
  const page = toPositiveInt(req.query.page);
  const limit = toPositiveInt(req.query.limit);
  const usePagination = page !== null && limit !== null;

  const baseSelect = `
    SELECT
      p.patient_id,
      p.full_name AS name,
      p.age,
      p.gender,
      p.phone,
      p.email,
      p.address,
      p.created_at,
      (
        SELECT pt.risk_level
        FROM patient_tests pt
        WHERE pt.patient_id = p.patient_id
        ORDER BY pt.test_date DESC, pt.id DESC
        LIMIT 1
      ) AS risk_level
    FROM patients p
  `;

  try {
    if (usePagination && page && limit) {
      const offset = (page - 1) * limit;

      const [countRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS total FROM patients`,
        [],
      );
      const total = Number(countRows[0]?.total ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const [rows] = await pool.execute<RowDataPacket[]>(
        `${baseSelect}
         ORDER BY p.patient_id DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [],
      );

      return res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `${baseSelect}
       ORDER BY p.patient_id DESC`,
      [],
    );

    res.json(rows);
  } catch (err) {
    console.error("getAllPatients error", err);
    res.status(500).json({ error: "failed to fetch patients" });
  }
}

export async function getPatientById(req: Request, res: Response) {
  const patientId = Number(req.params.id);
  if (!patientId || Number.isNaN(patientId)) {
    return res.status(400).json({ error: "invalid patient id" });
  }

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        p.patient_id,
        p.full_name AS name,
        p.age,
        p.gender,
        p.phone,
        p.email,
        p.address,
        p.created_at,
        (
          SELECT pt.risk_level
          FROM patient_tests pt
          WHERE pt.patient_id = p.patient_id
          ORDER BY pt.test_date DESC, pt.id DESC
          LIMIT 1
        ) AS risk_level
       FROM patients p
       WHERE p.patient_id = ?
       LIMIT 1`,
      [patientId],
    );

    const patient = rows[0];
    if (!patient) {
      return res.status(404).json({ error: "patient not found" });
    }

    res.json(patient);
  } catch (err) {
    console.error("getPatientById error", err);
    res.status(500).json({ error: "failed to fetch patient" });
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
