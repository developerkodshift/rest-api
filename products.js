/**
 * Product Routes
 * Exposes Shopify products as REST endpoints
 */

const express = require("express");
const router = express.Router();
const productsService = require("../services/productsService");

// ============================================
// GET /api/products - List all products
// Query params: limit, page_info, fields
// ============================================
router.get("/", async (req, res) => {
  try {
    const { limit, page_info, fields } = req.query;
    const result = await productsService.listProducts({
      limit: limit ? parseInt(limit) : 20,
      page_info: page_info || null,
      fields: fields || null,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// ============================================
// GET /api/products/filter - Filter products
// Query params: vendor, product_type, collection_id, status, title, handle, min_price, max_price
// ============================================
router.get("/filter", async (req, res) => {
  try {
    const {
      limit,
      vendor,
      product_type,
      collection_id,
      status,
      title,
      handle,
      ids,
      min_price,
      max_price,
      created_at_min,
      created_at_max,
    } = req.query;

    // If price filter is used, use price filtering helper
    if (min_price || max_price) {
      const result = await productsService.filterProductsByPrice({
        min_price,
        max_price,
        limit: limit ? parseInt(limit) : 50,
      });
      return res.json({ success: true, ...result });
    }

    // Otherwise use standard REST filtering
    const result = await productsService.filterProducts({
      limit: limit ? parseInt(limit) : 20,
      vendor,
      product_type,
      collection_id,
      status,
      title,
      handle,
      ids,
      created_at_min,
      created_at_max,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// ============================================
// GET /api/products/:identifier - Get product by ID or handle
// ============================================
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    let product;

    // If identifier is numeric, treat as product ID. Otherwise treat as handle.
    if (/^\d+$/.test(identifier)) {
      product = await productsService.getProductById(identifier);
    } else {
      product = await productsService.getProductByHandle(identifier);
    }

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// ============================================
// GET /api/products/:identifier/measurements
// ============================================
router.get("/:identifier/measurements", async (req, res) => {
  try {
    const { identifier } = req.params;

    // Get product first to resolve handle to ID
    const product = /^\d+$/.test(identifier)
      ? { id: identifier }
      : await productsService.getProductByHandle(identifier);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const measurements = await productsService.getProductMeasurements(
      product.id
    );

    if (!measurements) {
      return res
        .status(404)
        .json({ success: false, error: "Measurements not set for this product" });
    }

    res.json({
      success: true,
      product_id: product.id,
      measurements,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// ============================================
// GET /api/products/:identifier/size-chart
// ============================================
router.get("/:identifier/size-chart", async (req, res) => {
  try {
    const { identifier } = req.params;

    const product = /^\d+$/.test(identifier)
      ? { id: identifier }
      : await productsService.getProductByHandle(identifier);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const sizeChart = await productsService.getProductSizeChart(product.id);

    if (!sizeChart) {
      return res
        .status(404)
        .json({ success: false, error: "Size chart not set for this product" });
    }

    res.json({
      success: true,
      product_id: product.id,
      size_chart: sizeChart,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// ============================================
// GET /api/products/:identifier/images
// ============================================
router.get("/:identifier/images", async (req, res) => {
  try {
    const { identifier } = req.params;

    const product = /^\d+$/.test(identifier)
      ? { id: identifier }
      : await productsService.getProductByHandle(identifier);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const images = await productsService.getProductImages(product.id);

    res.json({
      success: true,
      product_id: product.id,
      count: images.length,
      images,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

// ============================================
// GET /api/products/:identifier/metafields - All metafields
// ============================================
router.get("/:identifier/metafields", async (req, res) => {
  try {
    const { identifier } = req.params;
    const { namespace, key } = req.query;

    const product = /^\d+$/.test(identifier)
      ? { id: identifier }
      : await productsService.getProductByHandle(identifier);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    const metafields = await productsService.getProductMetafields(product.id, {
      namespace,
      key,
    });

    res.json({
      success: true,
      product_id: product.id,
      count: metafields.length,
      metafields,
    });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    });
  }
});

module.exports = router;
