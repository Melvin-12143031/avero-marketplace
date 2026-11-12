import express from "express";
import {
  getCategoriesController,
  createCategoryController,
} from "../controllers/categoryController.js";

import validateRequest from "../middleware/validateRequest.js";
import { categorySchema } from "../validators/categoryValidator.js";

const router = express.Router();

// Get all categories
router.get("/", getCategoriesController);

// Create a category
router.post("/", validateRequest(categorySchema), createCategoryController);

export default router;
