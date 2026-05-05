import { useState, useEffect } from "react";
import PatientSidebar from "../components/PatientSidebar";
import PatientTopNav from "../components/PatientTopNav";
import { getPatientAppointments } from "../services/api";

export default function PatientAppointmentsPage() {
  const token = localStorage.getItem("dent_ai_token");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getPatientAppointments(token);
        if (response.data && response.data.data) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans']">
      <PatientTopNav />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 lg:ml-72 pt-28 px-4 md:px-8 pb-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">My Appointments</h1>
            <p className="text-slate-500 mb-8">View and manage your upcoming and past appointments.</p>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700 mx-auto"></div>
                  <p className="mt-4 text-slate-500">Loading appointments...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">event_busy</span>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No appointments found.</p>
                  <p className="text-slate-500 mt-1">You haven't booked any appointments yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">{apt.service_type || "General Consultation"}</h3>
                        <p className="text-sm text-slate-500">Doctor: {apt.doctor_id?.full_name || "Assigned Doctor"}</p>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {new Date(apt.appointment_date).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-center ${
                          apt.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                          apt.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {apt.status ? apt.status.toUpperCase() : "PENDING"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
