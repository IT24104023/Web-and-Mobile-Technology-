import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ─── Determine base URL ───────────────────────────────────────────────────────
const getApiBaseUrl = () => {
  // 1. If app.json extra.apiBaseUrl is set, use it (works for physical devices)
  const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra;
  if (extra?.apiBaseUrl) {
    return `${extra.apiBaseUrl}/api`;
  }

  // 2. Expo Go on device – read the bundler host
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:5000/api`;
  }

  // 3. Android emulator default
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 4. iOS simulator / web
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('[API] Base URL:', API_BASE_URL);

// ─── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('[API] Error reading token:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('userToken');
      } catch (e) {
        console.error('[API] Error clearing token:', e);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  register: (userData) => api.post('/auth/register', userData),
  getSettings: () => api.get('/auth/patient/settings'),
  updateSettings: (data) => api.put('/auth/patient/settings', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getDoctors: () => api.get('/auth/users?role=doctor'),
};

// ─── Patient API ──────────────────────────────────────────────────────────────
export const patientAPI = {
  getAppointments: () => api.get('/appointments/my-appointments'),
  bookAppointment: (data) => api.post('/appointments/book', data),
  cancelAppointment: (id) => api.put(`/appointments/cancel/${id}`),
  getStats: () => api.get('/appointments/stats'),
};

// ─── Emergency Contact API ────────────────────────────────────────────────────
export const emergencyAPI = {
  getContacts: () => api.get('/emergency'),
  addContact: (data) => api.post('/emergency', data),
  updateContact: (id, data) => api.put(`/emergency/${id}`, data),
  deleteContact: (id) => api.delete(`/emergency/${id}`),
  setPrimary: (id) => api.patch(`/emergency/${id}/set-primary`),
};

// ─── Doctor API ───────────────────────────────────────────────────────────────
export const doctorAPI = {
  getAppointments: () => api.get('/appointments/doctor-appointments'),
  confirmAppointment: (id) => api.put(`/appointments/confirm/${id}`),
  completeAppointment: (id) => api.put(`/appointments/complete/${id}`),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAllAppointments: (params) => api.get('/appointments/all', { params }),
  updateAppointment: (id, data) => api.put(`/appointments/admin/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/admin/${id}`),
};

export default api;
