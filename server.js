/**
 * Shopify REST API Server
 *
 * A Node.js + Express server that wraps Shopify REST Admin API
 * and exposes clean REST endpoints for product operations.
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables
if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
  console.error("Missing required environment variables.");
  console.error("Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN in .env file.");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    shopify_domain: process.env.SHOPIFY_STORE_DOMAIN,
    api_version: process.env.SHOPIFY_API_VERSION || "2024-10",
  });
});

// API root
app.get("/", (req, res) => {
  res.json({
    message: "Shopify REST API Server",
    endpoints: {
      health: "GET /health",
      list_products: "GET /api/products",
      filter_products: "GET /api/products/filter",
      product_details: "GET /api/products/:identifier",
      product_measurements: "GET /api/products/:identifier/measurements",
      product_size_chart: "GET /api/products/:identifier/size-chart",
      product_images: "GET /api/products/:identifier/images",
      product_metafields: "GET /api/products/:identifier/metafields",
    },
  });
});

// Routes
app.use("/api/products", productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nShopify REST API Server`);
  console.log(`Running on http://localhost:${PORT}`);
  console.log(`Connected to: ${process.env.SHOPIFY_STORE_DOMAIN}`);
  console.log(`API Version: ${process.env.SHOPIFY_API_VERSION || "2024-10"}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET /health`);
  console.log(`  GET /api/products`);
  console.log(`  GET /api/products/filter`);
  console.log(`  GET /api/products/:identifier`);
  console.log(`  GET /api/products/:identifier/measurements`);
  console.log(`  GET /api/products/:identifier/size-chart`);
  console.log(`  GET /api/products/:identifier/images`);
  console.log(`  GET /api/products/:identifier/metafields\n`);
});

module.exports = app;
