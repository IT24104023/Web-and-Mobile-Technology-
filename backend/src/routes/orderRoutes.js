import express from "express";
import { createOrder, getPatientOrders, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/patient", verifyToken, getPatientOrders);
router.get("/admin", verifyToken, getAllOrders);
router.put("/:id/status", verifyToken, updateOrderStatus);

export default router;
