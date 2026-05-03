import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import AdminLayout from "../components/AdminLayout.jsx";

const AdminMedicinePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({ name: "", unitPrice: "", quantity: "", defaultDosage: "", description: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      const res = await api.get("/medicines", { headers: { Authorization: `Bearer ${token}` } });
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("dent_ai_token");
    try {
      if (isEditing) {
        await api.put(`/medicines/${currentId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post("/medicines", formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setFormData({ name: "", unitPrice: "", quantity: "", defaultDosage: "", description: "" });
      setIsEditing(false);
      setCurrentId(null);
      fetchMedicines();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (medicine) => {
    setFormData({
      name: medicine.name,
      unitPrice: medicine.unitPrice,
      quantity: medicine.quantity,
      defaultDosage: medicine.defaultDosage || "",
      description: medicine.description || ""
    });
    setIsEditing(true);
    setCurrentId(medicine._id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("dent_ai_token");
    try {
      await api.delete(`/medicines/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMedicines();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Medicines Management">
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Medicine" : "Add New Medicine"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Medicine Name" value={formData.name} onChange={handleChange} required className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500" />
            <input type="number" name="unitPrice" placeholder="Unit Price" value={formData.unitPrice} onChange={handleChange} required className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500" />
            <input type="number" name="quantity" placeholder="Quantity/Stock" value={formData.quantity} onChange={handleChange} required className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500" />
            <input type="text" name="defaultDosage" placeholder="Default Dosage (e.g. 1 Tablet)" value={formData.defaultDosage} onChange={handleChange} className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500" />
            <input type="text" name="description" placeholder="Description/Instructions" value={formData.description} onChange={handleChange} className="md:col-span-2 px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500" />
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-xl transition-all">
                {isEditing ? "Update Medicine" : "Add Medicine"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold mb-4">Inventory</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Dosage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med) => (
                  <tr key={med._id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4">{med.name}</td>
                    <td className="py-3 px-4">${med.unitPrice}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${med.quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {med.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">{med.defaultDosage}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => handleEdit(med)} className="text-cyan-600 hover:text-cyan-800 font-semibold">Edit</button>
                      <button onClick={() => handleDelete(med._id)} className="text-red-500 hover:text-red-700 font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMedicinePage;
