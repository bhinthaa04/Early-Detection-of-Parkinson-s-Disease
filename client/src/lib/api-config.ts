function isLocalHost(value: string) {
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

const savedBackendUrl = localStorage.getItem('VITE_BACKEND_URL');
const envBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let BACKEND_URL =
  savedBackendUrl && !(isLocalHost(savedBackendUrl) && !isLocalHost(envBackendUrl))
    ? savedBackendUrl
    : envBackendUrl;

export const API_BASE_URL = BACKEND_URL;

export function getBackendURL() {
  return BACKEND_URL;
}

export const API_ENDPOINTS = {
  patients: `${BACKEND_URL}/api/patients`,
  doctors: `${BACKEND_URL}/api/doctors`,
  predictions: `${BACKEND_URL}/api/predictions`,
  reports: `${BACKEND_URL}/api/reports`,
  predict: `${BACKEND_URL}/predict`,
  downloadReport: `${BACKEND_URL}/download-report`,
  generateReport: `${BACKEND_URL}/generate-report`,
};

export function setBackendURL(url: string) {
  BACKEND_URL = url;
  API_ENDPOINTS.patients = `${url}/api/patients`;
  API_ENDPOINTS.doctors = `${url}/api/doctors`;
  API_ENDPOINTS.predictions = `${url}/api/predictions`;
  API_ENDPOINTS.reports = `${url}/api/reports`;
  API_ENDPOINTS.predict = `${url}/predict`;
  API_ENDPOINTS.downloadReport = `${url}/download-report`;
  API_ENDPOINTS.generateReport = `${url}/generate-report`;
}
