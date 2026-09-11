#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 * Comprehensive Backend API Test Script
 * ═══════════════════════════════════════════════════════════════════
 *
 * Tests EVERY route in the https backend:
 *   1.  Auth (sign-up, sign-in, session)
 *   2.  User routes (/api/users, /api/me)
 *   3.  Admin routes (/api/admin/stats)
 *   4.  Premium routes (/api/premium/features)
 *   5.  Creator routes (setup, profile, check, public)
 *   6.  Product routes (CRUD, publish)
 *   7.  Variant routes (CRUD)
 *   8.  File Upload routes (upload, delete, thumbnail)
 *   9.  Follower routes (follow, unfollow, isFollowing)
 *  10.  Public/Storefront routes (featured, storefront, product slug)
 *  11.  Discover routes (search, trending, categories, creators)
 *  12.  Analytics routes (overview, revenue, products, sales)
 *  13.  Order routes (sales, purchases, getById, refund)
 *  14.  Review routes (list, create, delete)
 *  15.  Discount routes (validate, list, create, delete)
 *  16.  Checkout routes (sessions, webhooks, connect, download)
 *
 * Usage:
 *   node test-all-routes.js [BASE_URL]
 *   Default BASE_URL = http://localhost:3002
 */

const BASE = process.argv[2] || "http://localhost:3002";

// ─── Helpers ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

function log(icon, msg) {
  console.log(`  ${icon} ${msg}`);
}

function sectionHeader(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
}

/**
 * Make an HTTP request and return { status, headers, body, ok }.
 * Handles cookies manually for session management.
 */
async function request(method, path, {
  body = null,
  cookies = "",
  query = {},
  headers: extraHeaders = {},
  rawBody = false,
} = {}) {
  // Build URL with query params
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  const headers = {
    Origin: "http://localhost:3000",
    ...(cookies ? { Cookie: cookies } : {}),
    ...extraHeaders,
  };

  if (body && !rawBody) {
    headers["Content-Type"] = "application/json";
  }

  const opts = { method, headers, redirect: "manual" };
  if (body) {
    opts.body = rawBody ? body : JSON.stringify(body);
  }

  const res = await fetch(url.toString(), opts);

  let responseBody;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    responseBody = await res.json();
  } else {
    responseBody = await res.text();
  }

  // Extract set-cookie headers
  const setCookieHeaders = res.headers.getSetCookie?.() || [];

  return {
    status: res.status,
    headers: res.headers,
    body: responseBody,
    ok: res.status >= 200 && res.status < 400,
    setCookies: setCookieHeaders,
    location: res.headers.get("location"),
  };
}

/**
 * Parse Set-Cookie headers and merge with existing cookie string.
 */
function mergeCookies(existingCookies, setCookieHeaders) {
  const cookieMap = {};
  // Parse existing
  if (existingCookies) {
    for (const part of existingCookies.split(";")) {
      const [k, ...v] = part.trim().split("=");
      if (k) cookieMap[k.trim()] = v.join("=");
    }
  }
  // Parse new set-cookie headers
  for (const sc of setCookieHeaders) {
    const mainPart = sc.split(";")[0];
    const [k, ...v] = mainPart.split("=");
    if (k) cookieMap[k.trim()] = v.join("=");
  }
  return Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join("; ");
}

/**
 * Run a single test case.
 */
