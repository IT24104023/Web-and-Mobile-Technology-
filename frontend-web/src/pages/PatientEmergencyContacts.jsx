import { useEffect, useState } from "react";
import PatientSidebar from "../components/PatientSidebar";
import PatientTopNav from "../components/PatientTopNav";
import api from "../services/api";

const RELATIONSHIPS = [
  "Spouse", "Parent", "Child", "Sibling", "Friend",
  "Guardian", "Relative", "Colleague", "Neighbour", "Other",
];

const emptyContact = { name: "", phone: "", relationship: "" };

export default function PatientEmergencyContacts() {
  const token = localStorage.getItem("dent_ai_token");
  const user = JSON.parse(localStorage.getItem("dent_ai_user") || "{}");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primary, setPrimary] = useState({ ...emptyContact });
  const [secondary, setSecondary] = useState({ ...emptyContact });
  const [hasSecondary, setHasSecondary] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/emergency/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.data) {
          const { primary: p, secondary: s } = res.data.data;
          setPrimary(p || { ...emptyContact });
          if (s) { setSecondary(s); setHasSecondary(true); }
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const validate = () => {
    const e = {};
    if (!primary.name.trim()) e.pName = "Name is required";
    if (!primary.phone.trim()) e.pPhone = "Phone is required";
    else if (!/^\+?[0-9\s\-().]{7,20}$/.test(primary.phone)) e.pPhone = "Invalid phone number";
    else if (user.phone && primary.phone.replace(/\s/g, "") === user.phone.replace(/\s/g, ""))
      e.pPhone = "Cannot be the same as your profile phone";
    if (!primary.relationship) e.pRel = "Please select a relationship";

    if (hasSecondary) {
      if (!secondary.name.trim()) e.sName = "Name is required";
      if (!secondary.phone.trim()) e.sPhone = "Phone is required";
      else if (!/^\+?[0-9\s\-().]{7,20}$/.test(secondary.phone)) e.sPhone = "Invalid phone number";
      else if (secondary.phone.replace(/\s/g, "") === primary.phone.replace(/\s/g, ""))
        e.sPhone = "Cannot be the same as primary contact";
      if (!secondary.relationship) e.sRel = "Please select a relationship";
    }
    return e;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      await api.put(
        "/emergency/my",
        { primary, secondary: hasSecondary ? secondary : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Emergency contacts saved successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save contacts", "error");
    }
    setSaving(false);
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const ContactForm = ({ title, icon, badge, data, setData, errPrefix, isSaved }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className={`material-symbols-outlined text-2xl ${badge === "Primary" ? "text-cyan-600" : "text-indigo-500"}`}>{icon}</span>
        <div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge === "Primary" ? "bg-cyan-100 text-cyan-700" : "bg-indigo-100 text-indigo-700"}`}>{badge}</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{title}</h3>
        </div>
        {isSaved && (
          <span className="ml-auto text-xs text-emerald-600 flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-base">check_circle</span> Saved
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Full Name" error={errors[`${errPrefix}Name`]}>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors[`${errPrefix}Name`] ? "border-red-400" : "border-slate-200 dark:border-slate-600"}`}
            placeholder="e.g. Nimal Perera"
            value={data.name}
            onChange={e => setData(d => ({ ...d, name: e.target.value }))}
          />
        </Field>
        <Field label="Phone Number" error={errors[`${errPrefix}Phone`]}>
          <input
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors[`${errPrefix}Phone`] ? "border-red-400" : "border-slate-200 dark:border-slate-600"}`}
            placeholder="e.g. +94771234567"
            value={data.phone}
            onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
          />
        </Field>
        <Field label="Relationship" error={errors[`${errPrefix}Rel`]}>
          <select
            className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors[`${errPrefix}Rel`] ? "border-red-400" : "border-slate-200 dark:border-slate-600"}`}
            value={data.relationship}
            onChange={e => setData(d => ({ ...d, relationship: e.target.value }))}
          >
            <option value="">Select relationship</option>
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans']">
      <PatientTopNav />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 lg:ml-72 pt-20 px-4 md:px-8 pb-10">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-3xl text-red-500">emergency</span>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Emergency Contacts</h1>
            </div>
            <p className="text-slate-500 text-sm ml-10">These contacts will be notified in case of a medical emergency.</p>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <span className="material-symbols-outlined text-amber-500 mt-0.5 flex-shrink-0">info</span>
            <div>
              <strong>Required:</strong> You must add at least one primary emergency contact. The primary contact phone
              cannot be the same as your profile phone number. Your emergency contacts will be visible to doctors who
              have appointments booked with you.
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="material-symbols-outlined animate-spin text-4xl text-cyan-500">progress_activity</span>
            </div>
          ) : (
            <div className="space-y-5">
              <ContactForm
                title="Primary Emergency Contact"
                icon="contact_phone"
                badge="Primary"
                data={primary}
                setData={setPrimary}
                errPrefix="p"
              />

              {/* Toggle secondary */}
              {!hasSecondary ? (
                <button
                  onClick={() => setHasSecondary(true)}
                  className="flex items-center gap-2 text-sm text-cyan-600 font-semibold hover:underline"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>
                  Add Secondary Emergency Contact (optional)
                </button>
              ) : (
                <div>
                  <ContactForm
                    title="Secondary Emergency Contact"
                    icon="contacts"
                    badge="Secondary"
                    data={secondary}
                    setData={setSecondary}
                    errPrefix="s"
                  />
                  <button
                    onClick={() => { setHasSecondary(false); setSecondary({ ...emptyContact }); }}
                    className="mt-3 flex items-center gap-2 text-xs text-red-500 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">remove_circle</span>
                    Remove secondary contact
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-cyan-200 transition-all active:scale-95 disabled:opacity-60"
                >
                  {saving
                    ? <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving…</>
                    : <><span className="material-symbols-outlined text-base">save</span> Save Contacts</>}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          <span className="material-symbols-outlined text-base">{toast.type === "error" ? "error" : "check_circle"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
