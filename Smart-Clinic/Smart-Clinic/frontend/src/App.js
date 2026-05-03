import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './App.css'
import Topnav from './components/Topnav'
import DashboardPage from './pages/DashboardPage'
import CreateOrderPage from './pages/CreateOrderPage'
import EditOrderPage from './pages/EditOrderPage'
import CheckoutPage from './pages/CheckoutPage'

export default function App() {
  return (
    <BrowserRouter>
      <Topnav />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders/create" element={<CreateOrderPage />} />
        <Route path="/orders/edit/:id" element={<EditOrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  )
}
