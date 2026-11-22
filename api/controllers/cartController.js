import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartService.js";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getCartController = async (req, res) => {
  try {
    const cartItems = await getCart(req.user.id);

    return res.status(200).json({
      status: "success",
      results: cartItems.length,
      data: {
        cartItems,
      },
    });
  } catch (error) {
    console.error("Error retrieving cart:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve cart.",
    });
  }
};

const addToCartController = async (req, res) => {
  try {
    // 1. Validate request body
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid cart request.",
      });
    }

    // 2. Extract request fields
    const { productId, quantity } = req.body;

    // 3. Validate authentication
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    // 4. Validate product ID
    if (typeof productId !== "string" || !uuidRegex.test(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid product ID.",
      });
    }

    // 5. Validate quantity
    if (quantity === undefined || quantity === null || quantity === "") {
      return res.status(400).json({
        status: "error",
        message: "Please provide a quantity.",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be a positive integer greater than 0.",
      });
    }

    // 6. Add product to cart
    const cartItems = await addToCart(req.user.id, productId, quantity);

    return res.status(201).json({
      status: "success",
      message: "Product added to cart successfully.",
      data: {
        cartItems,
      },
    });
  } catch (error) {
    console.error("Error adding product to cart:", error.message);

    const clientErrors = {
      "Product not found": 404,
      "Product is not available": 409,
      "Not enough stock": 409,
      "Quantity must be a positive integer greater than 0": 400,
    };

    const statusCode = clientErrors[error.message] || 500;

    return res.status(statusCode).json({
      status: "error",
      message:
        statusCode === 500 ? "Failed to add product to cart." : error.message,
    });
  }
};

const updateCartItemController = async (req, res) => {
  try {
    // 1. Validate request body
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid cart request.",
      });
    }

    // 2. Extract request fields
    const { productId } = req.params;
    const { quantity } = req.body;

    // 3. Validate authentication
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    // 4. Validate product ID
    if (typeof productId !== "string" || !uuidRegex.test(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid product ID.",
      });
    }

    // 5. Validate quantity
    if (quantity === undefined || quantity === null || quantity === "") {
      return res.status(400).json({
        status: "error",
        message: "Please provide a quantity.",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be a positive integer greater than 0.",
      });
    }

    // 6. Update product to cart
    const cartItems = await updateCartItem(req.user.id, productId, quantity);

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully.",
      data: {
        cartItems,
      },
    });
  } catch (error) {
    console.error("Error updating product in cart:", error.message);

    const clientErrors = {
      "Product not found": 404,
      "Product is not available": 409,
      "Not enough stock": 409,
      "Quantity must be a positive integer greater than 0": 400,
      "Cart item not found": 404,
    };

    const statusCode = clientErrors[error.message] || 500;

    return res.status(statusCode).json({
      status: "error",
      message:
        statusCode === 500
          ? "Failed to update product in cart."
          : error.message,
    });
  }
};

const removeCartItemController = async (req, res) => {
  try {
    // 1. Extract request fields
    const { productId } = req.params;

    // 2. Validate authentication
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    // 3. Validate product ID
    if (typeof productId !== "string" || !uuidRegex.test(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid product ID.",
      });
    }

    // 4. Remove product from cart
    const cartItems = await removeCartItem(req.user.id, productId);

    return res.status(200).json({
      status: "success",
      message: "Product successfully removed.",
      data: {
        cartItems,
      },
    });
  } catch (error) {
    console.error("Error removing product in cart:", error.message);

    const clientErrors = {
      "Cart item not found": 404,
    };

    const statusCode = clientErrors[error.message] || 500;

    return res.status(statusCode).json({
      status: "error",
      message:
        statusCode === 500
          ? "Failed to remove product in cart."
          : error.message,
    });
  }
};

const clearCartController = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required.",
      });
    }

    const cartItems = await clearCart(req.user.id);

    return res.status(200).json({
      status: "success",
      message: "Cart cleared successfully.",
      data: {
        cartItems,
      },
    });
  } catch (error) {
    console.error("Error clearing cart:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to clear cart.",
    });
  }
};

export {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
};
