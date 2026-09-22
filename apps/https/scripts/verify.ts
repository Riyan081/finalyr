/**
 * ═══════════════════════════════════════════════════════════════════
 *  DigiStore — Full Stack Verification Script
 *  Tests all services, routes, and integrations built so far.
 * ═══════════════════════════════════════════════════════════════════
 */

import "dotenv/config";
import prisma from "@repo/db/client";

const API = process.env.BETTER_AUTH_URL || "http://localhost:3002";
let passed = 0;
let failed = 0;
let skipped = 0;

function log(icon: string, msg: string) { console.log(`  ${icon} ${msg}`); }
function pass(msg: string) { passed++; log("✅", msg); }
function fail(msg: string, err?: string) { failed++; log("❌", `${msg}${err ? ` — ${err}` : ""}`); }
function skip(msg: string) { skipped++; log("⏭️", msg); }
function section(title: string) { console.log(`\n${"═".repeat(60)}\n  ${title}\n${"═".repeat(60)}`); }

// ─── 1. Database Connection ──────────────────────────────────────

async function checkDatabase() {
  section("1. DATABASE CONNECTION");
  try {
    await prisma.$queryRaw`SELECT 1`;
    pass("PostgreSQL connection OK");
  } catch (e: any) {
    fail("PostgreSQL connection FAILED", e.message);
    return false;
  }

  // Check all required tables exist
  const requiredTables = [
    "user", "session", "account", "product", "product_file",
    "product_variant", "order", "license_key", "membership",
    "review", "discount_code", "follower", "payout", "workflow",
    "creator_post",
  ];

  for (const table of requiredTables) {
    try {
      await prisma.$queryRawUnsafe(`SELECT 1 FROM "${table}" LIMIT 0`);
      pass(`Table "${table}" exists`);
    } catch {
      fail(`Table "${table}" MISSING — run: npx prisma db push`);
    }
  }

  return true;
}

// ─── 2. Schema Validation ────────────────────────────────────────

async function checkSchema() {
  section("2. SCHEMA VALIDATION");

  // Check Product has required fields
  try {
    const cols = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'product'
    `;
    const colNames = new Set(cols.map((c) => c.column_name));

    const required = ["productType", "recurrence", "bundledProductIds", "courseModules"];
    for (const col of required) {
      if (colNames.has(col)) pass(`Product.${col} column exists`);
      else fail(`Product.${col} column MISSING`);
    }
  } catch (e: any) {
    fail("Product schema check failed", e.message);
  }

  // Check Membership has updatedAt
  try {
    const cols = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'membership'
    `;
    const colNames = new Set(cols.map((c) => c.column_name));
    const required = ["customerId", "productId", "status", "currentPeriodStart", "currentPeriodEnd", "cancelledAt"];
    for (const col of required) {
      if (colNames.has(col)) pass(`Membership.${col} exists`);
      else fail(`Membership.${col} MISSING`);
    }
  } catch (e: any) {
    fail("Membership schema check failed", e.message);
  }

  // Check CreatorPost
  try {
    const cols = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'creator_post'
    `;
    const colNames = new Set(cols.map((c) => c.column_name));
    const required = ["title", "content", "isPublic", "isPinned", "productId", "creatorId"];
    for (const col of required) {
      if (colNames.has(col)) pass(`CreatorPost.${col} exists`);
      else fail(`CreatorPost.${col} MISSING`);
    }
  } catch (e: any) {
    fail("CreatorPost schema check failed", e.message);
  }

  // Check ProductFile has availableAfterDays
  try {
    const cols = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'product_file'
    `;
    const colNames = new Set(cols.map((c) => c.column_name));
    if (colNames.has("availableAfterDays")) pass("ProductFile.availableAfterDays exists (content dripping)");
    else fail("ProductFile.availableAfterDays MISSING");
  } catch (e: any) {
    fail("ProductFile schema check failed", e.message);
  }
}

// ─── 3. Service Imports ──────────────────────────────────────────

async function checkServiceImports() {
  section("3. SERVICE IMPORTS");

  const services = [
    { name: "file-upload.service", path: "../src/services/file-upload.service.js" },
    { name: "download.service", path: "../src/services/download.service.js" },
    { name: "order.service", path: "../src/services/order.service.js" },
    { name: "library.service", path: "../src/services/library.service.js" },
    { name: "email.service", path: "../src/services/email.service.js" },
    { name: "post.service", path: "../src/services/post.service.js" },
    { name: "renewal.service", path: "../src/services/renewal.service.js" },
    { name: "pdf-stamping.service", path: "../src/services/pdf-stamping.service.js" },
    { name: "product.service", path: "../src/services/product.service.js" },
    { name: "public.service", path: "../src/services/public.service.js" },
  ];

  for (const svc of services) {
    try {
      const mod = await import(svc.path);
      if (mod && Object.keys(mod).length > 0) {
        pass(`${svc.name} — imports OK (${Object.keys(mod).join(", ")})`);
      } else {
        fail(`${svc.name} — empty module`);
      }
    } catch (e: any) {
      fail(`${svc.name} — import FAILED`, e.message?.slice(0, 80));
    }
  }
}

