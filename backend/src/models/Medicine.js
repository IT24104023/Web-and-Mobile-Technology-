import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  defaultDosage: { type: String, default: "" },
}, { timestamps: true });

export const Medicine = mongoose.model("Medicine", medicineSchema);
