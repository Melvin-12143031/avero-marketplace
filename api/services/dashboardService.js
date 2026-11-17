import pool from "../config/database.js";
import { getOrderStatistics } from "./orderService.js";
import { getProductStatistics } from "./productService.js";

const getDashboardStatistics = async () => {
  const [orders, products, customersResult] = await Promise.all([
    getOrderStatistics(),
    getProductStatistics(),
    pool.query(`
      SELECT
        COUNT(*)::INTEGER AS total_customers,

        COUNT(*) FILTER (
          WHERE total_spent >= 10000
        )::INTEGER AS high_value,

        COUNT(*) FILTER (
          WHERE total_spent < 10000
            AND successful_orders >= 2
        )::INTEGER AS repeat_buyer,

        COUNT(*) FILTER (
          WHERE total_spent < 10000
            AND successful_orders = 1
        )::INTEGER AS one_time_buyer,

        COUNT(*) FILTER (
          WHERE successful_orders = 0
        )::INTEGER AS no_purchases

      FROM (
        SELECT
          u.id,

          COUNT(o.id) FILTER (
            WHERE
              o.payment_status = 'paid'
              AND o.status != 'cancelled'
          )::INTEGER AS successful_orders,

          COALESCE(
            SUM(o.total) FILTER (
              WHERE
                o.payment_status = 'paid'
                AND o.status != 'cancelled'
            ),
            0
          ) AS total_spent

        FROM users u
        LEFT JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'customer'
        GROUP BY u.id
      ) customer_metrics
    `),
  ]);

  const customerStats = customersResult.rows[0];

  return {
    orders,
    products,
    customers: {
      totalCustomers: customerStats.total_customers,
      segments: {
        highValue: customerStats.high_value,
        repeatBuyer: customerStats.repeat_buyer,
        oneTimeBuyer: customerStats.one_time_buyer,
        noPurchases: customerStats.no_purchases,
      },
    },
  };
};

export { getDashboardStatistics };
