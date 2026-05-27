# Shopify REST API Server

A complete Node.js + Express REST API server that wraps the Shopify REST Admin API and exposes clean endpoints for product operations.

## What This Does

Instead of calling Shopify's REST API directly from your frontend or app, you call this server. It handles authentication, formatting, and adds your own custom endpoints (like measurements and size charts as separate URLs).

## Project Structure

```
shopify-rest-api/
├── server.js                          # Main Express server
├── package.json                       # Dependencies
├── .env.example                       # Environment template
├── .gitignore
├── routes/
│   └── products.js                    # Product endpoints
├── services/
│   ├── shopifyClient.js               # Axios client for Shopify
│   └── productsService.js             # Product business logic
└── Shopify-REST-API.postman_collection.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/products` | List all products (paginated) |
| GET | `/api/products/filter` | Filter products by vendor, type, price, etc. |
| GET | `/api/products/:identifier` | Get product by ID or handle |
| GET | `/api/products/:identifier/measurements` | Get product measurements (metafield) |
| GET | `/api/products/:identifier/size-chart` | Get product size chart (metafield) |
| GET | `/api/products/:identifier/images` | Get all product images |
| GET | `/api/products/:identifier/metafields` | Get all metafields |

`:identifier` can be either a numeric product ID or a handle (slug).

---

# Setup Steps

## Step 1: Install Node.js

