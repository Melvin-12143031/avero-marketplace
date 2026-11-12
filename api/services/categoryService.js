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

const createCategory = async ({ name, description }) => {
  const result = await pool.query(
    `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *
    `,
    [name, description],
  );

  return result.rows[0];
};

export { getAllCategories, createCategory };
