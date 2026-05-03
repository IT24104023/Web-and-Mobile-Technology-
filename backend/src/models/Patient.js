import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    date_of_birth: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    blood_group: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    allergies: {
      type: String,
      default: "",
      trim: true,
    },
    medical_notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: false }
);

export const Patient = mongoose.model("Patient", patientSchema);
