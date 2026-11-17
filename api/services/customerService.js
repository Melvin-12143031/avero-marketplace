import pool from "../config/database.js";

const getAllCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
  sort = "newest",
} = {}) => {
  const offset = (page - 1) * limit;
  const searchTerm = `%${search}%`;

  // Whitelist allowed sorting options.
  const sortOptions = {
    newest: "u.created_at DESC",
    oldest: "u.created_at ASC",
    name_asc: "LOWER(u.full_name) ASC",
    name_desc: "LOWER(u.full_name) DESC",
    spent_desc: "total_spent DESC",
    orders_desc: "total_orders DESC",
  };

  const orderBy = sortOptions[sort] || sortOptions.newest;

  const countQuery = `
    SELECT COUNT(*)::INTEGER AS total
    FROM users
    WHERE
      role = 'customer'
      AND (
        full_name ILIKE $1
        OR email ILIKE $1
      )
      AND (
        $2 = 'all'
        OR ($2 = 'active' AND is_active = TRUE)
        OR ($2 = 'deactivated' AND is_active = FALSE)
      );
  `;

  const customersQuery = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.created_at,
      u.is_active,
      u.deactivated_at,

      -- All orders, regardless of their status
      COUNT(o.id)::INTEGER AS total_orders,

      -- Orders with successful, non-refunded payments
      COUNT(o.id) FILTER (
        WHERE
          o.payment_status = 'paid'
          AND o.status != 'cancelled'
      )::INTEGER AS successful_orders,

      -- Cancelled orders excluding refunded orders
      COUNT(o.id) FILTER (
        WHERE
          o.status = 'cancelled'
          AND o.payment_status != 'refunded'
      )::INTEGER AS cancelled_orders,

      -- Refunded orders
      COUNT(o.id) FILTER (
        WHERE o.payment_status = 'refunded'
      )::INTEGER AS refunded_orders,

      -- Actual spending from successful purchases
      COALESCE(
        SUM(o.total) FILTER (
          WHERE
            o.payment_status = 'paid'
            AND o.status != 'cancelled'
        ),
        0
      ) AS total_spent,

            CASE
        WHEN COALESCE(
          SUM(o.total) FILTER (
            WHERE
              o.payment_status = 'paid'
              AND o.status != 'cancelled'
          ),
          0
        ) >= 10000 THEN 'high_value'

        WHEN COUNT(o.id) FILTER (
          WHERE
            o.payment_status = 'paid'
            AND o.status != 'cancelled'
        ) >= 2 THEN 'repeat_buyer'

        WHEN COUNT(o.id) FILTER (
          WHERE
            o.payment_status = 'paid'
            AND o.status != 'cancelled'
        ) = 1 THEN 'one_time_buyer'

        ELSE 'no_purchases'
      END AS customer_segment

    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE
      u.role = 'customer'
      AND (
        u.full_name ILIKE $1
        OR u.email ILIKE $1
      )
      AND (
        $2 = 'all'
        OR ($2 = 'active' AND u.is_active = TRUE)
        OR ($2 = 'deactivated' AND u.is_active = FALSE)
      )
    GROUP BY u.id
    ORDER BY ${orderBy}, u.id ASC
    LIMIT $3 OFFSET $4;
  `;

  const [countResult, customersResult] = await Promise.all([
    pool.query(countQuery, [searchTerm, status]),
    pool.query(customersQuery, [
      searchTerm,
      status,
      limit,
      limit === null ? 0 : offset,
    ]),
  ]);

  return {
    customers: customersResult.rows,
    totalCustomers: countResult.rows[0].total,
  };
};

const getCustomerById = async (customerId) => {
  const query = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.created_at,
      u.is_active,
      u.deactivated_at,

      COUNT(o.id)::INTEGER AS total_orders,

      COUNT(o.id) FILTER (
        WHERE
          o.payment_status = 'paid'
          AND o.status != 'cancelled'
      )::INTEGER AS successful_orders,

      COUNT(o.id) FILTER (
        WHERE
          o.status = 'cancelled'
          AND o.payment_status != 'refunded'
      )::INTEGER AS cancelled_orders,

      COUNT(o.id) FILTER (
        WHERE o.payment_status = 'refunded'
      )::INTEGER AS refunded_orders,

      COALESCE(
        SUM(o.total) FILTER (
          WHERE
            o.payment_status = 'paid'
            AND o.status != 'cancelled'
        ),
        0
      ) AS total_spent,

            CASE
        WHEN COALESCE(
          SUM(o.total) FILTER (
            WHERE
              o.payment_status = 'paid'
              AND o.status != 'cancelled'
          ),
          0
        ) >= 10000 THEN 'high_value'

        WHEN COUNT(o.id) FILTER (
          WHERE
            o.payment_status = 'paid'
            AND o.status != 'cancelled'
        ) >= 2 THEN 'repeat_buyer'

        WHEN COUNT(o.id) FILTER (
          WHERE
            o.payment_status = 'paid'
            AND o.status != 'cancelled'
        ) = 1 THEN 'one_time_buyer'

        ELSE 'no_purchases'
      END AS customer_segment

    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.id = $1
      AND u.role = 'customer'
    GROUP BY u.id;
  `;

  const result = await pool.query(query, [customerId]);
  return result.rows[0] || null;
};

