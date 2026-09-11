import express, { type Express } from "express";
import cors from "cors";
import { auth } from "@repo/auth/server";
import { toNodeHandler } from "better-auth/node";
import corsOptions from "./config/cors.js";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middleware/error-handler.js";

// ─── BigInt Serialization Fix ───────────────────────────────────
// Prisma returns BigInt for fields like fileSizeBytes.
// JSON.stringify can't handle BigInt by default, so we polyfill it.
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app: Express = express();

// ─── Security Headers ───────────────────────────────────────────
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

// ─── CORS (allow Next.js frontend) ──────────────────────────────
app.use(cors(corsOptions));

// ─── Clean up stale cookie_cache from previous sessions ────────
app.use((req, _res, next) => {
  if (req.headers.cookie) {
    req.headers.cookie = req.headers.cookie
      .replace(/(?:^|;\s*)[^;]*cookie_cache=[^;]*/g, "")
      .replace(/^;\s*/, "");
  }
  next();
});

// ─── Better Auth Route Handler ──────────────────────────────────
// Must be mounted BEFORE express.json() to handle its own body parsing
app.all("/api/auth/*splat", toNodeHandler(auth));

// ─── Body Parser (for non-auth routes) ──────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Public Routes ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "Gumroad Clone API is running 🚀" });
});

// ─── API Routes ─────────────────────────────────────────────────
// Routes that define /api/products, /api/creator etc. internally use root mount.
// Routes for discover/orders/analytics/checkout mount under /api prefix.
app.use(routes);

// ─── Global Error Handler (must be LAST) ────────────────────────
app.use(globalErrorHandler);

export default app;
