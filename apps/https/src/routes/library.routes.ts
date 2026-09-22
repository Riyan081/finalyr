import { Router } from "express";
import { libraryService } from "../services/library.service.js";
import { downloadService } from "../services/download.service.js";
import { requireAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router = Router();

/**
 * GET /api/library — Get buyer's library (all purchases).
 * Supports filtering by search, product type, and creator.
 */
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { page, limit, search, type, creatorId } = req.query as any;

  const result = await libraryService.getLibrary(userId, {
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    search,
    type,
    creatorId,
  });

  sendSuccess(res, "Library loaded", result);
});

/**
 * GET /api/library/:orderId/download — Generate a fresh download token for an order.
 * This enables PERMANENT re-download access (Gumroad-style).
 * The buyer can call this anytime to get a new 24h download token.
 */
router.get("/:orderId/download", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orderId = req.params.orderId as string;

  const result = await downloadService.generateToken(orderId, userId);
  sendSuccess(res, "Download token generated", result);
});

/**
 * POST /api/library/membership/:id/cancel — Cancel a membership.
 * Access stays until current billing period ends.
 */
router.post("/membership/:id/cancel", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const membershipId = req.params.id as string;

  const result = await libraryService.cancelMembership(userId, membershipId);
  sendSuccess(res, "Membership cancelled. Access remains until period ends.", result);
});

/**
 * POST /api/library/membership/:id/restart — Restart a cancelled membership.
 */
router.post("/membership/:id/restart", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const membershipId = req.params.id as string;

  const result = await libraryService.restartMembership(userId, membershipId);
  sendSuccess(res, "Membership restarted!", result);
});

export default router;
