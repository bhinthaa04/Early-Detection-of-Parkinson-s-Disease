import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const {
    patient_id,
    doctor_id,
    prediction_result,
    confidence_score,
    disease_stage,
    spiral_image_path,
    audio_file_path,
  } = req.body ?? {};

  if (
    !patient_id ||
    !doctor_id ||
    !prediction_result ||
    !spiral_image_path ||
    !audio_file_path
  ) {
    return res.status(400).json({
      error:
        "patient_id, doctor_id, prediction_result, spiral_image_path, and audio_file_path are required",
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO predictions
         (patient_id, doctor_id, prediction_result, confidence_score, disease_stage, spiral_image_path, audio_file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        doctor_id,
        prediction_result,
        confidence_score ?? null,
        disease_stage ?? null,
        spiral_image_path,
        audio_file_path,
      ],
    );

    res.status(201).json({
      message: "Prediction stored successfully",
      prediction_id: result.insertId,
    });
  } catch (error) {
    console.error("Failed to create prediction:", error);

    if (error && error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Invalid patient_id or doctor_id" });
    }

    res.status(500).json({ error: "Failed to create prediction" });
  }
});

export default router;
