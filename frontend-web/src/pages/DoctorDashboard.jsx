import React from "react";
import DoctorSidebar from "../components/DoctorSidebar.jsx";
import DoctorTopNav from "../components/DoctorTopNav.jsx";

export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("dent_ai_user") || "{}");

  const stats = [
    { label: "Today's Appointments", value: "8", icon: "event", color: "bg-blue-500" },
    { label: "Total Patients", value: "142", icon: "group", color: "bg-cyan-500" },
    { label: "Pending Prescriptions", value: "3", icon: "description", color: "bg-orange-500" },
    { label: "Patient Feedback", value: "4.8/5", icon: "star", color: "bg-emerald-500" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-['Plus_Jakarta_Sans']">
      <DoctorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorTopNav />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Welcome back, Dr. {user.full_name?.split(' ')[0] || "Doctor"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Here is what's happening in your clinic today.
                </p>
              </div>
              <div className="text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                    <span className="material-symbols-outlined">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Appointments */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Upcoming Appointments</h2>
                  <button className="text-cyan-600 font-semibold text-sm hover:underline">View All</button>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            P{item}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white text-sm">Patient Name {item}</p>
                            <p className="text-xs text-slate-500">Regular Checkup • 10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors">Confirm</button>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">Reschedule</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions / Recent Activity */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
                <div className="grid gap-4">
                  <button className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center gap-4 hover:-translate-y-1 transition-all">
                    <span className="material-symbols-outlined">add_circle</span>
                    <span className="font-bold">New Prescription</span>
                  </button>
                  <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:border-cyan-400 transition-all">
                    <span className="material-symbols-outlined text-cyan-600">person_add</span>
                    <span className="font-bold">Register Patient</span>
                  </button>
                  <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:border-cyan-400 transition-all">
                    <span className="material-symbols-outlined text-cyan-600">analytics</span>
                    <span className="font-bold">Daily Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
