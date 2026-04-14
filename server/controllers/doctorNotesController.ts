import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { pool } from "../db";

let doctorNotesTableEnsured = false;

function toMySqlDateTime(rawDate: string): string {
  const parsed = new Date(rawDate);
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return safeDate.toISOString().slice(0, 19).replace("T", " ");
}

async function ensureDoctorNotesTable() {
  if (doctorNotesTableEnsured) return;

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS doctor_notes (
      note_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      patient_id INT UNSIGNED NOT NULL,
      doctor_id INT UNSIGNED NOT NULL,
      note TEXT NOT NULL,
      note_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (note_id),
      KEY idx_doctor_notes_patient_id (patient_id),
      KEY idx_doctor_notes_doctor_id (doctor_id),
      KEY idx_doctor_notes_note_date (note_date),
      CONSTRAINT fk_doctor_notes_patient
        FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_doctor_notes_doctor
        FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
  `);

  doctorNotesTableEnsured = true;
}

export async function addDoctorNote(req: Request, res: Response) {
  const body = req.body ?? {};
  const patientId = Number(body.patientId ?? body.patient_id);
  const doctorId = Number(body.doctorId ?? body.doctor_id);
  const note = typeof body.note === "string" ? body.note.trim() : "";
  const noteDate =
    (typeof body.date === "string" && body.date.trim()) ||
    (typeof body.note_date === "string" && body.note_date.trim()) ||
    new Date().toISOString();
  const normalizedNoteDate = toMySqlDateTime(noteDate);

  if (!patientId || Number.isNaN(patientId) || !doctorId || Number.isNaN(doctorId) || !note) {
    return res.status(400).json({ error: "patientId, doctorId, and note are required" });
  }

  try {
    await ensureDoctorNotesTable();

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO doctor_notes (patient_id, doctor_id, note, note_date)
       VALUES (?, ?, ?, ?)`,
      [patientId, doctorId, note, normalizedNoteDate],
    );

    res.status(201).json({
      noteId: result.insertId,
      patient_id: patientId,
      doctor_id: doctorId,
      note,
      note_date: normalizedNoteDate,
    });
  } catch (err) {
    console.error("addDoctorNote error", err);
    res.status(500).json({ error: "failed to add doctor note" });
  }
}

export async function getDoctorNotes(req: Request, res: Response) {
  const patientId = Number(req.query.patientId ?? req.query.patient_id);

  try {
    await ensureDoctorNotesTable();

    const hasPatientFilter = Number.isFinite(patientId) && patientId > 0;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         dn.note_id,
         dn.patient_id,
         dn.doctor_id,
         d.full_name AS doctor_name,
         p.full_name AS patient_name,
         dn.note,
         dn.note_date,
         dn.created_at
       FROM doctor_notes dn
       LEFT JOIN doctors d ON d.doctor_id = dn.doctor_id
       LEFT JOIN patients p ON p.patient_id = dn.patient_id
       ${hasPatientFilter ? "WHERE dn.patient_id = ?" : ""}
       ORDER BY dn.note_date DESC, dn.note_id DESC`,
      hasPatientFilter ? [patientId] : [],
    );

    res.json(rows);
  } catch (err) {
    console.error("getDoctorNotes error", err);
    res.status(500).json({ error: "failed to fetch doctor notes" });
  }
}
