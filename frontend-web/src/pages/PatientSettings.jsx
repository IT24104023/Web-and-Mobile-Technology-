import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "../components/PatientSidebar";
import PatientTopNav from "../components/PatientTopNav";
import { deactivateAccount, deleteAccount } from "../services/api";

export default function PatientSettings() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dent_ai_token");
  const user = JSON.parse(localStorage.getItem("dent_ai_user") || "{}");

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("dent_ai_token");
    localStorage.removeItem("dent_ai_user");
    navigate("/login");
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account? You will be logged out.")) return;
    setLoading(true);
    try {
      await deactivateAccount(token);
      handleLogout();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to deactivate account", "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete your account? This action cannot be undone.")) return;
    setLoading(true);
    try {
      await deleteAccount(token);
      handleLogout();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete account", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans']">
      <PatientTopNav />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 lg:ml-72 pt-28 px-4 md:px-8 pb-10">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Account Settings</h1>
            <p className="text-slate-500 mb-8">Manage your account preferences and data.</p>
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Danger Zone</h3>
              <p className="text-sm text-slate-500 mb-6">These actions will affect your account status immediately.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50">
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-500">Deactivate Account</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-600/80 mt-1">Temporarily hide your profile. You can reactivate by logging in.</p>
                  </div>
                  <button 
                    onClick={handleDeactivate}
                    disabled={loading}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
                  >
                    Deactivate
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50">
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-500">Delete Account</h4>
                    <p className="text-sm text-red-700 dark:text-red-600/80 mt-1">Permanently remove your account and all associated data.</p>
                  </div>
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="mt-4 sm:mt-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
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
