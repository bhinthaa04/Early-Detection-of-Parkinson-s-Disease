let BACKEND_URL = localStorage.getItem('VITE_BACKEND_URL') || 
                   import.meta.env.VITE_BACKEND_URL || 
                   'http://localhost:5000';

export const API_BASE_URL = BACKEND_URL;

export const API_ENDPOINTS = {
  predict: `${BACKEND_URL}/predict`,
  downloadReport: `${BACKEND_URL}/download-report`,
  generateReport: `${BACKEND_URL}/generate-report`,
};

export function setBackendURL(url: string) {
  BACKEND_URL = url;
  API_ENDPOINTS.predict = `${url}/predict`;
  API_ENDPOINTS.downloadReport = `${url}/download-report`;
  API_ENDPOINTS.generateReport = `${url}/generate-report`;
}
