import { Router, type Router as ExpressRouter } from "express";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import premiumRoutes from "./premium.routes.js";
import productRoutes from "./product.routes.js";
import creatorRoutes from "./creator.routes.js";
import fileUploadRoutes from "./file-upload.routes.js";
import variantRoutes from "./variant.routes.js";
import followerRoutes from "./follower.routes.js";
import publicRoutes from "./public.routes.js";
import discoverRoutes from "./discover.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import orderRoutes from "./order.routes.js";
import reviewRoutes from "./review.routes.js";
import discountRoutes from "./discount.routes.js";
import licenseRoutes from "./license.routes.js";
import membershipRoutes from "./membership.routes.js";
import drmRoutes from "./drm.routes.js";

const router: ExpressRouter = Router();

// ─── Core Routes (paths defined internally) ──────────────────────
// These route files define their own /api/* paths
router.use("/", userRoutes);       // /api/users, /api/me
router.use("/", productRoutes);    // /api/products
router.use("/", creatorRoutes);    // /api/creator/*
router.use("/", fileUploadRoutes); // /api/products/:id/files
router.use("/", variantRoutes);    // /api/variants

// ─── Admin / Premium ─────────────────────────────────────────────
router.use("/api/admin", adminRoutes);
router.use("/api/premium", premiumRoutes);

// ─── Creator Social ──────────────────────────────────────────────
router.use("/api/followers", followerRoutes);

// ─── Public (No Auth) ────────────────────────────────────────────
router.use("/api/storefront", publicRoutes);
router.use("/api/discover", discoverRoutes);
router.use("/api/reviews", reviewRoutes);

// ─── Auth-Required Data ──────────────────────────────────────────
router.use("/api/analytics", analyticsRoutes);
router.use("/api/orders", orderRoutes);
router.use("/api/discounts", discountRoutes);

// ─── Subscriptions & Memberships ─────────────────────────────────
router.use("/api/memberships", membershipRoutes);

// ─── Software License Keys ───────────────────────────────────────
router.use("/api/licenses", licenseRoutes);

// ─── PDF Stamping / DRM ──────────────────────────────────────────
router.use("/api/drm", drmRoutes);

// ─── Checkout + Payments ─────────────────────────────────────────
router.use("/api/checkout", checkoutRoutes);

export default router;
