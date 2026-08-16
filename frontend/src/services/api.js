import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  // Send/receive the httpOnly auth cookie on every request.
  withCredentials: true,
});

// Auto-logout if the session cookie is missing/expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint =
      err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/auth/signup');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('nsc_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authService = {
  login: (userType, email, password) =>
    api.post('/auth/login', { email, password, userType }),

  signup: (userType, data) =>
    api.post('/auth/signup', { ...data, userType }),

  logout: () => api.post('/auth/logout').catch(() => {}),

  me: () => api.get('/auth/me'),
};

// Prediction 
export const predictionService = {
  predict: (data) => api.post('/predict', data),
};

// Dashboard 
export const dashboardService = {
  patientDashboard: () => api.get('/dashboard/patient'),
  doctorDashboard: () => api.get('/dashboard/doctor'),
};

// Doctors 
export const doctorService = {
  list: (params) => api.get('/doctors', { params }),
  toggleAvailability: () => api.post('/doctors/toggle-availability'),
  updateProfile: (data) => api.patch('/doctors/profile', data),
  specializations: () => api.get('/doctors/specializations'),
};

//Patients 
export const patientService = {
  records: () => api.get('/patients'),
};

// History 
export const historyService = {
  list: () => api.get('/predict/history'),
};

// Hospitals
export const hospitalService = {
  nearby: (lat, lon) => api.get('/hospitals', { params: { lat, lon } }),
};

//Appointment
export const appointmentService = {
  request:   (doctorId)         => api.post('/appointments', { doctorId }),
  listDoctor: ()                => api.get('/appointments'),
  listPatient: ()               => api.get('/appointments/mine'),
  update:    (id, status, appointmentDate, appointmentTime) =>
    api.patch(`/appointments/${id}`, { status, appointmentDate, appointmentTime }),
};

export default api;
