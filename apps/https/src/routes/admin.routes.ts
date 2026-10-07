import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, requireRole } from "../middleware/index.js";
import { adminController } from "../controllers/admin.controller.js";

const router: ExpressRouter = Router();

// Apply admin authentication and authorization to all admin endpoints
router.use(requireAuth, requireRole("admin"));

// ─── Analytics & Overview ─────────────────────────────────────────
router.get("/stats", adminController.getStats);
router.get("/system", adminController.getSystemHealth);

// ─── User & Creator Management ────────────────────────────────────
router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.post("/users/:id/ban", adminController.banUser);

// ─── Product Catalog & Moderation ─────────────────────────────────
router.get("/products", adminController.getProducts);
router.patch("/products/:id", adminController.moderateProduct);

// ─── Orders & Transactions ────────────────────────────────────────
router.get("/orders", adminController.getOrders);
router.post("/orders/:id/refund", adminController.refundOrder);

// ─── Creator Payouts ──────────────────────────────────────────────
router.get("/payouts", adminController.getPayouts);
router.post("/payouts/:id/process", adminController.processPayout);

export default router;
