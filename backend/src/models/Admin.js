import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: ["manage_users", "manage_doctors", "manage_appointments", "view_reports", "system_settings"],
      },
    ],
    department: {
      type: String,
      default: "Administration",
    },
  },
  {
    timestamps: true,
  }
);

export const Admin = mongoose.model("Admin", AdminSchema);
