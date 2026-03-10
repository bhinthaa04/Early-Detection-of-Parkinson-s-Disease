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
