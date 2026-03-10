import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

export async function addPrediction(req: Request, res: Response) {
  const {
    patientId,
    doctorId,
    spiralImagePath,
    audioFilePath,
    predictionResult,
    confidenceScore,
    diseaseStage,
  } = req.body ?? {};

  if (!patientId || !doctorId || !spiralImagePath || !audioFilePath || !predictionResult) {
    return res.status(400).json({
      error: "patientId, doctorId, spiralImagePath, audioFilePath, and predictionResult are required",
    });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO predictions
        (patient_id, doctor_id, spiral_image_path, audio_file_path,
         prediction_result, confidence_score, disease_stage)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        doctorId,
        spiralImagePath,
        audioFilePath,
        predictionResult,
        confidenceScore ?? null,
        diseaseStage ?? null,
      ],
    );

    res.status(201).json({ predictionId: result.insertId });
  } catch (err: any) {
    console.error("addPrediction error", err);
    res.status(500).json({ error: "failed to save prediction" });
  }
}
