import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db";

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

    res.status(201).json({ testId: insertResult.insertId });
  } catch (err: any) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "invalid patient_id" });
    }
    console.error("addPatientTest error", err);
    res.status(500).json({ error: "failed to create patient test" });
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
