import pool from "../config/database.js";
import crypto from "node:crypto";

const createOrder = async (orderData, userId) => {
  const { customer, shippingAddress, items } = orderData;

  // 1. Validate cart items
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // 2. Validate individual order items
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      typeof item.productId !== "string" ||
      !uuidRegex.test(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new Error("Invalid order items.");
    }
  }

  // 3. Start database transaction
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    // 4. Get products and lock their database rows
    const productIds = items.map((item) => item.productId).sort();

    const result = await client.query(
      `
        SELECT id, name, price, stock_quantity
        FROM products
        WHERE id = ANY($1::uuid[])
        AND is_active = TRUE
        ORDER BY id
        FOR UPDATE
      `,
      [productIds],
    );

    const products = result.rows;

    if (products.length !== new Set(productIds).size) {
      throw new Error("One or more products are unavailable.");
    }

    // 5. Combine quantities for duplicate products
    const requestedQuantities = new Map();

    for (const item of items) {
      const currentQuantity = requestedQuantities.get(item.productId) || 0;

      requestedQuantities.set(item.productId, currentQuantity + item.quantity);
    }

    // 6. Check available product stock
    for (const product of products) {
      const requestedQuantity = requestedQuantities.get(product.id);

      if (product.stock_quantity < requestedQuantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}.`,
        );
      }
    }

    // 7. Calculate order totals
    const subtotal = products.reduce((total, product) => {
      const quantity = requestedQuantities.get(product.id);

      return total + Number(product.price) * quantity;
    }, 0);

    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const orderNumber = `ORD-${crypto.randomUUID()}`;

    const shippingInfo = JSON.stringify({
      customer,
      shippingAddress,
    });

    // 8. Create the order
    const orderResult = await client.query(
      `
        INSERT INTO orders (
          user_id,
          order_number,
          subtotal,
          shipping_fee,
          total,
          status,
          payment_status,
          shipping_address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        userId,
        orderNumber,
        subtotal,
        shippingFee,
        total,
        "pending",
        "unpaid",
        shippingInfo,
      ],
    );

    const order = orderResult.rows[0];

    // 9. Insert order items
    for (const product of products) {
      const quantity = requestedQuantities.get(product.id);
      const unitPrice = Number(product.price);
      const itemSubtotal = unitPrice * quantity;

      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            unit_price,
            subtotal
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [order.id, product.id, product.name, quantity, unitPrice, itemSubtotal],
      );
    }

    // 10. Deduct product stock
    for (const product of products) {
      const quantity = requestedQuantities.get(product.id);

      const stockResult = await client.query(
        `
          UPDATE products
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
          AND stock_quantity >= $1
          RETURNING id
        `,
        [quantity, product.id],
      );

      if (stockResult.rowCount === 0) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }
    }

    // 11. Commit transaction
    await client.query("COMMIT");
    transactionStarted = false;

    return order;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    throw error;
  } finally {
    // 13. Release database connection
    client.release();
  }
};

const getOrderById = async (orderId, userId) => {
  const orderResult = await pool.query(
    `
      SELECT *
      FROM orders
      WHERE id = $1
      AND user_id = $2
    `,
    [orderId, userId],
  );

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  const itemsResult = await pool.query(
    `
      SELECT
      id,
      product_id,
      product_name,
      quantity,
      unit_price,
      subtotal
    FROM order_items
    WHERE order_id = $1
    ORDER BY created_at ASC

    `,
    [orderId],
  );

  const paymentResult = await pool.query(
    `
    SELECT
      id,
      payment_method,
      payment_reference,
      amount,
      status,
      paid_at,
      created_at
    FROM payments
    WHERE order_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `,
    [orderId],
  );

  return {
    ...order,
    shipping_address: JSON.parse(order.shipping_address),
    items: itemsResult.rows,
    payment: paymentResult.rows[0] || null,
  };
};

