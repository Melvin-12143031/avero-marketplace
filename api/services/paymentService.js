import pool from "../config/database.js";
import crypto from "node:crypto";

const SUPPORTED_PAYMENT_METHODS = ["cash_on_delivery", "gcash", "card"];

const PAYMENT_STATUS_TRANSITIONS = {
  pending: ["paid", "failed", "cancelled"],
  paid: [],
  failed: [],
  cancelled: [],
  refunded: [],
};

const createPayment = async ({ orderId, paymentMethod, userId }) => {
  if (!SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const isValidUUID =
    typeof orderId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderId,
    );

  if (!isValidUUID) {
    throw new Error("Invalid order ID.");
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // 1. Retrieve and lock the order
    const orderResult = await client.query(
      `
        SELECT
          id,
          user_id,
          status,
          payment_status,
          total
        FROM orders
        WHERE id = $1
        AND user_id = $2
        FOR UPDATE
      `,
      [orderId, userId],
    );

    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Order not found.");
    }

    // 2. Validate order eligibility
    if (order.status === "cancelled") {
      throw new Error("Cannot process payment for a cancelled order.");
    }

    if (["shipped", "delivered"].includes(order.status)) {
      throw new Error(
        "Cannot process payment for an order that has already been shipped or delivered.",
      );
    }

    if (order.payment_status === "paid") {
      throw new Error("Payment has already been processed for this order.");
    }

    if (order.payment_status === "refunded") {
      throw new Error("Cannot process payment for a refunded order.");
    }

    // 3. Determine payment amount from the database
    const amount = Number(order.total);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid order total amount.");
    }

    // 4. Check for an existing pending payment
    const pendingPaymentResult = await client.query(
      `
        SELECT id
        FROM payments
        WHERE order_id = $1
        AND status = 'pending'
        LIMIT 1
      `,
      [orderId],
    );

    if (pendingPaymentResult.rows.length > 0) {
      throw new Error("A pending payment already exists for this order.");
    }

    // 5. Generate payment reference
    const paymentReference = crypto.randomUUID();

    // 6. Insert payment record
    const paymentResult = await client.query(
      `
        INSERT INTO payments (
          order_id,
          payment_method,
          payment_reference,
          amount,
          status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [orderId, paymentMethod, paymentReference, amount, "pending"],
    );

    const payment = paymentResult.rows[0];

    // 7. Commit transaction
    await client.query("COMMIT");
    transactionStarted = false;

    return payment;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Payment rollback failed:", rollbackError);
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

const updatePaymentStatus = async ({ paymentId, newStatus }) => {
  // 1. Validate payment ID
  const isValidUUID =
    typeof paymentId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      paymentId,
    );

  if (!isValidUUID) {
    throw new Error("Invalid payment ID.");
  }

  // 2. Validate requested status
  if (!Object.hasOwn(PAYMENT_STATUS_TRANSITIONS, newStatus)) {
    throw new Error("Invalid payment status.");
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    // 3. Start transaction
    await client.query("BEGIN");
    transactionStarted = true;

    // 4. Retrieve payment's order ID
    const paymentLookup = await client.query(
      `
    SELECT order_id
    FROM payments
    WHERE id = $1
  `,
      [paymentId],
    );

    const paymentReference = paymentLookup.rows[0];

    if (!paymentReference) {
      throw new Error("Payment not found.");
    }

    // 5. Lock the corresponding order first
    const orderResult = await client.query(
      `
    SELECT id
    FROM orders
    WHERE id = $1
    FOR UPDATE
  `,
      [paymentReference.order_id],
    );

    if (!orderResult.rows[0]) {
      throw new Error("Order not found.");
    }

    // 6. Lock the payment record
    const paymentResult = await client.query(
      `
    SELECT *
    FROM payments
    WHERE id = $1
    FOR UPDATE
  `,
      [paymentId],
    );

    const payment = paymentResult.rows[0];

    if (!payment) {
      throw new Error("Payment not found.");
    }

    // 7. Validate status transition
    const allowedTransitions = PAYMENT_STATUS_TRANSITIONS[payment.status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Cannot change payment status from ${payment.status} to ${newStatus}.`,
      );
    }

    // 8. Update payment status
    const updateResult = await client.query(
      `
    UPDATE payments
    SET
    status = $1::varchar,
    paid_at = CASE
        WHEN $1::varchar = 'paid' THEN NOW()
        ELSE paid_at
    END,
    updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `,
      [newStatus, paymentId],
    );

    const updatedPayment = updateResult.rows[0];

    // 9. Synchronize order payment status
    if (["paid", "failed"].includes(newStatus)) {
      await client.query(
        `
          UPDATE orders
          SET
            payment_status = $1,
            updated_at = NOW()
          WHERE id = $2
        `,
        [newStatus, payment.order_id],
      );
    }

    // 10. Commit transaction
    await client.query("COMMIT");
    transactionStarted = false;

    return updatedPayment;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Payment status rollback failed:", rollbackError);
      }
    }
    console.error("Payment status update failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

const refundPayment = async ({ paymentId }) => {
  // 1. Validate payment ID
  const isValidUUID =
    typeof paymentId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      paymentId,
    );

  if (!isValidUUID) {
    throw new Error("Invalid payment ID.");
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    // 2. Start transaction
    await client.query("BEGIN");
    transactionStarted = true;

    // 3. Retrieve the payment's order ID
    const paymentLookup = await client.query(
      `
            SELECT order_id
            FROM payments
            WHERE id = $1
            `,
      [paymentId],
    );

    const paymentReference = paymentLookup.rows[0];

    if (!paymentReference) {
      throw new Error("Payment not found.");
    }

    // 4. Lock the corresponding order first
    const orderResult = await client.query(
      `
            SELECT 
            id,
            status,
            payment_status
            FROM orders
            WHERE id = $1
            FOR UPDATE
            `,
      [paymentReference.order_id],
    );

    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Order not found.");
    }

    // 5. Lock the payment record belonging to the order
    const paymentsResult = await client.query(
      `
            SELECT *
            FROM payments
            WHERE order_id = $1
            ORDER BY id
            FOR UPDATE
            `,
      [order.id],
    );

    const payments = paymentsResult.rows;

    const payment = payments.find((item) => item.id === paymentId);

    if (!payment) {
      throw new Error("Payment not found.");
    }

    // 6. Validate that the payment is eligible for refund
    if (payment.status !== "paid") {
      throw new Error("Only paid payments can be refunded.");
    }

    if (order.payment_status !== "paid") {
      throw new Error(
        "Order payment status must be paid before processing a refund.",
      );
    }

    if (!["pending", "processing"].includes(order.status)) {
      throw new Error(
        "Only pending or processing orders can be refunded through this workflow.",
      );
    }

    // 7. Update payment status to refunded
    const updatePaymentResult = await client.query(
      `
            UPDATE payments
            SET
                status = 'refunded',
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
      [paymentId],
    );

    const updatedPayment = updatePaymentResult.rows[0];

    // 8. Cancel order pending payments attemps
    await client.query(
      `
            UPDATE payments
            SET
                status = 'cancelled',
                updated_at = NOW()
            WHERE order_id = $1
            AND id <> $2 
            AND status = 'pending'
            `,
      [order.id, paymentId],
    );

    // 9. Retrieve and lock the order items
    const orderItemsResult = await client.query(
      `
            SELECT 
            product_id, 
            quantity
            FROM order_items
            WHERE order_id = $1
            ORDER BY product_id
            FOR UPDATE
            `,
      [order.id],
    );

    // 10. Restore stock for each order item
    for (const item of orderItemsResult.rows) {
      // Skip productss that have already deleted
      if (!item.product_id) {
        continue;
      }

      await client.query(
        `
               UPDATE products
               SET
                    stock_quantity = stock_quantity + $1,
                    updated_at = NOW()
               WHERE id = $2
                `,
        [item.quantity, item.product_id],
      );
    }

    // 11. Update order status
    const updateOrderResult = await client.query(
      `
            UPDATE orders
            SET
                status = 'cancelled',
                payment_status = 'refunded',
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
      [order.id],
    );

    const updatedOrder = updateOrderResult.rows[0];

    // 12. Commit transaction
    await client.query("COMMIT");
    transactionStarted = false;

    return {
      payment: updatedPayment,
      order: updatedOrder,
    };
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Refund rollback failed:", rollbackError);
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

export { createPayment, updatePaymentStatus, refundPayment };
