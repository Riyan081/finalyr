import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/index.js";
import { validateBody, validateQuery, validateParams } from "../middleware/validate.js";
import { productController } from "../controllers/product.controller.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productParamsSchema,
} from "@repo/common/schemas";

const router: ExpressRouter = Router();

// All product routes require authentication
router.post(
  "/api/products",
  requireAuth,
  validateBody(createProductSchema),
  productController.create
);

router.get(
  "/api/products",
  requireAuth,
  validateQuery(productQuerySchema),
  productController.list
);

router.get(
  "/api/products/:id",
  requireAuth,
  validateParams(productParamsSchema),
  productController.getById
);

router.put(
  "/api/products/:id",
  requireAuth,
  validateParams(productParamsSchema),
  validateBody(updateProductSchema),
  productController.update
);

router.delete(
  "/api/products/:id",
  requireAuth,
  validateParams(productParamsSchema),
  productController.archive
);

router.post(
  "/api/products/:id/publish",
  requireAuth,
  validateParams(productParamsSchema),
  productController.publish
);

// Bundle management
router.put(
  "/api/products/:id/bundle",
  requireAuth,
  validateParams(productParamsSchema),
  productController.updateBundle
);

router.get(
  "/api/products/:id/bundle",
  productController.getBundledProducts
);

export default router;
