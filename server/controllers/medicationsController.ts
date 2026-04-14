import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db";

let medicationsTableEnsured = false;

async function ensureMedicationsTable() {
  if (medicationsTableEnsured) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS medications (
      medication_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      patient_id INT UNSIGNED NOT NULL,
      medicine_name VARCHAR(160) NOT NULL,
      dosage VARCHAR(80) NULL,
      frequency VARCHAR(80) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (medication_id),
      KEY idx_medications_patient_id (patient_id),
      CONSTRAINT fk_medications_patient
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  medicationsTableEnsured = true;
}

export async function addMedication(req: Request, res: Response) {
  const body = req.body ?? {};
  const patientId = Number(body.patientId ?? body.patient_id);
  const medicineName =
    (typeof body.medicine_name === "string" && body.medicine_name.trim()) ||
    (typeof body.medicineName === "string" && body.medicineName.trim()) ||
    "";
  const dosage = typeof body.dosage === "string" && body.dosage.trim() ? body.dosage.trim() : null;
  const frequency = typeof body.frequency === "string" && body.frequency.trim() ? body.frequency.trim() : null;

  if (!patientId || Number.isNaN(patientId) || !medicineName) {
    return res.status(400).json({ error: "patientId and medicine_name are required" });
  }

  try {
    await ensureMedicationsTable();

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO medications (patient_id, medicine_name, dosage, frequency)
       VALUES (?, ?, ?, ?)`,
      [patientId, medicineName, dosage, frequency],
    );

    res.status(201).json({
      medication_id: result.insertId,
      patient_id: patientId,
      medicine_name: medicineName,
      dosage,
      frequency,
    });
  } catch (err) {
    console.error("addMedication error", err);
    res.status(500).json({ error: "failed to add medication" });
  }
}

export async function getMedications(req: Request, res: Response) {
  const patientId = Number(req.query.patientId ?? req.query.patient_id);
  if (!patientId || Number.isNaN(patientId)) {
    return res.status(400).json({ error: "patientId query param is required" });
  }

  try {
    await ensureMedicationsTable();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT medication_id, patient_id, medicine_name, dosage, frequency, created_at
       FROM medications
       WHERE patient_id = ?
       ORDER BY created_at DESC, medication_id DESC`,
      [patientId],
    );

    res.json(rows);
  } catch (err) {
    console.error("getMedications error", err);
    res.status(500).json({ error: "failed to fetch medications" });
  }
}
