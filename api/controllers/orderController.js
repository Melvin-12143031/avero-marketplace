import {
  createOrder,
  getOrderById,
  getAllOrders,
} from "../services/orderService.js";
const createOrderController = async (req, res) => {
  try {
    const order = await createOrder(req.body);

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order request.",
      });
    }

    const { customer, shippingAddress } = req.body;
    if (
      !customer ||
      typeof customer.fullName !== "string" ||
      typeof customer.email !== "string" ||
      typeof customer.phone !== "string" ||
      !customer.fullName.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim()
    ) {
      return res.status(400).json({
        status: "error",
        message: "Complete customer information is required.",
      });
    }

    if (
      !shippingAddress ||
      typeof shippingAddress.address !== "string" ||
      typeof shippingAddress.city !== "string" ||
      typeof shippingAddress.province !== "string" ||
      typeof shippingAddress.postalCode !== "string" ||
      !shippingAddress.address.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.province.trim() ||
      !shippingAddress.postalCode.trim()
    ) {
      return res.status(400).json({
        status: "error",
        message: "Complete shipping information is required.",
      });
    }
    res.status(201).json({
      status: "success",
      message: "Order created successfully.",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error.message);

    const isClientError = [
      "Your cart is empty.",
      "Invalid order items.",
    ].includes(error.message);

    const isConflict =
      error.message.startsWith("Insufficient stock") ||
      error.message.includes("products are unavailable");

    res.status(isConflict ? 409 : isClientError ? 400 : 500).json({
      status: "error",
      message:
        isConflict || isClientError ? error.message : "Failed to create order.",
    });
  }
};

const getOrderByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID.",
      });
    }

    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Error retrieving order:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve order.",
    });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const orders = await getAllOrders();

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error("Error retrieving orders:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve orders.",
    });
  }
};

export {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
};
