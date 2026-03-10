-- Schema for "Hybrid ML Framework for Parkinson's Disease Early Detection"
-- Run with: mysql -u <user> -p < script/mysql_schema.sql

CREATE DATABASE IF NOT EXISTS parkinsons_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE parkinsons_db;

-- Patients: basic demographics and contact
CREATE TABLE IF NOT EXISTS patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  age         TINYINT UNSIGNED,
  gender      ENUM('male','female','other') DEFAULT NULL,
  phone       VARCHAR(20),
  email       VARCHAR(150),
  address     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_patients_email (email)
) ENGINE=InnoDB;

-- Doctors: application users
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  password       CHAR(60) NOT NULL,   -- bcrypt/argon2 hash
  specialization VARCHAR(120),
  hospital_name  VARCHAR(160),
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_doctors_email (email)
) ENGINE=InnoDB;

-- Predictions: ML outputs tied to patient and reviewing doctor
CREATE TABLE IF NOT EXISTS predictions (
  prediction_id     INT AUTO_INCREMENT PRIMARY KEY,
  patient_id        INT NOT NULL,
  doctor_id         INT NULL,
  spiral_image_path VARCHAR(255) NOT NULL,
  audio_file_path   VARCHAR(255) NOT NULL,
  prediction_result ENUM('Parkinson','Normal') NOT NULL,
  confidence_score  DECIMAL(5,4) CHECK (confidence_score BETWEEN 0 AND 1),
  disease_stage     VARCHAR(40),
  analysis_date     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pred_patient (patient_id),
  KEY idx_pred_doctor (doctor_id),
  CONSTRAINT fk_pred_patient FOREIGN KEY (patient_id)
    REFERENCES patients(patient_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_pred_doctor FOREIGN KEY (doctor_id)
    REFERENCES doctors(doctor_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Reports: one report per prediction
CREATE TABLE IF NOT EXISTS reports (
  report_id         INT AUTO_INCREMENT PRIMARY KEY,
  prediction_id     INT NOT NULL UNIQUE,
  report_summary    TEXT NOT NULL,
  precautions       TEXT,
  recommended_therapy TEXT,
  report_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_prediction FOREIGN KEY (prediction_id)
    REFERENCES predictions(prediction_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Sample seed data ----------------------------------------------------------
INSERT INTO patients (name, age, gender, phone, email, address) VALUES
('Alice Carter', 62, 'female', '+1-555-201-1111', 'alice@example.com', '123 Maple St'),
('Brian Lee',    55, 'male',   '+1-555-202-2222', 'brian@example.com', '456 Oak Ave');

INSERT INTO doctors (name, email, password, specialization, hospital_name) VALUES
('Dr. Priya Nair', 'priya.nair@clinic.org', '$2b$10$hashhashhash', 'Neurologist', 'City Neuro Center'),
('Dr. Miguel Soto','miguel.soto@hospital.com', '$2b$10$hashhashhash', 'Movement Disorder', 'Metro Hospital');

INSERT INTO predictions (patient_id, doctor_id, spiral_image_path, audio_file_path,
                         prediction_result, confidence_score, disease_stage, analysis_date)
VALUES
(1, 1, '/uploads/spirals/a1.png', '/uploads/audio/a1.wav', 'Parkinson', 0.91, 'Stage 2', '2026-03-05 10:15:00'),
(2, 2, '/uploads/spirals/b1.png', '/uploads/audio/b1.wav', 'Normal',    0.12, NULL,      '2026-03-05 10:20:00');

INSERT INTO reports (prediction_id, report_summary, precautions, recommended_therapy) VALUES
(1, 'Motor irregularities detected; tremor frequency elevated.', 'Regular exercise; fall-proofing home.', 'Levodopa trial; physiotherapy'),
(2, 'No Parkinsonian indicators detected.', 'Maintain healthy lifestyle.', 'Routine check-up in 12 months');
