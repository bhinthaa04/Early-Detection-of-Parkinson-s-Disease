import { API_ENDPOINTS } from './api-config';
import type { PatientData } from './patient-data';

export interface PredictionResponse {
  prediction: boolean;
  confidence: number;
  stage: string;
  message?: string;
}

export interface DownloadReportResponse {
  url: string;
  filename: string;
}

export interface GenerateReportPayload extends PatientData {
  test_type: string;
  input_data: string;
  test_date_time: string;
  test_id?: string;
  status: string;
  confidence_score: number;
  disease_stage: string;
  risk_level: string;
  interpretation?: string;
  analysis_time_seconds?: number;
  voice_duration_seconds?: number;
  model_version?: string;
  image_file_name?: string;
  image_file_size?: number;
  voice_file_name?: string;
  voice_file_size?: number;
  ai_model_type?: string;
  ai_features?: string;
  recommendations?: string[];
  lifestyle_tips?: string[];
  symptom_checklist?: {
    tremor?: string;
    slurred_speech?: string;
    handwriting_difficulty?: string;
    fatigue?: string;
    balance_issues?: string;
  };
  baseline_comparison?: {
    voice_stability?: string;
    handwriting_smoothness?: string;
  };
  previous_test?: {
    date?: string;
    prediction?: string;
    trend?: string;
  };
  doctor_notes?: string;
  report_generated_at?: string;
  generated_by?: string;
  report_format?: string;
  report_language?: string;
  privacy_notice?: string;
  verification_url?: string;
}

