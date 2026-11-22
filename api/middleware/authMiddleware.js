import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const protect = async (req, res, next) => {
  try {
    // 1. Get JWT from HTTP-only cookie or Authorization header
    const authHeader = req.headers.authorization;

    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = req.cookies?.token || bearerToken;

    // 2. Check if token exists
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Not authorized. No token provided.",
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // 4. Retrieve current user from database

    if (typeof decoded.userId !== "string" || !decoded.userId) {
      return res.status(401).json({
        status: "error",
        message: "Not authorized. Invalid token payload.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          full_name,
          email,
          role,
          is_active
        FROM users
        WHERE id = $1
      `,
      [decoded.userId],
    );

    // 5. Check if user still exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Not authorized. User no longer exists.",
      });
    }

    const user = result.rows[0];

    // 6. Check account status
    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "Your account has been deactivated.",
      });
    }

    // 7. Attach user information to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      status: "error",
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

export default protect;
//
