export interface PatientData {
  name: string;
  age: string;
  gender: string;
  patient_id: string;
  db_patient_id?: number;
  contact: string;
  email: string;
  medical_history: string;
  symptoms: string;
  family_history: string;
  medications: string;
}

export const PATIENT_DATA_SESSION_KEY = "patientData";

export function createPatientId(): string {
  return `PD${Date.now().toString().slice(-8)}`;
}

export function savePatientData(data: PatientData): void {
  sessionStorage.setItem(PATIENT_DATA_SESSION_KEY, JSON.stringify(data));
}

export function readPatientData(): PatientData | null {
  const raw = sessionStorage.getItem(PATIENT_DATA_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PatientData;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function formatReportDateTime(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