const getAllOrders = async (userId) => {
  const ordersResult = await pool.query(
    `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  const orders = ordersResult.rows;

  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);

  const itemsResult = await pool.query(
    `
      SELECT
        id,
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        subtotal
      FROM order_items
      WHERE order_id = ANY($1::uuid[])
      ORDER BY created_at ASC
    `,
    [orderIds],
  );

  return orders.map((order) => ({
    ...order,
    shipping_address: JSON.parse(order.shipping_address),
    items: itemsResult.rows.filter((item) => item.order_id === order.id),
  }));
};

const getAllOrdersForAdmin = async ({
  page = 1,
  limit = 10,
  status = null,
  search = "",
}) => {
  const offset = (page - 1) * limit;

  // 1. Get total number of matching orders
  const countResult = await pool.query(
    `
    SELECT COUNT(*) AS total
    FROM orders
    WHERE
      ($1::text IS NULL OR status = $1)
      AND (
        $2::text = ''
        OR order_number ILIKE '%' || $2 || '%'
        OR shipping_address::jsonb -> 'customer' ->> 'fullName' ILIKE '%' || $2 || '%'
        OR shipping_address::jsonb -> 'customer' ->> 'email' ILIKE '%' || $2 || '%'
      )
  `,
    [status, search],
  );

  const total = Number(countResult.rows[0].total);

  // 2. Get pagination orders
  const ordersResult = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE
      ($1::text IS NULL OR status = $1)
      AND (
        $2::text = ''
        OR order_number ILIKE '%' || $2 || '%'
        OR shipping_address::jsonb -> 'customer' ->> 'fullName' ILIKE '%' || $2 || '%'
        OR shipping_address::jsonb -> 'customer' ->> 'email' ILIKE '%' || $2 || '%'
      )
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4
  `,
    [status, search, limit, offset],
  );

  const orders = ordersResult.rows;
  if (orders.length === 0) {
    return {
      orders: [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 3. Get items belonging to these orders
  const orderIds = orders.map((order) => order.id);
  const itemsResult = await pool.query(
    `
    SELECT
        id,
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        subtotal
      FROM order_items
      WHERE order_id = ANY($1::uuid[])
      ORDER BY created_at ASC
    
    `,
    [orderIds],
  );

  // 4. Attach items to their orders
  const formattedOrders = orders.map((order) => ({
    ...order,
    shipping_address: JSON.parse(order.shipping_address),
    items: itemsResult.rows.filter((item) => item.order_id === order.id),
  }));

  return {
    orders: formattedOrders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const ORDER_STATUS_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const updateOrderStatus = async ({ orderId, newStatus }) => {
  // 1. Validate order ID

  const isValidUUID =
    typeof orderId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      orderId,
    );

  if (!isValidUUID) {
    throw new Error("Invalid order ID.");
  }

  // 2. Validate requested status

  if (!Object.hasOwn(ORDER_STATUS_TRANSITIONS, newStatus)) {
    throw new Error("Invalid order status.");
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    // 3. Start transaction
    await client.query("BEGIN");
    transactionStarted = true;

    // 4. Lock the order record
    const orderResult = await client.query(
      `
        SELECT *
        FROM orders
        WHERE id = $1
        FOR UPDATE
      `,
      [orderId],
    );

    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Order not found.");
    }

    // 5. Validate status transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${newStatus}.`,
      );
    }

    // 6. Validate payment before fulfillment
    if (["processing", "shipped", "delivered"].includes(newStatus)) {
      if (order.payment_status !== "paid") {
        throw new Error("Order must be fully paid before fulfillment.");
      }
    }

    // 7. Validate payment before cancellation
    if (newStatus === "cancelled") {
      if (["paid", "refunded"].includes(order.payment_status)) {
        throw new Error(
          "Paid or refunded orders cannot be cancelled through this workflow.",
        );
      }
    }

    // 8. Restore product stock when cancelling
    if (newStatus === "cancelled") {
      const orderItemsResult = await client.query(
        `
          SELECT product_id, quantity
          FROM order_items
          WHERE order_id = $1
          ORDER BY product_id
          FOR UPDATE
        `,
        [orderId],
      );

      for (const item of orderItemsResult.rows) {
        //skip product that have been deleted
        if (!item.product_id) {
          continue;
        }

        const productResult = await client.query(
          `
            SELECT id
            FROM products
            WHERE id = $1
            FOR UPDATE
          `,
          [item.product_id],
        );

        if (productResult.rowCount === 0) {
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
    }

    // 9. Cancel pending payment records
    if (newStatus === "cancelled") {
      await client.query(
        `
          UPDATE payments
          SET
              status = 'cancelled',
              updated_at = NOW()
          WHERE order_id = $1 
          AND status = 'pending'
        `,
        [orderId],
      );
    }

    // 10. Update order status
    const updateResult = await client.query(
      `
        UPDATE orders
        SET
          status = $1::varchar,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `,
      [newStatus, orderId],
    );

    const updatedOrder = updateResult.rows[0];

    // 11. Commit transaction
    await client.query("COMMIT");
    transactionStarted = false;

    return updatedOrder;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }
    throw error;
  } finally {
    // 12. Release database connection
    client.release();
  }
};
const getOrderStatistics = async () => {
  const result = await pool.query(
    `
    SELECT
      COUNT(*) AS total_orders,

      COUNT(*) FILTER (
        WHERE status = 'pending'
      ) AS pending_orders,

      COUNT(*) FILTER (
        WHERE status = 'processing'
      ) AS processing_orders,

      COUNT(*) FILTER (
        WHERE status = 'shipped'
      ) AS shipped_orders,

      COUNT(*) FILTER (
        WHERE status = 'delivered'
      ) AS delivered_orders,

      COUNT(*) FILTER (
        WHERE status = 'cancelled'
      ) AS cancelled_orders,

      COUNT(*) FILTER (
        WHERE payment_status = 'paid'
      ) AS paid_orders,

      COUNT(*) FILTER (
        WHERE payment_status = 'refunded'
      ) AS refunded_orders,

      COALESCE(
        SUM(total) FILTER (
          WHERE payment_status = 'paid'
        ),
        0
      ) AS total_revenue,

      COALESCE(
      AVG(total) FILTER (
      WHERE payment_status = 'paid'
      ),
      0
      ) AS average_order_value

    FROM orders
    
    `,
  );

  const statistics = result.rows[0];

  const monthlyRevenueResult = await pool.query(
    `
    SELECT
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
    SUM(total) AS revenue,
    COUNT(*) AS order_count
    FROM orders
    WHERE payment_status = 'paid'
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC

    `,
  );

  return {
    ...statistics,
    total_orders: Number(statistics.total_orders),
    pending_orders: Number(statistics.pending_orders),
    processing_orders: Number(statistics.processing_orders),
    shipped_orders: Number(statistics.shipped_orders),
    delivered_orders: Number(statistics.delivered_orders),
    cancelled_orders: Number(statistics.cancelled_orders),
    paid_orders: Number(statistics.paid_orders),
    refunded_orders: Number(statistics.refunded_orders),
    average_order_value: statistics.average_order_value,

    monthly_revenue: monthlyRevenueResult.rows.map((row) => ({
      month: row.month,
      revenue: row.revenue,
      order_count: Number(row.order_count),
    })),
  };
};

export {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAllOrdersForAdmin,
  getOrderStatistics,
};
