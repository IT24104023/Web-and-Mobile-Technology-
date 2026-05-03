import app from "../backend/src/app.js";
import { connectDB } from "../backend/src/config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize DB connection for serverless environment
const init = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failed", err);
  }
};

init();

export default app;
