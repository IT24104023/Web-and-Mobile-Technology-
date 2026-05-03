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
} from "../controllers/emergencyController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

// Patient routes
router.post("/", addContact);
router.get("/", getMyContacts);
router.get("/my", getMyContacts); // Alias for web frontend
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);
router.patch("/:id/set-primary", setPrimary);

// Admin routes (to be implemented in controller)
router.get("/admin/all", getAdminAllContacts);
router.put("/admin/:id", updateAdminContact);
router.delete("/admin/:id", deleteAdminContact);

export default router;
