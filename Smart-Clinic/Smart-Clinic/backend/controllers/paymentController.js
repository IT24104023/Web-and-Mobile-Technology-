const Payment = require('../models/payment')
const Order   = require('../models/order')
const crypto  = require('node:crypto')

// ── Card Validation Helpers ──

// Luhn Algorithm — checks if card number is mathematically valid
function luhnCheck(cardNumber) {
  const digits = cardNumber.split('').reverse().map(Number)
  let sum = 0
  digits.forEach((d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9 }
    sum += d
  })
  return sum % 10 === 0
}

// Check expiry is not in the past
function isExpiryValid(expiry) {
  const [month, year] = expiry.split('/')
  if (!month || !year) return false
  const expDate = new Date(`20${year}`, month - 1, 1)
  const today = new Date()
  today.setDate(1); today.setHours(0,0,0,0)
  return expDate >= today
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

// POST process payment
exports.processPayment = async (req, res, body) => {
  const { orderId, cardNumber, cardHolderName, cardExpiry, cvv, paymentMethod } = body

  // ── Order check ──
  const order = await Order.findById(orderId)
  if (!order) return sendJSON(res, 404, { error: 'Order not found' })
  if (order.paymentStatus === 'PAID')
    return sendJSON(res, 400, { error: 'Order is already paid' })
  if (order.orderStatus === 'CANCELLED')
    return sendJSON(res, 400, { error: 'Cannot pay for a cancelled order' })

  if (paymentMethod === 'CARD') {
    // ── Card Number Validations ──
    const cleanCard = cardNumber?.replace(/\s/g, '')

    if (!cleanCard)
      return sendJSON(res, 400, { error: 'Card number is required' })
    if (!/^\d+$/.test(cleanCard))
      return sendJSON(res, 400, { error: 'Card number must contain digits only' })
    if (cleanCard.length !== 16)
      return sendJSON(res, 400, { error: 'Card number must be exactly 16 digits' })
    if (!luhnCheck(cleanCard))
      return sendJSON(res, 400, { error: 'Invalid card number — failed security check' })

    // ── Card Holder Name ──
    if (!cardHolderName || cardHolderName.trim().length < 3)
      return sendJSON(res, 400, { error: 'Cardholder name must be at least 3 characters' })
    if (!/^[a-zA-Z\s]+$/.test(cardHolderName))
      return sendJSON(res, 400, { error: 'Cardholder name must contain letters only' })

    // ── Expiry Date ──
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry))
      return sendJSON(res, 400, { error: 'Expiry date must be in MM/YY format' })
    const month = Number.parseInt(cardExpiry.split('/')[0])
    if (month < 1 || month > 12)
      return sendJSON(res, 400, { error: 'Expiry month must be between 01 and 12' })
    if (!isExpiryValid(cardExpiry))
      return sendJSON(res, 400, { error: 'Card has expired' })

    // ── CVV ──
    if (!cvv)
      return sendJSON(res, 400, { error: 'CVV is required' })
    if (!/^\d{3,4}$/.test(cvv))
      return sendJSON(res, 400, { error: 'CVV must be 3 or 4 digits' })
  }

  // ── Create payment record ──
  const transactionId = crypto.randomBytes(10).toString('hex').toUpperCase()
  const payment = await Payment.create({
    orderId,
    amount:         order.totalAmount,
    cardHolderName: cardHolderName || 'N/A',
    cardLast4:      cardNumber ? cardNumber.replaceAll(/\s/g,'').slice(-4) : '0000',
    cardExpiry:     cardExpiry || 'N/A',
    paymentMethod:  paymentMethod || 'CARD',
    paymentStatus:  'SUCCESS',
    transactionId
  })

  // ── Update order ──
  order.paymentStatus = 'PAID'
  order.orderStatus   = 'PAID'
  await order.save()

  sendJSON(res, 201, { message: 'Payment successful', transactionId, payment, order })
}

// GET payment by order ID
exports.getPayment = async (req, res, sendJSON, orderId) => {
  const payment = await Payment.findOne({ orderId })
  if (!payment) return sendJSON(res, 404, { error: 'No payment record found' })
  sendJSON(res, 200, payment)
}
