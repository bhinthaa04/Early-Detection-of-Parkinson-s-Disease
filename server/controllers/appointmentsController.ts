import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db";

let tablesEnsured = false;

function generateBookingId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${date}-${random}`;
}

function toPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

async function ensureAppointmentTables() {
  if (tablesEnsured) return;

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

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS appointments (
      appointment_id VARCHAR(20) NOT NULL,
      patient_id INT UNSIGNED NOT NULL,
      report_id INT UNSIGNED NULL,
      patient_name VARCHAR(120) NOT NULL,
      phone_number VARCHAR(30) NOT NULL,
      visit_reason TEXT NULL,
      doctor_id INT UNSIGNED NOT NULL,
      appointment_date DATE NOT NULL,
      time_slot VARCHAR(30) NOT NULL,
      status ENUM('pending', 'confirmed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (appointment_id),
      KEY idx_appointments_patient_id (patient_id),
      KEY idx_appointments_doctor_id (doctor_id),
      KEY idx_appointments_report_id (report_id),
      CONSTRAINT fk_appointments_patient
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_appointments_doctor
        FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
      CONSTRAINT fk_appointments_report
        FOREIGN KEY (report_id) REFERENCES patient_reports (report_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    )
  `);

  tablesEnsured = true;
}

export async function bookAppointment(req: Request, res: Response) {
  const body = req.body ?? {};

  const patientId = Number(body.patientId ?? body.patient_id);
  const doctorId = Number(body.doctorId ?? body.doctor_id);
  const normalizedDate =
    (typeof body.date === "string" && body.date.trim()) ||
    (typeof body.appointment_date === "string" && body.appointment_date.trim()) ||
    "";
  const normalizedTime =
    (typeof body.time === "string" && body.time.trim()) ||
    (typeof body.time_slot === "string" && body.time_slot.trim()) ||
    "";
  const normalizedReason =
    (typeof body.reason === "string" && body.reason.trim()) ||
    (typeof body.visit_reason === "string" && body.visit_reason.trim()) ||
    null;
  const normalizedStatus = typeof body.status === "string" && body.status.trim() ? body.status.trim() : "pending";

  let normalizedPatientName =
    (typeof body.patientName === "string" && body.patientName.trim()) ||
    (typeof body.patient_name === "string" && body.patient_name.trim()) ||
    "";
  let normalizedPhoneNumber =
    (typeof body.phoneNumber === "string" && body.phoneNumber.trim()) ||
    (typeof body.phone_number === "string" && body.phone_number.trim()) ||
    "";

  if (!patientId || Number.isNaN(patientId) || !doctorId || Number.isNaN(doctorId) || !normalizedDate || !normalizedTime) {
    return res.status(400).json({
      error: "patientId, doctorId, date, and time are required",
    });
  }

  try {
    await ensureAppointmentTables();

    const [patientRows] = await pool.execute<RowDataPacket[]>(
      `SELECT full_name, phone FROM patients WHERE patient_id = ? LIMIT 1`,
      [patientId],
    );

    const patient = patientRows[0];
    if (!patient) {
      return res.status(404).json({ error: "patient not found" });
    }

    if (!normalizedPatientName) {
      normalizedPatientName = String(patient.full_name ?? "Unknown Patient");
    }
    if (!normalizedPhoneNumber) {
      normalizedPhoneNumber = String(patient.phone ?? "N/A");
    }

    const bookingId = generateBookingId();

    let linkedReportId = body.reportId ?? body.report_id ?? null;
    if (!linkedReportId) {
      const [latestReportRows] = await pool.execute<RowDataPacket[]>(
        `SELECT report_id
         FROM patient_reports
         WHERE patient_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [patientId],
      );
      linkedReportId = latestReportRows[0]?.report_id ?? null;
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO appointments
       (appointment_id, patient_id, report_id, patient_name, phone_number, visit_reason, doctor_id, appointment_date, time_slot, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        bookingId,
        patientId,
        linkedReportId,
        normalizedPatientName,
        normalizedPhoneNumber,
        normalizedReason,
        doctorId,
        normalizedDate,
        normalizedTime,
        normalizedStatus,
      ],
    );

    res.status(201).json({
      success: true,
      bookingId,
      status: normalizedStatus,
    });
  } catch (err) {
    console.error("bookAppointment error", err);
    res.status(500).json({ error: "Booking failed" });
  }
}

export async function getAllAppointments(req: Request, res: Response) {
  const page = toPositiveInt(req.query.page);
  const limit = toPositiveInt(req.query.limit);
  const usePagination = page !== null && limit !== null;

  try {
    await ensureAppointmentTables();

    const baseQuery = `
      SELECT
        a.appointment_id AS bookingId,
        a.patient_id,
        a.report_id,
        COALESCE(p.full_name, a.patient_name) AS patient_name,
        a.phone_number,
        p.email AS patient_email,
        a.visit_reason,
        a.doctor_id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.created_at,
        d.full_name AS doctor_name,
        pr.prediction_result,
        pr.stage,
        pr.confidence_score
       FROM appointments a
       LEFT JOIN patients p ON p.patient_id = a.patient_id
       LEFT JOIN doctors d ON d.doctor_id = a.doctor_id
       LEFT JOIN patient_reports pr ON pr.report_id = a.report_id
    `;

    if (usePagination && page && limit) {
      const offset = (page - 1) * limit;

      const [countRows] = await pool.execute<RowDataPacket[]>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingCount,
           SUM(CASE WHEN appointment_date = CURDATE() THEN 1 ELSE 0 END) AS todayCount
         FROM appointments`,
        [],
      );

      const total = Number(countRows[0]?.total ?? 0);
      const pendingCount = Number(countRows[0]?.pendingCount ?? 0);
      const todayCount = Number(countRows[0]?.todayCount ?? 0);
      const totalPages = Math.max(1, Math.ceil(total / limit));

      const [rows] = await pool.execute<RowDataPacket[]>(
        `${baseQuery}
         ORDER BY a.created_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [],
      );

      return res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          pendingCount,
          todayCount,
        },
      });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `${baseQuery}
       ORDER BY a.created_at DESC`,
      [],
    );

    res.json(rows);
  } catch (err) {
    console.error("getAllAppointments error", err);
    res.status(500).json({ error: "failed to fetch appointments" });
  }
}

export async function getAppointmentById(req: Request, res: Response) {
  const bookingId = typeof req.params.bookingId === "string" ? req.params.bookingId.trim() : "";

  if (!bookingId) {
    return res.status(400).json({ error: "bookingId is required" });
  }

  try {
    await ensureAppointmentTables();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
        a.appointment_id AS bookingId,
        a.patient_id,
        a.report_id,
        COALESCE(p.full_name, a.patient_name) AS patient_name,
        a.phone_number,
        p.email AS patient_email,
        a.visit_reason,
        a.doctor_id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.created_at,
        d.full_name AS doctor_name,
        pr.prediction_result,
        pr.stage,
        pr.confidence_score
       FROM appointments a
       LEFT JOIN patients p ON p.patient_id = a.patient_id
       LEFT JOIN doctors d ON d.doctor_id = a.doctor_id
       LEFT JOIN patient_reports pr ON pr.report_id = a.report_id
       WHERE a.appointment_id = ?
       LIMIT 1`,
      [bookingId],
    );

    const appointment = rows[0];
    if (!appointment) {
      return res.status(404).json({ error: "appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("getAppointmentById error", err);
    res.status(500).json({ error: "failed to fetch appointment" });
  }
}
