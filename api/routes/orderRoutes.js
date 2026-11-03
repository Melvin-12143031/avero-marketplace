import express from "express";
import {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
} from "../controllers/orderController.js";

const router = express.Router();

// Get all orders
router.get("/", getAllOrdersController);

// Get a single order by ID
router.get("/:id", getOrderByIdController);

// Create a new order
router.post("/", createOrderController);

export default router;
