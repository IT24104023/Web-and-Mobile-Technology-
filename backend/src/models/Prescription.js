import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicines: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: "" }
  }],
  status: { type: String, enum: ["active", "completed"], default: "active" },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
