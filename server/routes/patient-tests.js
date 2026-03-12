import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
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
    const [insertResult] = await pool.execute(
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

    res.status(201).json({
      message: "Patient test stored successfully",
      test_id: insertResult.insertId,
    });
  } catch (error) {
    console.error("Failed to store patient test:", error);

    if (error && error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid patient_id" });
    }

    res.status(500).json({ error: "Failed to store patient test" });
  }
});

router.get("/", async (req, res) => {
  const patientId = Number(req.query.patient_id);
  const limit = Number(req.query.limit);

  if (!patientId || Number.isNaN(patientId)) {
    return res.status(400).json({ error: "patient_id query param is required" });
  }

  const limitClause = Number.isFinite(limit) && limit > 0 ? "LIMIT ?" : "";
  const params = [patientId];
  if (limitClause) params.push(limit);

  try {
    const [rows] = await pool.execute(
      `SELECT id, patient_id, test_date, confidence_score, risk_level, result, stage, created_at
       FROM patient_tests
       WHERE patient_id = ?
       ORDER BY test_date DESC, id DESC
       ${limitClause}`,
      params,
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Failed to fetch patient tests:", error);
    res.status(500).json({ error: "Failed to fetch patient tests" });
  }
});

export default router;
