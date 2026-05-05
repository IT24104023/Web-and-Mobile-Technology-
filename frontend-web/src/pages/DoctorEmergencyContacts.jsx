import { useEffect, useState } from "react";
import DoctorSidebar from "../components/DoctorSidebar";
import DoctorTopNav from "../components/DoctorTopNav";
import api from "../services/api";

/**
 * DoctorEmergencyContacts
 *
 * Lists the emergency contacts for all patients that have booked
 * appointments with this doctor.
 *
 * Doctors can VIEW and DELETE, but cannot EDIT.
 *
 * NOTE: In a full implementation the patient list would be filtered
 * server-side by appointment records.  Here we fetch via the
 * /emergency-contacts/patient/:patient_id endpoint and let the
 * doctor search by the patient_id they can see in the Patients tab.
 */
export default function DoctorEmergencyContacts() {
  const token = localStorage.getItem("dent_ai_token");

  const [patientId, setPatientId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchContact = async (pid) => {
    if (!pid.trim()) return;
    setLoading(true);
    setNotFound(false);
    setRecord(null);
    try {
      const res = await api.get(`/emergency/patient/${pid.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecord(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else showToast(err.response?.data?.message || "Error fetching contact", "error");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!record) return;
    setDeleting(true);
    try {
      await api.delete(`/emergency/admin/${record.patient_id?._id || record.patient_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Emergency contact record deleted.");
      setRecord(null);
      setSearchInput("");
      setPatientId("");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
    setDeleting(false);
    setConfirmDelete(false);
  };

  const ContactCard = ({ badge, data, color }) => (
    <div className={`rounded-xl border-l-4 ${color} bg-white dark:bg-slate-800 p-5 shadow-sm`}>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block ${badge === "Primary" ? "bg-cyan-100 text-cyan-700" : "bg-indigo-100 text-indigo-700"}`}>
        {badge}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
        {[
          { label: "Name", value: data.name, icon: "person" },
          { label: "Phone", value: data.phone, icon: "phone" },
          { label: "Relationship", value: data.relationship, icon: "group" },
        ].map(({ label, value, icon }) => (
          <div key={label}>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-sm">{icon}</span>{label}
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans flex">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col">
        <DoctorTopNav />
        <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-3xl text-red-500">emergency</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Patient Emergency Contacts</h1>
              <p className="text-slate-500 text-sm">View emergency contacts for your patients. You may delete records but cannot edit them.</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Enter Patient ID
            </label>
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Paste patient user ID (e.g. 6634abc...)"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchContact(searchInput)}
              />
              <button
                onClick={() => fetchContact(searchInput)}
                disabled={loading || !searchInput.trim()}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {loading
                  ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  : <span className="material-symbols-outlined text-sm">search</span>}
                Search
              </button>
            </div>
          </div>

          {/* Not found */}
          {notFound && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-800 text-sm">
              <span className="material-symbols-outlined">info</span>
              No emergency contacts found for this patient ID.
            </div>
          )}

          {/* Result */}
          {record && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
              {/* Patient info */}
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-lg flex-shrink-0">
                  {record.patient_id?.full_name?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">{record.patient_id?.full_name || "Patient"}</p>
                  <p className="text-sm text-slate-500">{record.patient_id?.email}</p>
                  {record.patient_id?.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs">phone</span>
                      Profile phone: {record.patient_id.phone}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Delete Record
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <ContactCard badge="Primary" data={record.primary} color="border-cyan-500" />
                {record.secondary && (
                  <ContactCard badge="Secondary" data={record.secondary} color="border-indigo-400" />
                )}
                {!record.secondary && (
                  <p className="text-xs text-slate-400 italic">No secondary contact added by patient.</p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm">lock</span>
                You have view-only access. Contact editing is reserved for the patient and admin.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Confirm Delete</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
              Are you sure you want to delete the emergency contact record for{" "}
              <strong>{record?.patient_id?.full_name || "this patient"}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Deleting…</>
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          <span className="material-symbols-outlined text-base">{toast.type === "error" ? "error" : "check_circle"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
