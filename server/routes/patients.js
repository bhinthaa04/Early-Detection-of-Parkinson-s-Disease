import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { full_name, name, age, gender, phone, email, address } = req.body ?? {};
  const patientName = full_name ?? name;

  if (!patientName) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO patients (full_name, age, gender, phone, email, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patientName,
        age ?? null,
        gender ?? null,
        phone ?? null,
        email ?? null,
        address ?? null,
      ],
    );

    res.status(201).json({
      message: "Patient created successfully",
      patient_id: result.insertId,
    });
  } catch (error) {
    console.error("Failed to create patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT patient_id, full_name AS name, age, gender, phone, email, address, created_at
       FROM patients
       ORDER BY patient_id DESC`,
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

export default router;
