import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import { verifyToken } from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Dent AI API is running" });
});

app.get("/api/auth/test", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token verified successfully", user: req.user });
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", verifyToken, feedbackRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use((err, _req, res, _next) => {
  res.status(500).json({ message: "Unexpected server error", error: err.message });
});

export default app;
