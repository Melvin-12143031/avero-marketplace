import pool from "../config/database.js";
import crypto from "node:crypto";

const createOrder = async (orderData) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const { customer, shippingAddress, items } = orderData;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error("Invalid order items.");
      }
    }

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

    const requestedQuantities = new Map();

    for (const item of items) {
      const currentQuantity = requestedQuantities.get(item.productId) || 0;

      requestedQuantities.set(item.productId, currentQuantity + item.quantity);
    }

    for (const product of products) {
      const requestedQuantity = requestedQuantities.get(product.id);

      if (product.stock_quantity < requestedQuantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}.`,
        );
      }
    }

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

    const orderResult = await client.query(
      `
            INSERT INTO orders (
                order_number,
                subtotal,
                shipping_fee,
                total,
                status,
                payment_status,
                shipping_address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            `,
      [
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

    for (const product of products) {
      const quantity = requestedQuantities.get(product.id);

      await client.query(
        `
                UPDATE products
                SET stock_quantity = stock_quantity - $1
                WHERE id = $2
                `,
        [quantity, product.id],
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return order;
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
  }
};

const getOrderById = async (orderId) => {
  const orderResult = await pool.query(
    `
    SELECT *
    FROM orders
    WHERE id = $1

    `,
    [orderId],
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

  return {
    ...order,
    shipping_address: JSON.parse(order.shipping_address),
    items: itemsResult.rows,
  };
};

const getAllOrders = async () => {
  const ordersResult = await pool.query(
    `
    SELECT *
    FROM orders
    ORDER BY created_at DESC
    
    `,
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

export { createOrder, getOrderById, getAllOrders };
