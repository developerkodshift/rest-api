/**
 * Shopify REST Admin API Client
 * Uses axios to make HTTP requests to Shopify REST endpoints
 */

const axios = require("axios");

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

const BASE_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

// Create axios instance with default config
const shopifyClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor for logging
shopifyClient.interceptors.request.use(
  (config) => {
    console.log(`[Shopify API] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
shopifyClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[Shopify API Error] ${error.response.status}:`,
        error.response.data
      );
    } else {
      console.error("[Shopify API Error]", error.message);
    }
    return Promise.reject(error);
  }
);

module.exports = shopifyClient;
