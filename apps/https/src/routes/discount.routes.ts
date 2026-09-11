import { Router } from "express";
import { discountService } from "../services/discount.service.js";
import { requireAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router: import("express").Router = Router();

// GET /api/discounts/validate?code=...&productId=... — public
router.get("/validate", async (req: Request, res: Response) => {
  const { code, productId } = req.query as { code: string; productId: string };
  const result = await discountService.validate(code, productId);
  sendSuccess(res, "Discount valid", result);
});

// Auth-required routes below
router.use(requireAuth);

// GET /api/discounts — list creator's discount codes
router.get("/", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const discounts = await discountService.list(creatorId);
  sendSuccess(res, "Discounts fetched", discounts);
});

// POST /api/discounts — create discount code
router.post("/", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const discount = await discountService.create(creatorId, req.body);
  sendSuccess(res, "Discount created", discount, 201);
});

// DELETE /api/discounts/:id — delete discount code
router.delete("/:id", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const result = await discountService.delete(req.params.id as string, creatorId);
  sendSuccess(res, "Discount deleted", result);
});

export default router;
