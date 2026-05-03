import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/User.js";
import { Appointment } from "./src/models/Appointment.js";
import { Payment } from "./src/models/Payment.js";
import { Feedback } from "./src/models/Feedback.js";

dotenv.config();

const runDiagnostics = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✓ Connected to MongoDB\n");

    // Get all users
    const allUsers = await User.countDocuments();
    const patients = await User.countDocuments({ role: "patient" });
    const doctors = await User.countDocuments({ role: "doctor" });
    const admins = await User.countDocuments({ role: "admin" });

    console.log("=== USERS COLLECTION ===");
    console.log(`Total Users: ${allUsers}`);
    console.log(`  - Patients: ${patients}`);
    console.log(`  - Doctors: ${doctors}`);
    console.log(`  - Admins: ${admins}`);

    // Get all appointments
    const allAppointments = await Appointment.countDocuments();
    console.log("\n=== APPOINTMENTS COLLECTION ===");
    console.log(`Total Appointments: ${allAppointments}`);

    if (allAppointments > 0) {
      // Get appointment statuses breakdown
      const statusCounts = await Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      console.log("Status Breakdown:");
      statusCounts.forEach((item) => {
        console.log(`  - ${item._id}: ${item.count}`);
      });

      // Show sample appointments with their dates
      const samples = await Appointment.find()
        .populate("patient_id", "full_name")
        .populate("doctor_id", "full_name")
        .limit(3);

      console.log("\nSample Appointments:");
      samples.forEach((apt, idx) => {
        console.log(
          `  ${idx + 1}. ${apt.patient_name} → ${apt.doctor_name}`
        );
        console.log(
          `     Date: ${apt.appointment_date} (${apt.appointment_date.toISOString()})`
        );
        console.log(`     Time: ${apt.appointment_time}`);
        console.log(`     Status: ${apt.status}\n`);
      });

      // Check today's appointments
      const today = new Date();
      const todayStart = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0)
      );
      const todayEnd = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999)
      );

      console.log("Today's Date (UTC):");
      console.log(`  Start: ${todayStart.toISOString()}`);
      console.log(`  End: ${todayEnd.toISOString()}`);

      const todayAppointments = await Appointment.countDocuments({
        appointment_date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });
      console.log(`\nAppointments for Today (${today.toDateString()}): ${todayAppointments}`);
    }

    // Get payments
    const allPayments = await Payment.countDocuments();
    console.log("\n=== PAYMENTS COLLECTION ===");
    console.log(`Total Payments: ${allPayments}`);

    if (allPayments > 0) {
      const paymentStatuses = await Payment.aggregate([
        {
          $group: {
            _id: "$payment_status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);

      console.log("Payment Status Breakdown:");
      paymentStatuses.forEach((item) => {
        console.log(
          `  - ${item._id}: ${item.count} (Total: $${item.totalAmount.toFixed(2)})`
        );
      });
    }

    // Get feedbacks
    const allFeedbacks = await Feedback.countDocuments({ is_deleted: false });
    console.log("\n=== FEEDBACK COLLECTION ===");
    console.log(`Total Feedbacks: ${allFeedbacks}`);

    if (allFeedbacks > 0) {
      const avgRating = await Feedback.aggregate([
        { $match: { is_deleted: false } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            minRating: { $min: "$rating" },
            maxRating: { $max: "$rating" },
          },
        },
      ]);

      if (avgRating.length > 0) {
        console.log(`Average Rating: ${avgRating[0].averageRating.toFixed(2)}`);
        console.log(`Rating Range: ${avgRating[0].minRating} - ${avgRating[0].maxRating}`);
      }
    }

    console.log("\n✓ Diagnostics Complete\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runDiagnostics();