const getCustomerOrders = async (customerId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*)::INTEGER AS total
    FROM orders
    WHERE user_id = $1;
  `;

  const ordersQuery = `
    SELECT
      o.id,
      o.order_number,
      o.created_at,
      o.total,
      o.status,
      o.payment_status,
      COUNT(oi.id)::INTEGER AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = $1
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const [countResult, ordersResult] = await Promise.all([
    pool.query(countQuery, [customerId]),
    pool.query(ordersQuery, [customerId, limit, offset]),
  ]);

  return {
    orders: ordersResult.rows,
    totalOrders: countResult.rows[0].total,
  };
};

const getCustomerActivity = async (
  customerId,
  { page = 1, limit = 10 } = {},
) => {
  const offset = (page - 1) * limit;

  const countQuery = `
    SELECT COUNT(*)::INTEGER AS total
    FROM customer_activity_logs
    WHERE customer_id = $1;
  `;

  const activityQuery = `
    SELECT
      l.id,
      l.action,
      l.created_at,
      l.metadata,
      a.id AS admin_id,
      a.full_name AS admin_name,
      a.email AS admin_email
    FROM customer_activity_logs l
    INNER JOIN users a ON a.id = l.performed_by
    WHERE l.customer_id = $1
    ORDER BY l.created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const [countResult, activityResult] = await Promise.all([
    pool.query(countQuery, [customerId]),
    pool.query(activityQuery, [customerId, limit, offset]),
  ]);

  return {
    activities: activityResult.rows,
    totalActivities: countResult.rows[0].total,
  };
};

// Update account status and record activity in one transaction
const updateCustomerAccountStatus = async (
  customerId,
  performedBy,
  shouldBeActive,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the customer row to prevent concurrent status changes
    const customerResult = await client.query(
      `
        SELECT id, full_name, email, is_active, deactivated_at
        FROM users
        WHERE id = $1
          AND role = 'customer'
        FOR UPDATE;
      `,
      [customerId],
    );

    const customer = customerResult.rows[0];

    if (!customer) {
      await client.query("COMMIT");
      return null;
    }

    // Avoid creating duplicate activity logs for unchanged status
    if (customer.is_active === shouldBeActive) {
      await client.query("COMMIT");
      return customer;
    }

    const action = shouldBeActive ? "reactivated" : "deactivated";

    const updateResult = await client.query(
      `
        UPDATE users
        SET
          is_active = $2,
          deactivated_at = CASE
            WHEN $2 = FALSE THEN CURRENT_TIMESTAMP
            ELSE NULL
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, full_name, email, is_active, deactivated_at;
      `,
      [customerId, shouldBeActive],
    );

    const updatedCustomer = updateResult.rows[0];

    // Record who performed the account status change
    await client.query(
      `
        INSERT INTO customer_activity_logs (
          customer_id,
          performed_by,
          action
        )
        VALUES ($1, $2, $3);
      `,
      [customerId, performedBy, action],
    );

    await client.query("COMMIT");

    return updatedCustomer;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deactivateCustomer = async (customerId, performedBy) => {
  return updateCustomerAccountStatus(customerId, performedBy, false);
};

const reactivateCustomer = async (customerId, performedBy) => {
  return updateCustomerAccountStatus(customerId, performedBy, true);
};

export {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
  getCustomerActivity,
  deactivateCustomer,
  reactivateCustomer,
};
