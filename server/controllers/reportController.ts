import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

export async function addReport(req: Request, res: Response) {
  const { predictionId, reportSummary, precautions, recommendedTherapy } = req.body ?? {};

  if (!predictionId || !reportSummary) {
    return res.status(400).json({ error: "predictionId and reportSummary are required" });
  }

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO reports (prediction_id, report_summary, precautions, recommended_therapy)
       VALUES (?, ?, ?, ?)`,
      [predictionId, reportSummary, precautions ?? null, recommendedTherapy ?? null],
    );

    res.status(201).json({ reportId: result.insertId });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "report already exists for this prediction" });
    }
    console.error("addReport error", err);
    res.status(500).json({ error: "failed to create report" });
  }
}
