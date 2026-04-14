import { promises as fs } from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "../db";

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createSimplePdfBuffer(lines: string[]): Buffer {
  const content = lines
    .map((line, index) => `BT /F1 12 Tf 72 ${760 - index * 20} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets[i + 1] = Buffer.byteLength(pdf, "utf8");
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

async function generateFallbackReport(testId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      pt.id,
      pt.patient_id,
      p.full_name AS patient_name,
      pt.test_date,
      pt.result,
      pt.stage,
      pt.confidence_score,
      pt.risk_level,
      pt.test_type
     FROM patient_tests pt
     JOIN patients p ON p.patient_id = pt.patient_id
     WHERE pt.id = ?
     LIMIT 1`,
    [testId],
  );

  const row = rows[0];
  if (!row) return null;

  const reportsDir = path.resolve(process.cwd(), "reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const fileName = `report-${testId}.pdf`;
  const absolutePath = path.join(reportsDir, fileName);
  const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

  const lines = [
    "Parkinson Prediction Test Report",
    `Test ID: ${row.id}`,
    `Patient ID: ${row.patient_id}`,
    `Patient Name: ${row.patient_name}`,
    `Result: ${row.result ?? "N/A"}`,
    `Stage: ${row.stage ?? "N/A"}`,
    `Confidence: ${row.confidence_score ?? "N/A"}%`,
    `Risk Level: ${row.risk_level ?? "N/A"}`,
    `Test Type: ${row.test_type ?? "Multimodal"}`,
    `Test Date: ${row.test_date ?? "N/A"}`,
    `Generated At: ${new Date().toISOString()}`,
  ];

  await fs.writeFile(absolutePath, createSimplePdfBuffer(lines));
  await pool.execute<ResultSetHeader>(
    `UPDATE patient_tests SET report_url = ? WHERE id = ?`,
    [relativePath, testId],
  );

  return absolutePath;
}

async function resolveAbsoluteReportPath(testId: number): Promise<string | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT report_url FROM patient_tests WHERE id = ? LIMIT 1`,
    [testId],
  );

  const reportUrl = rows[0]?.report_url as string | undefined;
  if (reportUrl && reportUrl.trim()) {
    const absolutePath = path.isAbsolute(reportUrl)
      ? path.resolve(reportUrl)
      : path.resolve(process.cwd(), reportUrl);
    try {
      await fs.access(absolutePath);
      return absolutePath;
    } catch {
      // Fallback below will regenerate and update DB.
    }
  }

  return generateFallbackReport(testId);
}

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

export async function getReportByTestId(req: Request, res: Response) {
  const testId = Number(req.params.testId);
  if (!testId || Number.isNaN(testId)) {
    return res.status(400).send("Invalid test id");
  }

  try {
    const absolutePath = await resolveAbsoluteReportPath(testId);
    if (!absolutePath) {
      return res.status(404).send("Report not found");
    }
    return res.sendFile(absolutePath);
  } catch (err) {
    console.error("getReportByTestId error", err);
    return res.status(404).send("Report not found");
  }
}
