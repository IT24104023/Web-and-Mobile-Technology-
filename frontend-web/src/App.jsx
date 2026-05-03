import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import AdminMedicinePage from "./pages/AdminMedicinePage.jsx";
import DoctorPrescriptionPage from "./pages/DoctorPrescriptionPage.jsx";
import PatientMedicationOrderingPage from "./pages/PatientMedicationOrderingPage.jsx";
import PatientEmergencyContacts from "./pages/PatientEmergencyContacts.jsx";
import AdminEmergencyContacts from "./pages/AdminEmergencyContacts.jsx";
import DoctorEmergencyContacts from "./pages/DoctorEmergencyContacts.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Dashboards */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />

      {/* Features */}
      <Route path="/admin/medicines" element={<AdminMedicinePage />} />
      <Route path="/doctor/prescriptions" element={<DoctorPrescriptionPage />} />
      <Route path="/patient/medication-ordering" element={<PatientMedicationOrderingPage />} />
      <Route path="/patient/prescriptions" element={<PatientMedicationOrderingPage />} />
      <Route path="/patient/emergency-contacts" element={<PatientEmergencyContacts />} />
      <Route path="/admin/emergency-contacts" element={<AdminEmergencyContacts />} />
      <Route path="/doctor/emergency-contacts" element={<DoctorEmergencyContacts />} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
