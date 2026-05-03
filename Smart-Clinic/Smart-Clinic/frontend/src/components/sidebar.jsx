import React from 'react'
import { Link, useLocation } from 'react-router-dom'
const mainNav = [
  { icon: 'dashboard',       label: 'Dashboard',          path: '/dashboard' },
  { icon: 'calendar_add_on', label: 'Book Appointment',   path: '#' },
  { icon: 'psychology',      label: 'AI Analysis',        path: '#' },
  { icon: 'menu_book',       label: 'Medical Resource',   path: '#' },
  { icon: 'inventory_2',     label: 'History Vault',      path: '#' },
  { icon: 'pill',            label: 'Medication Ordering', path: '/dashboard' },
  { icon: 'payments',        label: 'E-Payment',          path: '/checkout' },
  { icon: 'rate_review',     label: 'My Feedback',        path: '#' },
]
const bottomNav = [
  { icon: 'person',   label: 'Profile',  path: '#' },
  { icon: 'settings', label: 'Settings', path: '#' },
]
export default function Sidebar() {
  var location = useLocation()
  function isActive(path) {
    if (path === '#') return false
    return location.pathname === path
  }
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="label">Clinical Precision</span>
        <h2>Smart Clinic</h2>
      </div>
      <nav className="sidebar-nav">
        {mainNav.map(function(item, i) {
          return (
            <Link
              key={i}
              to={item.path}
              className={'nav-item ' + (isActive(item.path) ? 'active' : '')}
            >
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
        <div className="sidebar-divider"></div>
        {bottomNav.map(function(item, i) {
          return (
            <Link key={i} to={item.path} className="nav-item">
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="sidebar-bottom">
        <button className="emergency-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>emergency</span>
          Emergency Contact
        </button>
        <Link to="/orders/create" className="book-now-btn">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
          Book Now
        </Link>
      </div>
    </aside>
  )
}
