import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const RELATIONSHIPS = [
  "Spouse", "Parent", "Child", "Sibling", "Friend",
  "Guardian", "Relative", "Colleague", "Neighbour", "Other",
];

const emptyContact = { name: "", phone: "", relationship: "" };

export default function AdminEmergencyContacts() {
  const token = localStorage.getItem("dent_ai_token");

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Edit modal
  const [editRecord, setEditRecord] = useState(null);
  const [editPrimary, setEditPrimary] = useState({ ...emptyContact });
  const [editSecondary, setEditSecondary] = useState({ ...emptyContact });
  const [hasSecondary, setHasSecondary] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/emergency/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load contacts", "error");
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      records.filter(r =>
        r.patient_id?.full_name?.toLowerCase().includes(q) ||
        r.patient_id?.email?.toLowerCase().includes(q) ||
        r.primary?.name?.toLowerCase().includes(q) ||
        r.primary?.phone?.includes(q)
      )
    );
  }, [search, records]);

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const openEdit = (rec) => {
    setEditRecord(rec);
    setEditPrimary({ ...rec.primary });
    if (rec.secondary) {
      setEditSecondary({ ...rec.secondary });
      setHasSecondary(true);
    } else {
      setEditSecondary({ ...emptyContact });
      setHasSecondary(false);
    }
    setEditErrors({});
  };

  const validateEdit = () => {
    const e = {};
    if (!editPrimary.name.trim()) e.pName = "Required";
    if (!editPrimary.phone.trim()) e.pPhone = "Required";
    else if (!/^\+?[0-9\s\-().]{7,20}$/.test(editPrimary.phone)) e.pPhone = "Invalid phone";
    if (!editPrimary.relationship) e.pRel = "Required";
    if (hasSecondary) {
      if (!editSecondary.name.trim()) e.sName = "Required";
      if (!editSecondary.phone.trim()) e.sPhone = "Required";
      else if (!/^\+?[0-9\s\-().]{7,20}$/.test(editSecondary.phone)) e.sPhone = "Invalid phone";
      if (!editSecondary.relationship) e.sRel = "Required";
    }
    return e;
  };

  const handleSaveEdit = async () => {
    const errs = validateEdit();
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setEditErrors({});
    setSaving(true);
    try {
      const res = await api.put(
        `/emergency/admin/${editRecord._id}`,
        { primary: editPrimary, secondary: hasSecondary ? editSecondary : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecords(prev => prev.map(r => r._id === editRecord._id ? res.data.data : r));
      showToast("Emergency contact updated successfully.");
      setEditRecord(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    }
    setSaving(false);
  };

  // ── Delete handlers ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/emergency/admin/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(prev => prev.filter(r => r._id !== deleteTarget._id));
      showToast("Record deleted.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    }
    setDeleting(false);
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const MiniForm = ({ badge, color, data, setData, errPrefix }) => (
    <div className={`border-l-4 ${color} pl-4`}>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge === "Primary" ? "bg-cyan-100 text-cyan-700" : "bg-indigo-100 text-indigo-700"} inline-block mb-3`}>{badge}</span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Name" error={editErrors[`${errPrefix}Name`]}>
          <input className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${editErrors[`${errPrefix}Name`] ? "border-red-400" : "border-slate-200 dark:border-slate-600"}`} value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
        </Field>
        <Field label="Phone" error={editErrors[`${errPrefix}Phone`]}>
          <input className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${editErrors[`${errPrefix}Phone`] ? "border-red-400" : "border-slate-200 dark:border-slate-600"}`} value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} />
        </Field>
        <Field label="Relationship" error={editErrors[`${errPrefix}Rel`]}>
          <select className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${editErrors[`${errPrefix}Rel`] ? "border-red-400" : "border-slate-200 dark:border-slate-600"}`} value={data.relationship} onChange={e => setData(d => ({ ...d, relationship: e.target.value }))}>
            <option value="">Select</option>
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Emergency Contacts">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-red-500">emergency</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Emergency Contacts</h1>
              <p className="text-slate-500 text-sm">{records.length} patient records found</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Search by patient name, email, or contact name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="material-symbols-outlined animate-spin text-4xl text-cyan-500">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 block">contacts</span>
            <p className="font-semibold">No emergency contact records found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  {["Patient", "Primary Contact", "Phone", "Relationship", "Secondary", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {filtered.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm flex-shrink-0">
                          {rec.patient_id?.full_name?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white text-xs">{rec.patient_id?.full_name || "–"}</p>
                          <p className="text-slate-400 text-xs">{rec.patient_id?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{rec.primary?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{rec.primary?.phone}</td>
                    <td className="px-4 py-3">
                      <span className="bg-cyan-50 text-cyan-700 text-xs px-2 py-0.5 rounded-full font-semibold">{rec.primary?.relationship}</span>
                    </td>
                    <td className="px-4 py-3">
                      {rec.secondary
                        ? <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-xs">check_circle</span>{rec.secondary.name}</span>
                        : <span className="text-xs text-slate-400">None</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(rec)}
                          className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-800 border border-cyan-200 hover:border-cyan-400 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(rec)}
                          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1.5 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-cyan-600">edit</span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Emergency Contacts</h2>
                  <p className="text-xs text-slate-500">{editRecord.patient_id?.full_name}</p>
                </div>
              </div>
              <button onClick={() => setEditRecord(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <MiniForm badge="Primary" color="border-cyan-500" data={editPrimary} setData={setEditPrimary} errPrefix="p" />
              {!hasSecondary ? (
                <button onClick={() => setHasSecondary(true)} className="flex items-center gap-2 text-sm text-cyan-600 font-semibold hover:underline">
                  <span className="material-symbols-outlined text-base">add_circle</span> Add Secondary Contact
                </button>
              ) : (
                <>
                  <MiniForm badge="Secondary" color="border-indigo-400" data={editSecondary} setData={setEditSecondary} errPrefix="s" />
                  <button onClick={() => { setHasSecondary(false); setEditSecondary({ ...emptyContact }); }} className="flex items-center gap-2 text-xs text-red-500 hover:underline">
                    <span className="material-symbols-outlined text-sm">remove_circle</span> Remove Secondary
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setEditRecord(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving
                  ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Saving…</>
                  : <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Confirm Delete</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
              Delete all emergency contacts for <strong>{deleteTarget.patient_id?.full_name || "this patient"}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
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
    </AdminLayout>
  );
}
