// ─────────────────────────────────────────────────────────────
//  ShopApp API Client
//  All backend requests go through this module.
//  In development, Vite proxies /api → http://localhost:5000
// ─────────────────────────────────────────────────────────────

const BASE_URL = "/api";

/**
 * Generic request helper — throws on non-2xx or network failure.
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json;
}

// ─── Products ────────────────────────────────────────────────

/**
 * Fetch products with optional query filters.
 * @param {Object} params - e.g. { category, search, brand, sort, isFeatured, isNew, deals, bestsellers }
 */
export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== "") {
      qs.append(key, val);
    }
  });
  const query = qs.toString() ? `?${qs.toString()}` : "";
  const data = await request(`/products${query}`);
  return data.data; // array of products
}

/**
 * Fetch a single product by ID.
 */
export async function fetchProductById(id) {
  const data = await request(`/products/${id}`);
  return data.data;
}

// ─── Categories ──────────────────────────────────────────────

/**
 * Fetch all categories (with live counts).
 */
export async function fetchCategories() {
  const data = await request("/categories");
  return data.data; // array of categories
}

// ─── Coupon ──────────────────────────────────────────────────

/**
 * Validate a promo coupon code against the cart subtotal.
 * @returns {{ code, discountPercent, discountAmount, description }}
 */
export async function validateCoupon(code, subtotal) {
  const data = await request("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
  return data.data;
}

// ─── Orders ──────────────────────────────────────────────────

/**
 * Create a new order (checkout).
 * @param {{ items, customerName, email, promoCode, discountAmount }} payload
 * @returns {Object} created order
 */
export async function createOrder(payload) {
  const data = await request("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
}

/**
 * Track an order by Order ID (e.g. "ORD-84920").
 * @returns {Object} order tracking info with steps timeline
 */
export async function trackOrder(trackingId) {
  const data = await request(`/orders/track/${encodeURIComponent(trackingId)}`);
  return data.data;
}

// ─── Auth ────────────────────────────────────────────────────

/**
 * Sign in an existing user.
 * @returns {{ id, name, email, role, token }}
 */
export async function signIn(email, password) {
  const data = await request("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.data;
}

/**
 * Register a new user.
 * @returns {{ id, name, email, role, token }}
 */
export async function signUp(name, email, password) {
  const data = await request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return data.data;
}
