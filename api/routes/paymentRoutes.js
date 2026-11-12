import express from "express";
import { createPaymentController } from "../controllers/paymentController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPaymentController);

export default router;
