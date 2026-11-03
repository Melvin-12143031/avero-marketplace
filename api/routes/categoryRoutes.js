import express from "express";
import { getCategoriesController } from "../controllers/categoryController.js";

const router = express.Router();

// Get all categories
router.get("/", getCategoriesController);

export default router;
