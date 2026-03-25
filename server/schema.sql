CREATE DATABASE IF NOT EXISTS parkinsons_db;
USE parkinsons_db;

CREATE TABLE IF NOT EXISTS doctors (
  doctor_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  specialization VARCHAR(120) NULL,
  hospital_name VARCHAR(160) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (doctor_id),
  UNIQUE KEY uq_doctors_email (email)
);

CREATE TABLE IF NOT EXISTS patients (
  patient_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  age INT UNSIGNED NULL,
  gender VARCHAR(20) NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(160) NULL,
  address TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (patient_id)
);

CREATE TABLE IF NOT EXISTS predictions (
  prediction_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id INT UNSIGNED NOT NULL,
  doctor_id INT UNSIGNED NOT NULL,
  prediction_result VARCHAR(80) NOT NULL,
  confidence_score DECIMAL(5,2) NULL,
  disease_stage VARCHAR(80) NULL,
  spiral_image_path VARCHAR(255) NOT NULL,
  audio_file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (prediction_id),
  KEY idx_predictions_patient_id (patient_id),
  KEY idx_predictions_doctor_id (doctor_id),
  CONSTRAINT fk_predictions_patient
    FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_predictions_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  report_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  prediction_id INT UNSIGNED NOT NULL,
  report_summary TEXT NOT NULL,
  precautions TEXT NULL,
  recommended_therapy TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id),
  UNIQUE KEY uq_reports_prediction_id (prediction_id),
  CONSTRAINT fk_reports_prediction
    FOREIGN KEY (prediction_id) REFERENCES predictions (prediction_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_tests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id INT UNSIGNED NOT NULL,
  test_date DATETIME NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  result VARCHAR(20) NOT NULL,
  stage VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_patient_tests_patient_id (patient_id),
  KEY idx_patient_tests_test_date (test_date),
  CONSTRAINT fk_patient_tests_patient
    FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

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
);

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
);
