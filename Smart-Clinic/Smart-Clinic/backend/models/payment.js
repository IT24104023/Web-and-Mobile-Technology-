const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  orderId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:         { type: Number, required: true },
  cardHolderName: { type: String, required: true },
  cardLast4:      { type: String, required: true },   // store only last 4 digits
  cardExpiry:     { type: String, required: true },   // MM/YY
  paymentMethod:  { type: String, default: 'CARD',
                    enum: ['CARD', 'BANK_TRANSFER'] },
  paymentStatus:  { type: String, default: 'SUCCESS',
                    enum: ['SUCCESS', 'FAILED', 'REFUNDED'] },
  transactionId:  { type: String, unique: true },
  paidAt:         { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)
