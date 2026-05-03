import express from "express";
import {
  bookAppointment,
  getAvailableSlots,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  completeAppointment,
  getAppointmentStats,
  getAllAppointments,
  updateAppointmentByAdmin,
  deleteAppointmentByAdmin,
} from "../controllers/appointmentController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/available-slots", getAvailableSlots);

// Protected routes
router.use(verifyToken);

// Patient routes
router.post("/book", authorize("patient"), bookAppointment);
router.get("/my-appointments", authorize("patient"), getMyAppointments);
router.put("/cancel/:id", authorize("patient"), cancelAppointment);
router.put("/reschedule/:id", authorize("patient"), rescheduleAppointment);
router.get("/stats", authorize("patient"), getAppointmentStats);

// Doctor routes
router.get("/doctor-appointments", authorize("doctor"), getDoctorAppointments);
router.put("/confirm/:id", authorize("doctor"), confirmAppointment);
router.put("/complete/:id", authorize("doctor"), completeAppointment);

// Admin routes
router.get("/all", authorize("admin"), getAllAppointments);
router.put("/admin/:id", authorize("admin"), updateAppointmentByAdmin);
router.delete("/admin/:id", authorize("admin"), deleteAppointmentByAdmin);

export default router;