export interface CreatePatientPayload {
  name: string;
  age?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface CreatePredictionPayload {
  patientId: number;
  doctorId: number;
  spiralImagePath: string;
  audioFilePath: string;
  predictionResult: string;
  confidenceScore?: number;
  diseaseStage?: string;
}

export interface CreateReportPayload {
  predictionId: number;
  reportSummary: string;
  precautions?: string;
  recommendedTherapy?: string;
}

export interface PatientTestRecord {
  id: number;
  patient_id: number;
  test_date: string;
  confidence_score: number;
  risk_level: string;
  result: string;
  stage?: string | null;
  created_at: string;
}

export interface CreatePatientTestPayload {
  patientId: number;
  testDate: string;
  confidenceScore: number;
  riskLevel: string;
  result: string;
  stage?: string;
  testType?: string;
  reportUrl?: string;
}

export interface CreateAppointmentPayload {
  patientName: string;
  phoneNumber: string;
  reason: string;
  doctorId: number;
  date: string;
  time: string;
  patientId: number;
  reportId?: number | null;
}

export interface AppointmentResponse {
  success: boolean;
  bookingId: string;
  status: "pending" | "confirmed";
}

export interface AppointmentDetails {
  bookingId: string;
  patient_id: number;
  report_id: number | null;
  patient_name: string;
  phone_number: string;
  visit_reason: string | null;
  doctor_id: number;
  appointment_date: string;
  time_slot: string;
  status: "pending" | "confirmed";
  created_at: string;
  doctor_name?: string | null;
  prediction_result?: string | null;
  stage?: string | null;
  confidence_score?: number | null;
  patient_email?: string | null;
}

export const apiService = {
  async createPatient(payload: CreatePatientPayload): Promise<number> {
    const response = await fetch(API_ENDPOINTS.patients, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Patient Error: HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json() as { patientId: number };
    return data.patientId;
  },

  async ensureDefaultDoctor(): Promise<number> {
    const cached = window.localStorage.getItem('defaultDoctorId');
    if (cached) {
      const parsed = Number(cached);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    const response = await fetch(API_ENDPOINTS.doctors, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'NeuroScan Auto Doctor',
        email: 'autosave-doctor@neuroscan.local',
        password: 'autosave-doctor',
        specialization: 'Neurologist',
        hospital_name: 'NeuroScan AI',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Doctor Error: HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json() as { doctorId: number };
    window.localStorage.setItem('defaultDoctorId', String(data.doctorId));
    return data.doctorId;
  },

  async createPrediction(payload: CreatePredictionPayload): Promise<number> {
    const response = await fetch(API_ENDPOINTS.predictions, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Prediction Save Error: HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json() as { predictionId: number };
    return data.predictionId;
  },

  async createReport(payload: CreateReportPayload): Promise<number> {
    const response = await fetch(API_ENDPOINTS.reports, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Report Save Error: HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json() as { reportId: number };
    return data.reportId;
  },

  async createPatientTest(payload: CreatePatientTestPayload): Promise<number> {
    const response = await fetch(API_ENDPOINTS.patientTests, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId: payload.patientId,
        patient_id: payload.patientId,
        testDate: payload.testDate,
        test_date: payload.testDate,
        confidence: payload.confidenceScore,
        confidenceScore: payload.confidenceScore,
        confidence_score: payload.confidenceScore,
        riskLevel: payload.riskLevel,
        risk_level: payload.riskLevel,
        result: payload.result,
        stage: payload.stage ?? null,
        test_type: payload.testType ?? "Multimodal",
        report_url: payload.reportUrl ?? null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Patient Test Error: HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json() as { testId?: number; test_id?: number };
    const testId = data.testId ?? data.test_id;
    if (!testId) {
      throw new Error("Patient Test Error: Invalid response from server.");
    }
    return testId;
  },

  async getPatientTests(patientId: number, limit?: number): Promise<PatientTestRecord[]> {
    const params = new URLSearchParams();
    params.set('patientId', String(patientId));
    params.set('patient_id', String(patientId));
    if (limit && Number.isFinite(limit)) {
      params.set('limit', String(limit));
    }

    const response = await fetch(`${API_ENDPOINTS.patientTests}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Patient Test Fetch Error: HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    return response.json() as Promise<PatientTestRecord[]>;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<AppointmentResponse> {
    const requestAppointment = async (url: string): Promise<AppointmentResponse> => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Appointment Error: HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      if (!contentType.includes("application/json")) {
        const bodyPreview = (await response.text().catch(() => "")).slice(0, 120);
        throw new Error(`Appointment Error: Expected JSON but received non-JSON response. ${bodyPreview}`);
      }

      return response.json() as Promise<AppointmentResponse>;
    };

    try {
      return await requestAppointment(API_ENDPOINTS.appointmentsCreate);
    } catch (error) {
      try {
        return await requestAppointment(API_ENDPOINTS.appointmentsBook);
      } catch {
        // Ignore compatibility fallback error and continue to localhost fallback.
      }
      // Common local-dev case: frontend-only server on :5000 returns HTML for /api routes.
      try {
        const fallbackUrl = "http://127.0.0.1:5001/api/appointments/book";
        if (API_ENDPOINTS.appointmentsCreate !== fallbackUrl) {
          return await requestAppointment(fallbackUrl);
        }
      } catch {
        // Ignore fallback error and rethrow original.
      }

      const message = error instanceof Error ? error.message : "Failed to create appointment";
      throw new Error(message);
    }
  },

  async getAppointmentByBookingId(bookingId: string): Promise<AppointmentDetails> {
    const requestAppointment = async (url: string): Promise<AppointmentDetails> => {
      const response = await fetch(url, {
        method: "GET",
      });

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Appointment Fetch Error: HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      if (!contentType.includes("application/json")) {
        const bodyPreview = (await response.text().catch(() => "")).slice(0, 120);
        throw new Error(`Appointment Fetch Error: Expected JSON but received non-JSON response. ${bodyPreview}`);
      }

      return response.json() as Promise<AppointmentDetails>;
    };

    const primaryUrl = `${API_ENDPOINTS.appointmentsBase}/${encodeURIComponent(bookingId)}`;

    try {
      return await requestAppointment(primaryUrl);
    } catch (error) {
      try {
        const fallbackUrl = `http://127.0.0.1:5001/api/appointments/${encodeURIComponent(bookingId)}`;
        if (primaryUrl !== fallbackUrl) {
          return await requestAppointment(fallbackUrl);
        }
      } catch {
        // Ignore fallback error and rethrow original.
      }

      const message = error instanceof Error ? error.message : "Failed to fetch appointment";
      throw new Error(message);
    }
  },

  async predict(imageFile: File, audioFile: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('audio', audioFile);

    const requestPredict = async (url: string) => {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      return response.json() as Promise<PredictionResponse>;
    };

    try {
      return await requestPredict(API_ENDPOINTS.predict);
    } catch (error) {
      // If user configured a different backend URL and it fails (CORS/network),
      // retry against same-origin Express proxy endpoint.
      try {
        const primary = new URL(API_ENDPOINTS.predict, window.location.origin);
        if (primary.origin !== window.location.origin) {
          return await requestPredict('/predict');
        }
      } catch {
        // Ignore URL parsing issues and continue with original error.
      }

      const message = error instanceof Error ? error.message : 'Failed to analyze';
      throw new Error(`Backend Error: ${message}. Check if backend is running at ${API_ENDPOINTS.predict}`);
    }
  },

  async downloadReport(prediction: PredictionResponse, patientData?: Partial<PatientData>): Promise<Blob> {
    const params = new URLSearchParams();
    params.set('prediction', prediction.prediction ? 'Yes' : 'No');
    params.set('confidence', (prediction.confidence * 100).toFixed(1));
    params.set('stage', prediction.stage);

    if (patientData?.name) params.set('patient_name', patientData.name);
    if (patientData?.age) params.set('age', patientData.age);
    if (patientData?.gender) params.set('gender', patientData.gender);
    if (patientData?.patient_id) params.set('patient_id', patientData.patient_id);

    try {
      const response = await fetch(`${API_ENDPOINTS.downloadReport}?${params}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download';
      throw new Error(`Download Error: ${message}`);
    }
  },

  async generateReport(payload: GenerateReportPayload): Promise<Blob> {
    try {
      const response = await fetch(API_ENDPOINTS.generateReport, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate report';
      throw new Error(`Report Error: ${message}`);
    }
  },
};
