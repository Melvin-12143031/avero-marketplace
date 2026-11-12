import pool from "../config/database.js";

const adjustStock = async (
  productId,
  quantity,
  movementType,
  reason,
  userId,
) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const productResult = await client.query(
      `
        SELECT id, stock_quantity
        FROM products
        WHERE id = $1
        FOR UPDATE

        `,
      [productId],
    );

    if (productResult.rows.length === 0) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    const previousStock = productResult.rows[0].stock_quantity;

    const quantityChange = movementType === "stock_in" ? quantity : -quantity;

    const newStock = previousStock + quantityChange;

    if (newStock < 0) {
      const error = new Error("Insufficient stock available.");
      error.statusCode = 400;
      throw error;
    }

    const updatedProductResult = await client.query(
      `
        UPDATE products
        SET stock_quantity = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *

        `,
      [newStock, productId],
    );

    const movementResult = await client.query(
      `
        INSERT INTO inventory_movements (
            product_id,
            movement_type,
            quantity_change,
            previous_stock,
            new_stock,
            reason,
            created_by
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        
        `,
      [
        productId,
        movementType,
        quantityChange,
        previousStock,
        newStock,
        reason,
        userId,
      ],
    );

    await client.query("COMMIT");
    transactionStarted = false;

    return {
      product: updatedProductResult.rows[0],
      movement: movementResult.rows[0],
    };
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    throw error;
  } finally {
    client.release();
  }
};

const getInventoryMovements = async (productId, page, limit) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
        SELECT *
        FROM inventory_movements
        WHERE product_id = $1
        ORDER BY created_at DESC
        LIMIT $2
        OFFSET $3

        `,
    [productId, limit, offset],
  );

  const countResult = await pool.query(
    `
        SELECT COUNT(*)
        FROM inventory_movements
        WHERE product_id = $1
        
        `,
    [productId],
  );

  const totalMovements = Number(countResult.rows[0].count);
  const totalPages = Math.ceil(totalMovements / limit);

  return {
    movements: result.rows,
    pagination: {
      page,
      limit,
      totalMovements,
      totalPages,
    },
  };
};

export { adjustStock, getInventoryMovements };
