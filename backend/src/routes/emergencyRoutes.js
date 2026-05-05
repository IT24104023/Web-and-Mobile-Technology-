import express from "express";
import {
  addContact,
  getMyContacts,
  updateContact,
  deleteContact,
  setPrimary,
  getAdminAllContacts,
  updateAdminContact,
  deleteAdminContact,
  getMyContactsWeb,
  syncMyContacts,
  getPatientContacts,
} from "../controllers/emergencyController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

// Patient routes
router.post("/", addContact);
router.get("/", getMyContacts);
router.get("/my", getMyContactsWeb); // Updated for web frontend
router.put("/my", syncMyContacts);    // Added for web frontend bulk save
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);
router.patch("/:id/set-primary", setPrimary);
router.get("/patient/:patientId", getPatientContacts); // Added for doctor search

// Admin routes (to be implemented in controller)
router.get("/admin/all", getAdminAllContacts);
router.put("/admin/:id", updateAdminContact);
router.delete("/admin/:id", deleteAdminContact);

export default router;
