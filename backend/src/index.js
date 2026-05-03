import dotenv from "dotenv";
import os from "os";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

const bootstrap = async () => {
  try {
    await connectDB();
    const localIP = getLocalIP();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n==============================================`);
      console.log(`Dent AI Backend is running!`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Network: http://${localIP}:${PORT}`);
      console.log(`==============================================\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

bootstrap();
