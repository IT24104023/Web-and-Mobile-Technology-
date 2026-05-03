import React from 'react'
import { Link } from 'react-router-dom'
const topLinks = [
  { label: 'Dashboard',        path: '/dashboard', active: true },
  { label: 'Book Appointment', path: '#' },
  { label: 'AI Analysis',      path: '#' },
  { label: 'History Vault',    path: '#' },
  { label: 'E-Payment',        path: '/checkout' },
]
export default function Topnav() {
  return (
    <nav className="topnav">
      <div className="topnav-left">
        <span className="topnav-brand">Smart Clinic</span>
        <div className="topnav-links">
          {topLinks.map(function(link, i) {
            return (
              <Link
                key={i}
                to={link.path}
                className={'topnav-link ' + (link.active ? 'topnav-link-active' : '')}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="topnav-right">
        <button className="topnav-icon-btn" title="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="topnav-icon-btn" title="Messages">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
        <div className="topnav-avatar">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC19OhhUZ5MLXw14hfGq7llblZDBIXkM-Bwl632cZbf5bzEAvD5irgNuqgcD4_dJwPvWomDEc0yb3rc_8RVEXpM78ad9Bobu5VRYIwQuhcK1mNiUA6vqPrlLkyPMO-AFhrq7PhZOY47edINZbk_w9xZ0tJ6M6uqXiLti5az1Kggnwx4HrNuepDM9113DEDm_Zr0lKfNX81Jm8qqW-6--zl_IR0mOVoUEgU3YuD-kl4JtNHGvZG8HbZrgQ0_mG1YGqWy3bhZKbF0MaEX"
            alt="User avatar"
          />
        </div>
      </div>
    </nav>
  )
}
