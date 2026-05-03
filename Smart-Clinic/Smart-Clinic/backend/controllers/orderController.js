const Order = require('../models/order')

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function getAllOrders(req, res) {
  Order.find().sort({ createdAt: -1 })
    .then(function (orders) { sendJSON(res, 200, orders) })
    .catch(function (err) { sendJSON(res, 500, { error: err.message }) })
}

function getOrderById(req, res, id) {
  Order.findById(id)
    .then(function (order) {
      if (!order) return sendJSON(res, 404, { error: 'Order not found' })
      sendJSON(res, 200, order)
    })
    .catch(function (err) { sendJSON(res, 500, { error: err.message }) })
}

function createOrder(req, res, body) {
  var errors = []
  if (!body.patientName || body.patientName.trim().length < 2)
    errors.push('Patient name must be at least 2 characters')
  if (!body.patientPhone || !/^\d{10}$/.test(body.patientPhone))
    errors.push('Phone number must be exactly 10 digits')
  if (!body.prescriptionId || !body.prescriptionId.trim())
    errors.push('Prescription ID is required')
  if (!body.items || body.items.length === 0)
    errors.push('At least one medication item is required')
  if (errors.length > 0)
    return sendJSON(res, 400, { error: errors.join(', ') })

  var total = 0
  for (var i = 0; i < body.items.length; i++)
    total += body.items[i].subtotal || (body.items[i].price * body.items[i].quantity)

  var order = new Order({
    patientName: body.patientName.trim(), patientPhone: body.patientPhone.trim(),
    prescriptionId: body.prescriptionId.trim(), items: body.items,
    totalAmount: total, orderStatus: 'PENDING', paymentStatus: 'UNPAID'
  })
  order.save()
    .then(function (saved) { sendJSON(res, 201, saved) })
    .catch(function (err) { sendJSON(res, 400, { error: err.message }) })
}

function updateOrder(req, res, id, body) {
  Order.findById(id)
    .then(function (order) {
      if (!order)
        return sendJSON(res, 404, { error: 'Order not found' })
      if (order.orderStatus === 'DELIVERED')
        return sendJSON(res, 400, { error: 'Cannot edit a delivered order.' })
      if (order.paymentStatus === 'PAID')
        return sendJSON(res, 400, { error: 'Cannot edit a paid order.' })
      if (order.orderStatus === 'CANCELLED')
        return sendJSON(res, 400, { error: 'Cannot edit a cancelled order.' })

      if (body.patientName) order.patientName = body.patientName.trim()
      if (body.patientPhone) order.patientPhone = body.patientPhone.trim()
      if (body.prescriptionId) order.prescriptionId = body.prescriptionId.trim()

      if (body.items && body.items.length > 0) {
        order.items = body.items
        var total = 0
        for (var i = 0; i < body.items.length; i++)
          total += body.items[i].subtotal || (body.items[i].price * body.items[i].quantity)
        order.totalAmount = total
      }
      return order.save()
    })
    .then(function (updated) { if (updated) sendJSON(res, 200, updated) })
    .catch(function (err) { sendJSON(res, 500, { error: err.message }) })
}

function cancelOrder(req, res, id) {
  Order.findById(id)
    .then(function (order) {
      if (!order) return sendJSON(res, 404, { error: 'Order not found' })
      if (order.orderStatus === 'DELIVERED')
        return sendJSON(res, 400, { error: 'Cannot cancel a delivered order.' })
      if (order.orderStatus === 'CANCELLED')
        return sendJSON(res, 400, { error: 'Order is already cancelled.' })
      order.orderStatus = 'CANCELLED'
      return order.save()
    })
    .then(function (updated) {
      if (updated) sendJSON(res, 200, { message: 'Order cancelled', order: updated })
    })
    .catch(function (err) { sendJSON(res, 500, { error: err.message }) })
}

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, cancelOrder }
