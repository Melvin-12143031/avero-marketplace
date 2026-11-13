import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import { getDashboardStatisticsController } from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
  "/statistics",
  protect,
  authorizeRoles("admin"),
  getDashboardStatisticsController,
);

export default router;
