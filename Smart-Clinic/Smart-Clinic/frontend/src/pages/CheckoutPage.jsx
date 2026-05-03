import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/sidebar'
import axios from 'axios'
const API = 'http://localhost:5000/api'
function luhnCheck(number) {
  const digits = number.split('').reverse().map(Number)
  let sum = 0
  digits.forEach(function (d, i) {
    if (i % 2 === 1) { d = d * 2; if (d > 9) d = d - 9 }
    sum = sum + d
  })
  return sum % 10 === 0
}
function isExpiryValid(expiry) {
  const parts = expiry.split('/')
  const mm = parts[0]
  const yy = parts[1]
  if (!mm || !yy) return false
  const exp = new Date('20' + yy, Number(mm) - 1, 1)
  const now = new Date()
  now.setDate(1)
  now.setHours(0, 0, 0, 0)
  return exp >= now
}
function formatCard(val) {
  return val.replaceAll(/\D/g, '').slice(0, 16).replaceAll(/(.{4})/g, '$1 ').trim()
}
function validateCardNumber(number, errors) {
  const clean = number.replaceAll(/\s/g, '')
  if (!clean) {
    errors.number = 'Card number is required'
  } else if (!/^\d+$/.test(clean)) {
    errors.number = 'Digits only — no letters or symbols'
  } else if (clean.length !== 16) {
    errors.number = 'Must be exactly 16 digits'
  } else if (!luhnCheck(clean)) {
    errors.number = 'Invalid card number — failed security check'
  }
}
function validateCardholderName(name, errors) {
  if (!name || name.trim().length < 3) {
    errors.name = 'Cardholder name must be at least 3 characters'
  } else if (!/^[a-zA-Z ]+$/.test(name)) {
    errors.name = 'Name must contain letters only'
  }
}
function validateCardExpiry(expiry, errors) {
  if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.expiry = 'Expiry must be in MM/YY format'
  } else {
    const mm = Number(expiry.split('/')[0])
    const yy = Number(expiry.split('/')[1])
    const now = new Date()
    const currentYear = now.getFullYear() % 100
    if (mm < 1 || mm > 12) {
      errors.expiry = 'Month must be between 01 and 12'
    } else if (!isExpiryValid(expiry)) {
      errors.expiry = 'This card has expired'
    } else if (yy > currentYear + 6) {
      errors.expiry = 'Expiry date cannot exceed 6 years from now'
    }
  }
}
function validateCardCVV(cvv, errors) {
  if (!cvv) {
    errors.cvv = 'CVV is required'
  } else if (!/^\d{3,4}$/.test(cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits'
  }
}
export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const params = searchParams
  const navigate = useNavigate()
  const orderId = params.get('order_id')
  const amount = Number(params.get('amount') || 0)
  const [method, setMethod] = useState('CARD')
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  function validate() {
    const e = {}
    if (method === 'CARD') {
      validateCardNumber(card.number, e)
      validateCardholderName(card.name, e)
      validateCardExpiry(card.expiry, e)
      validateCardCVV(card.cvv, e)
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }
  function pay() {
    if (!validate()) return
    setLoading(true)
    axios.post(API + '/payments', {
      orderId: orderId,
      cardNumber: card.number,
      cardHolderName: card.name,
      cardExpiry: card.expiry,
      cvv: card.cvv,
      paymentMethod: method
    })
      .then(function (response) {
        setSuccess(response.data)
        setLoading(false)
      })
      .catch(function (err) {
        const msg = err.response?.data?.error || 'Payment failed. Please try again.'
        setErrors({ submit: msg })
        setLoading(false)
      })
  }
  if (success) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: 'var(--success)', fontSize: '1.5rem', fontWeight: 800 }}>
              Payment Successful!
            </h2>
            <p className="text-secondary mt-2">Your medication order has been confirmed.</p>
            <div className="info-block mt-3" style={{ textAlign: 'left' }}>
              <label>Transaction ID</label>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {success.transactionId}
              </span>
            </div>
            <div className="info-block" style={{ textAlign: 'left' }}>
              <label>Amount Paid</label>
              <span>
                Rs. {success.payment && success.payment.amount
                  ? Number(success.payment.amount).toFixed(2)
                  : amount.toFixed(2)}
              </span>
            </div>
            <button
              className="btn btn-primary btn-full mt-3"
              onClick={function () { navigate('/dashboard') }}
            >
              Back to Orders
            </button>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">E-Payment</div>
            <div className="topbar-sub">Secure Checkout</div>
          </div>
        </div>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {/* Amount Hero */}
          <div className="checkout-hero">
            <div className="hero-label">
              Order #{orderId ? orderId.slice(-6).toUpperCase() : '------'} · Total Due
            </div>
            <div className="hero-amount">Rs. {amount.toFixed(2)}</div>
            <div className="hero-order">Secure encrypted payment</div>
          </div>
          <div className="card">
            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <div className="pay-methods">
                <label
                  className={'pay-method-card ' + (method === 'CARD' ? 'active' : '')}
                  onClick={function () { setMethod('CARD') }}
                >
                  <input type="radio" name="method" value="CARD" readOnly checked={method === 'CARD'} />
                  <div className="pay-method-icon">💳</div>
                  <div className="pay-method-label">Debit / Credit Card</div>
                </label>
                <label
                  className={'pay-method-card ' + (method === 'BANK_TRANSFER' ? 'active' : '')}
                  onClick={function () { setMethod('BANK_TRANSFER') }}
                >
                  <input type="radio" name="method" value="BANK_TRANSFER" readOnly checked={method === 'BANK_TRANSFER'} />
                  <div className="pay-method-icon">🏦</div>
                  <div className="pay-method-label">Bank Transfer</div>
                </label>
              </div>
            </div>
            {/* Card Fields */}
            {method === 'CARD' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Card Number (16 digits)</label>
                  <input
                    className="form-control"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    maxLength={19}
                    onChange={function (e) {
                      setCard({ number: formatCard(e.target.value), name: card.name, expiry: card.expiry, cvv: card.cvv })
                    }}
                  />
                  {errors.number && <div className="form-error">{errors.number}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    className="form-control"
                    placeholder="Sarah Johnson"
                    value={card.name}
                    onChange={function (e) {
                      setCard({ number: card.number, name: e.target.value, expiry: card.expiry, cvv: card.cvv })
                    }}
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry Date (MM/YY)</label>
                    <input
                      className="form-control"
                      placeholder="12/27"
                      value={card.expiry}
                      maxLength={5}
                      onChange={function (e) {
                        let v = e.target.value.replace(/\D/g, '')
                        if (v.length > 2) { v = v.slice(0, 2) + '/' + v.slice(2, 4) }
                        setCard({ number: card.number, name: card.name, expiry: v, cvv: card.cvv })
                      }}
                    />
                    {errors.expiry && <div className="form-error">{errors.expiry}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      className="form-control"
                      placeholder="123"
                      type="password"
                      value={card.cvv}
                      maxLength={4}
                      onChange={function (e) {
                        setCard({ number: card.number, name: card.name, expiry: card.expiry, cvv: e.target.value.replace(/\D/g, '') })
                      }}
                    />
                    {errors.cvv && <div className="form-error">{errors.cvv}</div>}
                  </div>
                </div>
              </div>
            )}
            {/* Submit Error */}
            {errors.submit && (
              <div className="form-error" style={{ marginBottom: '0.75rem' }}>
                ⚠️ {errors.submit}
              </div>
            )}
            {/* Pay Button */}
            <button className="btn btn-success btn-full" onClick={pay} disabled={loading}>
              {loading
                ? <span>Processing...</span>
                : <span>🔒 Pay Rs. {amount.toFixed(2)}</span>
              }
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              🛡️ 256-bit SSL Encrypted · Card details are never stored
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}