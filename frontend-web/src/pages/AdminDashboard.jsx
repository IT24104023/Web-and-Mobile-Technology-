import AdminLayout from "../components/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6">Management Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Patients</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">1,284</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Active Doctors</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">12</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Appointments Today</h3>
            <p className="text-4xl font-bold text-slate-800 dark:text-white">48</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
