import express from "express";
import {
  createPaymentController,
  updatePaymentStatusController,
  refundPaymentController,
  getOrderPaymentHistoryController,
} from "../controllers/paymentController.js";
import protect from "../middleware/authMiddleware.js";
import AuthorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.post("/", protect, createPaymentController);

// Update payment status (Admin only)
router.patch(
  "/:id/status",
  protect,
  AuthorizeRoles("admin"),
  updatePaymentStatusController,
);

// Get order payment history
router.get(
  "/orders/:orderId/history",
  protect,
  AuthorizeRoles("admin"),
  getOrderPaymentHistoryController,
);

// Refund payment (Admin only)
router.post(
  "/:id/refund",
  protect,
  AuthorizeRoles("admin"),
  refundPaymentController,
);

export default router;
