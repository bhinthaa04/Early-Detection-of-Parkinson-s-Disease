import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db";

let patientReportsTableEnsured = false;

async function ensurePatientReportsTable() {
  if (patientReportsTableEnsured) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS patient_reports (
      report_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      patient_id INT UNSIGNED NOT NULL,
      patient_name VARCHAR(120) NOT NULL,
      prediction_result VARCHAR(20) NOT NULL,
      stage VARCHAR(80) NULL,
      confidence_score DECIMAL(5,2) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (report_id),
      KEY idx_patient_reports_patient_id (patient_id),
      KEY idx_patient_reports_created_at (created_at),
      CONSTRAINT fk_patient_reports_patient
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  patientReportsTableEnsured = true;
}

export async function addPatientTest(req: Request, res: Response) {
  const {
    patient_id,
    test_date,
    confidence_score,
    risk_level,
    result,
    stage,
  } = req.body ?? {};

  if (
    !patient_id ||
    !test_date ||
    confidence_score === undefined ||
    confidence_score === null ||
    !risk_level ||
    !result
  ) {
    return res.status(400).json({
      error: "patient_id, test_date, confidence_score, risk_level, and result are required",
    });
  }

  try {
    await ensurePatientReportsTable();

    const [insertResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO patient_tests
        (patient_id, test_date, confidence_score, risk_level, result, stage)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        test_date,
        confidence_score,
        risk_level,
        result,
        stage ?? null,
      ],
    );

    const [patientRows] = await pool.execute<RowDataPacket[]>(
      `SELECT full_name
       FROM patients
       WHERE patient_id = ?
       LIMIT 1`,
      [patient_id],
    );

    const patientName = patientRows[0]?.full_name ?? "Unknown Patient";

    await pool.execute<ResultSetHeader>(
      `INSERT INTO patient_reports
        (patient_id, patient_name, prediction_result, stage, confidence_score)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patient_id,
        patientName,
        result,
        stage ?? null,
        confidence_score,
      ],
    );

    res.status(201).json({ testId: insertResult.insertId });
  } catch (err: any) {
    console.error("Patient Test Save Error:", err);
    res.status(200).json({
      warning: "Prediction generated but test history could not be saved"
    });
  }
}

export async function getAllPatientTests(req: Request, res: Response) {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        pt.id,
        p.full_name AS patient_name,
        pt.test_date,
        pt.result,
        pt.stage,
        pt.confidence_score,
        pt.risk_level
       FROM patient_tests pt
       JOIN patients p ON pt.patient_id = p.patient_id
       ORDER BY pt.test_date DESC, pt.id DESC
       LIMIT 50`,
      [],
    );

    res.json(rows);
  } catch (err) {
    console.error("getAllPatientTests error", err);
    res.status(500).json({ error: "failed to fetch patient tests" });
  }
}

export async function getPatientTests(req: Request, res: Response) {
  const patientId = Number(req.query.patient_id);
  const limit = Number(req.query.limit);

  if (!patientId || Number.isNaN(patientId)) {
    return res.status(400).json({ error: "patient_id query param is required" });
  }

  const limitClause = Number.isFinite(limit) && limit > 0 ? "LIMIT ?" : "";
  const params: Array<number | string> = [patientId];
  if (limitClause) params.push(limit);

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, patient_id, test_date, confidence_score, risk_level, result, stage, created_at
       FROM patient_tests
       WHERE patient_id = ?
       ORDER BY test_date DESC, id DESC
       ${limitClause}`,
      params,
    );

    res.json(rows);
  } catch (err) {
    console.error("getPatientTests error", err);
    res.status(500).json({ error: "failed to fetch patient tests" });
  }
}
