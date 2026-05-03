const url          = require('url')
const orderCtrl    = require('../controllers/orderController')
const paymentCtrl  = require('../controllers/paymentController')

function router(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  var parsed = url.parse(req.url, true)
  var path   = parsed.pathname
  var method = req.method

  function readBody(callback) {
    var data = ''
    req.on('data', function(chunk) { data += chunk })
    req.on('end', function() {
      try { callback(JSON.parse(data || '{}')) } catch(e) { callback({}) }
    })
  }

  function sendJSON(status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  }

  if (path === '/api/orders' && method === 'GET')
    return orderCtrl.getAllOrders(req, res)

  if (path === '/api/orders' && method === 'POST')
    return readBody(function(body) { orderCtrl.createOrder(req, res, body) })

  var orderMatch = path.match(/^\/api\/orders\/([a-f0-9]{24})$/)

  if (orderMatch && method === 'GET')
    return orderCtrl.getOrderById(req, res, orderMatch[1])

  if (orderMatch && method === 'PUT')
    return readBody(function(body) { orderCtrl.updateOrder(req, res, orderMatch[1], body) })

  if (orderMatch && method === 'DELETE')
    return orderCtrl.cancelOrder(req, res, orderMatch[1])

  if (path === '/api/payments' && method === 'POST')
    return readBody(function(body) { paymentCtrl.processPayment(req, res, body) })

  sendJSON(404, { error: 'Route not found: ' + method + ' ' + path })
}

module.exports = router
