import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import DoctorSidebar from "../components/DoctorSidebar.jsx";
import DoctorTopNav from "../components/DoctorTopNav.jsx";

const DoctorPrescriptionPage = () => {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  
  const [selectedPatient, setSelectedPatient] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ medicineId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "" });

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      const res = await api.get("/auth/users?role=patient", { headers: { Authorization: `Bearer ${token}` } });
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      const res = await api.get("/medicines", { headers: { Authorization: `Bearer ${token}` } });
      setMedicines(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      const res = await api.get("/prescriptions/doctor", { headers: { Authorization: `Bearer ${token}` } });
      setPrescriptions(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPatients();
    fetchMedicines();
    fetchPrescriptions();
  }, []);

  const handleMedicineSelect = (e) => {
    const medId = e.target.value;
    const med = medicines.find(m => m._id === medId);
    if (med) {
      setCurrentItem({ ...currentItem, medicineId: med._id, name: med.name, dosage: med.defaultDosage || "" });
    } else {
      setCurrentItem({ ...currentItem, medicineId: "", name: "", dosage: "" });
    }
  };

  const addItem = () => {
    if (!currentItem.medicineId || !currentItem.frequency || !currentItem.duration) return;
    setPrescriptionItems([...prescriptionItems, currentItem]);
    setCurrentItem({ medicineId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "" });
  };

  const removeItem = (index) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedPatient || prescriptionItems.length === 0) return;
    try {
      const token = localStorage.getItem("dent_ai_token");
      await api.post("/prescriptions", { patientId: selectedPatient, medicines: prescriptionItems.map(item => ({ medicine: item.medicineId, ...item })) }, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedPatient("");
      setPrescriptionItems([]);
      fetchPrescriptions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        <DoctorTopNav />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Prescription</h1>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Patient</label>
                <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500">
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.full_name} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Medicine</label>
                  <select value={currentItem.medicineId} onChange={handleMedicineSelect} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm">
                    <option value="">-- Medicine --</option>
                    {medicines.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Dosage</label>
                  <input type="text" value={currentItem.dosage} onChange={e => setCurrentItem({...currentItem, dosage: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm" placeholder="e.g. 500mg" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Frequency</label>
                  <input type="text" value={currentItem.frequency} onChange={e => setCurrentItem({...currentItem, frequency: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm" placeholder="e.g. 1-0-1" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Duration</label>
                  <input type="text" value={currentItem.duration} onChange={e => setCurrentItem({...currentItem, duration: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm" placeholder="e.g. 5 days" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Instructions</label>
                  <div className="flex gap-2">
                    <input type="text" value={currentItem.instructions} onChange={e => setCurrentItem({...currentItem, instructions: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 text-sm" placeholder="After food" />
                    <button onClick={addItem} className="bg-cyan-600 text-white px-3 rounded-lg hover:bg-cyan-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {prescriptionItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Prescribed Medicines</h3>
                  <div className="space-y-2">
                    {prescriptionItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-cyan-50 text-cyan-900 rounded-lg dark:bg-cyan-900/30 dark:text-cyan-100">
                        <div>
                          <span className="font-bold">{item.name}</span> - {item.dosage} ({item.frequency} for {item.duration})
                          {item.instructions && <span className="block text-xs opacity-75">{item.instructions}</span>}
                        </div>
                        <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleSubmit} disabled={!selectedPatient || prescriptionItems.length === 0} className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                Upload Prescription
              </button>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Past Prescriptions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {prescriptions.map(p => (
                <div key={p._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold">{p.patient?.full_name || "Unknown"}</span>
                    <span className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString()}</span>
                  </div>
                  <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                    {p.medicines.map((m, i) => (
                      <li key={i}>• {m.name} ({m.dosage}) - {m.frequency} x {m.duration}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorPrescriptionPage;
