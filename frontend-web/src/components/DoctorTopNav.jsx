import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DoctorTopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("dent_ai_user") || "{}");

  const navItems = [
    { label: "Dashboard", path: "/doctor/dashboard" },
    { label: "Appointments", path: "/doctor/appointments" },
    { label: "Prescriptions", path: "/doctor/prescriptions" },
    { label: "Patients", path: "/doctor/patients" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("dent_ai_token");
    localStorage.removeItem("dent_ai_user");
    navigate("/login");
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left - Navigation Items */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.path)}
              className={`font-medium transition-colors pb-2 ${
                location.pathname === item.path
                  ? "text-cyan-600 border-b-2 border-cyan-600"
                  : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right - Profile & Actions */}
        <div className="flex items-center gap-6 ml-auto">
          {/* Notifications Icon */}
          <button className="relative text-gray-600 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {user.full_name || "Doctor"}
              </span>
              <span className="material-symbols-outlined text-gray-600">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-semibold text-gray-900">{user.full_name || "Doctor"}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate("/doctor/settings");
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorTopNav;
