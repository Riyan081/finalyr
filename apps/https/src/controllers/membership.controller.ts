import type { Request, Response } from "express";
import { membershipService } from "../services/membership.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const membershipController = {
  /**
   * POST /api/memberships/subscribe
   */
  subscribe: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { productId, recurrence } = req.body;

      if (!productId) {
        sendError(res, "Missing productId in request body", 400);
        return;
      }

      const result = await membershipService.subscribe({
        customerId: user.id,
        customerEmail: user.email,
        customerName: user.name,
        productId,
        recurrence,
      });

      sendSuccess(
        res,
        result.isExtension
          ? "Membership subscription extended"
          : "Successfully joined membership!",
        result
      );
    } catch (err: any) {
      sendError(res, err.message || "Failed to subscribe to membership", 500);
    }
  },

  /**
   * GET /api/memberships/my-subscriptions
   */
  getMySubscriptions: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const subscriptions = await membershipService.getMySubscriptions(user.id);
      sendSuccess(res, "My subscriptions fetched", subscriptions);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch subscriptions", 500);
    }
  },

  /**
   * GET /api/memberships/creator-members
   */
  getCreatorMembers: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const data = await membershipService.getCreatorMembers(user.id);
      sendSuccess(res, "Creator members fetched", data);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch creator members", 500);
    }
  },

  /**
   * POST /api/memberships/:id/cancel
   */
  cancel: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
      const cancelled = await membershipService.cancelMembership(id, user.id);
      sendSuccess(res, "Membership cancelled", cancelled);
    } catch (err: any) {
      sendError(res, err.message || "Failed to cancel membership", 500);
    }
  },

  /**
   * POST /api/memberships/:id/renew
   * Simulate recurring billing charge in live project demo.
   */
  renew: async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
      const renewed = await membershipService.renewMembership(id);
      sendSuccess(res, "Simulated recurring charge processed (+30 days)", renewed);
    } catch (err: any) {
      sendError(res, err.message || "Failed to renew membership", 500);
    }
  },

  /**
   * GET /api/memberships/access/:productId
   */
  checkAccess: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]!
        : req.params.productId!;
      const access = await membershipService.checkAccess(user?.id, productId);
      sendSuccess(res, "Access checked", access);
    } catch (err: any) {
      sendError(res, err.message || "Failed to check access", 500);
    }
  },
};
