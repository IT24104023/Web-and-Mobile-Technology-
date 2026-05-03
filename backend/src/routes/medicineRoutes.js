import express from "express";
import { createMedicine, getMedicines, updateMedicine, deleteMedicine } from "../controllers/medicineController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, createMedicine);
router.get("/", verifyToken, getMedicines);
router.put("/:id", verifyToken, updateMedicine);
router.delete("/:id", verifyToken, deleteMedicine);

export default router;
