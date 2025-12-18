import { API_ENDPOINTS } from './api-config';

export interface PredictionResponse {
  prediction: boolean;
  confidence: number;
  stage: 'Early' | 'Mid' | 'Advanced';
  message?: string;
}

export interface DownloadReportResponse {
  url: string;
  filename: string;
}

export const apiService = {
  async predict(imageFile: File, audioFile: File): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('audio', audioFile);

    const response = await fetch(API_ENDPOINTS.predict, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Prediction failed: ${response.statusText}`);
    }

    return response.json();
  },

  async downloadReport(prediction: PredictionResponse): Promise<Blob> {
    const params = new URLSearchParams({
      prediction: prediction.prediction ? 'Yes' : 'No',
      confidence: (prediction.confidence * 100).toFixed(1),
      stage: prediction.stage,
    });

    const response = await fetch(`${API_ENDPOINTS.downloadReport}?${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  },
};
