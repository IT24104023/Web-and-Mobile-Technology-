import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import PatientSidebar from "../components/PatientSidebar.jsx";
import PatientTopNav from "../components/PatientTopNav.jsx";

const PatientMedicationOrderingPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      const res = await api.get("/prescriptions/patient", { headers: { Authorization: `Bearer ${token}` } });
      setPrescriptions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      const res = await api.get("/orders/patient", { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchOrders();
  }, []);

  const handleSelectPrescription = (presc) => {
    setSelectedPrescription(presc);
    const initialItems = presc.medicines.map(m => {
      const unitPrice = m.medicine?.unitPrice || 0;
      return {
        medicine: m.medicine?._id,
        name: m.name,
        unitPrice: unitPrice,
        quantity: 1,
        total: unitPrice * 1
      };
    });
    setOrderItems(initialItems);
  };

  const handleQuantityChange = (index, qty) => {
    const newQty = parseInt(qty) || 0;
    const newItems = [...orderItems];
    newItems[index].quantity = newQty;
    newItems[index].total = newItems[index].unitPrice * newQty;
    setOrderItems(newItems);
  };

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem("dent_ai_token");
      await api.post("/orders", {
        prescriptionId: selectedPrescription._id,
        items: orderItems
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setSelectedPrescription(null);
      setOrderItems([]);
      fetchOrders();
      alert("Order placed successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to place order.");
    }
  };

  const totalAmount = orderItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans']">
      <PatientSidebar />
      <div className="flex-1 flex flex-col lg:ml-72 transition-all duration-300">
        <PatientTopNav />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pt-28">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Medication Ordering</h1>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
              <h2 className="text-xl font-bold mb-4">Your Prescriptions</h2>
              <div className="grid gap-4 md:grid-cols-2 mb-8">
                {prescriptions.map(p => (
                  <div 
                    key={p._id} 
                    onClick={() => handleSelectPrescription(p)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedPrescription?._id === p._id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-200 hover:border-cyan-300 dark:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-800 dark:text-white">Dr. {p.doctor?.full_name}</span>
                      <span className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {p.medicines.length} medicines prescribed
                    </div>
                  </div>
                ))}
                {prescriptions.length === 0 && <p className="text-slate-500">No prescriptions found.</p>}
              </div>

              {selectedPrescription && (
                <div className="mt-8 bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl animate-fade-in">
                  <h3 className="text-lg font-bold mb-4">Order Details</h3>
                  <div className="space-y-4">
                    {orderItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm gap-4">
                        <div className="flex-1">
                          <span className="font-bold text-slate-800 dark:text-white block">{item.name}</span>
                          <span className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">${item.unitPrice} / unit</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <label className="text-xs text-slate-500 mb-1">Quantity</label>
                            <input 
                              type="number" 
                              min="1" 
                              value={item.quantity} 
                              onChange={(e) => handleQuantityChange(idx, e.target.value)}
                              className="w-20 px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500"
                            />
                          </div>
                          <div className="flex flex-col items-end">
                            <label className="text-xs text-slate-500 mb-1">Total</label>
                            <span className="font-bold text-lg">${item.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-600">
                    <div className="mb-4 sm:mb-0">
                      <span className="text-slate-500">Total Amount:</span>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white ml-3">${totalAmount.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handlePlaceOrder}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition-all"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {orders.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                <h2 className="text-xl font-bold mb-4">Past Orders</h2>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white">Order #{order._id.substring(order._id.length - 6)}</div>
                        <div className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className="font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientMedicationOrderingPage;
