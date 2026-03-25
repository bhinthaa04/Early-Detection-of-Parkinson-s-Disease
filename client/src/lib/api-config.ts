const isBrowser = typeof window !== 'undefined';
const envBackendUrl = import.meta.env.VITE_BACKEND_URL;

const defaultBackendUrl = isBrowser ? window.location.origin : 'http://localhost:5000';

// In development, we want the frontend to call the same origin by default.
// This avoids hardcoded IPs like 192.168.x.x and works when the app is served from localhost:5000.
let BACKEND_URL = envBackendUrl ?? defaultBackendUrl;

export const API_BASE_URL = BACKEND_URL;

export function getBackendURL() {
  return BACKEND_URL;
}

export const API_ENDPOINTS = {
  patients: `${BACKEND_URL}/api/patients`,
  doctors: `${BACKEND_URL}/api/doctors`,
  predictions: `${BACKEND_URL}/api/predictions`,
  reports: `${BACKEND_URL}/api/reports`,
  patientTests: `${BACKEND_URL}/api/patient-tests`,
  appointmentsBook: `${BACKEND_URL}/api/appointments/book`,
  appointmentsBase: `${BACKEND_URL}/api/appointments`,
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
  API_ENDPOINTS.patientTests = `${url}/api/patient-tests`;
  API_ENDPOINTS.appointmentsBook = `${url}/api/appointments/book`;
  API_ENDPOINTS.appointmentsBase = `${url}/api/appointments`;
  API_ENDPOINTS.predict = `${url}/predict`;
  API_ENDPOINTS.downloadReport = `${url}/download-report`;
  API_ENDPOINTS.generateReport = `${url}/generate-report`;
}
