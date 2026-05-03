import express from "express";
import { login, register, getPatientSettings, updatePatientSettings, updateProfile, changePassword, getUsersByRole, getDoctorsWithSpecialization, updateUserStatus } from "../controllers/authController.js";
import { uploadProfileImage } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", uploadProfileImage.single("profile_image"), register);
router.post("/login", login);
router.get("/users", verifyToken, getUsersByRole);
router.get("/doctors/specialization", verifyToken, getDoctorsWithSpecialization);
router.get("/patient/settings", verifyToken, getPatientSettings);
router.put("/patient/settings", verifyToken, uploadProfileImage.single("profile_image"), updatePatientSettings);
router.put("/profile", verifyToken, uploadProfileImage.single("profile_image"), updateProfile);
router.put("/change-password", verifyToken, changePassword);
router.put("/users/:userId/status", verifyToken, updateUserStatus);

export default router;
