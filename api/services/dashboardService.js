import pool from "../config/database.js";
import { getOrderStatistics } from "./orderService.js";
import { getProductStatistics } from "./productService.js";

const getDashboardStatistics = async () => {
  const [orders, products, customersResult] = await Promise.all([
    getOrderStatistics(),
    getProductStatistics(),
    pool.query(
      `
        SELECT COUNT(*) AS total_customers
        FROM users
        WHERE role = 'customer'
      `,
    ),
  ]);

  return {
    orders,
    products,
    customers: {
      totalCustomers: Number(customersResult.rows[0].total_customers),
    },
  };
};

export { getDashboardStatistics };
