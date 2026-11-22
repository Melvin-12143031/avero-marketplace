import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controllers/cartController.js";

const router = express.Router();

// GET cart
router.get("/", protect, getCartController);

// POST add to cart
router.post("/", protect, addToCartController);

// PATCH update cart item
router.patch("/:productId", protect, updateCartItemController);

// DELETE remove cart item
router.delete("/:productId", protect, removeCartItemController);

// DELETE clear cart
router.delete("/", protect, clearCartController);

export default router;
