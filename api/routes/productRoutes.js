import express from "express";
import {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  getProductsForAdminController,
  getLowStockProductsController,
  updateProductStatusController,
} from "../controllers/productController.js";

import validateRequest from "../middleware/validateRequest.js";
import { productSchema } from "../validators/productValidator.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import upload from "../middleware/uploadMiddleware.js";
import { uploadImageController } from "../controllers/imageController.js";

const router = express.Router();

// Get all active products
router.get("/", getProductsController);

// Get all products for admin
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getProductsForAdminController,
);

// Get low stock products
router.get(
  "/admin/low-stock",
  protect,
  authorizeRoles("admin"),
  getLowStockProductsController,
);

// Upload product image
router.post(
  "/upload-image",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadImageController,
);

// Update product active status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateProductStatusController,
);

// Get a single active product
router.get("/:id", getProductController);

// Create a product
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  validateRequest(productSchema),
  createProductController,
);

// Update a product
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validateRequest(productSchema),
  updateProductController,
);

// Deactivate a product
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteProductController,
);

export default router;
