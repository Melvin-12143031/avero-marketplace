import { createPayment } from "../services/paymentService.js";

const createPaymentController = async (req, res) => {
  const { orderId, paymentMethod } = req.body || {};

  if (!orderId || !paymentMethod) {
    return res.status(400).json({
      status: "error",
      message: "Order ID and payment method are required.",
    });
  }
  try {
    const payment = await createPayment({
      orderId,
      paymentMethod,
      userId: req.user.id,
    });

    return res.status(201).json({
      status: "success",
      message: "Payment created successfully.",
      data: {
        payment,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);

    const badRequestErrors = [
      "Invalid order ID.",
      "Invalid payment method.",
      "Invalid order total amount.",
    ];

    const conflictErrors = [
      "Cannot process payment for a cancelled order.",
      "Cannot process payment for an order that has already been shipped or delivered.",
      "Payment has already been processed for this order.",
      "Cannot process payment for a refunded order.",
      "A pending payment already exists for this order.",
    ];

    if (badRequestErrors.includes(error.message)) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    if (error.message === "Order not found.") {
      return res.status(404).json({
        status: "error",
        message: error.message,
      });
    }

    if (conflictErrors.includes(error.message)) {
      return res.status(409).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to create payment.",
    });
  }
};

export { createPaymentController };
