import express from "express";
import { createPrescription, getPatientPrescriptions, getDoctorPrescriptions } from "../controllers/prescriptionController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, createPrescription);
router.get("/patient/:patientId?", verifyToken, getPatientPrescriptions);
router.get("/doctor", verifyToken, getDoctorPrescriptions);

export default router;
