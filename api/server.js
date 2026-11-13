import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import pool from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

//Product Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);

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

//Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
