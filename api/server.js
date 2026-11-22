import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import validateEnv from "./config/validateEnv.js";

import pool from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(helmet());

const allowedOrigins = [
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

//Product Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/contact", contactRoutes);

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy!",
    timestamp: new Date().toISOString(),
  });
});

//Database Health Check
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.status(200).json({
      status: "success",
      message: "Neon database connected successfully!",
      current_time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Database connection failed.",
    });
  }
});

//Test Route
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce Marketplace API is running!",
  });
});

// 404 Not Found Middleware
app.use(notFound);

// Error Handling Middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down server...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log("Database connection pool closed.");
      process.exit(0);
    } catch (error) {
      console.error("Error closing database pool:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
