import express from "express";
import AuthorizeRoles from "../middleware/authorizeRoles.js";

import {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  updateOrderStatusController,
  getAllOrdersForAdminController,
  getOrderStatisticsController,
} from "../controllers/orderController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all orders
router.get("/", protect, getAllOrdersController);

// Update order status (Admin only)
router.patch(
  "/:id/status",
  protect,
  AuthorizeRoles("admin"),
  updateOrderStatusController,
);

// Get order statistics (Admin only)
router.get(
  "/admin/statistics",
  protect,
  AuthorizeRoles("admin"),
  getOrderStatisticsController,
);

// Get all orders for admin
router.get(
  "/admin/all",
  protect,
  AuthorizeRoles("admin"),
  getAllOrdersForAdminController,
);

// Get a single order by ID
router.get("/:id", protect, getOrderByIdController);

// Create a new order
router.post("/", protect, createOrderController);

export default router;
