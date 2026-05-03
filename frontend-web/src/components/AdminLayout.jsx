import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("dent_ai_user")) || {
    full_name: "Dent AI Admin",
    role: "admin",
    profile_image: "",
  };

  const navigationItems = [
    { id: "patients", label: "Patients", icon: "person" },
    { id: "doctors", label: "Doctors", icon: "medical_services" },
    { id: "appointments", label: "Appointments", icon: "calendar_today" },
    { id: "feedback", label: "Feedback", icon: "chat_bubble" },
    { id: "payments", label: "Payments", icon: "payments" },
    { id: "resources", label: "Medical Resources", icon: "library_books" },
    { id: "medicines", label: "Medicines", icon: "medication" },
    { id: "emergency", label: "Emergency", icon: "emergency" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("dent_ai_token");
    localStorage.removeItem("dent_ai_user");
    navigate("/login");
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    navigate("/admin/settings");
  };

  const handleNavClick = (id) => {
    const paths = {
      patients: "/admin/patients",
      doctors: "/admin/doctors",
      appointments: "/admin/appointments",
      feedback: "/admin/feedback",
      payments: "/admin/payments",
      resources: "/admin/medical-resources",
      medicines: "/admin/medicines",
      emergency: "/admin/emergency",
    };
    navigate(paths[id]);
  };

  return (
    <div className="bg-background text-on-surface">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 h-screen w-64 border-r-0 bg-slate-100 dark:bg-slate-900 flex flex-col py-8 px-4">
        <div className="mb-10 px-4">
          <h1 className="text-2xl font-bold tracking-tighter text-cyan-700 dark:text-cyan-300 font-headline">
            Dent AI Admin
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
            Clinical Precision
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/40 transition-all font-headline font-semibold tracking-tight text-sm"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-1 border-t border-slate-200/50 pt-4">
          <button className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-headline text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">add</span>
            New Appointment
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/40 transition-all font-headline font-semibold tracking-tight text-sm">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/40 transition-all font-headline font-semibold tracking-tight text-sm">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 z-40 bg-slate-50/70 dark:bg-slate-950/70 backdrop-blur-xl flex justify-between items-center h-16 px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 font-label">
              {title || "Page"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-slate-200 dark:bg-slate-800 rounded-full px-4 py-1.5 w-64 group focus-within:bg-white dark:focus-within:bg-slate-700 transition-all ring-1 ring-transparent focus-within:ring-cyan-500/20">
              <span className="material-symbols-outlined text-slate-500 text-lg">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-slate-400"
                placeholder="Search..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 transition-all opacity-80 hover:opacity-100">
                <span className="material-symbols-outlined">notifications</span>
              </button>

              <div ref={profileMenuRef} className="relative flex items-center gap-3 border-l border-slate-200 dark:border-slate-700 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold font-headline text-on-surface">{user.full_name}</p>
                  <p className="text-xs text-slate-500 font-label uppercase">Super Admin</p>
                </div>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-200 hover:ring-cyan-400 transition-all"
                >
                  <img
                    alt="Admin User"
                    className="w-full h-full object-cover"
                    src={user.profile_image || "https://lh3.googleusercontent.com/aida-public/AB6AXuCcF5gL7i4_dbYl2IQ96R5oWyOCNru_3VpaUI2s5lPOBeKmMYNhh74pftCn3b9OYWxn2_-2_bRctKyu9XXv_RXb3iGUW-jt-1WFc9EgMESCdcql3xZVRKNYxXn5dpShRfWrEZ7gSzmOdU5rDf3TODd_wcwIHcNB_kSE_zv5VJwce_MXV2OP5dpk8CFeLJM9EBOn17XqWyD3t_S2Rr1vXecNPWTMizVSPYMj28yPzv-IAQoh-Ch1dhp9nteu_BgcqWsTJwHLs9tMUJxw"}
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => navigate("/admin/dashboard")}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleSettings}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-slate-200 dark:border-slate-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="pt-16 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
