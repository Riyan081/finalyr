import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, optionalAuth } from "../middleware/index.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { creatorController } from "../controllers/creator.controller.js";
import {
  setupCreatorSchema,
  updateCreatorSchema,
  creatorUsernameSchema,
} from "@repo/common/schemas";

const router: ExpressRouter = Router();

// ─── Authenticated Routes ────────────────────────────────────────

router.post(
  "/api/creator/setup",
  requireAuth,
  validateBody(setupCreatorSchema),
  creatorController.setup
);

router.put(
  "/api/creator/profile",
  requireAuth,
  validateBody(updateCreatorSchema),
  creatorController.updateProfile
);

// ─── Public Routes ───────────────────────────────────────────────

router.get(
  "/api/creator/check/:username",
  optionalAuth,
  validateParams(creatorUsernameSchema),
  creatorController.checkUsername
);

// This must be last to avoid matching "check" and "setup" as usernames
router.get(
  "/api/creator/:username",
  validateParams(creatorUsernameSchema),
  creatorController.getPublicProfile
);

export default router;
