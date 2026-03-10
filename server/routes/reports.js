import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { prediction_id, report_summary, precautions, recommended_therapy } = req.body ?? {};

  if (!prediction_id || !report_summary) {
    return res.status(400).json({ error: "prediction_id and report_summary are required" });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO reports (prediction_id, report_summary, precautions, recommended_therapy)
       VALUES (?, ?, ?, ?)`,
      [prediction_id, report_summary, precautions ?? null, recommended_therapy ?? null],
    );

    res.status(201).json({
      message: "Report created successfully",
      report_id: result.insertId,
    });
  } catch (error) {
    console.error("Failed to create report:", error);

    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A report already exists for this prediction" });
    }

    if (error && error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid prediction_id" });
    }

    res.status(500).json({ error: "Failed to create report" });
  }
});

router.get("/:patient_id", async (req, res) => {
  const { patient_id } = req.params;

  try {
    const [rows] = await pool.execute(
      `SELECT
          p.patient_id,
          p.full_name AS patient_name,
          p.age,
          p.gender,
          pred.prediction_id,
          pred.prediction_result,
          pred.confidence_score,
          pred.disease_stage,
          pred.spiral_image_path,
          pred.audio_file_path,
          d.doctor_id,
          d.full_name AS doctor_name,
          r.report_id,
          r.report_summary,
          r.precautions,
          r.recommended_therapy,
          r.created_at AS report_created_at
       FROM reports r
       INNER JOIN predictions pred ON pred.prediction_id = r.prediction_id
       INNER JOIN patients p ON p.patient_id = pred.patient_id
       INNER JOIN doctors d ON d.doctor_id = pred.doctor_id
       WHERE p.patient_id = ?
       ORDER BY r.created_at DESC`,
      [patient_id],
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;
