import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

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

export default api;
