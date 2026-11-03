import pool from "../config/database.js";

const getAllCategories = async () => {
  const result = await pool.query(
    `
        SELECT *
        FROM categories
        ORDER BY name ASC

        `,
  );

  return result.rows;
};

export { getAllCategories };
