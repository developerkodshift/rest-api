/**
 * Products Service
 * Wraps Shopify REST Admin API endpoints for products
 *
 * Shopify REST API Reference:
 * https://shopify.dev/docs/api/admin-rest/2024-10/resources/product
 */

const shopifyClient = require("./shopifyClient");

// ============================================
// 1. LIST PRODUCTS
// ============================================
// GET /admin/api/2024-10/products.json
async function listProducts({ limit = 20, page_info = null, fields = null } = {}) {
  const params = { limit };
  if (page_info) params.page_info = page_info;
  if (fields) params.fields = fields;

  const response = await shopifyClient.get("/products.json", { params });

  // Extract pagination from Link header
  const linkHeader = response.headers.link;
  const pagination = parseLinkHeader(linkHeader);

  return {
    products: response.data.products,
    pagination,
  };
}

// ============================================
// 2. FILTER PRODUCTS
// ============================================
// GET /admin/api/2024-10/products.json?vendor=X&product_type=Y
async function filterProducts({
  limit = 20,
  vendor = null,
  product_type = null,
  collection_id = null,
  status = null,
  created_at_min = null,
  created_at_max = null,
  title = null,
  handle = null,
  ids = null,
} = {}) {
  const params = { limit };

  if (vendor) params.vendor = vendor;
  if (product_type) params.product_type = product_type;
  if (collection_id) params.collection_id = collection_id;
  if (status) params.status = status;
  if (created_at_min) params.created_at_min = created_at_min;
  if (created_at_max) params.created_at_max = created_at_max;
  if (title) params.title = title;
  if (handle) params.handle = handle;
  if (ids) params.ids = ids;

  const response = await shopifyClient.get("/products.json", { params });

  // Client-side filtering for price range (REST API does not support price filter directly)
  return {
    products: response.data.products,
    count: response.data.products.length,
  };
}

// Helper: Filter products by price range (client-side)
async function filterProductsByPrice({ min_price, max_price, limit = 50 }) {
  const response = await shopifyClient.get("/products.json", {
    params: { limit },
  });

  const filtered = response.data.products.filter((product) => {
    const prices = product.variants.map((v) => parseFloat(v.price));
    const minVariantPrice = Math.min(...prices);
    const maxVariantPrice = Math.max(...prices);

    if (min_price && maxVariantPrice < parseFloat(min_price)) return false;
    if (max_price && minVariantPrice > parseFloat(max_price)) return false;
    return true;
  });

  return {
    products: filtered,
    count: filtered.length,
  };
}

// ============================================
// 3. GET PRODUCT DETAILS BY ID OR HANDLE
// ============================================
// GET /admin/api/2024-10/products/{product_id}.json
async function getProductById(productId) {
  const response = await shopifyClient.get(`/products/${productId}.json`);
  return response.data.product;
}

// GET product by handle (requires listing and filtering)
async function getProductByHandle(handle) {
  const response = await shopifyClient.get("/products.json", {
    params: { handle, limit: 1 },
  });

  if (!response.data.products || response.data.products.length === 0) {
    return null;
  }

  return response.data.products[0];
}

// ============================================
// 4. GET PRODUCT METAFIELDS (measurements, size chart)
// ============================================
// GET /admin/api/2024-10/products/{product_id}/metafields.json
async function getProductMetafields(productId, { namespace = null, key = null } = {}) {
  const params = {};
  if (namespace) params.namespace = namespace;
  if (key) params.key = key;

  const response = await shopifyClient.get(
    `/products/${productId}/metafields.json`,
    { params }
  );

  return response.data.metafields;
}

// Get specific metafield (measurements)
async function getProductMeasurements(productId) {
  const metafields = await getProductMetafields(productId, {
    namespace: "custom",
    key: "measurements",
  });

  if (!metafields || metafields.length === 0) {
    return null;
  }

  return safeJsonParse(metafields[0].value);
}

// Get specific metafield (size chart)
async function getProductSizeChart(productId) {
  const metafields = await getProductMetafields(productId, {
    namespace: "custom",
    key: "size_chart",
  });

  if (!metafields || metafields.length === 0) {
    return null;
  }

  return safeJsonParse(metafields[0].value);
}

// ============================================
// 5. GET PRODUCT IMAGES
// ============================================
// GET /admin/api/2024-10/products/{product_id}/images.json
async function getProductImages(productId) {
  const response = await shopifyClient.get(
    `/products/${productId}/images.json`
  );
  return response.data.images;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Parse Shopify's Link header for pagination
function parseLinkHeader(linkHeader) {
  if (!linkHeader) return { next: null, previous: null };

  const links = {};
  const parts = linkHeader.split(",");

  parts.forEach((part) => {
    const section = part.split(";");
    if (section.length < 2) return;

    const url = section[0].trim().replace(/[<>]/g, "");
    const name = section[1].trim().replace(/rel="(.+)"/, "$1");

    // Extract page_info from URL
    const pageInfoMatch = url.match(/page_info=([^&]+)/);
    if (pageInfoMatch) {
      links[name] = pageInfoMatch[1];
    }
  });

  return {
    next: links.next || null,
    previous: links.previous || null,
  };
}

// Safely parse JSON metafield values
function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

module.exports = {
  listProducts,
  filterProducts,
  filterProductsByPrice,
  getProductById,
  getProductByHandle,
  getProductMetafields,
  getProductMeasurements,
  getProductSizeChart,
  getProductImages,
};
