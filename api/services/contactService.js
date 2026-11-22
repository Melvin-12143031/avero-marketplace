import pool from "../config/database.js";

const createContactInquiry = async (inquiryData) => {
  const { full_name, email, phone, inquiry_type, subject, message } =
    inquiryData;

  const query = `
    INSERT INTO contact_inquiries (
      full_name,
      email,
      phone,
      inquiry_type,
      subject,
      message
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      full_name,
      email,
      inquiry_type,
      subject,
      status,
      created_at;
  `;

  const values = [
    full_name,
    email,
    phone || null,
    inquiry_type,
    subject,
    message,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAdminContactInquiries = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  inquiry_type = "",
}) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(full_name ILIKE $${values.length}
        OR email ILIKE $${values.length}
        OR subject ILIKE $${values.length})`,
    );
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (inquiry_type) {
    values.push(inquiry_type);
    conditions.push(`inquiry_type = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM contact_inquiries
    ${whereClause};
  `;

  const countResult = await pool.query(countQuery, values);

  const total = countResult.rows[0].total;

  const dataValues = [...values, limit, offset];

  const dataQuery = `
    SELECT
      id,
      full_name,
      email,
      phone,
      inquiry_type,
      subject,
      status,
      created_at,
      updated_at
    FROM contact_inquiries
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${dataValues.length - 1}
    OFFSET $${dataValues.length};
  `;

  const result = await pool.query(dataQuery, dataValues);

  return {
    inquiries: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAdminContactInquiryById = async (id) => {
  const query = `
    SELECT
      id,
      full_name,
      email,
      phone,
      inquiry_type,
      subject,
      message,
      status,
      created_at,
      updated_at
    FROM contact_inquiries
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
};

const updateContactInquiryStatus = async (id, status) => {
  const query = `
    UPDATE contact_inquiries
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      full_name,
      email,
      subject,
      status,
      updated_at;
  `;

  const result = await pool.query(query, [status, id]);

  return result.rows[0] || null;
};

export {
  createContactInquiry,
  getAdminContactInquiries,
  getAdminContactInquiryById,
  updateContactInquiryStatus,
};
