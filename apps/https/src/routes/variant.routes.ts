import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/index.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { variantController } from "../controllers/variant.controller.js";
import {
  createVariantSchema,
  updateVariantSchema,
} from "@repo/common/schemas";

const router: ExpressRouter = Router();

router.post(
  "/api/products/:id/variants",
  requireAuth,
  validateBody(createVariantSchema),
  variantController.create
);

router.put(
  "/api/products/:id/variants/:variantId",
  requireAuth,
  validateBody(updateVariantSchema),
  variantController.update
);

router.delete(
  "/api/products/:id/variants/:variantId",
  requireAuth,
  variantController.remove
);

router.get(
  "/api/products/:id/variants",
  requireAuth,
  variantController.list
);

export default router;
