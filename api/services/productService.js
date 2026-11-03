import pool from "../config/database.js";

const getAllProducts = async () => {
  const result = await pool.query(
    `
        SELECT
            products.*,
            categories.name AS category
        FROM products
        LEFT JOIN categories
            ON products.category_id = categories.id
        WHERE products.is_active = TRUE
        ORDER BY products.created_at DESC
        
        `,
  );

  return result.rows;
};

const getProductById = async (productId) => {
  const result = await pool.query(
    `
        SELECT *
        FROM products
        WHERE id = $1
        AND is_active = TRUE

        `,
    [productId],
  );

  return result.rows[0];
};

const createProduct = async ({
  category_id,
  name,
  description,
  price,
  stock_quantity,
  image_url,
}) => {
  const result = await pool.query(
    `
            INSERT INTO products (
            category_id,
            name,
            description,
            price,
            stock_quantity,
            image_url
        )

        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *

        `,
    [category_id, name, description, price, stock_quantity, image_url],
  );

  return result.rows[0];
};

const updateProduct = async (
  productId,
  { category_id, name, description, price, stock_quantity, image_url },
) => {
  const result = await pool.query(
    `
        UPDATE products
        SET
            category_id = $1,
            name = $2,
            description = $3,
            price = $4,
            stock_quantity = $5,
            image_url = $6
        WHERE id = $7
        AND is_active = TRUE
        RETURNING *
        
        `,
    [
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      productId,
    ],
  );

  return result.rows[0];
};

const deleteProduct = async (productId) => {
  const result = await pool.query(
    `
        UPDATE products
        SET is_active = FALSE
        WHERE id = $1
        AND is_active = TRUE
        RETURNING *

        `,
    [productId],
  );

  return result.rows[0];
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
