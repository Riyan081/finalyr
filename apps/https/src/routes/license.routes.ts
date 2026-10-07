import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/index.js";
import { licenseController } from "../controllers/license.controller.js";

const router: ExpressRouter = Router();

// ─── Public Developer API (Gumroad v2 signature) ──────────────────
router.post("/verify", licenseController.verify);
router.post("/decrement", licenseController.decrement);

// ─── Creator Studio Management ────────────────────────────────────
router.get("/creator-keys", requireAuth, licenseController.getCreatorKeys);
router.post("/:id/toggle", requireAuth, licenseController.toggleKey);

export default router;
