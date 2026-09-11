import { Router } from "express";
import { reviewService } from "../services/review.service.js";
import { requireAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router: import("express").Router = Router();

// GET /api/reviews/:productId — public
router.get("/:productId", async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await reviewService.getForProduct(req.params.productId as string, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  sendSuccess(res, "Reviews fetched", result.reviews, 200, result.pagination);
});

// POST /api/reviews — create (auth required)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { productId, rating, content, orderId } = req.body;
  const review = await reviewService.create(userId, { productId, rating, content, orderId });
  sendSuccess(res, "Review posted", review, 201);
});

// DELETE /api/reviews/:id — delete own review (auth required)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await reviewService.delete(userId, req.params.id as string);
  sendSuccess(res, "Review deleted", result);
});

export default router;
