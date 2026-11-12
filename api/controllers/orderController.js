import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAllOrdersForAdmin,
  getOrderStatistics,
} from "../services/orderService.js";

const createOrderController = async (req, res) => {
  try {
    // 1. Validate request body
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order request.",
      });
    }

    // 2. Validate customer information
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

    // 3. Validate shipping information
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

    // 4. Create order only after validation
    const order = await createOrder(req.body, req.user.id);

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

    const order = await getOrderById(id, req.user.id);

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
    const orders = await getAllOrders(req.user.id);

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

const getAllOrdersForAdminController = async (req, res) => {
  try {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);

    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    const status = req.query.status || null;

    const search = req.query.search?.trim() || "";

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order status.",
      });
    }

    // Validate pagination
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pagination parameters.",
      });
    }

    const result = await getAllOrdersForAdmin({
      page,
      limit,
      status,
      search,
    });

    return res.status(200).json({
      status: "success",
      results: result.orders.length,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: {
        orders: result.orders,
      },
    });
  } catch (error) {
    console.error("Admin order retrieval error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve orders.",
    });
  }
};

const getOrderStatisticsController = async (req, res) => {
  try {
    const statistics = await getOrderStatistics();

    return res.status(200).json({
      status: "success",
      data: {
        statistics,
      },
    });
  } catch (error) {
    console.error("Order statistics error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve order statistics.",
    });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Order status is required.",
      });
    }

    const order = await updateOrderStatus({
      orderId: id,
      newStatus: status,
    });

    return res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order status:", error.message);

    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export {
  createOrderController,
  getOrderByIdController,
  getAllOrdersController,
  updateOrderStatusController,
  getAllOrdersForAdminController,
  getOrderStatisticsController,
};
