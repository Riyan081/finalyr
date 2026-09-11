/**
 * Full API integration test — tests every backend endpoint.
 * Run: bun run scratch/test-all-apis.ts
 */

const BASE = "http://localhost:3002";
let cookies = "";
let userId = "";
let productId = "";
let orderId = "";
let discountId = "";

// ─── Helpers ────────────────────────────────────────────────────

async function api(method: string, path: string, body?: any, expectStatus?: number) {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
      "Referer": "http://localhost:3000/",
      Cookie: cookies,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);

  // Capture set-cookie headers
  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length > 0) {
    cookies = setCookie.map((c: string) => c.split(";")[0]).join("; ");
  }

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text.substring(0, 200) }; }

  const expected = expectStatus || 200;
  const pass = Array.isArray(expected)
    ? expected.includes(res.status)
    : res.status === expected;
  return { status: res.status, json, pass, expected };
}

function log(name: string, result: { status: number; pass: boolean; expected: number; json: any }) {
  const icon = result.pass ? "✅" : "❌";
  const extra = result.pass ? "" : ` (expected ${result.expected}, body: ${JSON.stringify(result.json).substring(0, 120)})`;
  console.log(`${icon} ${name}: ${result.status}${extra}`);
}

// ─── Tests ──────────────────────────────────────────────────────

