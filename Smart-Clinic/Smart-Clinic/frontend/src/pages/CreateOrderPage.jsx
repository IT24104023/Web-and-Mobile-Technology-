import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/sidebar'
import axios from 'axios'
const API = 'http://localhost:5000/api'
// ── Sample patients with pre-assigned prescription IDs ──────────────────────
const PATIENTS = [
  { name: 'yohani dhanushika',   phone: '0771234567', prescriptionId: 'PRES-2026-001' },
  { name: 'ranga perera',    phone: '0712345678', prescriptionId: 'PRES-2026-002' },
  { name: 'amani jayaweera', phone: '0756789012', prescriptionId: 'PRES-2026-003' },
  { name: 'kushani nimesha',    phone: '0765432198', prescriptionId: 'PRES-2026-004' },
  { name: 'senu sehansa',     phone: '0787654321', prescriptionId: 'PRES-2026-005' },
  { name: 'awishka nuwan',    phone: '0798765432', prescriptionId: 'PRES-2026-006' },
  { name: 'Amara Silva',     phone: '0711223344', prescriptionId: 'PRES-2026-007' },
  { name: 'Lucas Perera',    phone: '0722334455', prescriptionId: 'PRES-2024-008' },
]
const MEDICATIONS = [
  { name: 'Amoxicillin 500mg',       dosage: '1 tablet 3× daily',  price: 10.00 },
  { name: 'Ibuprofen 400mg',          dosage: '1 tablet on pain',   price: 8.00  },
  { name: 'Metronidazole 200mg',      dosage: '1 tablet 2× daily',  price: 12.00 },
  { name: 'Chlorhexidine Mouthwash',  dosage: 'Rinse 2× daily',     price: 15.00 },
  { name: 'Paracetamol 500mg',        dosage: '1–2 tablets on pain', price: 5.00  },
  { name: 'Clindamycin 150mg',        dosage: '1 capsule 4× daily', price: 18.00 },
]
function blankItems() {
  return MEDICATIONS.map(function(m) {
    return { name: m.name, dosage: m.dosage, price: m.price, selected: false, quantity: 1 }
  })
}
export default function CreateOrderPage() {
  var searchParams = useSearchParams()[0]
  var navigate     = useNavigate()
  var editId       = searchParams.get('edit')   // null = create mode, value = edit mode
  var formState    = useState({ patientName: '', patientPhone: '', prescriptionId: '' })
  var form         = formState[0]; var setForm = formState[1]
  var itemsState   = useState(blankItems())
  var items        = itemsState[0]; var setItems = itemsState[1]
  var errorsState  = useState({})
  var errors       = errorsState[0]; var setErrors = errorsState[1]
  var savingState  = useState(false)
  var saving       = savingState[0]; var setSaving = savingState[1]
  var loadingState = useState(false)
  var loading      = loadingState[0]; var setLoading = loadingState[1]
  var blockedState = useState(null)
  var blocked      = blockedState[0]; var setBlocked = blockedState[1]
  // ── If edit mode: fetch existing order and pre-fill ──────────────────
  useEffect(function() {
    if (!editId) return
    setLoading(true)
    axios.get(API + '/orders/' + editId)
      .then(function(res) {
        var order = res.data
        // Validate: can we still edit?
        if (order.orderStatus === 'DELIVERED') {
          setBlocked('This order has been DELIVERED and cannot be edited.')
          setLoading(false)
          return
        }
        if (order.paymentStatus === 'PAID') {
          setBlocked('This order has been PAID and cannot be edited.')
          setLoading(false)
          return
        }
        if (order.orderStatus === 'CANCELLED') {
          setBlocked('This order has been CANCELLED and cannot be edited.')
          setLoading(false)
          return
        }
        // Pre-fill patient info
        setForm({
          patientName:    order.patientName    || '',
          patientPhone:   order.patientPhone   || '',
          prescriptionId: order.prescriptionId || ''
        })
        // Pre-tick medications that were in the order
        var updated = MEDICATIONS.map(function(med) {
          var existing = (order.items || []).find(function(i) {
            return i.medicationName === med.name
          })
          return {
            name:     med.name,
            dosage:   med.dosage,
            price:    med.price,
            selected: !!existing,
            quantity: existing ? existing.quantity : 1
          }
        })
        setItems(updated)
        setLoading(false)
      })
      .catch(function(err) {
        setErrors({ fetch: 'Failed to load order. Please go back and try again.' })
        setLoading(false)
      })
  }, [editId])
  // ── Toggle a medication ───────────────────────────────────────────────
  function toggle(i) {
    var updated = items.slice()
    updated[i]  = Object.assign({}, updated[i], { selected: !updated[i].selected })
    setItems(updated)
  }
  function updateQty(i, val) {
    var updated = items.slice()
    updated[i]  = Object.assign({}, updated[i], { quantity: Math.max(1, parseInt(val) || 1) })
    setItems(updated)
  }
  var selectedItems = items.filter(function(i) { return i.selected })
  var total         = selectedItems.reduce(function(s, i) { return s + i.price * i.quantity }, 0)
  // ── Validate form ─────────────────────────────────────────────────────
  function validate() {
    var e = {}
    if (!form.patientName.trim() || form.patientName.trim().length < 2)
      e.patientName = 'Patient name must be at least 2 characters'
    if (!/^\d{10}$/.test(form.patientPhone))
      e.patientPhone = 'Phone number must be exactly 10 digits'
    if (!form.prescriptionId.trim())
      e.prescriptionId = 'Prescription ID is required'
    if (selectedItems.length === 0)
      e.items = 'Select at least one medication'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  // ── Save (create or update) ───────────────────────────────────────────
  function save() {
    if (!validate()) return
    setSaving(true)
    var payload = {
      patientName:    form.patientName.trim(),
      patientPhone:   form.patientPhone.trim(),
      prescriptionId: form.prescriptionId.trim(),
      items: selectedItems.map(function(i) {
        return {
          medicationName: i.name,
          dosage:         i.dosage,
          quantity:       i.quantity,
          price:          i.price,
          subtotal:       i.price * i.quantity
        }
      })
    }
    var request = editId
      ? axios.put(API + '/orders/' + editId, payload)   // Update
      : axios.post(API + '/orders', payload)             // Create
    request
      .then(function() { navigate('/dashboard') })
      .catch(function(err) {
        var msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error : 'Save failed. Please try again.'
        setErrors({ submit: msg })
        setSaving(false)
      })
  }
  // ── Blocked screen ────────────────────────────────────────────────────
  if (blocked) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚫</div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, color: 'var(--on-background)', marginBottom: '0.75rem' }}>
              Cannot Edit Order
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {blocked}
            </p>
            <button className="btn btn-primary" onClick={function() { navigate('/dashboard') }}>
              ← Back to Orders
            </button>
          </div>
        </main>
      </div>
    )
  }
  // ── Loading screen ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="empty-state">
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: 32, height: 32, margin: '0 auto 1rem' }}></div>
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <span className="page-label">Medication Ordering</span>
            <h1 className="page-title">
              {editId ? 'Edit Order' : 'Create New Order'}
            </h1>
          </div>
          <button className="btn btn-outline" onClick={function() { navigate('/dashboard') }}>
            ← Back to Orders
          </button>
        </div>
        {errors.fetch && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem', color: 'var(--error)', fontWeight: 600 }}>
            {errors.fetch}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* ── Left Column ── */}
          <div>
            {/* Patient Info */}
            <div className="card">
              <h3 className="card-title">
                <span className="material-symbols-outlined">person</span>
                Patient Information
              </h3>
              {/* Patient Name DROPDOWN */}
              <div className="form-group">
                <label className="form-label">Select Patient Name</label>
                <select
                  className="form-control"
                  value={form.patientName}
                  onChange={function(e) {
                    var selected = PATIENTS.find(function(p) { return p.name === e.target.value })
                    if (selected) {
                      setForm({ patientName: selected.name, patientPhone: selected.phone, prescriptionId: selected.prescriptionId })
                    } else {
                      setForm({ patientName: '', patientPhone: '', prescriptionId: '' })
                    }
                  }}
                >
                  <option value="">-- Select a patient --</option>
                  {PATIENTS.map(function(p) {
                    return <option key={p.name} value={p.name}>{p.name}</option>
                  })}
                </select>
                {errors.patientName && <div className="form-error">{errors.patientName}</div>}
              </div>
              <div className="form-row">
                {/* Phone — auto-filled, read only */}
                <div className="form-group">
                  <label className="form-label">Phone Number (auto-filled)</label>
                  <input
                    className="form-control"
                    placeholder="Auto-filled on patient select"
                    value={form.patientPhone}
                    readOnly
                    style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', cursor: 'not-allowed' }}
                  />
                  {errors.patientPhone && <div className="form-error">{errors.patientPhone}</div>}
                </div>
                {/* Prescription ID DROPDOWN — auto-filled */}
                <div className="form-group">
                  <label className="form-label">Prescription ID (auto-filled)</label>
                  <input
                    className="form-control"
                    placeholder="Auto-filled on patient select"
                    value={form.prescriptionId}
                    readOnly
                    style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', cursor: 'not-allowed' }}
                  />
                  {errors.prescriptionId && <div className="form-error">{errors.prescriptionId}</div>}
                </div>
              </div>
              {/* Patient info preview card */}
              {form.patientName && (
                <div style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>person</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--on-background)' }}>{form.patientName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                      📞 {form.patientPhone} &nbsp;·&nbsp; 📋 {form.prescriptionId}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Medication Selection */}
            <div className="card">
              <h3 className="card-title">
                <span className="material-symbols-outlined">pill</span>
                Select Medications
              </h3>
              {errors.items && (
                <div className="form-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                  ⚠️ {errors.items}
                </div>
              )}
              {items.map(function(med, i) {
                return (
                  <div key={i}
                    className={'med-item ' + (med.selected ? 'selected' : '')}
                    onClick={function() { toggle(i) }}
                  >
                    <input type="checkbox" checked={med.selected} readOnly />
                    <div style={{ flex: 1 }}>
                      <div className="med-name">{med.name}</div>
                      <div className="med-dosage">{med.dosage}</div>
                    </div>
                    <input
                      type="number" min={1} value={med.quantity}
                      className="form-control"
                      style={{ width: 72, textAlign: 'center', borderRadius: 'var(--radius-sm)' }}
                      onClick={function(e) { e.stopPropagation() }}
                      onChange={function(e) { updateQty(i, e.target.value) }}
                    />
                    <div className="med-price">Rs. {med.price.toFixed(2)}</div>
                  </div>
                )
              })}
              {errors.submit && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginTop: '1rem', color: 'var(--error)', fontWeight: 600, fontSize: '0.875rem' }}>
                  ⚠️ {errors.submit}
                </div>
              )}
            </div>
          </div>
          {/* ── Right Column — Summary ── */}
          <div>
            {editId && (
              <div className="info-block" style={{ marginBottom: '1rem', background: '#ecfdf5', borderColor: '#6ee7b7' }}>
                <label style={{ color: '#065f46' }}>Editing Order</label>
                <span style={{ color: '#064e3b', fontSize: '0.8rem' }}>
                  Changes will replace the current order data.
                </span>
              </div>
            )}
            <div className="teal-accent-card" style={{ marginBottom: '1.25rem' }}>
              <span className="accent-label">
                {editId ? 'Updated Total' : 'Order Total'}
              </span>
              <div className="accent-amount">Rs. {total.toFixed(2)}</div>
              <div className="accent-sub">{selectedItems.length} medication(s) selected</div>
            </div>
            <div className="card">
              <h3 className="card-title" style={{ fontSize: '0.9rem' }}>Order Summary</h3>
              {selectedItems.length === 0
                ? <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>No medications selected yet.</p>
                : selectedItems.map(function(item, i) {
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--outline-variant)', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>{item.name} ×{item.quantity}</span>
                      <strong style={{ color: 'var(--on-background)' }}>Rs. {(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  )
                })
              }
              {selectedItems.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontWeight: 800, fontFamily: 'var(--font-headline)', color: 'var(--primary)', fontSize: '1rem' }}>
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              )}
              <button className="btn btn-primary btn-full mt-3" onClick={save} disabled={saving}>
                {saving
                  ? <span className="spinner"></span>
                  : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{editId ? 'save' : 'add_circle'}</span>
                }
                {saving ? ' Saving...' : (editId ? ' Save Changes' : ' Create Order')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
