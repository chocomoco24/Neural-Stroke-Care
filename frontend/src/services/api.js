import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout if token expires
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('nsc_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authService = {
  login:  (userType, email, password) =>
    api.post('/auth/login', { email, password, userType }),

  signup: (userType, data) =>
    api.post('/auth/signup', { ...data, userType }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nsc_user');
  },

  me: () => api.get('/auth/me'),
};

// ── Prediction ────────────────────────────────────────
export const predictionService = {
  predict: (data) => api.post('/predict', data),
};

// ── Dashboard ─────────────────────────────────────────
export const dashboardService = {
  patientDashboard: () => api.get('/dashboard/patient'),
  doctorDashboard:  () => api.get('/dashboard/doctor'),
};

// ── Doctors ───────────────────────────────────────────
export const doctorService = {
  list:               (params) => api.get('/doctors', { params }),
  toggleAvailability: (data)   => api.post('/doctors/toggle-availability', data),
  specializations:    ()       => api.get('/doctors/specializations'),
};

// ── Patients ──────────────────────────────────────────
export const patientService = {
  records: () => api.get('/patients'),
};

// ── History ───────────────────────────────────────────
export const historyService = {
  list: () => api.get('/predict/history'),
};

// ── Hospitals ─────────────────────────────────────────
export const hospitalService = {
  nearby: (lat, lon) => api.get('/hospitals', { params: { lat, lon } }),
};

export default api;
