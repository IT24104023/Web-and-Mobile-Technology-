require('dotenv').config()
const mongoose = require('mongoose')
// ── Connect ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_clinic_db')
  .then(function() { console.log('Connected to MongoDB — seeding sample data...') })
  .catch(function(err) { console.error('Connection error:', err.message); process.exit(1) })
// ── Schemas (inline for simplicity) ──────────────────────────────────────────
var OrderItemSchema = new mongoose.Schema({
  medicationName: String, dosage: String,
  quantity: Number, price: Number, subtotal: Number
})
var OrderSchema = new mongoose.Schema({
  patientName: String, patientPhone: String, prescriptionId: String,
  items: [OrderItemSchema], totalAmount: Number,
  orderStatus: { type: String, default: 'PENDING' },
  paymentStatus: { type: String, default: 'UNPAID' }
}, { timestamps: true })
var Order = mongoose.model('Order', OrderSchema)
// ── Sample Orders ─────────────────────────────────────────────────────────────
var sampleOrders = [
  {
    patientName:    'yohani dhanushika',
    patientPhone:   '0771234567',
    prescriptionId: 'PRES-2026-001',
    orderStatus:    'PENDING',
    paymentStatus:  'UNPAID',
    items: [
      { medicationName: 'Amoxicillin 500mg',      dosage: '1 tablet 3× daily', quantity: 2, price: 10.00, subtotal: 20.00 },
      { medicationName: 'Ibuprofen 400mg',         dosage: '1 tablet on pain',  quantity: 1, price: 8.00,  subtotal: 8.00  }
    ],
    totalAmount: 28.00
  },
  {
    patientName:    'ranga perera',
    patientPhone:   '0712345678',
    prescriptionId: 'PRES-2026-002',
    orderStatus:    'PROCESSING',
    paymentStatus:  'PAID',
    items: [
      { medicationName: 'Metronidazole 200mg',     dosage: '1 tablet 2× daily', quantity: 3, price: 12.00, subtotal: 36.00 },
      { medicationName: 'Chlorhexidine Mouthwash', dosage: 'Rinse 2× daily',    quantity: 1, price: 15.00, subtotal: 15.00 }
    ],
    totalAmount: 51.00
  },
  {
    patientName:    'amani jayaweera',
    patientPhone:   '0756789012',
    prescriptionId: 'PRES-2026-003',
    orderStatus:    'DISPATCHED',
    paymentStatus:  'PAID',
    items: [
      { medicationName: 'Clindamycin 150mg',       dosage: '1 capsule 4× daily', quantity: 2, price: 18.00, subtotal: 36.00 },
      { medicationName: 'Paracetamol 500mg',        dosage: '1–2 tabs on pain',   quantity: 2, price: 5.00,  subtotal: 10.00 }
    ],
    totalAmount: 46.00
  },
  {
    patientName:    'kushani nimesha',
    patientPhone:   '0765432198',
    prescriptionId: 'PRES-2026-004',
    orderStatus:    'DELIVERED',
    paymentStatus:  'PAID',
    items: [
      { medicationName: 'Amoxicillin 500mg',       dosage: '1 tablet 3× daily', quantity: 1, price: 10.00, subtotal: 10.00 },
      { medicationName: 'Chlorhexidine Mouthwash', dosage: 'Rinse 2× daily',    quantity: 1, price: 15.00, subtotal: 15.00 },
      { medicationName: 'Paracetamol 500mg',        dosage: '1–2 tabs on pain',  quantity: 3, price: 5.00,  subtotal: 15.00 }
    ],
    totalAmount: 40.00
  },
  {
    patientName:    'senu sehansa',
    patientPhone:   '0787654321',
    prescriptionId: 'PRES-2026-005',
    orderStatus:    'PENDING',
    paymentStatus:  'UNPAID',
    items: [
      { medicationName: 'Ibuprofen 400mg',         dosage: '1 tablet on pain',   quantity: 2, price: 8.00,  subtotal: 16.00 },
      { medicationName: 'Metronidazole 200mg',     dosage: '1 tablet 2× daily',  quantity: 1, price: 12.00, subtotal: 12.00 }
    ],
    totalAmount: 28.00
  },
  {
    patientName:    'awishka nuwan',
    patientPhone:   '0798765432',
    prescriptionId: 'PRES-2026-006',
    orderStatus:    'CANCELLED',
    paymentStatus:  'UNPAID',
    items: [
      { medicationName: 'Clindamycin 150mg',       dosage: '1 capsule 4× daily', quantity: 1, price: 18.00, subtotal: 18.00 }
    ],
    totalAmount: 18.00
  }
]
// ── Insert ─────────────────────────────────────────────────────────────────────
Order.deleteMany({})
  .then(function() {
    console.log('Cleared existing orders.')
    return Order.insertMany(sampleOrders)
  })
  .then(function(inserted) {
    console.log('\n✅ Inserted ' + inserted.length + ' sample orders:\n')
    inserted.forEach(function(o) {
      console.log('  - ' + o.patientName + ' | ' + o.prescriptionId + ' | ' + o.orderStatus + ' | Rs.' + o.totalAmount)
    })
    console.log('\n🎉 Seed complete! Restart your backend and open http://localhost:3000')
    mongoose.disconnect()
  })
  .catch(function(err) {
    console.error('Seed error:', err.message)
    mongoose.disconnect()
  })