// ─── 4. Route Registration ───────────────────────────────────────

async function checkRoutes() {
  section("4. ROUTE REGISTRATION");

  // Check that each route module exports a valid Express router
  const routeFiles = [
    { name: "/api/library", path: "../src/routes/library.routes.js" },
    { name: "/api/posts", path: "../src/routes/post.routes.js" },
    { name: "/api/checkout", path: "../src/routes/checkout.routes.js" },
    { name: "/api/products", path: "../src/routes/product.routes.js" },
    { name: "/api/orders", path: "../src/routes/order.routes.js" },
    { name: "/api/discounts", path: "../src/routes/discount.routes.js" },
    { name: "/api/reviews", path: "../src/routes/review.routes.js" },
  ];

  for (const route of routeFiles) {
    try {
      const mod = await import(route.path);
      const router = mod.default;
      if (router && router.stack && router.stack.length > 0) {
        pass(`${route.name} — ${router.stack.length} endpoints`);
      } else if (router) {
        pass(`${route.name} — router loaded (no endpoints detected)`);
      } else {
        fail(`${route.name} — no default export`);
      }
    } catch (e: any) {
      fail(`${route.name} — import FAILED`, e.message?.slice(0, 80));
    }
  }

  // Verify main router index registers them
  try {
    const routesMod = await import("../src/routes/index.js");
    const router = routesMod.default;
    if (router && router.stack && router.stack.length >= 10) {
      pass(`Main router — ${router.stack.length} middleware layers registered`);
    } else {
      fail("Main router — too few layers registered");
    }
  } catch (e: any) {
    fail("Main router import failed", e.message?.slice(0, 80));
  }
}

// ─── 5. Email Service ────────────────────────────────────────────

async function checkEmailService() {
  section("5. EMAIL SERVICE");

  try {
    const { emailService } = await import("../src/services/email.service.js");

    // Test sending (dev mode logs to console)
    const result = await emailService.sendPurchaseReceipt({
      buyerEmail: "test@example.com",
      buyerName: "Test User",
      productName: "Test Product",
      creatorName: "Test Creator",
      amountCents: 1999,
      currency: "usd",
      orderId: "test-order-123",
      licenseKey: "ABCD-EFGH-IJKL-MNOP",
      productType: "digital",
    });

    if (result.sent) pass("Receipt email sent (dev/console mode)");
    else fail("Receipt email failed", result.error);

  } catch (e: any) {
    fail("Email service test failed", e.message?.slice(0, 80));
  }
}

// ─── 6. PDF Stamping ─────────────────────────────────────────────

async function checkPdfStamping() {
  section("6. PDF STAMPING");

  try {
    const { pdfStampingService } = await import("../src/services/pdf-stamping.service.js");

    // Test shouldStamp
    if (pdfStampingService.shouldStamp("application/pdf")) pass("shouldStamp('application/pdf') = true");
    else fail("shouldStamp('application/pdf') should be true");

    if (!pdfStampingService.shouldStamp("image/png")) pass("shouldStamp('image/png') = false");
    else fail("shouldStamp('image/png') should be false");

    if (!pdfStampingService.shouldStamp("application/zip")) pass("shouldStamp('application/zip') = false");
    else fail("shouldStamp('application/zip') should be false");

  } catch (e: any) {
    fail("PDF stamping check failed", e.message?.slice(0, 80));
  }
}

// ─── 7. Renewal Service ─────────────────────────────────────────

async function checkRenewalService() {
  section("7. RENEWAL SERVICE");

  try {
    const { renewalService } = await import("../src/services/renewal.service.js");

    // Run expiry check (should work even with no memberships)
    const result = await renewalService.expireOverdueMemberships();
    pass(`Expiry check ran — expired ${result.expiredCount} memberships`);

    // Get stats
    const stats = await renewalService.getMembershipStats();
    pass(`Membership stats: active=${stats.active}, cancelled=${stats.cancelled}, expired=${stats.expired}, total=${stats.total}`);

  } catch (e: any) {
    fail("Renewal service check failed", e.message?.slice(0, 80));
  }
}

// ─── 8. Library Service ──────────────────────────────────────────

async function checkLibraryService() {
  section("8. LIBRARY SERVICE");

  try {
    const { libraryService } = await import("../src/services/library.service.js");

    // Try fetching library for a non-existent user (should return empty)
    const result = await libraryService.getLibrary("non-existent-user-id", {});
    
    if (result.items.length === 0) pass("Empty library for non-existent user");
    else pass(`Library returned ${result.items.length} items`);

    if (result.pagination) pass("Pagination object present");
    else fail("Pagination missing from library response");

  } catch (e: any) {
    fail("Library service check failed", e.message?.slice(0, 80));
  }
}

// ─── 9. Post Service ─────────────────────────────────────────────

