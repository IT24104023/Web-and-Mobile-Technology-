import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./src/models/User.js";
import { Patient } from "./src/models/Patient.js";
import { Doctor } from "./src/models/Doctor.js";

dotenv.config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dent_ai");
    console.log("Connected to database. Seeding data...");

    const password_hash = await bcrypt.hash("password123", 10);

    // Seed Admin
    let admin = await User.findOne({ email: "admin@dentai.com" });
    if (!admin) {
      await User.create({
        full_name: "System Admin",
        email: "admin@dentai.com",
        password_hash,
        phone: "1234567890",
        role: "admin",
        status: "active"
      });
      console.log("Admin seeded: admin@dentai.com / password123");
    }

    // Seed Patient
    let patient = await User.findOne({ email: "patient@dentai.com" });
    if (!patient) {
      const pUser = await User.create({
        full_name: "Test Patient",
        email: "patient@dentai.com",
        password_hash,
        phone: "0987654321",
        role: "patient",
        status: "active"
      });
      await Patient.create({
        user_id: pUser._id,
        gender: "male",
        blood_group: "O+"
      });
      console.log("Patient seeded: patient@dentai.com / password123");
    }

    // Seed Doctor
    let doctor = await User.findOne({ email: "doctor@dentai.com" });
    if (!doctor) {
      const dUser = await User.create({
        full_name: "Dr. Smith",
        email: "doctor@dentai.com",
        password_hash,
        phone: "1122334455",
        role: "doctor",
        status: "active"
      });
      await Doctor.create({
        user_id: dUser._id,
        specialization: "General Dentistry",
        license_number: "LIC123456",
        experience: 5
      });
      console.log("Doctor seeded: doctor@dentai.com / password123");
    }

    console.log("Seeding complete.");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

runSeed();
