import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  await mongoose.connect(uri);

  // Seed default admin
  await seedDefaultAdmin();
};

const seedDefaultAdmin = async () => {
  try {
    const adminEmail = "admin123@gmail.com";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: adminEmail,
      role: "admin"
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await User.create({
        full_name: "Dent AI Admin",
        email: adminEmail,
        password_hash: hashedPassword,
        phone: "+1-800-DENTAI",
        role: "admin",
        profile_image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcF5gL7i4_dbYl2IQ96R5oWyOCNru_3VpaUI2s5lPOBeKmMYNhh74pftCn3b9OYWxn2_-2_bRctKyu9XXv_RXb3iGUW-jt-1WFc9EgMESCdcql3xZVRKNYxXn5dpShRfWrEZ7gSzmOdU5rDf3TODd_wcwIHcNB_kSE_zv5VJwce_MXV2OP5dpk8CFeLJM9EBOn17XqWyD3t_S2Rr1vXecNPWTMizVSPYMj28yPzv-IAQoh-Ch1dhp9nteu_BgcqWsTJwHLs9tMUJxw",
        status: "active",
      });

      console.log("✓ Default admin created: admin123@gmail.com / admin123");
    }
  } catch (error) {
    console.error("Error seeding default admin:", error.message);
  }
};
