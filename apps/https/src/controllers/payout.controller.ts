import type { Request, Response } from "express";
import { payoutService } from "../services/payout.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const payoutController = {
  /**
   * GET /api/payouts/status
   * Get the creator's current payout status and 30-day maturity breakdown.
   */
  getStatus: async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user.id;
      const status = await payoutService.getCreatorPayoutStatus(creatorId);
      sendSuccess(res, "Payout status retrieved", status);
    } catch (err: any) {
      sendError(res, err.message || "Failed to retrieve payout status", err.statusCode || 500);
    }
  },

  /**
   * POST /api/payouts/request
   * Creator submits a withdrawal request for mature funds (30+ days old).
   */
  requestPayout: async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user.id;
      const { amountCents } = req.body || {};
      const result = await payoutService.requestPayout(
        creatorId,
        typeof amountCents === "number" ? amountCents : undefined
      );
      sendSuccess(res, "Withdrawal request submitted successfully", result, 201);
    } catch (err: any) {
      sendError(res, err.message || "Failed to request payout", err.statusCode || 400);
    }
  },

  /**
   * GET /api/payouts/history
   * Creator's history of withdrawal requests.
   */
  getHistory: async (req: Request, res: Response) => {
    try {
      const creatorId = (req as any).user.id;
      const history = await payoutService.getMyPayoutHistory(creatorId);
      sendSuccess(res, "Payout history retrieved", history);
    } catch (err: any) {
      sendError(res, err.message || "Failed to retrieve payout history", err.statusCode || 500);
    }
  },
};
