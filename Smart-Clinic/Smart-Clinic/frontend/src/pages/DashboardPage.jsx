import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/sidebar'
import StatusBadge from '../components/StatusBadge'
import axios from 'axios'
const API = 'http://localhost:5000/api'
function fmt(amt) { return 'Rs. ' + parseFloat(amt || 0).toFixed(2) }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' }) }
// ── Validation logic for every button × every status ─────────────────────────
function editValidation(order) {
  if (order.orderStatus === 'DELIVERED')
    return { allowed: false, message: 'Cannot edit — this order has already been DELIVERED. Delivered orders are final.' }
  if (order.orderStatus === 'CANCELLED')
    return { allowed: false, message: 'Cannot edit — this order has been CANCELLED.' }
  if (order.paymentStatus === 'PAID')
    return { allowed: false, message: 'Cannot edit — this order has already been PAID. Please contact support if changes are needed.' }
  if (order.orderStatus === 'DISPATCHED')
    return { allowed: false, message: 'Cannot edit — this order is already DISPATCHED and on the way.' }
  if (order.orderStatus === 'PROCESSING')
    return { allowed: false, message: 'Cannot edit — this order is currently being PROCESSED.' }
  return { allowed: true }
}
function payValidation(order) {
  if (order.orderStatus === 'DELIVERED')
    return { allowed: false, message: 'Cannot pay — this order has already been DELIVERED.' }
  if (order.orderStatus === 'CANCELLED')
    return { allowed: false, message: 'Cannot pay — this order has been CANCELLED.' }
  if (order.paymentStatus === 'PAID')
    return { allowed: false, message: 'This order has already been PAID. No further payment is needed.' }
  return { allowed: true }
}
function cancelValidation(order) {
  if (order.orderStatus === 'DELIVERED')
    return { allowed: false, message: 'Cannot cancel — this order has already been DELIVERED.' }
  if (order.orderStatus === 'CANCELLED')
    return { allowed: false, message: 'This order has already been CANCELLED.' }
  // For paid or any other cancellable status → show confirm dialog
  return { allowed: true }
}
function cancelConfirmMessage(order) {
  if (order.paymentStatus === 'PAID')
    return 'This order is already PAID. Are you sure you want to cancel it? You may lose delivery of your medication.'
  return 'Are you sure you want to cancel this order? This cannot be undone. Don\'t want to deliver?'
}
export default function DashboardPage() {
  var navigate = useNavigate()
  var ordersState = useState([])
  var orders = ordersState[0]; var setOrders = ordersState[1]
  var filteredState = useState([])
  var filtered = filteredState[0]; var setFiltered = filteredState[1]
  var statusState = useState('')
  var statusFilter = statusState[0]; var setStatusFilter = statusState[1]
  var searchState = useState('')
  var search = searchState[0]; var setSearch = searchState[1]
  var loadingState = useState(true)
  var loading = loadingState[0]; var setLoading = loadingState[1]
  // Validation error modal
  var errorModalState = useState(null)   // { title, message }
  var errorModal = errorModalState[0]; var setErrorModal = errorModalState[1]
  // Cancel confirmation modal
  var cancelModalState = useState(null)   // { orderId, message }
  var cancelModal = cancelModalState[0]; var setCancelModal = cancelModalState[1]
  var cancelErrState = useState('')
  var cancelErr = cancelErrState[0]; var setCancelErr = cancelErrState[1]
  var cancellingState = useState(false)
  var cancelling = cancellingState[0]; var setCancelling = cancellingState[1]
  useEffect(function () { loadOrders() }, [])
  function loadOrders() {
    setLoading(true)
    axios.get(API + '/orders')
      .then(function (res) { setOrders(res.data); setFiltered(res.data); setLoading(false) })
      .catch(function () { setLoading(false) })
  }
  useEffect(function () {
    var result = orders.slice()
    if (statusFilter)
      result = result.filter(function (o) { return o.orderStatus === statusFilter })
    if (search)
      result = result.filter(function (o) {
        return o._id.includes(search) ||
          (o.patientName && o.patientName.toLowerCase().includes(search.toLowerCase()))
      })
    setFiltered(result)
  }, [statusFilter, search, orders])
  // ── Action handlers ──────────────────────────────────────────────────────
  function handleEdit(order) {
    var v = editValidation(order)
    if (!v.allowed) {
      setErrorModal({ title: 'Cannot Edit Order', icon: '✏️', message: v.message })
      return
    }
    navigate('/orders/edit/' + order._id)
  }
  function handlePay(order) {
    var v = payValidation(order)
    if (!v.allowed) {
      setErrorModal({ title: 'Cannot Process Payment', icon: '💳', message: v.message })
      return
    }
    navigate('/checkout?order_id=' + order._id + '&amount=' + order.totalAmount)
  }
  function handleCancel(order) {
    var v = cancelValidation(order)
    if (!v.allowed) {
      setErrorModal({ title: 'Cannot Cancel Order', icon: '🚫', message: v.message })
      return
    }
    setCancelErr('')
    setCancelModal({ orderId: order._id, message: cancelConfirmMessage(order) })
  }
  function confirmCancel() {
    setCancelling(true)
    axios.delete(API + '/orders/' + cancelModal.orderId)
      .then(function () {
        setCancelModal(null)
        setCancelling(false)
        loadOrders()
      })
      .catch(function (err) {
        var msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error : 'Cancel failed. Please try again.'
        setCancelErr(msg)
        setCancelling(false)
      })
  }
  var stats = {
    total: orders.length,
    pending: orders.filter(function (o) { return o.orderStatus === 'PENDING' }).length,
    paid: orders.filter(function (o) { return o.paymentStatus === 'PAID' }).length,
    delivered: orders.filter(function (o) { return o.orderStatus === 'DELIVERED' }).length,
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <span className="page-label">Medication Ordering</span>
            <h1 className="page-title">Orders Dashboard</h1>
          </div>
          <Link to="/orders/create" className="btn btn-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add</span>
            New Order
          </Link>
        </div>
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{stats.pending}</div>
          </div>
          <div className="stat-card primary-card">
            <div className="stat-label">Paid</div>
            <div className="stat-value">{stats.paid}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Delivered</div>
            <div className="stat-value" style={{ color: '#16a34a' }}>{stats.delivered}</div>
          </div>
        </div>
        {/* Orders Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <span className="material-symbols-outlined">receipt_long</span>
              All Orders
            </h3>
            <div className="flex gap-3">
              <select className="form-control" style={{ width: 190 }}
                value={statusFilter}
                onChange={function (e) { setStatusFilter(e.target.value) }}
              >
                <option value="">All Statuses</option>
                {['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map(function (s) {
                  return <option key={s}>{s}</option>
                })}
              </select>
              <input className="form-control" style={{ width: 220 }}
                placeholder="Search name or order ID..."
                value={search}
                onChange={function (e) { setSearch(e.target.value) }}
              />
            </div>
          </div>
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: 28, height: 28, margin: '0 auto 1rem' }}></div>
              Loading orders...
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Patient</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Order Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th style={{ minWidth: 210 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <div className="empty-icon">📭</div>
                          No orders found
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map(function (order) {
                    return (
                      <tr key={order._id}>
                        <td>
                          <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.patientName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{order.patientPhone}</div>
                        </td>
                        <td>{(order.items && order.items.length) || 0} item(s)</td>
                        <td><strong>{fmt(order.totalAmount)}</strong></td>
                        <td><StatusBadge status={order.orderStatus} /></td>
                        <td><StatusBadge status={order.paymentStatus} /></td>
                        <td className="text-sm text-secondary">{fmtDate(order.createdAt)}</td>
                        <td>
                          {['DELIVERED', 'DISPATCHED', 'CANCELLED'].includes(order.orderStatus) ? null : order.paymentStatus === 'PAID' ? (
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {/* CANCEL */}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={function () { handleCancel(order) }}
                                title="Cancel order"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>cancel</span>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              {/* EDIT */}
                              <button
                                className="btn btn-teal-outline btn-sm"
                                onClick={function () { handleEdit(order) }}
                                title="Edit order"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>edit</span>
                                Edit
                              </button>
                              {/* PAY */}
                              <button
                                className="btn btn-success btn-sm"
                                onClick={function () { handlePay(order) }}
                                title="Pay order"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>payments</span>
                                Pay
                              </button>
                              {/* CANCEL */}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={function () { handleCancel(order) }}
                                title="Cancel order"
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>cancel</span>
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* ══ VALIDATION ERROR MODAL ══════════════════════════════════════════ */}
        <div className={'modal-overlay ' + (errorModal ? 'open' : '')}>
          <div className="modal">
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>
                {errorModal && errorModal.icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {errorModal && errorModal.title}
              </h3>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                {errorModal && errorModal.message}
              </p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={function () { setErrorModal(null) }}>
                OK, Got It
              </button>
            </div>
          </div>
        </div>
        {/* ══ CANCEL CONFIRMATION MODAL ════════════════════════════════════════ */}
        <div className={'modal-overlay ' + (cancelModal ? 'open' : '')}>
          <div className="modal">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>warning</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, marginBottom: '0.4rem' }}>
                  Cancel this Order?
                </h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.65 }}>
                  {cancelModal && cancelModal.message}
                </p>
              </div>
            </div>
            {cancelErr && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600 }}>
                ⚠️ {cancelErr}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline"
                onClick={function () { setCancelModal(null); setCancelErr('') }}
                disabled={cancelling}
              >
                No, Keep Order
              </button>
              <button className="btn btn-danger" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? <span className="spinner"></span> : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>}
                {cancelling ? ' Cancelling...' : ' Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
