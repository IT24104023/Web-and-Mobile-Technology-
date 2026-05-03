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
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Health Check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "active", message: "Dent AI API is running" });
});

app.get("/api/auth/test", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token verified successfully", user: req.user });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", verifyToken, feedbackRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/emergency", emergencyRoutes);

// Static files for Frontend
const frontendPath = path.join(__dirname, "../frontend-web/dist");
app.use(express.static(frontendPath));

// Catch-all route to serve Frontend index.html
app.get("*", (req, res) => {
  // If request is for API, don't serve index.html
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  
  const indexPath = path.join(frontendPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send("Dent AI API is running. Frontend build not found.");
    }
  });
});

// Error handling
app.use((err, _req, res, _next) => {
  res.status(500).json({ message: "Unexpected server error", error: err.message });
});

export default app;

