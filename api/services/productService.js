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

const getProductsForAdmin = async (
  page = 1,
  limit = 10,
  search = "",
  status = "all",
) => {
  const offset = (page - 1) * limit;
  const searchTerm = `%${search.trim()}%`;

  const statusCondition =
    status === "active"
      ? "AND products.is_active = TRUE"
      : status === "inactive"
        ? "AND products.is_active = FALSE"
        : "";

  const [productsResult, countResult, statsResult] = await Promise.all([
    // Get products for the current page
    pool.query(
      `
        SELECT
          products.*,
          CASE
            WHEN products.stock_quantity <= 5 THEN TRUE
            ELSE FALSE
          END AS is_low_stock,
          categories.name AS category
        FROM products
        LEFT JOIN categories
          ON products.category_id = categories.id
        WHERE products.name ILIKE $1
        ${statusCondition}
        ORDER BY products.created_at DESC, products.id DESC
        LIMIT $2 OFFSET $3
      `,
      [searchTerm, limit, offset],
    ),

    // Count products matching the search
    pool.query(
      `
        SELECT COUNT(*) AS total_products
        FROM products
        WHERE name ILIKE $1
        ${statusCondition}
      `,
      [searchTerm],
    ),

    // Get overall inventory statistics
    pool.query(
      `
        SELECT
          COUNT(*) AS total_products,
          COALESCE(SUM(stock_quantity), 0) AS total_units,
          COUNT(*) FILTER (
            WHERE stock_quantity > 0 AND stock_quantity <= 5
          ) AS low_stock_products,
          COUNT(*) FILTER (
            WHERE stock_quantity = 0
          ) AS out_of_stock_products
        FROM products
      `,
    ),
  ]);

  const stats = statsResult.rows[0];

  const totalProducts = Number(countResult.rows[0].total_products);
  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products: productsResult.rows,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
    },
    statistics: {
      totalProducts: Number(stats.total_products),
      totalUnits: Number(stats.total_units),
      lowStockProducts: Number(stats.low_stock_products),
      outOfStockProducts: Number(stats.out_of_stock_products),
    },
  };
};

const getLowStockProducts = async () => {
  const result = await pool.query(
    `
     SELECT
        products.*,
        TRUE AS is_low_stock,
        categories.name AS category
      FROM products
      LEFT JOIN categories
        ON products.category_id = categories.id
      WHERE products.stock_quantity <= 5
        AND products.is_active = TRUE
      ORDER BY
        products.stock_quantity ASC,
        products.created_at DESC
    
    `,
  );
  return result.rows;
};

const getProductById = async (productId) => {
  const result = await pool.query(
    `
        SELECT
            products.*,
            categories.name AS category
        FROM products
        LEFT JOIN categories
            ON products.category_id = categories.id
        WHERE products.id = $1
        AND products.is_active = TRUE
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
  {
    category_id,
    name,
    description,
    price,
    stock_quantity,
    image_url,
    is_active,
  },
) => {
  const result = await pool.query(
    `
      WITH updated_product AS (
        UPDATE products
        SET
          category_id = $1,
          name = $2,
          description = $3,
          price = $4,
          stock_quantity = $5,
          image_url = $6,
          is_active = $7
        WHERE id = $8
        AND is_active = TRUE
        RETURNING *
      )
      SELECT
        updated_product.*,
        categories.name AS category_name
      FROM updated_product
      LEFT JOIN categories
        ON updated_product.category_id = categories.id
    `,
    [
      category_id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      is_active,
      productId,
    ],
  );

  return result.rows[0];
};

const updateProductStatus = async (productId, isActive) => {
  const result = await pool.query(
    `
        UPDATE products
        SET is_active = $1
        WHERE id = $2
        AND is_active != $1
        RETURNING *

        `,
    [isActive, productId],
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

const getProductStatistics = async () => {
  const result = await pool.query(
    `
      SELECT
        COUNT(*) AS total_products,
        COALESCE(SUM(stock_quantity), 0) AS total_units,
        COUNT(*) FILTER (
          WHERE stock_quantity > 0 AND stock_quantity <= 5
        ) AS low_stock_products,
        COUNT(*) FILTER (
          WHERE stock_quantity = 0
        ) AS out_of_stock_products
      FROM products
    `,
  );

  const stats = result.rows[0];

  return {
    totalProducts: Number(stats.total_products),
    totalUnits: Number(stats.total_units),
    lowStockProducts: Number(stats.low_stock_products),
    outOfStockProducts: Number(stats.out_of_stock_products),
  };
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsForAdmin,
  getLowStockProducts,
  updateProductStatus,
  getProductStatistics,
};
