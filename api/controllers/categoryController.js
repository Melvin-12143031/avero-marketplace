import {
  getAllCategories,
  createCategory,
} from "../services/categoryService.js";

const getCategoriesController = async (req, res) => {
  try {
    const categories = await getAllCategories();

    res.status(200).json({
      status: "success",
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories.",
    });
  }
};

const createCategoryController = async (req, res) => {
  try {
    const category = await createCategory(req.body);

    res.status(201).json({
      status: "success",
      message: "Category created successfully.",
      data: {
        category,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "A category with this name already exists.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create category.",
    });
  }
};

export { getCategoriesController, createCategoryController };