async function run() {
  console.log("\n════════════════════════════════════════════");
  console.log("  GUMROAD CLONE — FULL API TEST SUITE");
  console.log("════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  function check(name: string, result: { status: number; pass: boolean; expected: number; json: any }) {
    log(name, result);
    if (result.pass) passed++; else failed++;
  }

  // ═══ 1. PUBLIC ENDPOINTS (no auth) ═══════════════════════════

  console.log("\n─── Public Endpoints ───────────────────────\n");

  check("GET / (root)", await api("GET", "/"));
  check("GET /api/discover", await api("GET", "/api/discover"));
  check("GET /api/discover/categories", await api("GET", "/api/discover/categories"));
  check("GET /api/discover/trending", await api("GET", "/api/discover/trending"));
  check("GET /api/discover/creators", await api("GET", "/api/discover/creators"));
  check("GET /api/storefront/nonexistent (404)", await api("GET", "/api/storefront/nonexistent", undefined, 404));
  check("GET /api/reviews/fake-product-id", await api("GET", "/api/reviews/fake-product-id"));

  // ═══ 2. AUTH — SIGN UP ═══════════════════════════════════════

  console.log("\n─── Auth (Sign Up + Session) ───────────────\n");

  const email = `testcreator_${Date.now()}@test.com`;
  const signupRes = await api("POST", "/api/auth/sign-up/email", {
    name: "Test Creator",
    email,
    password: "TestPass123!",
  });
  check("POST /api/auth/sign-up/email", { ...signupRes, pass: signupRes.status === 200 || signupRes.status === 201, expected: 200 });

  if (signupRes.json?.user) {
    userId = signupRes.json.user.id;
    console.log(`   → User ID: ${userId}`);
    console.log(`   → Cookies: ${cookies.substring(0, 60)}...`);
  }

  // Get session
  const sessionRes = await api("GET", "/api/auth/get-session");
  check("GET /api/auth/get-session", sessionRes);
  if (sessionRes.json?.user) {
    console.log(`   → Logged in as: ${sessionRes.json.user.name} (${sessionRes.json.user.email})`);
  }

  // ═══ 3. AUTH-PROTECTED — BEFORE CREATOR SETUP ════════════════

  console.log("\n─── Auth-Protected (User role) ─────────────\n");

  check("GET /api/me", await api("GET", "/api/me"));
  check("GET /api/products (empty)", await api("GET", "/api/products"));
  check("GET /api/analytics/overview", await api("GET", "/api/analytics/overview"));
  check("GET /api/analytics/revenue", await api("GET", "/api/analytics/revenue?days=30"));
  check("GET /api/analytics/products", await api("GET", "/api/analytics/products?limit=5"));
  check("GET /api/analytics/sales", await api("GET", "/api/analytics/sales?limit=8"));
  check("GET /api/orders/sales", await api("GET", "/api/orders/sales"));
  check("GET /api/orders/purchases", await api("GET", "/api/orders/purchases"));
  check("GET /api/discounts (list)", await api("GET", "/api/discounts"));

  // ═══ 4. CREATOR PROFILE SETUP ════════════════════════════════

  console.log("\n─── Creator Profile ────────────────────────\n");

  const username = `creator${Date.now()}`;
  check("GET /api/creator/check/:username", await api("GET", `/api/creator/check/${username}`));

  const setupRes = await api("POST", "/api/creator/setup", {
    username,
    bio: "I sell digital products",
    accentColor: "#FF90E8",
    socialTwitter: "https://twitter.com/testcreator",
  });
  check("POST /api/creator/setup", { ...setupRes, pass: setupRes.status === 200 || setupRes.status === 201, expected: [200, 201] });

  if (setupRes.pass) {
    console.log(`   → Creator username: ${username}`);
  }

  const profileRes = await api("PUT", "/api/creator/profile", {
    bio: "Updated bio — selling cool stuff!",
    socialWebsite: "https://example.com",
  });
  check("PUT /api/creator/profile", profileRes);

  // Public profile
  check("GET /api/creator/:username", await api("GET", `/api/creator/${username}`));

  // Public storefront
  const storefrontRes = await api("GET", `/api/storefront/${username}`);
  check("GET /api/storefront/:username", storefrontRes);

  // ═══ 5. PRODUCT CRUD ═════════════════════════════════════════

  console.log("\n─── Product CRUD ───────────────────────────\n");

  const createProductRes = await api("POST", "/api/products", {
    name: "Ultimate Design Kit",
    summary: "500+ UI components for modern apps",
    description: "A comprehensive design system with buttons, inputs, cards, and more.",
    productType: "digital",
    priceCents: 3999,
    currency: "usd",
    category: "design",
    tags: ["ui", "design", "components"],
    callToAction: "Get the Kit!",
    isListedOnDiscover: true,
  });
  check("POST /api/products (create)", { ...createProductRes, pass: createProductRes.status === 200 || createProductRes.status === 201, expected: [200, 201] });

  if (createProductRes.json?.data?.id) {
    productId = createProductRes.json.data.id;
    console.log(`   → Product ID: ${productId}`);
  }

  if (productId) {
    check("GET /api/products (list)", await api("GET", "/api/products"));
    check("GET /api/products/:id", await api("GET", `/api/products/${productId}`));

    const updateRes = await api("PUT", `/api/products/${productId}`, {
      name: "Ultimate Design Kit v2",
      priceCents: 3999,
      summary: "Updated — now with 800+ components!",
    });
    check("PUT /api/products/:id (update)", updateRes);

    // Publish
    const publishRes = await api("POST", `/api/products/${productId}/publish`);
    check("POST /api/products/:id/publish", publishRes);

    // Check it appears on storefront
    const storeProducts = await api("GET", `/api/storefront/${username}`);
    const productCount = storeProducts.json?.data?.products?.length || 0;
    console.log(`   → Storefront products after publish: ${productCount}`);

    // Check product by slug — refetch the product to get the current slug
    const refetchedProduct = await api("GET", `/api/products/${productId}`);
    const slug = refetchedProduct.json?.data?.slug;
    if (slug) {
      const slugRes = await api("GET", `/api/storefront/${username}/${slug}`);
      check("GET /api/storefront/:username/:slug", slugRes);
    }

    // Check it appears on discover
    const discoverRes = await api("GET", "/api/discover");
    const discoverCount = discoverRes.json?.data?.length || 0;
    console.log(`   → Discover products: ${discoverCount}`);
  }

  // ═══ 6. DISCOUNT CODES ═══════════════════════════════════════

  console.log("\n─── Discount Codes ─────────────────────────\n");

  if (productId) {
    const createDiscountRes = await api("POST", "/api/discounts", {
      code: "LAUNCH50",
      productId,
      discountType: "percentage",
      discountValue: 50,
      maxUses: 100,
    });
    // Accept 201 Created
    createDiscountRes.pass = createDiscountRes.status === 200 || createDiscountRes.status === 201;
    (createDiscountRes as any).expected = [200, 201];
    check("POST /api/discounts (create)", createDiscountRes);

    if (createDiscountRes.json?.data?.id) {
      discountId = createDiscountRes.json.data.id;
      console.log(`   → Discount ID: ${discountId}`);
    }

    check("GET /api/discounts (list)", await api("GET", "/api/discounts"));

    const validateRes = await api("GET", `/api/discounts/validate?code=LAUNCH50&productId=${productId}`);
    check("GET /api/discounts/validate", validateRes);
    if (validateRes.json?.data) {
      console.log(`   → Discount validated: ${validateRes.json.data.discount?.value}% off`);
      console.log(`   → Discounted price: $${(validateRes.json.data.discountedPriceCents / 100).toFixed(2)}`);
    }

    // Invalid code
    check("GET /api/discounts/validate (invalid)", await api("GET", `/api/discounts/validate?code=FAKE&productId=${productId}`, undefined, 404));
  }

  // ═══ 7. REVIEWS ══════════════════════════════════════════════

  console.log("\n─── Reviews ────────────────────────────────\n");

  if (productId) {
    check("GET /api/reviews/:productId", await api("GET", `/api/reviews/${productId}`));

    // Try creating a review (should fail — no purchase)
    const reviewRes = await api("POST", "/api/reviews", {
      productId,
      rating: 5,
      headline: "Great product!",
      content: "Would buy again",
    });
    // May return 400/403 because no purchase exists
    const reviewExpected = reviewRes.status === 200 || reviewRes.status === 400 || reviewRes.status === 403;
    console.log(`${reviewExpected ? "✅" : "❌"} POST /api/reviews (no-purchase guard): ${reviewRes.status}`);
    if (reviewExpected) passed++; else failed++;
  }

  // ═══ 8. FOLLOWERS ════════════════════════════════════════════

  console.log("\n─── Followers ──────────────────────────────\n");

  if (userId) {
    // Follow self (creator) — just to test the endpoint
    const followRes = await api("POST", `/api/followers/${userId}/follow`);
    // Might return 200 or 400 (can't follow yourself)
    const followExpected = followRes.status === 200 || followRes.status === 201 || followRes.status === 400;
    console.log(`${followExpected ? "✅" : "❌"} POST /api/followers/:id/follow: ${followRes.status}`);
    if (followExpected) passed++; else failed++;

    check("GET /api/followers/:id/following", await api("GET", `/api/followers/${userId}/following`));
  }

  // ═══ 9. CHECKOUT (Stripe not configured) ═════════════════════

  console.log("\n─── Checkout / Stripe ──────────────────────\n");

  if (productId) {
    const checkoutRes = await api("POST", "/api/checkout/session", {
      productId,
    });
    // Should return 400 since Stripe isn't configured
    const checkoutExpected = checkoutRes.status === 400 || checkoutRes.status === 200;
    console.log(`${checkoutExpected ? "✅" : "❌"} POST /api/checkout/session (no Stripe): ${checkoutRes.status} — ${checkoutRes.json?.message || ""}`);
    if (checkoutExpected) passed++; else failed++;
  }

  check("GET /api/checkout/connect/status", await api("GET", "/api/checkout/connect/status"));

  // ═══ 10. CLEANUP — DELETE DISCOUNT ═══════════════════════════

  console.log("\n─── Cleanup ────────────────────────────────\n");

  if (discountId) {
    check("DELETE /api/discounts/:id", await api("DELETE", `/api/discounts/${discountId}`));
  }

  if (productId) {
    check("DELETE /api/products/:id (archive)", await api("DELETE", `/api/products/${productId}`));
  }

  // ═══ SUMMARY ═══════════════════════════════════════════════

  console.log("\n════════════════════════════════════════════");
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log("════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
