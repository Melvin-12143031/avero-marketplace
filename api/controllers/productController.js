import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getProductsForAdmin,
  getLowStockProducts,
} from "../services/productService.js";

const getProductsController = async (req, res) => {
  try {
    const products = await getAllProducts();

    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch products.",
    });
  }
};

const getProductsForAdminController = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const search = req.query.search || "";
    const status = req.query.status || "all";

    const result = await getProductsForAdmin(page, limit, search, status);

    res.status(200).json({
      status: "success",
      results: result.products.length,
      data: result,
    });
  } catch (error) {
    console.error("Admin product retrieval error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve products.",
    });
  }
};

const getLowStockProductsController = async (req, res) => {
  try {
    const products = await getLowStockProducts();

    return res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    console.error("Get low-stock products error:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve low-stock products.",
    });
  }
};

const getProductController = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID.",
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch product",
    });
  }
};

const createProductController = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      is_active = true,
    } = req.body;

    const product = await createProduct({
      category_id: category_id || null,
      name,
      description: description || null,
      price,
      stock_quantity,
      image_url: image_url || null,
      is_active,
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error.message);

    if (error.code === "23503") {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID. The selected category does not exist.",
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        status: "error",
        message: "Product data violates a database constraint.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to create product.",
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID.",
      });
    }

    const {
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      is_active = true,
    } = req.body;

    const product = await updateProduct(id, {
      category_id: category_id || null,
      name,
      description: description || null,
      price,
      stock_quantity,
      image_url: image_url || null,
      is_active,
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Product updated successfully.",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error updating product:", error.message);

    if (error.code === "23503") {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID. The selected category does not exist.",
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        status: "error",
        message: "Product data violates a database constraint.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to update product.",
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID.",
      });
    }

    const product = await deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Product deactivated successfully.",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to delete product.",
    });
  }
};

const updateProductStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product ID.",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "is_active must be a boolean.",
      });
    }

    const product = await updateProductStatus(id, is_active);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found or already has this status.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Product ${is_active ? "activated" : "deactivated"} successfully.`,
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Error updating product status:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to update product status.",
    });
  }
};

export {
  getProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  getProductsForAdminController,
  getLowStockProductsController,
  updateProductStatusController,
};
