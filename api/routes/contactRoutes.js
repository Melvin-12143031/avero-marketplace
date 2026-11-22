import express from "express";
import contactLimiter from "../middleware/contactRateLimitMiddleware.js";
import {
  createContactInquiryController,
  getAdminContactInquiriesController,
  getAdminContactInquiryByIdController,
  updateContactInquiryStatusController,
} from "../controllers/contactController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

// Get all contact inquiries for admin
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAdminContactInquiriesController,
);

// Get a single contact inquiry by ID
router.get(
  "/admin/:id",
  protect,
  authorizeRoles("admin"),
  getAdminContactInquiryByIdController,
);

// Update contact inquiry status
router.patch(
  "/admin/:id/status",
  protect,
  authorizeRoles("admin"),
  updateContactInquiryStatusController,
);

// Public inquiry submission
router.post("/", contactLimiter, createContactInquiryController);

export default router;
