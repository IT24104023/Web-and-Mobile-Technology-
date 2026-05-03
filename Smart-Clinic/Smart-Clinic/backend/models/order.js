const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  medicationName: { type: String, required: true },
  dosage:         { type: String },
  quantity:       { type: Number, required: true, min: 1 },
  price:          { type: Number, required: true, min: 0 },
  subtotal:       { type: Number, required: true }
})

const orderSchema = new mongoose.Schema({
  patientName:    { type: String, required: true },
  patientPhone:   { type: String, required: true },
  prescriptionId: { type: String, required: true },
  items:          { type: [orderItemSchema], required: true },
  totalAmount:    { type: Number, required: true },
  orderStatus:    { type: String, default: 'PENDING',
                    enum: ['PENDING','PAID','PROCESSING','DISPATCHED','DELIVERED','CANCELLED'] },
  paymentStatus:  { type: String, default: 'UNPAID',
                    enum: ['UNPAID','PAID','REFUNDED'] }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
