import express from "express";
import {
  getAllCustomersController,
  getCustomerByIdController,
  getCustomerOrdersController,
  getCustomerActivityController,
  deactivateCustomerController,
  reactivateCustomerController,
} from "../controllers/customerController.js";

import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllCustomersController,
);

router.get(
  "/admin/:id",
  protect,
  authorizeRoles("admin"),
  getCustomerByIdController,
);

router.get(
  "/admin/:id/orders",
  protect,
  authorizeRoles("admin"),
  getCustomerOrdersController,
);

router.get(
  "/admin/:id/activity",
  protect,
  authorizeRoles("admin"),
  getCustomerActivityController,
);

router.patch(
  "/admin/:id/deactivate",
  protect,
  authorizeRoles("admin"),
  deactivateCustomerController,
);

router.patch(
  "/admin/:id/reactivate",
  protect,
  authorizeRoles("admin"),
  reactivateCustomerController,
);

export default router;
