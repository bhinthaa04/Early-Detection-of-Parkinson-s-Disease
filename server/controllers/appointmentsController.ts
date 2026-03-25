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
  const {
    patientName,
    phoneNumber,
    reason,
    doctorId,
    date,
    time,
    patientId,
    reportId,
  } = req.body ?? {};

  if (!patientName || !phoneNumber || !doctorId || !date || !time || !patientId) {
    return res.status(400).json({
      error: "patientName, phoneNumber, doctorId, date, time, and patientId are required",
    });
  }

  try {
    await ensureAppointmentTables();

    const bookingId = generateBookingId();

    let linkedReportId = reportId ?? null;
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        bookingId,
        patientId,
        linkedReportId,
        patientName,
        phoneNumber,
        reason ?? null,
        doctorId,
        date,
        time,
      ],
    );

    res.status(201).json({
      success: true,
      bookingId,
      status: "pending",
    });
  } catch (err) {
    console.error("bookAppointment error", err);
    res.status(500).json({ error: "Booking failed" });
  }
}

export async function getAppointmentById(req: Request, res: Response) {
  const bookingId = req.params.bookingId;

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
        a.patient_name,
        a.phone_number,
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
       LEFT JOIN doctors d ON d.doctor_id = a.doctor_id
       LEFT JOIN patient_reports pr ON pr.report_id = a.report_id
       WHERE a.appointment_id = ?
       LIMIT 1`,
      [bookingId],
    );

    const appointment = rows[0];
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error("getAppointmentById error", err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
}
