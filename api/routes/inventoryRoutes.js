import express from "express";
import {
  adjustStockController,
  getInventoryMovementsController,
} from "../controllers/inventoryController.js";

import protect from "../middleware/authMiddleware.js";

import authorizeRoles from "../middleware/authorizeRoles.js";
import {
  stockAdjustmentSchema,
  paginationSchema,
} from "../validators/inventoryValidator.js";
import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

router.patch(
  "/:productId/stock",
  protect,
  authorizeRoles("admin"),
  validateRequest(stockAdjustmentSchema),
  adjustStockController,
);

router.get(
  "/:productId/movements",
  protect,
  authorizeRoles("admin"),
  validateRequest(paginationSchema, "query"),
  getInventoryMovementsController,
);

export default router;
