import { promises as fs } from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db";

let patientReportsTableEnsured = false;
let patientTestsTableEnsured = false;

function normalizeRiskLevel(input: unknown, confidenceScore: number, result: string): string {
  if (typeof input === "string" && input.trim()) {
    return input.trim();
  }

  if (Number.isFinite(confidenceScore)) {
    if (confidenceScore >= 80) return "High";
    if (confidenceScore >= 50) return "Moderate";
    return "Low";
  }

  const normalizedResult = result.toLowerCase();
  if (normalizedResult.includes("parkinson") || normalizedResult.includes("positive")) {
    return "High";
  }

  return "Low";
}

function normalizeConfidence(rawConfidence: unknown): number {
  const parsed = Number(rawConfidence);
  if (!Number.isFinite(parsed)) return NaN;
  if (parsed <= 1 && parsed >= 0) return Number((parsed * 100).toFixed(2));
  return Number(parsed.toFixed(2));
}

function toMySqlDateTime(rawDate: string): string {
  const parsed = new Date(rawDate);
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return safeDate.toISOString().slice(0, 19).replace("T", " ");
}

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

async function generatePatientTestReportFile(params: {
  testId: number;
  patientId: number;
  patientName: string;
  result: string;
  stage: string | null;
  confidenceScore: number;
  riskLevel: string;
  testType: string;
  testDate: string;
}): Promise<string> {
  const reportsDir = path.resolve(process.cwd(), "reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const fileName = `report-${params.testId}.pdf`;
  const absolutePath = path.join(reportsDir, fileName);

  const lines = [
    "Parkinson Prediction Test Report",
    `Test ID: ${params.testId}`,
    `Patient ID: ${params.patientId}`,
    `Patient Name: ${params.patientName}`,
    `Result: ${params.result}`,
    `Stage: ${params.stage ?? "N/A"}`,
    `Confidence: ${params.confidenceScore}%`,
    `Risk Level: ${params.riskLevel}`,
    `Test Type: ${params.testType}`,
    `Test Date: ${params.testDate}`,
    `Generated At: ${new Date().toISOString()}`,
  ];

  await fs.writeFile(absolutePath, createSimplePdfBuffer(lines));
  return path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");
}

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

async function ensurePatientTestsTable() {
  if (patientTestsTableEnsured) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS patient_tests (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      patient_id INT UNSIGNED NOT NULL,
      test_date DATETIME NOT NULL,
      confidence_score DECIMAL(5,2) NOT NULL,
      risk_level VARCHAR(20) NOT NULL,
      result VARCHAR(20) NOT NULL,
      stage VARCHAR(80) NULL,
      test_type VARCHAR(80) NULL,
      report_url VARCHAR(500) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_patient_tests_patient_id (patient_id),
      KEY idx_patient_tests_test_date (test_date),
      CONSTRAINT fk_patient_tests_patient
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  const [testTypeColumn] = await pool.execute<RowDataPacket[]>(
    `SHOW COLUMNS FROM patient_tests LIKE 'test_type'`,
    [],
  );
  if (testTypeColumn.length === 0) {
    await pool.execute(`ALTER TABLE patient_tests ADD COLUMN test_type VARCHAR(80) NULL AFTER stage`);
  }

  const [reportUrlColumn] = await pool.execute<RowDataPacket[]>(
    `SHOW COLUMNS FROM patient_tests LIKE 'report_url'`,
    [],
  );
  if (reportUrlColumn.length === 0) {
    await pool.execute(`ALTER TABLE patient_tests ADD COLUMN report_url VARCHAR(500) NULL AFTER test_type`);
  }

  patientTestsTableEnsured = true;
}

export async function addPatientTest(req: Request, res: Response) {
  const body = req.body ?? {};
  const numericPatientId = Number(body.patient_id ?? body.patientId);
  const result = typeof body.result === "string" ? body.result.trim() : "";
  const stage = typeof body.stage === "string" && body.stage.trim() ? body.stage.trim() : null;
  const testType =
    typeof body.test_type === "string" && body.test_type.trim()
      ? body.test_type.trim()
      : typeof body.testType === "string" && body.testType.trim()
        ? body.testType.trim()
        : "Multimodal";
  const testDateRaw =
    (typeof body.test_date === "string" && body.test_date.trim()) ||
    (typeof body.testDate === "string" && body.testDate.trim()) ||
    new Date().toISOString();
  const normalizedTestDate = toMySqlDateTime(testDateRaw);
  const confidenceScore = normalizeConfidence(body.confidence_score ?? body.confidenceScore ?? body.confidence);
  const riskLevel = normalizeRiskLevel(body.risk_level ?? body.riskLevel, confidenceScore, result);
  const requestedReportUrl =
    typeof body.report_url === "string" && body.report_url.trim()
      ? body.report_url.trim()
      : typeof body.reportUrl === "string" && body.reportUrl.trim()
        ? body.reportUrl.trim()
        : null;

  if (!numericPatientId || Number.isNaN(numericPatientId) || !result || Number.isNaN(confidenceScore)) {
    return res.status(400).json({
      error: "patientId/patient_id, result, and confidence are required",
    });
  }

  try {
    await ensurePatientReportsTable();
    await ensurePatientTestsTable();

    const [patientRows] = await pool.execute<RowDataPacket[]>(
      `SELECT full_name FROM patients WHERE patient_id = ? LIMIT 1`,
      [numericPatientId],
    );

    const patientName = patientRows[0]?.full_name;
    if (!patientName) {
      return res.status(404).json({ error: "patient not found" });
    }

    const [insertResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO patient_tests
        (patient_id, test_date, confidence_score, risk_level, result, stage, test_type, report_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numericPatientId,
        normalizedTestDate,
        confidenceScore,
        riskLevel,
        result,
        stage,
        testType,
        requestedReportUrl,
      ],
    );

    const testId = insertResult.insertId;

    const reportUrl =
      requestedReportUrl ||
      (await generatePatientTestReportFile({
        testId,
        patientId: numericPatientId,
        patientName,
        result,
        stage,
        confidenceScore,
        riskLevel,
        testType,
        testDate: normalizedTestDate,
      }));

    if (!requestedReportUrl) {
      await pool.execute<ResultSetHeader>(
        `UPDATE patient_tests SET report_url = ? WHERE id = ?`,
        [reportUrl, testId],
      );
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO patient_reports
        (patient_id, patient_name, prediction_result, stage, confidence_score)
       VALUES (?, ?, ?, ?, ?)`,
      [numericPatientId, patientName, result, stage, confidenceScore],
    );

    res.status(201).json({
      testId,
      patient_id: numericPatientId,
      patient_name: patientName,
      result,
      stage,
      confidence_score: confidenceScore,
      risk_level: riskLevel,
      test_type: testType,
      report_url: reportUrl,
      test_date: normalizedTestDate,
    });
  } catch (err: any) {
    console.error("Patient Test Save Error:", err);
    res.status(500).json({ error: "failed to save patient test history" });
  }
}

export async function getAllPatientTests(req: Request, res: Response) {
  try {
    await ensurePatientTestsTable();

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
        pt.test_type,
        pt.report_url,
        pt.created_at
       FROM patient_tests pt
       JOIN patients p ON pt.patient_id = p.patient_id
       ORDER BY pt.test_date DESC, pt.id DESC`,
      [],
    );

    res.json(rows);
  } catch (err) {
    console.error("getAllPatientTests error", err);
    res.status(500).json({ error: "failed to fetch patient tests" });
  }
}

export async function getPatientTests(req: Request, res: Response) {
  const patientId = Number(req.query.patient_id ?? req.query.patientId);
  const limit = Number(req.query.limit);
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : null;

  if (!patientId || Number.isNaN(patientId)) {
    return res.status(400).json({ error: "patientId or patient_id query param is required" });
  }

  const limitClause = safeLimit ? `LIMIT ${safeLimit}` : "";
  const params: Array<number | string> = [patientId];

  try {
    await ensurePatientTestsTable();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        id,
        patient_id,
        test_date,
        confidence_score,
        risk_level,
        result,
        stage,
        test_type,
        report_url,
        created_at
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
