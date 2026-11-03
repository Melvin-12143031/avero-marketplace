import express from "express";
import "dotenv/config";
import cors from "cors";
import pool from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

//Product Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);

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

//Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
