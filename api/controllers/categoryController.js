import { getAllCategories } from "../services/categoryService.js";

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

export { getCategoriesController };
