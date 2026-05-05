import { useEffect, useState } from "react";
import PatientSidebar from "../components/PatientSidebar";
import PatientTopNav from "../components/PatientTopNav";
import { getMyFeedbacks, getClinicReviews, deleteFeedback } from "../services/api";

export default function PatientFeedback() {
  const token = localStorage.getItem("dent_ai_token");
  const [loading, setLoading] = useState(true);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [clinicReviews, setClinicReviews] = useState([]);
  const [tab, setTab] = useState("mine");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mine, clinic] = await Promise.all([
        getMyFeedbacks(token),
        getClinicReviews(token)
      ]);
      setMyFeedbacks(mine.data.data || []);
      setClinicReviews(clinic.data.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load feedbacks", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await deleteFeedback(id, token);
      showToast("Feedback deleted");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`material-symbols-outlined text-sm ${s <= rating ? "text-amber-400 fill-1" : "text-slate-300"}`}>
          star
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans']">
      <PatientTopNav />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 lg:ml-72 pt-28 px-4 md:px-8 pb-10">
          <div className="max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Service Feedback</h1>
                <p className="text-slate-500 text-sm">Review your consultations and see what others say about us.</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-fit mb-8">
              <button
                onClick={() => setTab("mine")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "mine" ? "bg-cyan-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                My Feedbacks ({myFeedbacks.length})
              </button>
              <button
                onClick={() => setTab("clinic")}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "clinic" ? "bg-cyan-600 text-white shadow-md" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                Clinic Reviews ({clinicReviews.length})
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined animate-spin text-4xl text-cyan-500">progress_activity</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {(tab === "mine" ? myFeedbacks : clinicReviews).length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">rate_review</span>
                    <p className="text-slate-500 font-medium">No feedback entries found.</p>
                  </div>
                ) : (
                  (tab === "mine" ? myFeedbacks : clinicReviews).map((f) => (
                    <div key={f._id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 font-bold">
                            {(tab === 'mine' ? f.doctorId?.full_name : f.patientId?.full_name)?.[0] || '?'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-white">
                              {tab === 'mine' ? `Dr. ${f.doctorId?.full_name}` : f.patientId?.full_name}
                            </h4>
                            <p className="text-xs text-slate-500">{new Date(f.createdAt).toLocaleDateString()} • Appointment: {f.appointmentId?._id || f.appointmentId}</p>
                          </div>
                        </div>
                        {tab === "mine" && (
                          <button 
                            onClick={() => handleDelete(f._id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">App Usability</p>
                          <StarRating rating={f.appUsabilityRating} />
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{f.appUsabilityComment}"</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consultation</p>
                          <StarRating rating={f.consultationRating} />
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{f.consultationComment}"</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor Service</p>
                          <StarRating rating={f.doctorServiceRating} />
                          <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{f.doctorServiceComment}"</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Comment</p>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{f.overallComments}</p>
                      </div>

                      {f.doctorReply?.text && (
                        <div className="border-l-4 border-cyan-500 pl-4 py-1 mt-4">
                          <p className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-1">Doctor's Response</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm italic">"{f.doctorReply.text}"</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          <span className="material-symbols-outlined text-base">{toast.type === "error" ? "error" : "check_circle"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
