import { Router } from "express";
import { analyticsService } from "../services/analytics.service.js";
import { requireAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router: import("express").Router = Router();

// All analytics routes require auth
router.use(requireAuth);

// GET /api/analytics/overview
router.get("/overview", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const data = await analyticsService.getOverview(creatorId);
  sendSuccess(res, "Analytics overview", data);
});

// GET /api/analytics/revenue?days=30
router.get("/revenue", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
  const data = await analyticsService.getRevenueByDay(creatorId, days);
  sendSuccess(res, "Revenue data", data);
});

// GET /api/analytics/products?limit=5
router.get("/products", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
  const data = await analyticsService.getTopProducts(creatorId, limit);
  sendSuccess(res, "Top products", data);
});

// GET /api/analytics/sales?limit=10
router.get("/sales", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const data = await analyticsService.getRecentSales(creatorId, limit);
  sendSuccess(res, "Recent sales", data);
});

export default router;
