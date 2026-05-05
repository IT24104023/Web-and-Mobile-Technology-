import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dent_ai_token");
      localStorage.removeItem("dent_ai_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const loginUser = (payload) => api.post("/auth/login", payload);
export const registerUser = (payload) => api.post("/auth/register", payload);
export const getPatientSettings = (token) => 
  api.get("/auth/patient/settings", {
    headers: { Authorization: `Bearer ${token}` }
  });
export const updatePatientSettings = (payload, token) =>
  api.put("/auth/patient/settings", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const deactivateAccount = (token) =>
  api.put("/auth/deactivate", {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const deleteAccount = (token) =>
  api.delete("/auth/delete", {
    headers: { Authorization: `Bearer ${token}` }
  });

// Appointments
export const getPatientAppointments = (token) =>
  api.get("/appointments/my-appointments", {
    headers: { Authorization: `Bearer ${token}` }
  });

// Feedback
export const getMyFeedbacks = (token) =>
  api.get("/feedback/my", {
    headers: { Authorization: `Bearer ${token}` }
  });
export const getClinicReviews = (token) =>
  api.get("/feedback/clinic-reviews", {
    headers: { Authorization: `Bearer ${token}` }
  });
export const submitFeedback = (payload, token) =>
  api.post("/feedback", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
export const deleteFeedback = (id, token) =>
  api.delete(`/feedback/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Emergency Contacts
export const getMyEmergencyContacts = (token) =>
  api.get("/emergency/my", {
    headers: { Authorization: `Bearer ${token}` }
  });
export const syncEmergencyContacts = (payload, token) =>
  api.put("/emergency/my", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });

export default api;
