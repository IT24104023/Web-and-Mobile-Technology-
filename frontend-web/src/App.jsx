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
import PatientSettings from "./pages/PatientSettings.jsx";
import PatientFeedback from "./pages/PatientFeedback.jsx";
import AdminEmergencyContacts from "./pages/AdminEmergencyContacts.jsx";
import DoctorEmergencyContacts from "./pages/DoctorEmergencyContacts.jsx";

import PatientAppointmentsPage from "./pages/PatientAppointmentsPage.jsx";

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans'] text-slate-800 dark:text-white">
    <h1 className="text-6xl font-bold mb-4 text-cyan-600">404</h1>
    <p className="text-xl mb-6">The page you are looking for does not exist or is under construction.</p>
    <a href="/" className="px-6 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-medium transition-colors">
      Return to Home
    </a>
  </div>
);

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
      <Route path="/patient/feedback" element={<PatientFeedback />} />
      <Route path="/patient/settings" element={<PatientSettings />} />
      
      {/* Appointments */}
      <Route path="/patient/appointments/book" element={<PatientAppointmentsPage />} />
      <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
      
      {/* Fallback Routes for Unimplemented Pages */}
      <Route path="/patient/medical-resource" element={<PatientDashboard />} />
      <Route path="/patient/e-payment" element={<PatientDashboard />} />

      <Route path="/admin/emergency-contacts" element={<AdminEmergencyContacts />} />
      <Route path="/doctor/emergency-contacts" element={<DoctorEmergencyContacts />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
