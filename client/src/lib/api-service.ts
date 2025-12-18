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

    try {
      const response = await fetch(API_ENDPOINTS.predict, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze';
      throw new Error(`Backend Error: ${message}. Check if backend is running at ${API_ENDPOINTS.predict}`);
    }
  },

  async downloadReport(prediction: PredictionResponse): Promise<Blob> {
    const params = new URLSearchParams({
      prediction: prediction.prediction ? 'Yes' : 'No',
      confidence: (prediction.confidence * 100).toFixed(1),
      stage: prediction.stage,
    });

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
};
