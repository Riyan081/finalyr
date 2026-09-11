import { Router } from "express";
import { orderService } from "../services/order.service.js";
import { requireAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router: import("express").Router = Router();
router.use(requireAuth);

// GET /api/orders/sales — Creator's sales list
router.get("/sales", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const { page, limit, status, productId } = req.query as Record<string, string>;
  const result = await orderService.getCreatorSales(creatorId, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
    status,
    productId,
  });
  sendSuccess(res, "Sales fetched", result.orders, 200, result.pagination);
});

// GET /api/orders/purchases — Customer's purchase history
router.get("/purchases", async (req: Request, res: Response) => {
  const customerId = (req as any).user.id;
  const { page, limit } = req.query as Record<string, string>;
  const result = await orderService.getCustomerPurchases(customerId, {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 20,
  });
  sendSuccess(res, "Purchases fetched", result.orders, 200, result.pagination);
});

// GET /api/orders/:id — Get single order
router.get("/:id", async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const order = await orderService.getOrder(req.params.id as string, userId);
  sendSuccess(res, "Order fetched", order);
});

// POST /api/orders/:id/refund — Refund an order
router.post("/:id/refund", async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const order = await orderService.refund(req.params.id as string, creatorId);
  sendSuccess(res, "Order refunded", order);
});

export default router;