If you do not have Node.js, install it from [nodejs.org](https://nodejs.org). Version 18 or higher is recommended.

Verify installation:
```bash
node --version
npm --version
```

## Step 2: Get Your Shopify Admin API Token

You need a Shopify Admin API access token (starts with `shpat_`).

1. Go to your Shopify Admin
2. Click **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app** (or open existing app)
4. Click **Configuration** tab → find **Admin API integration** → click **Configure**
5. Enable these scopes:
   - `read_products`
   - `read_product_listings`
   - `read_inventory`
   - `read_content` (optional)
6. Click **Save**
7. Click **API credentials** tab → click **Install app**
8. Copy the **Admin API access token** (only shown once)



## Step 3: Set Up the Project

```bash
# Navigate to the project folder
cd shopify-rest-api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## Step 4: Configure Environment Variables

Open `.env` in a text editor and fill in:

```env
SHOPIFY_STORE_DOMAIN=thareja-mwevoupc.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_actual_token_here
SHOPIFY_API_VERSION=2024-10
PORT=3000
```

**Important:**
- No `https://` in `SHOPIFY_STORE_DOMAIN`
- No trailing slash
- Use the actual token from Step 2

## Step 5: Start the Server

```bash
npm start
```

Expected output:
```
Shopify REST API Server
Running on http://localhost:3000
Connected to: thareja-mwevoupc.myshopify.com
API Version: 2024-10

Available endpoints:
  GET /health
  GET /api/products
  GET /api/products/filter
  GET /api/products/:identifier
  GET /api/products/:identifier/measurements
  GET /api/products/:identifier/size-chart
  GET /api/products/:identifier/images
  GET /api/products/:identifier/metafields
```

For development with auto-reload:
```bash
npm run dev
```

## Step 6: Test in Browser or Postman

Open in browser:
```
http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-05-27T...",
  "shopify_domain": "thareja-mwevoupc.myshopify.com",
  "api_version": "2024-10"
}
```

## Step 7: Import Postman Collection

1. Open Postman
2. Click **Import** → drag `Shopify-REST-API.postman_collection.json`
3. Click on the collection → **Variables** tab
4. Set values:
   - `baseUrl` = `http://localhost:3000`
   - `productHandle` = a real handle from your store
   - `productId` = a real numeric ID from your store
5. Save

---

# Example Requests

## List Products
```bash
curl http://localhost:3000/api/products?limit=10
```

## Filter by Vendor
```bash
curl "http://localhost:3000/api/products/filter?vendor=Thareja%20Premium"
```

## Filter by Product Type
```bash
curl "http://localhost:3000/api/products/filter?product_type=T-Shirt"
```

## Filter by Price Range
```bash
curl "http://localhost:3000/api/products/filter?min_price=50&max_price=150"
```

## Get Product by Handle
```bash
curl http://localhost:3000/api/products/premium-cotton-tshirt
```

## Get Product Measurements
```bash
curl http://localhost:3000/api/products/premium-cotton-tshirt/measurements
```

## Get Product Size Chart
```bash
curl http://localhost:3000/api/products/premium-cotton-tshirt/size-chart
```

## Get Product Images
```bash
curl http://localhost:3000/api/products/premium-cotton-tshirt/images
```

---

# Example Responses

## List Products
```json
{
  "success": true,
  "products": [
    {
      "id": 1234567890,
      "title": "Premium Cotton T-Shirt",
      "handle": "premium-cotton-tshirt",
      "vendor": "Thareja Premium",
      "product_type": "T-Shirt",
      "tags": "summer, cotton, bestseller",
      "status": "active",
      "variants": [
        {
          "id": 987654321,
          "title": "S / Black",
          "sku": "TSHIRT-S-BLK",
          "price": "29.99",
          "inventory_quantity": 50,
          "option1": "S",
          "option2": "Black"
        }
      ],
      "images": [
        {
          "id": 111111,
          "src": "https://cdn.shopify.com/...",
          "alt": "Premium Cotton T-Shirt"
        }
      ]
    }
  ],
  "pagination": {
    "next": "eyJsYXN0X2lkIjoxMjM0NTY3ODkw...",
    "previous": null
  }
}
```

## Get Measurements
```json
{
  "success": true,
  "product_id": 1234567890,
  "measurements": {
    "chest": "52 cm",
    "length": "70 cm",
    "shoulders": "44 cm",
    "sleeve": "22 cm",
    "weight": "180 g"
  }
}
```

## Get Size Chart
```json
{
  "success": true,
  "product_id": 1234567890,
  "size_chart": {
    "unit": "cm",
    "sizes": [
      { "size": "S", "chest": 48, "length": 68, "shoulders": 42 },
      { "size": "M", "chest": 52, "length": 70, "shoulders": 44 },
      { "size": "L", "chest": 56, "length": 72, "shoulders": 46 }
    ]
  }
}
```

---

# Pagination

Shopify uses cursor-based pagination. The response includes a `pagination` object:

```json
{
  "products": [...],
  "pagination": {
    "next": "eyJsYXN0X2lkIjoxMjM0...",
    "previous": null
  }
}
```

To get the next page, pass `page_info`:
```
GET /api/products?page_info=eyJsYXN0X2lkIjoxMjM0...
```

---

# Differences from GraphQL Version

| Feature | REST API | GraphQL |
|---------|----------|---------|
| Token type | Admin API (`shpat_`) | Storefront API |
| Pagination | Cursor via Link header | Cursor via response |
| Price filter | Client-side (REST limitation) | Native support |
| Field selection | Limited (`fields` param) | Granular per query |
| Metafields | Separate endpoint | Inline in query |
| Use case | Backend, admin operations | Customer-facing |

---

# Troubleshooting

## Server will not start
**Error:** `Missing required environment variables`
- Check that `.env` exists and has both `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_ACCESS_TOKEN` set.

## 401 Unauthorized from Shopify
- Token is wrong or revoked. Generate a new one and update `.env`.
- Token does not have `read_products` scope. Add the scope and re-install the app.
- Restart the server after changing `.env`.

## 404 Product not found
- Product handle is wrong. Run List Products first to find a real handle.
- Product is not visible to the API (e.g., status is `draft`).

## Empty measurements/size chart
- Metafields are not set on the product. Go to Shopify Admin → Product → Metafields section.
- Wrong namespace/key. The code expects `custom.measurements` and `custom.size_chart`.

## Rate limit errors
- Shopify REST API has a leaky bucket rate limit (40 calls/sec on standard plans).
- The interceptor logs errors; if you see 429 errors, add delays between calls.

---

# Security Notes

1. **Never commit `.env`** — it is in `.gitignore` by default
2. **Admin API token is sensitive** — anyone with it has full access to your store
3. **Run this server behind authentication** in production — currently anyone hitting your server can read your products
4. **CORS is open to all** in this template — restrict it in production
5. **Rotate tokens periodically** — uninstall and reinstall the app every few months

---

# Next Steps

- Add caching (Redis) to reduce Shopify API calls
- Add authentication middleware (JWT or API keys) to protect your endpoints
- Add rate limiting (express-rate-limit) to prevent abuse
- Add request validation (joi or zod)
- Add unit tests (jest)
- Deploy to Render, Railway, Vercel, or AWS
