import pool from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

const registerUser = async ({ fullName, email, password }) => {
  // 1. Check if the email is already registered
  const existingUser = await pool.query(
    `
      SELECT id
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Email already registered.");
  }

  // 2. Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create the user
  const result = await pool.query(
    `
      INSERT INTO users (full_name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, full_name, email
    `,
    [fullName, email, passwordHash],
  );

  return result.rows[0];
};

const loginUser = async ({ email, password }) => {
  // 1. Fetch the user by email
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        email,
        role,
        password_hash,
        is_active
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  const user = result.rows[0];

  // 2. Check if the user exists
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // 3. Verify the password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  // 4. Check account status
  if (!user.is_active) {
    throw new Error("Account is deactivated.");
  }

  // 5. Generate a JWT token
  const token = jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );

  // 6. Return user details and token
  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

export { registerUser, loginUser };
