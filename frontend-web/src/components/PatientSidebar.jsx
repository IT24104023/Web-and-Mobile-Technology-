import { useNavigate, useLocation } from "react-router-dom";

export default function PatientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/patient/dashboard" },
    { id: "appointment", label: "Book Appointment", icon: "calendar_add_on", path: "/patient/appointments/book" },
    { id: "appointments", label: "My Appointments", icon: "event", path: "/patient/appointments" },
    { id: "medical", label: "Medical Resource", icon: "menu_book", path: "/patient/medical-resource" },
    { id: "prescription", label: "Prescription", icon: "local_pharmacy", path: "/patient/prescriptions" },
    { id: "medication", label: "Medication Ordering", icon: "pill", path: "/patient/medication-ordering" },
    { id: "emergency", label: "Emergency Contact", icon: "emergency", path: "/patient/emergency-contacts" },
    { id: "payment", label: "E-Payment", icon: "payments", path: "/patient/e-payment" },
    { id: "feedback", label: "My Feedback", icon: "rate_review", path: "/patient/feedback" },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="hidden lg:flex bg-slate-50 dark:bg-slate-950 h-screen w-72 fixed left-0 top-0 flex-col p-6 space-y-2 z-30 pt-28 font-['Plus_Jakarta_Sans'] text-sm antialiased">
      <div className="px-2 mb-6"></div>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            navigate(item.path);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
            isActive(item.path)
              ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">{item.icon}</span>
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </aside>
  );
}
