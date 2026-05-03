import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";
import "../styles/notification.css";

export default function PatientTopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("dent_ai_user")) || {
    full_name: "Patient",
    role: "patient",
    profile_image: "",
    email: "patient@dentai.com",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("dent_ai_token");
    localStorage.removeItem("dent_ai_user");
    navigate("/login");
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    navigate("/patient/settings");
  };

  return (
    <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl w-full sticky top-0 z-50 flex justify-between items-center px-8 h-20 max-w-full shadow-sm">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-extrabold bg-gradient-to-br from-cyan-800 to-cyan-600 bg-clip-text text-transparent font-['Manrope'] tracking-tight">
          Dent AI
        </span>
        <div className="hidden md:flex gap-6 items-center overflow-x-auto">
          <button
            onClick={() => navigate("/patient/dashboard")}
            className={`font-bold pb-1 font-['Manrope'] tracking-tight hover:text-cyan-900 transition-colors whitespace-nowrap ${
              location.pathname === "/patient/dashboard"
                ? "text-cyan-800 dark:text-cyan-400 border-b-2 border-cyan-800 dark:border-cyan-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/patient/appointments/book")}
            className={`font-medium font-['Manrope'] tracking-tight hover:text-cyan-700 transition-colors duration-300 whitespace-nowrap ${
              location.pathname === "/patient/appointments/book"
                ? "text-cyan-800 dark:text-cyan-400 border-b-2 border-cyan-800 dark:border-cyan-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => navigate("/patient/appointments")}
            className={`font-medium font-['Manrope'] tracking-tight hover:text-cyan-700 transition-colors duration-300 whitespace-nowrap ${
              location.pathname === "/patient/appointments"
                ? "text-cyan-800 dark:text-cyan-400 border-b-2 border-cyan-800 dark:border-cyan-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => navigate("/patient/prescriptions")}
            className={`font-medium font-['Manrope'] tracking-tight hover:text-cyan-700 transition-colors duration-300 whitespace-nowrap ${
              location.pathname === "/patient/prescriptions"
                ? "text-cyan-800 dark:text-cyan-400 border-b-2 border-cyan-800 dark:border-cyan-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Prescription
          </button>
          <button
            onClick={() => navigate("/patient/e-payment")}
            className={`font-medium font-['Manrope'] tracking-tight hover:text-cyan-700 transition-colors duration-300 whitespace-nowrap ${
              location.pathname === "/patient/e-payment"
                ? "text-cyan-800 dark:text-cyan-400 border-b-2 border-cyan-800 dark:border-cyan-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            E-Payment
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationCenter />
        <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-cyan-800">chat_bubble</span>
        </button>
        <div ref={profileMenuRef} className="relative flex items-center gap-3 pl-4">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-cyan-600 transition-all"
          >
            <img
              alt="User profile avatar"
              className="w-full h-full object-cover"
              src={
                user.profile_image
                  ? user.profile_image
                  : "https://via.placeholder.com/40x40?text=User"
              }
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/40x40?text=User";
              }}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-base">settings</span>
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-200 dark:border-slate-700"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
