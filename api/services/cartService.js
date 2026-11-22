import pool from "../config/database.js";

const validateCartProduct = async (client, productId) => {
  const result = await client.query(
    `
      SELECT
        id,
        stock_quantity,
        is_active
      FROM products
      WHERE id = $1
    `,
    [productId],
  );

  if (result.rows.length === 0) {
    throw new Error("Product not found");
  }

  const product = result.rows[0];

  if (!product.is_active) {
    throw new Error("Product is not available");
  }

  return product;
};

const getCart = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        cart_items.id,
        cart_items.product_id,
        cart_items.quantity,
        cart_items.created_at,
        cart_items.updated_at,
        products.name,
        products.description,
        products.price,
        products.image_url,
        products.stock_quantity,
        products.is_active,
        categories.name AS category
      FROM cart_items
      INNER JOIN products
        ON cart_items.product_id = products.id
      LEFT JOIN categories
        ON products.category_id = categories.id
      WHERE cart_items.user_id = $1
      ORDER BY cart_items.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};

const addToCart = async (userId, productId, quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer greater than 0");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const product = await validateCartProduct(client, productId);

    if (quantity > product.stock_quantity) {
      throw new Error("Not enough stock");
    }

    const cartItemResult = await client.query(
      `
            INSERT INTO cart_items (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, product_id)
            DO UPDATE
            SET quantity = cart_items.quantity + EXCLUDED.quantity
            WHERE cart_items.quantity + EXCLUDED.quantity <= $4
            RETURNING *
        `,
      [userId, productId, quantity, product.stock_quantity],
    );

    if (cartItemResult.rows.length === 0) {
      throw new Error("Not enough stock");
    }

    await client.query("COMMIT");
    return getCart(userId);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
};

const updateCartItem = async (userId, productId, quantity) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer greater than 0");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const product = await validateCartProduct(client, productId);

    if (quantity > product.stock_quantity) {
      throw new Error("Not enough stock");
    }

    const updatedCartItem = await client.query(
      `
            UPDATE cart_items
            SET quantity = $1
            WHERE user_id = $2 AND product_id = $3
            RETURNING *
        `,
      [quantity, userId, productId],
    );

    if (updatedCartItem.rowCount === 0) {
      throw new Error("Cart item not found");
    }

    await client.query("COMMIT");
    return getCart(userId);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
};

const removeCartItem = async (userId, productId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deletedCartItem = await client.query(
      `
        DELETE FROM cart_items
        WHERE user_id = $1 AND product_id = $2
        RETURNING *
      `,
      [userId, productId],
    );

    if (deletedCartItem.rowCount === 0) {
      throw new Error("Cart item not found");
    }

    await client.query("COMMIT");
    return getCart(userId);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
};

const clearCart = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        DELETE FROM cart_items
        WHERE user_id = $1
      `,
      [userId],
    );

    await client.query("COMMIT");
    return getCart(userId);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
};

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
