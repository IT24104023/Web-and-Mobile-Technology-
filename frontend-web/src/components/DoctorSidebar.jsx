import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("dent_ai_user") || "{}");

  const navItems = [
    { label: "Dashboard", icon: "dashboard", path: "/doctor/dashboard" },
    { label: "Appointments", icon: "calendar_today", path: "/doctor/appointments" },
    { label: "Prescriptions", icon: "local_pharmacy", path: "/doctor/prescriptions" },
    { label: "Patients", icon: "people", path: "/doctor/patients" },
    { label: "Settings", icon: "settings", path: "/doctor/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("dent_ai_token");
    localStorage.removeItem("dent_ai_user");
    navigate("/login");
  };

  const handleNavClick = (path) => {
    if (path) {
      navigate(path);
      setMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-cyan-600 text-white p-2 rounded-lg"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative w-64 h-screen bg-gradient-to-b from-cyan-700 to-cyan-600 text-white flex flex-col z-40 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-cyan-500">
          <h1 className="text-2xl font-bold">Dent AI</h1>
          <p className="text-cyan-100 text-sm mt-1">Doctor Portal</p>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-cyan-500 bg-cyan-800 bg-opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-300 rounded-full flex items-center justify-center text-cyan-900 font-bold">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <p className="font-semibold text-sm">{user.full_name || "Doctor"}</p>
              <p className="text-cyan-200 text-xs">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? "bg-white bg-opacity-20 text-white border-r-4 border-white"
                      : "text-cyan-100 hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-cyan-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white font-medium"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default DoctorSidebar;
