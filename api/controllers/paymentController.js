import {
  createPayment,
  updatePaymentStatus,
  refundPayment,
  getOrderPaymentHistory,
} from "../services/paymentService.js";

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

const updatePaymentStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Payment status is required.",
      });
    }

    const payment = await updatePaymentStatus({
      paymentId: id,
      newStatus: status,
    });

    return res.status(200).json({
      status: "success",
      message: "Payment status updated successfully.",
      data: { payment },
    });
  } catch (error) {
    console.error("Update payment status error:", error);

    const clientErrors = [
      "Invalid payment ID.",
      "Invalid payment status.",
      "Payment not found.",
      "Order not found.",
    ];

    const isTransitionError = error.message.startsWith(
      "Cannot change payment status",
    );

    return res
      .status(
        clientErrors.includes(error.message) || isTransitionError ? 400 : 500,
      )
      .json({
        status: "error",
        message:
          clientErrors.includes(error.message) || isTransitionError
            ? error.message
            : "Failed to update payment status.",
      });
  }
};

const refundPaymentController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await refundPayment({
      paymentId: id,
    });

    return res.status(200).json({
      status: "success",
      message: "Payment refunded successfully.",
      data: {
        payment: result.payment,
        order: result.order,
      },
    });
  } catch (error) {
    console.error("Refund payment error:", error);

    const clientErrors = [
      "Invalid payment ID.",
      "Payment not found.",
      "Order not found.",
      "Only paid payments can be refunded.",
      "Order payment status must be paid before processing a refund.",
      "Only pending or processing orders can be refunded through this workflow.",
    ];

    const isClientError = clientErrors.includes(error.message);

    return res.status(isClientError ? 400 : 500).json({
      status: "error",
      message: isClientError ? error.message : "Failed to refund payment.",
    });
  }
};

const getOrderPaymentHistoryController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await getOrderPaymentHistory(orderId);

    return res.status(200).json({
      status: "success",
      results: payments.length,
      data: {
        payments,
      },
    });
  } catch (error) {
    console.error("Get order payment history error:", error);

    if (error.message === "Invalid order Id.") {
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

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve payment history.",
    });
  }
};

export {
  createPaymentController,
  updatePaymentStatusController,
  refundPaymentController,
  getOrderPaymentHistoryController,
};
