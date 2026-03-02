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

export const apiService = {
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