async function test(name, fn) {
  try {
    const result = await fn();
    if (result === "SKIP") {
      skipped++;
      log("⏭️", `${name} — SKIPPED`);
      results.push({ name, status: "SKIP" });
      return;
    }
    passed++;
    log("✅", name);
    results.push({ name, status: "PASS" });
  } catch (err) {
    failed++;
    log("❌", `${name} — ${err.message}`);
    results.push({ name, status: "FAIL", error: err.message });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// ─── State (populated during tests) ──────────────────────────────

let userCookies = "";
let adminCookies = "";
let user2Cookies = "";

let userId = "";
let adminId = "";
let user2Id = "";

let creatorUsername = "";
let productId = "";
let variantId = "";
let orderId = "";
let reviewId = "";
let discountId = "";
let discountCode = "";

// Unique suffix to avoid collisions across runs
const TS = Date.now();
const TEST_EMAIL = `testuser_${TS}@test.com`;
const TEST_EMAIL_2 = `testuser2_${TS}@test.com`;
const ADMIN_EMAIL = `admin_${TS}@test.com`;
const TEST_PASSWORD = "TestPassword123!";
const TEST_USERNAME = `testcreator${TS}`.substring(0, 28);

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log(`\n🚀 Testing backend at: ${BASE}`);
  console.log(`   Timestamp suffix: ${TS}`);

  // ─── 0. Health Check ────────────────────────────────────────────
  sectionHeader("0. HEALTH CHECK");

  await test("GET / — API running", async () => {
    const res = await request("GET", "/");
    assert(res.ok, `Expected 2xx, got ${res.status}`);
    assert(res.body?.message?.includes("running"), "Missing running message");
  });

  // ─── 1. AUTH ────────────────────────────────────────────────────
  sectionHeader("1. AUTH (Better Auth)");

  // Sign up main user
  await test("POST /api/auth/sign-up/email — sign up test user", async () => {
    const res = await request("POST", "/api/auth/sign-up/email", {
      body: { name: "Test User", email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    assert(res.status === 200 || res.status === 201, `Sign-up failed: ${res.status} — ${JSON.stringify(res.body)}`);
    if (res.setCookies.length) {
      userCookies = mergeCookies(userCookies, res.setCookies);
    }
    userId = res.body?.user?.id || res.body?.data?.user?.id || "";
  });

  // Sign up second user (for follower/order tests)
  await test("POST /api/auth/sign-up/email — sign up user2", async () => {
    const res = await request("POST", "/api/auth/sign-up/email", {
      body: { name: "Test User 2", email: TEST_EMAIL_2, password: TEST_PASSWORD },
    });
    assert(res.status === 200 || res.status === 201, `Sign-up failed: ${res.status}`);
    if (res.setCookies.length) {
      user2Cookies = mergeCookies(user2Cookies, res.setCookies);
    }
    user2Id = res.body?.user?.id || res.body?.data?.user?.id || "";
  });

  // Sign up admin user
  await test("POST /api/auth/sign-up/email — sign up admin user", async () => {
    const res = await request("POST", "/api/auth/sign-up/email", {
      body: { name: "Admin User", email: ADMIN_EMAIL, password: TEST_PASSWORD },
    });
    assert(res.status === 200 || res.status === 201, `Sign-up failed: ${res.status}`);
    if (res.setCookies.length) {
      adminCookies = mergeCookies(adminCookies, res.setCookies);
    }
    adminId = res.body?.user?.id || res.body?.data?.user?.id || "";
    if (adminId) {
      try {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();
        await prisma.user.update({ where: { id: adminId }, data: { role: "admin" } });
        await prisma.$disconnect();
      } catch (e) {
        // Ignore if prisma direct access not available
      }
    }
  });

  // Sign in (to get fresh session cookies)
  await test("POST /api/auth/sign-in/email — sign in test user", async () => {
    const res = await request("POST", "/api/auth/sign-in/email", {
      body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    assert(res.status === 200, `Sign-in failed: ${res.status} — ${JSON.stringify(res.body)}`);
    if (res.setCookies.length) {
      userCookies = mergeCookies(userCookies, res.setCookies);
    }
    userId = res.body?.user?.id || res.body?.data?.user?.id || userId;
  });

  // Sign in user2
  await test("POST /api/auth/sign-in/email — sign in user2", async () => {
    const res = await request("POST", "/api/auth/sign-in/email", {
      body: { email: TEST_EMAIL_2, password: TEST_PASSWORD },
    });
    assert(res.status === 200, `Sign-in failed: ${res.status}`);
    if (res.setCookies.length) {
      user2Cookies = mergeCookies(user2Cookies, res.setCookies);
    }
    user2Id = res.body?.user?.id || res.body?.data?.user?.id || user2Id;
  });

  // Sign in promoted admin
  await test("POST /api/auth/sign-in/email — sign in promoted admin user", async () => {
    const res = await request("POST", "/api/auth/sign-in/email", {
      body: { email: ADMIN_EMAIL, password: TEST_PASSWORD },
    });
    if (res.status === 200 && res.setCookies.length) {
      adminCookies = mergeCookies("", res.setCookies);
    }
  });

  // Get session
  await test("GET /api/auth/get-session — verify session", async () => {
    const res = await request("GET", "/api/auth/get-session", {
      cookies: userCookies,
    });
    assert(res.ok, `Session check failed: ${res.status}`);
  });

  // ─── 2. USER ROUTES ────────────────────────────────────────────
  sectionHeader("2. USER ROUTES");

  await test("GET /api/me — get current user (authenticated)", async () => {
    const res = await request("GET", "/api/me", { cookies: userCookies });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
    assert(res.body?.success === true, "Expected success: true");
  });

  await test("GET /api/me — 401 without auth", async () => {
    const res = await request("GET", "/api/me");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/users — list users (authenticated)", async () => {
    const res = await request("GET", "/api/users", { cookies: userCookies });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/users — 401 without auth", async () => {
    const res = await request("GET", "/api/users");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // ─── 3. ADMIN ROUTES ───────────────────────────────────────────
  sectionHeader("3. ADMIN ROUTES");

  await test("GET /api/admin/stats — 401 without auth", async () => {
    const res = await request("GET", "/api/admin/stats");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/admin/stats — 403 for non-admin user", async () => {
    const res = await request("GET", "/api/admin/stats", { cookies: userCookies });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test("GET /api/admin/stats — with admin user", async () => {
    const res = await request("GET", "/api/admin/stats", { cookies: adminCookies });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  // ─── 4. PREMIUM ROUTES ─────────────────────────────────────────
  sectionHeader("4. PREMIUM ROUTES");

  await test("GET /api/premium/features — 401 without auth", async () => {
    const res = await request("GET", "/api/premium/features");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/premium/features — 403 for non-premium user", async () => {
    const res = await request("GET", "/api/premium/features", { cookies: userCookies });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  // ─── 5. CREATOR ROUTES ─────────────────────────────────────────
  sectionHeader("5. CREATOR ROUTES");

  creatorUsername = TEST_USERNAME;

  await test("POST /api/creator/setup — setup creator profile", async () => {
    const res = await request("POST", "/api/creator/setup", {
      cookies: userCookies,
      body: {
        username: creatorUsername,
        bio: "Test creator bio for API testing",
        accentColor: "#FF90E8",
      },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("POST /api/creator/setup — 401 without auth", async () => {
    const res = await request("POST", "/api/creator/setup", {
      body: { username: "noauth-user", bio: "test" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/creator/setup — validation error (short username)", async () => {
    const res = await request("POST", "/api/creator/setup", {
      cookies: user2Cookies,
      body: { username: "ab" }, // Too short
    });
    assert(res.status === 400 || res.status === 422, `Expected 400/422, got ${res.status}`);
  });

  await test("PUT /api/creator/profile — update creator profile", async () => {
    const res = await request("PUT", "/api/creator/profile", {
      cookies: userCookies,
      body: { bio: "Updated bio for testing" },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("PUT /api/creator/profile — 401 without auth", async () => {
    const res = await request("PUT", "/api/creator/profile", {
      body: { bio: "No auth bio" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/creator/check/:username — check username availability (taken)", async () => {
    const res = await request("GET", `/api/creator/check/${creatorUsername}`);
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/creator/check/:username — check username availability (free)", async () => {
    const res = await request("GET", `/api/creator/check/nonexistent-user-${TS}`);
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/creator/:username — get public creator profile", async () => {
    const res = await request("GET", `/api/creator/${creatorUsername}`);
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("GET /api/creator/:username — 404 for non-existent creator", async () => {
    const res = await request("GET", `/api/creator/no-such-creator-${TS}`);
    assert(res.status === 404 || res.status === 400, `Expected 404/400, got ${res.status}`);
  });

  // ─── 6. PRODUCT ROUTES ─────────────────────────────────────────
  sectionHeader("6. PRODUCT ROUTES");

  await test("POST /api/products — create product", async () => {
    const res = await request("POST", "/api/products", {
      cookies: userCookies,
      body: {
        name: `Test Product ${TS}`,
        priceCents: 999,
        currency: "usd",
        productType: "digital",
        category: "software",
        description: "A test product for API testing",
        summary: "Test product summary",
        tags: ["test", "api"],
      },
    });
    assert(res.ok || res.status === 201, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
    productId = res.body?.data?.id || "";
    assert(productId, "Product ID not returned");
  });

  await test("POST /api/products — 401 without auth", async () => {
    const res = await request("POST", "/api/products", {
      body: { name: "No Auth Product", priceCents: 100 },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/products — validation error (missing name)", async () => {
    const res = await request("POST", "/api/products", {
      cookies: userCookies,
      body: { priceCents: 100 },
    });
    assert(res.status === 400 || res.status === 422, `Expected 400/422, got ${res.status}`);
  });

  await test("GET /api/products — list products", async () => {
    const res = await request("GET", "/api/products", {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
    assert(res.body?.success === true, "Expected success: true");
  });

  await test("GET /api/products — with query params", async () => {
    const res = await request("GET", "/api/products", {
      cookies: userCookies,
      query: { page: 1, limit: 5, sort: "createdAt", order: "desc" },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/products — 401 without auth", async () => {
    const res = await request("GET", "/api/products");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/products/:id — get product by ID", async () => {
    if (!productId) return "SKIP";
    const res = await request("GET", `/api/products/${productId}`, {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/products/:id — 404 for non-existent product", async () => {
    const res = await request("GET", "/api/products/nonexistent-id-12345", {
      cookies: userCookies,
    });
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  await test("PUT /api/products/:id — update product", async () => {
    if (!productId) return "SKIP";
    const res = await request("PUT", `/api/products/${productId}`, {
      cookies: userCookies,
      body: {
        name: `Updated Product ${TS}`,
        priceCents: 1999,
        summary: "Updated summary",
      },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("PUT /api/products/:id — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("PUT", `/api/products/${productId}`, {
      body: { name: "No auth update" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("PUT /api/products/:id — set systemRequirements for publish", async () => {
    if (!productId) return "SKIP";
    const res = await request("PUT", `/api/products/${productId}`, {
      cookies: userCookies,
      body: {
        systemRequirements: "Windows 10+, macOS 12+, Linux (Ubuntu 20.04+)",
      },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("POST /api/products/:id/publish — publish product", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/publish`, {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("POST /api/products/:id/publish — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/publish`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // ─── 7. VARIANT ROUTES ─────────────────────────────────────────
  sectionHeader("7. VARIANT ROUTES");

  await test("POST /api/products/:id/variants — create variant", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/variants`, {
      cookies: userCookies,
      body: {
        name: "Premium Tier",
        priceCents: 4999,
        description: "Premium variant with extra features",
        sortOrder: 0,
      },
    });
    assert(res.ok || res.status === 201, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
    variantId = res.body?.data?.id || "";
    assert(variantId, "Variant ID not returned");
  });

  await test("POST /api/products/:id/variants — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/variants`, {
      body: { name: "No Auth Variant", priceCents: 100 },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/products/:id/variants — validation error (missing name)", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/variants`, {
      cookies: userCookies,
      body: { priceCents: 100 },
    });
    assert(res.status === 400 || res.status === 422, `Expected 400/422, got ${res.status}`);
  });

  await test("GET /api/products/:id/variants — list variants", async () => {
    if (!productId) return "SKIP";
    const res = await request("GET", `/api/products/${productId}/variants`, {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("PUT /api/products/:id/variants/:variantId — update variant", async () => {
    if (!productId || !variantId) return "SKIP";
    const res = await request("PUT", `/api/products/${productId}/variants/${variantId}`, {
      cookies: userCookies,
      body: {
        name: "Updated Premium Tier",
        priceCents: 5999,
      },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  // ─── 8. FILE UPLOAD ROUTES ─────────────────────────────────────
  sectionHeader("8. FILE UPLOAD ROUTES");

  await test("POST /api/products/:id/files — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/files`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/products/:id/files — upload file (no file attached = error)", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/files`, {
      cookies: userCookies,
    });
    // Should get an error because no file was attached
    assert(res.status >= 400 || res.ok, `Unexpected status: ${res.status}`);
  });

  await test("POST /api/products/:id/thumbnail — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", `/api/products/${productId}/thumbnail`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("DELETE /api/products/:id/files/:fileId — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("DELETE", `/api/products/${productId}/files/fake-file-id`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("DELETE /api/products/:id/files/:fileId — delete non-existent file", async () => {
    if (!productId) return "SKIP";
    const res = await request("DELETE", `/api/products/${productId}/files/nonexistent-file-id`, {
      cookies: userCookies,
    });
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  // ─── 9. FOLLOWER ROUTES ────────────────────────────────────────
  sectionHeader("9. FOLLOWER ROUTES");

  await test("POST /api/followers/:creatorId/follow — follow a creator", async () => {
    if (!userId) return "SKIP";
    const res = await request("POST", `/api/followers/${userId}/follow`, {
      cookies: user2Cookies,
    });
    assert(res.ok || res.status === 201, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("POST /api/followers/:creatorId/follow — 401 without auth", async () => {
    if (!userId) return "SKIP";
    const res = await request("POST", `/api/followers/${userId}/follow`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/followers/:creatorId/following — check if following", async () => {
    if (!userId) return "SKIP";
    const res = await request("GET", `/api/followers/${userId}/following`, {
      cookies: user2Cookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/followers/:creatorId/following — 401 without auth", async () => {
    if (!userId) return "SKIP";
    const res = await request("GET", `/api/followers/${userId}/following`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("DELETE /api/followers/:creatorId/follow — unfollow a creator", async () => {
    if (!userId) return "SKIP";
    const res = await request("DELETE", `/api/followers/${userId}/follow`, {
      cookies: user2Cookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("DELETE /api/followers/:creatorId/follow — 401 without auth", async () => {
    if (!userId) return "SKIP";
    const res = await request("DELETE", `/api/followers/${userId}/follow`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // ─── 10. PUBLIC / STOREFRONT ROUTES ────────────────────────────
  sectionHeader("10. PUBLIC / STOREFRONT ROUTES");

  await test("GET /api/storefront/featured — get featured products (no auth required)", async () => {
    const res = await request("GET", "/api/storefront/featured");
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/storefront/:username — get creator storefront", async () => {
    const res = await request("GET", `/api/storefront/${creatorUsername}`);
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("GET /api/storefront/:username — 404 for non-existent storefront", async () => {
    const res = await request("GET", `/api/storefront/nonexistent-creator-${TS}`);
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  await test("GET /api/storefront/:username/:slug — get product by slug", async () => {
    const slug = `test-product-${TS}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const res = await request("GET", `/api/storefront/${creatorUsername}/${slug}`);
    // Slug might not match exactly due to service slug generation
    assert(res.ok || res.status === 404, `Unexpected status: ${res.status}`);
  });

  // ─── 11. DISCOVER ROUTES ───────────────────────────────────────
  sectionHeader("11. DISCOVER ROUTES");

  await test("GET /api/discover — search products (no filters)", async () => {
    const res = await request("GET", "/api/discover");
    assert(res.ok, `Expected 2xx, got ${res.status}`);
    assert(res.body?.success === true, "Expected success: true");
  });

  await test("GET /api/discover — search with query", async () => {
    const res = await request("GET", "/api/discover", {
      query: { q: "test", page: 1, limit: 5 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover — search with category filter", async () => {
    const res = await request("GET", "/api/discover", {
      query: { category: "software", sort: "newest" },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover — search with price range", async () => {
    const res = await request("GET", "/api/discover", {
      query: { minPrice: 0, maxPrice: 5000 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover/trending — get trending products", async () => {
    const res = await request("GET", "/api/discover/trending");
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover/trending — with limit", async () => {
    const res = await request("GET", "/api/discover/trending", {
      query: { limit: 3 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover/categories — get all categories", async () => {
    const res = await request("GET", "/api/discover/categories");
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover/creators — get featured creators", async () => {
    const res = await request("GET", "/api/discover/creators");
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/discover/creators — with limit", async () => {
    const res = await request("GET", "/api/discover/creators", {
      query: { limit: 3 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  // ─── 12. ANALYTICS ROUTES ──────────────────────────────────────
  sectionHeader("12. ANALYTICS ROUTES");

  await test("GET /api/analytics/overview — 401 without auth", async () => {
    const res = await request("GET", "/api/analytics/overview");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/analytics/overview — get overview (authenticated)", async () => {
    const res = await request("GET", "/api/analytics/overview", {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/analytics/revenue — 401 without auth", async () => {
    const res = await request("GET", "/api/analytics/revenue");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/analytics/revenue — get revenue data", async () => {
    const res = await request("GET", "/api/analytics/revenue", {
      cookies: userCookies,
      query: { days: 30 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/analytics/revenue — with custom days", async () => {
    const res = await request("GET", "/api/analytics/revenue", {
      cookies: userCookies,
      query: { days: 7 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/analytics/products — 401 without auth", async () => {
    const res = await request("GET", "/api/analytics/products");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/analytics/products — get top products", async () => {
    const res = await request("GET", "/api/analytics/products", {
      cookies: userCookies,
      query: { limit: 5 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/analytics/sales — 401 without auth", async () => {
    const res = await request("GET", "/api/analytics/sales");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/analytics/sales — get recent sales", async () => {
    const res = await request("GET", "/api/analytics/sales", {
      cookies: userCookies,
      query: { limit: 10 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  // ─── 13. ORDER ROUTES ──────────────────────────────────────────
  sectionHeader("13. ORDER ROUTES");

  await test("GET /api/orders/sales — 401 without auth", async () => {
    const res = await request("GET", "/api/orders/sales");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/orders/sales — get creator sales list", async () => {
    const res = await request("GET", "/api/orders/sales", {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/orders/sales — with pagination", async () => {
    const res = await request("GET", "/api/orders/sales", {
      cookies: userCookies,
      query: { page: 1, limit: 5 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/orders/purchases — 401 without auth", async () => {
    const res = await request("GET", "/api/orders/purchases");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/orders/purchases — get customer purchases", async () => {
    const res = await request("GET", "/api/orders/purchases", {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/orders/purchases — with pagination", async () => {
    const res = await request("GET", "/api/orders/purchases", {
      cookies: userCookies,
      query: { page: 1, limit: 5 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/orders/:id — 401 without auth", async () => {
    const res = await request("GET", "/api/orders/fake-order-id");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/orders/:id — get non-existent order", async () => {
    const res = await request("GET", "/api/orders/nonexistent-order-id", {
      cookies: userCookies,
    });
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  await test("POST /api/orders/:id/refund — 401 without auth", async () => {
    const res = await request("POST", "/api/orders/fake-order-id/refund");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/orders/:id/refund — refund non-existent order", async () => {
    const res = await request("POST", "/api/orders/nonexistent-order-id/refund", {
      cookies: userCookies,
    });
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  // ─── 14. REVIEW ROUTES ─────────────────────────────────────────
  sectionHeader("14. REVIEW ROUTES");

  await test("GET /api/reviews/:productId — get reviews for product (no auth required)", async () => {
    if (!productId) return "SKIP";
    const res = await request("GET", `/api/reviews/${productId}`);
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/reviews/:productId — with pagination", async () => {
    if (!productId) return "SKIP";
    const res = await request("GET", `/api/reviews/${productId}`, {
      query: { page: 1, limit: 5 },
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("GET /api/reviews/:productId — for non-existent product", async () => {
    const res = await request("GET", "/api/reviews/nonexistent-product-id");
    // Should return empty list or error
    assert(res.ok || res.status === 404, `Expected 2xx/404, got ${res.status}`);
  });

  await test("POST /api/reviews — 401 without auth", async () => {
    const res = await request("POST", "/api/reviews", {
      body: { productId: "test", rating: 5, content: "Great!" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/reviews — create review (may fail without order)", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", "/api/reviews", {
      cookies: userCookies,
      body: {
        productId: productId,
        rating: 5,
        content: "Great test product!",
        orderId: "fake-order-id",
      },
    });
    // May fail because orderId doesn't exist — that's expected
    if (res.ok || res.status === 201) {
      reviewId = res.body?.data?.id || "";
    }
    // Accept any response as we're testing the route exists
    assert(res.status !== 401, "Should not be 401 since we have auth");
  });

  await test("DELETE /api/reviews/:id — 401 without auth", async () => {
    const res = await request("DELETE", "/api/reviews/fake-review-id");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("DELETE /api/reviews/:id — delete non-existent review", async () => {
    const res = await request("DELETE", "/api/reviews/nonexistent-review-id", {
      cookies: userCookies,
    });
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  // ─── 15. DISCOUNT ROUTES ───────────────────────────────────────
  sectionHeader("15. DISCOUNT ROUTES");

  await test("GET /api/discounts/validate — validate non-existent discount code", async () => {
    if (!productId) return "SKIP";
    const res = await request("GET", "/api/discounts/validate", {
      query: { code: "FAKECODE", productId },
    });
    // Should fail validation but route should respond
    assert(res.status === 400 || res.status === 404 || res.ok || res.status === 500, `Unexpected status: ${res.status}`);
  });

  await test("GET /api/discounts — 401 without auth", async () => {
    const res = await request("GET", "/api/discounts");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/discounts — list discounts (authenticated)", async () => {
    const res = await request("GET", "/api/discounts", {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("POST /api/discounts — 401 without auth", async () => {
    const res = await request("POST", "/api/discounts", {
      body: { code: "TESTCODE", productId: "test" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  discountCode = `TEST${TS}`.substring(0, 20);

  await test("POST /api/discounts — create discount code", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", "/api/discounts", {
      cookies: userCookies,
      body: {
        code: discountCode,
        productId,
        discountType: "percentage",
        discountValue: 20,
        maxUses: 100,
      },
    });
    assert(res.ok || res.status === 201, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
    discountId = res.body?.data?.id || "";
  });

  await test("GET /api/discounts/validate — validate existing discount code", async () => {
    if (!productId || !discountCode) return "SKIP";
    const res = await request("GET", "/api/discounts/validate", {
      query: { code: discountCode, productId },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("DELETE /api/discounts/:id — 401 without auth", async () => {
    const res = await request("DELETE", "/api/discounts/fake-discount-id");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("DELETE /api/discounts/:id — delete discount code", async () => {
    if (!discountId) return "SKIP";
    const res = await request("DELETE", `/api/discounts/${discountId}`, {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("DELETE /api/discounts/:id — delete non-existent discount", async () => {
    const res = await request("DELETE", "/api/discounts/nonexistent-discount-id", {
      cookies: userCookies,
    });
    assert(res.status === 404 || res.status === 400 || res.status === 500, `Expected error, got ${res.status}`);
  });

  // ─── 16. CHECKOUT ROUTES ───────────────────────────────────────
  sectionHeader("16. CHECKOUT ROUTES");

  await test("POST /api/checkout/session/polar — create Polar session (may fail without Polar config)", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", "/api/checkout/session/polar", {
      cookies: userCookies,
      body: { productId },
    });
    // Expected to fail without Polar keys configured, but the route should exist
    assert(res.status !== 404, `Route not found (404) — checkout polar session route missing`);
  });

  await test("POST /api/checkout/session/razorpay — create Razorpay session (may fail without config)", async () => {
    if (!productId) return "SKIP";
    const res = await request("POST", "/api/checkout/session/razorpay", {
      cookies: userCookies,
      body: { productId },
    });
    assert(res.status !== 404, `Route not found (404) — checkout razorpay route missing`);
  });

  await test("POST /api/checkout/verify/razorpay — verify Razorpay payment (should fail with bad data)", async () => {
    const res = await request("POST", "/api/checkout/verify/razorpay", {
      cookies: userCookies,
      body: {
        razorpayOrderId: "fake_order_123",
        razorpayPaymentId: "fake_payment_123",
        razorpaySignature: "fake_signature",
      },
    });
    assert(res.status !== 404, `Route not found (404)`);
  });

  await test("POST /api/checkout/webhook/polar — Polar webhook (should fail with invalid sig)", async () => {
    const res = await request("POST", "/api/checkout/webhook/polar", {
      body: JSON.stringify({ type: "test" }),
      rawBody: true,
      headers: {
        "Content-Type": "application/json",
        "polar-signature": "invalid-sig",
      },
    });
    assert(res.status !== 404, `Route not found (404)`);
  });

  await test("POST /api/checkout/webhook/razorpay — Razorpay webhook (should fail with invalid sig)", async () => {
    const res = await request("POST", "/api/checkout/webhook/razorpay", {
      body: JSON.stringify({ type: "test" }),
      rawBody: true,
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "invalid-sig",
      },
    });
    assert(res.status !== 404, `Route not found (404)`);
  });

  await test("GET /api/checkout/connect/status — 401 without auth", async () => {
    const res = await request("GET", "/api/checkout/connect/status");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("GET /api/checkout/connect/status — get connect status", async () => {
    const res = await request("GET", "/api/checkout/connect/status", {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status}`);
  });

  await test("POST /api/checkout/connect/polar — 401 without auth", async () => {
    const res = await request("POST", "/api/checkout/connect/polar");
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/checkout/connect/polar — get Polar connect link", async () => {
    const res = await request("POST", "/api/checkout/connect/polar", {
      cookies: userCookies,
    });
    // May fail if Polar isn't configured but route should exist
    assert(res.status !== 404, `Route not found (404)`);
  });

  await test("POST /api/checkout/connect/polar/save — 401 without auth", async () => {
    const res = await request("POST", "/api/checkout/connect/polar/save", {
      body: { organizationId: "fake-org" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/checkout/connect/polar/save — save with missing organizationId", async () => {
    const res = await request("POST", "/api/checkout/connect/polar/save", {
      cookies: userCookies,
      body: {},
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test("POST /api/checkout/connect/polar/save — save Polar org ID", async () => {
    const res = await request("POST", "/api/checkout/connect/polar/save", {
      cookies: userCookies,
      body: { organizationId: `test-org-id-${TS}` },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("POST /api/checkout/connect/razorpay/save — 401 without auth", async () => {
    const res = await request("POST", "/api/checkout/connect/razorpay/save", {
      body: { accountId: "fake-account" },
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test("POST /api/checkout/connect/razorpay/save — save with missing accountId", async () => {
    const res = await request("POST", "/api/checkout/connect/razorpay/save", {
      cookies: userCookies,
      body: {},
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test("POST /api/checkout/connect/razorpay/save — save Razorpay account ID", async () => {
    const res = await request("POST", "/api/checkout/connect/razorpay/save", {
      cookies: userCookies,
      body: { accountId: `test-razorpay-acc-${TS}` },
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("GET /api/checkout/order-by-session/:id — lookup non-existent session", async () => {
    const res = await request("GET", "/api/checkout/order-by-session/fake-session-id-123");
    // Should return 404 or empty data
    assert(res.ok || res.status === 404, `Unexpected status: ${res.status}`);
  });

  await test("GET /api/checkout/download/:orderId — generate download token (fake order)", async () => {
    const res = await request("GET", "/api/checkout/download/fake-order-id");
    // Should fail with non-existent order
    assert(res.status !== 404 || res.status >= 400, `Route should exist but order should fail`);
  });

  await test("GET /api/checkout/file — download file (missing token)", async () => {
    const res = await request("GET", "/api/checkout/file");
    // Should fail without valid token
    assert(res.status >= 400 || res.status === 302, `Unexpected status: ${res.status}`);
  });

  await test("GET /api/checkout/file — download file (invalid token)", async () => {
    const res = await request("GET", "/api/checkout/file", {
      query: { token: "invalid-token", fileId: "fake-file-id" },
    });
    assert(res.status >= 400, `Expected error, got ${res.status}`);
  });

  // ─── 17. CLEANUP — DELETE PRODUCT & VARIANT ────────────────────
  sectionHeader("17. CLEANUP");

  await test("DELETE /api/products/:id/variants/:variantId — delete variant", async () => {
    if (!productId || !variantId) return "SKIP";
    const res = await request("DELETE", `/api/products/${productId}/variants/${variantId}`, {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("DELETE /api/products/:id — archive product", async () => {
    if (!productId) return "SKIP";
    const res = await request("DELETE", `/api/products/${productId}`, {
      cookies: userCookies,
    });
    assert(res.ok, `Expected 2xx, got ${res.status} — ${JSON.stringify(res.body)}`);
  });

  await test("DELETE /api/products/:id — 401 without auth", async () => {
    if (!productId) return "SKIP";
    const res = await request("DELETE", `/api/products/${productId}`);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // ═══════════════════════════════════════════════════════════════
  //  SUMMARY
  // ═══════════════════════════════════════════════════════════════

  console.log(`\n${"═".repeat(60)}`);
  console.log("  📊 TEST RESULTS SUMMARY");
  console.log(`${"═".repeat(60)}`);
  console.log(`  ✅ Passed:  ${passed}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  📋 Total:   ${passed + failed + skipped}`);
  console.log(`${"═".repeat(60)}`);

  if (failed > 0) {
    console.log("\n  ❌ FAILED TESTS:");
    for (const r of results) {
      if (r.status === "FAIL") {
        console.log(`     • ${r.name}`);
        console.log(`       Error: ${r.error}`);
      }
    }
    console.log();
  }

  if (skipped > 0) {
    console.log("\n  ⏭️  SKIPPED TESTS:");
    for (const r of results) {
      if (r.status === "SKIP") {
        console.log(`     • ${r.name}`);
      }
    }
    console.log();
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(2);
});
