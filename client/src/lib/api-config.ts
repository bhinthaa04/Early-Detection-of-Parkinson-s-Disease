const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const API_BASE_URL = BACKEND_URL;

export const API_ENDPOINTS = {
  predict: `${API_BASE_URL}/predict`,
  downloadReport: `${API_BASE_URL}/download-report`,
};

export function setBackendURL(url: string) {
  Object.assign(API_ENDPOINTS, {
    predict: `${url}/predict`,
    downloadReport: `${url}/download-report`,
  });
}