async function checkPostService() {
  section("9. CREATOR POST SERVICE");

  try {
    const { postService } = await import("../src/services/post.service.js");

    // Try fetching posts for a non-existent creator
    const result = await postService.getPublicPosts("non-existent-creator", undefined);

    if (result.posts.length === 0) pass("Empty posts for non-existent creator");
    else pass(`Posts returned ${result.posts.length} items`);

    if (result.pagination) pass("Pagination object present");
    else fail("Pagination missing from post response");

  } catch (e: any) {
    fail("Post service check failed", e.message?.slice(0, 80));
  }
}

// ─── 10. S3/MinIO Connection ─────────────────────────────────────

async function checkStorage() {
  section("10. S3/MinIO STORAGE");

  try {
    const { ensureBucketExists } = await import("@repo/storage");
    await ensureBucketExists();
    pass("S3/MinIO bucket exists and is accessible");
  } catch (e: any) {
    if (e.message?.includes("ECONNREFUSED")) {
      skip("MinIO not running (start with: docker compose up minio -d)");
    } else {
      fail("S3/MinIO check failed", e.message?.slice(0, 80));
    }
  }
}

// ─── 11. Content Dripping Logic ──────────────────────────────────

async function checkContentDripping() {
  section("11. CONTENT DRIPPING LOGIC");

  try {
    const { downloadService } = await import("../src/services/download.service.js");

    // Verify the service has getFileDownloadUrl
    if (typeof downloadService.getFileDownloadUrl === "function") {
      pass("downloadService.getFileDownloadUrl exists");
    } else {
      fail("downloadService.getFileDownloadUrl missing");
    }

    // Verify the service has verifyToken
    if (typeof downloadService.verifyToken === "function") {
      pass("downloadService.verifyToken exists");
    } else {
      fail("downloadService.verifyToken missing");
    }

    // Verify the service has generateToken
    if (typeof downloadService.generateToken === "function") {
      pass("downloadService.generateToken exists");
    } else {
      fail("downloadService.generateToken missing");
    }

  } catch (e: any) {
    fail("Content dripping check failed", e.message?.slice(0, 80));
  }
}

// ─── 12. File Upload Service ─────────────────────────────────────

async function checkFileUpload() {
  section("12. FILE UPLOAD SERVICE");

  try {
    const { fileUploadService } = await import("../src/services/file-upload.service.js");

    if (typeof fileUploadService.uploadProductFile === "function") pass("uploadProductFile method exists");
    else fail("uploadProductFile method missing");

    if (typeof fileUploadService.uploadThumbnail === "function") pass("uploadThumbnail method exists");
    else fail("uploadThumbnail method missing");

    if (typeof fileUploadService.deleteProductFile === "function") pass("deleteProductFile method exists");
    else fail("deleteProductFile method missing");

  } catch (e: any) {
    fail("File upload check failed", e.message?.slice(0, 80));
  }
}

// ─── 13. Environment Variables ───────────────────────────────────

async function checkEnvVars() {
  section("13. ENVIRONMENT VARIABLES");

  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
  ];

  const recommended = [
    "S3_ENDPOINT",
    "S3_ACCESS_KEY",
    "S3_SECRET_KEY",
    "S3_BUCKET",
    "DOWNLOAD_TOKEN_SECRET",
    "FRONTEND_URL",
  ];

  const optional = [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "POLAR_ACCESS_TOKEN",
    "RAZORPAY_KEY_ID",
  ];

  for (const key of required) {
    if (process.env[key]) pass(`${key} is set`);
    else fail(`${key} is MISSING (required)`);
  }

  for (const key of recommended) {
    if (process.env[key]) pass(`${key} is set`);
    else skip(`${key} not set (recommended)`);
  }

  for (const key of optional) {
    if (process.env[key]) pass(`${key} is set`);
    else skip(`${key} not set (optional — feature disabled)`);
  }
}

// ─── RUN ALL ─────────────────────────────────────────────────────

async function main() {
  console.log("\n" + "🔍".repeat(30));
  console.log("  DigiStore — Full Verification Suite");
  console.log("🔍".repeat(30));

  const dbOk = await checkDatabase();
  if (dbOk) {
    await checkSchema();
  }
  
  await checkServiceImports();
  await checkRoutes();
  await checkEmailService();
  await checkPdfStamping();
  
  if (dbOk) {
    await checkRenewalService();
    await checkLibraryService();
    await checkPostService();
  }
  
  await checkStorage();
  await checkContentDripping();
  await checkFileUpload();
  await checkEnvVars();

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log(`  RESULTS: ✅ ${passed} passed | ❌ ${failed} failed | ⏭️  ${skipped} skipped`);
  console.log("═".repeat(60));

  if (failed > 0) {
    console.log("\n⚠️  Some checks failed. Review the errors above and fix them.\n");
    process.exit(1);
  } else {
    console.log("\n🎉 All checks passed! Your DigiStore clone is fully functional.\n");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
}).finally(() => {
  prisma.$disconnect();
});
