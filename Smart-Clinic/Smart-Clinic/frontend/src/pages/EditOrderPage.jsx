import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/sidebar'
import axios from 'axios'
const API = 'http://localhost:5000/api'
const MEDICATIONS = [
  { name: 'Amoxicillin 500mg', dosage: '1 tablet 3× daily', price: 10.00 },
  { name: 'Ibuprofen 400mg', dosage: '1 tablet on pain', price: 8.00 },
  { name: 'Metronidazole 200mg', dosage: '1 tablet 2× daily', price: 12.00 },
  { name: 'Chlorhexidine Mouthwash', dosage: 'Rinse 2× daily', price: 15.00 },
  { name: 'Paracetamol 500mg', dosage: '1–2 tablets on pain', price: 5.00 },
  { name: 'Clindamycin 150mg', dosage: '1 capsule 4× daily', price: 18.00 },
]
const PATIENTS = [
  { name: 'yohani dhanushika', phone: '0771234567', prescriptionId: 'PRES-2026-001' },
  { name: 'ranga perera', phone: '0712345678', prescriptionId: 'PRES-2026-002' },
  { name: 'amani jayaweera', phone: '0756789012', prescriptionId: 'PRES-2026-003' },
  { name: 'kushani nimesha', phone: '0765432198', prescriptionId: 'PRES-2026-004' },
  { name: 'senu sehansa', phone: '0787654321', prescriptionId: 'PRES-2026-005' },
  { name: 'awishka nuwan', phone: '0798765432', prescriptionId: 'PRES-2026-006' },
  { name: 'Amara Silva', phone: '0711223344', prescriptionId: 'PRES-2026-007' },
  { name: 'Lucas Perera', phone: '0722334455', prescriptionId: 'PRES-2026-008' },
]
function blankItems() {
  return MEDICATIONS.map(function (m) {
    return { name: m.name, dosage: m.dosage, price: m.price, selected: false, quantity: 1 }
  })
}
export default function EditOrderPage() {
  var params = useParams()
  var navigate = useNavigate()
  var orderId = params.id
  // Form state
  var formState = useState({ patientName: '', patientPhone: '', prescriptionId: '' })
  var form = formState[0]; var setForm = formState[1]
  var itemsState = useState(blankItems())
  var items = itemsState[0]; var setItems = itemsState[1]
  var errState = useState({})
  var errors = errState[0]; var setErrors = errState[1]
  var savingState = useState(false)
  var saving = savingState[0]; var setSaving = savingState[1]
  var loadState = useState(true)
  var loading = loadState[0]; var setLoading = loadState[1]
  var blockState = useState(null)
  var blocked = blockState[0]; var setBlocked = blockState[1]
  // ── Fetch existing order on load ────────────────────────────────────────────
  useEffect(function () {
    axios.get(API + '/orders/' + orderId)
      .then(function (response) {
        var order = response.data
        // Block editing for non-editable statuses
        if (order.orderStatus === 'DELIVERED') {
          setBlocked('This order has already been DELIVERED and cannot be changed.')
          setLoading(false)
          return
        }
        if (order.paymentStatus === 'PAID') {
          setBlocked('This order has already been PAID and cannot be edited.')
          setLoading(false)
          return
        }
        if (order.orderStatus === 'CANCELLED') {
          setBlocked('This order has been CANCELLED and cannot be edited.')
          setLoading(false)
          return
        }
        if (order.orderStatus === 'PROCESSING') {
          setBlocked('This order is currently being PROCESSED and cannot be edited.')
          setLoading(false)
          return
        }
        if (order.orderStatus === 'DISPATCHED') {
          setBlocked('This order has been DISPATCHED and is on the way. Cannot be edited.')
          setLoading(false)
          return
        }
        // ── Pre-fill patient info ──────────────────────────────────────────
        setForm({
          patientName: order.patientName || '',
          patientPhone: order.patientPhone || '',
          prescriptionId: order.prescriptionId || ''
        })
        // ── Pre-tick medications from the saved order ──────────────────────
        var updated = MEDICATIONS.map(function (med) {
          var match = (order.items || []).find(function (i) {
            return i.medicationName === med.name
          })
          return {
            name: med.name,
            dosage: med.dosage,
            price: med.price,
            selected: !!match,
            quantity: match ? match.quantity : 1
          }
        })
        setItems(updated)
        setLoading(false)
      })
      .catch(function () {
        setErrors({ fetch: 'Could not load order. Make sure the backend is running.' })
        setLoading(false)
      })
  }, [orderId])
  // ── Medication helpers ──────────────────────────────────────────────────────
  function toggle(i) {
    var u = items.slice()
    u[i] = Object.assign({}, u[i], { selected: !u[i].selected })
    setItems(u)
  }
  function changeQty(i, val) {
    var u = items.slice()
    u[i] = Object.assign({}, u[i], { quantity: Math.max(1, parseInt(val) || 1) })
    setItems(u)
  }
  var selected = items.filter(function (i) { return i.selected })
  var total = selected.reduce(function (s, i) { return s + i.price * i.quantity }, 0)
  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    var e = {}
    if (!form.patientName)
      e.patient = 'Please select a patient'
    if (selected.length === 0)
      e.items = 'Select at least one medication'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  // ── Save ────────────────────────────────────────────────────────────────────
  function save() {
    if (!validate()) return
    setSaving(true)
    axios.put(API + '/orders/' + orderId, {
      patientName: form.patientName,
      patientPhone: form.patientPhone,
      prescriptionId: form.prescriptionId,
      items: selected.map(function (i) {
        return {
          medicationName: i.name,
          dosage: i.dosage,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.price * i.quantity
        }
      })
    })
      //  (goes to payment with order details):
      .then(function (res) {
        navigate('/checkout?order_id=' + res.data._id + '&amount=' + res.data.totalAmount)
      })

      .catch(function (err) {
        var msg = err.response && err.response.data && err.response.data.error
          ? err.response.data.error : 'Save failed. Please try again.'
        setErrors({ submit: msg })
        setSaving(false)
      })
  }
  // ── BLOCKED SCREEN ──────────────────────────────────────────────────────────
  if (blocked) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚫</div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Cannot Edit This Order
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{blocked}</p>
            <button className="btn btn-primary" onClick={function () { navigate('/dashboard') }}>
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }
  // ── LOADING SCREEN ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="empty-state" style={{ paddingTop: '5rem' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', width: 36, height: 36, margin: '0 auto 1rem' }}></div>
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }
  // ── FETCH ERROR ─────────────────────────────────────────────────────────────
  if (errors.fetch) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 480, textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, marginBottom: '0.75rem' }}>
              Error Loading Order
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>{errors.fetch}</p>
            <button className="btn btn-primary" onClick={function () { navigate('/dashboard') }}>
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }
  // ── EDIT FORM ───────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <span className="page-label">Medication Ordering</span>
            <h1 className="page-title">Edit Order</h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Editing order #{orderId.slice(-6).toUpperCase()} — make your changes and click Save
            </p>
          </div>
          <button className="btn btn-outline" onClick={function () { navigate(`/orders/create/${orderId}`) }}>
            ← Cancel
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* ── LEFT: Form ── */}
          <div>
            {/* Patient selector */}
            <div className="card">
              <h3 className="card-title">
                <span className="material-symbols-outlined">person</span>
                Patient Information
              </h3>
              {/* Dropdown to change patient */}
              <div className="form-group">
                <label className="form-label">Change Patient</label>
                <select
                  className="form-control"
                  value={form.patientName}
                  onChange={function (e) {
                    var p = PATIENTS.find(function (p) { return p.name === e.target.value })
                    if (p) setForm({ patientName: p.name, patientPhone: p.phone, prescriptionId: p.prescriptionId })
                    else setForm({ patientName: '', patientPhone: '', prescriptionId: '' })
                  }}
                >
                  <option value="">-- Select a patient --</option>
                  {PATIENTS.map(function (p) { return <option key={p.name}>{p.name}</option> })}
                </select>
                {errors.patient && <div className="form-error">{errors.patient}</div>}
              </div>
              {/* All 3 fields: auto-filled & read-only */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Patient Name (auto-filled)</label>
                  <input
                    className="form-control"
                    value={form.patientName}
                    readOnly
                    placeholder="Auto-filled on patient select"
                    style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', color: 'var(--on-surface-variant)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (auto-filled)</label>
                  <input
                    className="form-control"
                    value={form.patientPhone}
                    readOnly
                    placeholder="Auto-filled on patient select"
                    style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', color: 'var(--on-surface-variant)' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Prescription ID (auto-filled)</label>
                <input
                  className="form-control"
                  value={form.prescriptionId}
                  readOnly
                  placeholder="Auto-filled on patient select"
                  style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', color: 'var(--on-surface-variant)' }}
                />
              </div>
              {/* Patient preview card */}
              {form.patientName && (
                <div style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>person</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{form.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--on-surface-variant)' }}>
                      📞 {form.patientPhone} &nbsp;·&nbsp; 📋 {form.prescriptionId}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Medication checkboxes */}
            <div className="card">
              <h3 className="card-title">
                <span className="material-symbols-outlined">pill</span>
                Select Medications
              </h3>
              {errors.items && (
                <div className="form-error" style={{ marginBottom: '1rem' }}>⚠️ {errors.items}</div>
              )}
              {items.map(function (med, i) {
                return (
                  <div key={i}
                    className={'med-item ' + (med.selected ? 'selected' : '')}
                    onClick={function () { toggle(i) }}
                  >
                    <input type="checkbox" checked={med.selected} readOnly />
                    <div style={{ flex: 1 }}>
                      <div className="med-name">{med.name}</div>
                      <div className="med-dosage">{med.dosage}</div>
                    </div>
                    <input
                      type="number" min={1} value={med.quantity}
                      className="form-control"
                      style={{ width: 70, textAlign: 'center' }}
                      onClick={function (e) { e.stopPropagation() }}
                      onChange={function (e) { changeQty(i, e.target.value) }}
                    />
                    <div className="med-price">Rs. {med.price.toFixed(2)}</div>
                  </div>
                )
              })}
              {errors.submit && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginTop: '1rem', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ⚠️ {errors.submit}
                </div>
              )}
            </div>
          </div>
          {/* ── RIGHT: Summary ── */}
          <div>
            <div style={{ background: 'var(--surface-container-low)', border: '1px solid #6ee7b7', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Editing Existing Order</div>
              <div style={{ fontSize: '0.8rem', color: '#064e3b', marginTop: '0.2rem' }}>Your changes will update the saved order.</div>
            </div>
            <div className="teal-accent-card" style={{ marginBottom: '1.25rem' }}>
              <span className="accent-label">Updated Total</span>
              <div className="accent-amount">Rs. {total.toFixed(2)}</div>
              <div className="accent-sub">{selected.length} medication(s) selected</div>
            </div>
            <div className="card">
              <h3 className="card-title" style={{ fontSize: '0.875rem' }}>Order Summary</h3>
              {selected.length === 0
                ? <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>No medications selected.</p>
                : selected.map(function (item, i) {
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid var(--surface-container)', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>{item.name} ×{item.quantity}</span>
                      <strong>Rs. {(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                  )
                })
              }
              {selected.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontWeight: 800, fontFamily: 'var(--font-headline)', color: 'var(--primary)', fontSize: '1rem' }}>
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              )}
              <button className="btn btn-primary btn-full mt-3" onClick={save} disabled={saving} >
                {saving
                  ? <><span className="spinner"></span> Saving...</>
                  : <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>save</span> Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
