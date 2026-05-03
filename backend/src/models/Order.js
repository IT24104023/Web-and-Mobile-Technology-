import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
  items: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "fulfilled", "cancelled"], default: "pending" },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
