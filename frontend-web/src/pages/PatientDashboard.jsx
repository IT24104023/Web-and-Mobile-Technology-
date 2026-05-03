import { useEffect, useState } from "react";
import PatientSidebar from "../components/PatientSidebar";
import PatientTopNav from "../components/PatientTopNav";

export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("dent_ai_user") || "{}");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-['Plus_Jakarta_Sans']">
      <PatientTopNav />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 lg:ml-72 pt-28 px-8 pb-10">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome, {user.full_name}</h1>
            <p className="text-slate-500 mb-8">Manage your dental care and appointments from your personal portal.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined">calendar_add_on</span>
                    Book an Appointment
                  </button>
                  <button className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined">emergency</span>
                    Update Emergency Contacts
                  </button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-600 to-cyan-500 p-6 rounded-2xl shadow-lg text-white">
                <h3 className="font-bold text-lg mb-2">AI Health Status</h3>
                <p className="text-cyan-100 text-sm mb-4">Your last scan shows excellent oral hygiene.</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[92%]" />
                  </div>
                  <span className="font-bold">92%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
