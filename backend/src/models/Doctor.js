import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      default: "",
      trim: true,
    },
    license_number: {
      type: String,
      default: "",
      trim: true,
    },
    qualification: {
      type: String,
      default: "",
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    clinic_name: {
      type: String,
      default: "",
      trim: true,
    },
    clinic_address: {
      type: String,
      default: "",
      trim: true,
    },
    working_hours_start: {
      type: String,
      default: "09:00",
    },
    working_hours_end: {
      type: String,
      default: "17:00",
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: false }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
