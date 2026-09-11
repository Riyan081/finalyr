import type { Request, Response } from "express";
import { creatorService } from "../services/creator.service.js";
import { sendSuccess } from "../utils/response.js";

export const creatorController = {
  /**
   * POST /api/creator/setup — Initial creator profile setup.
   */
  setup: async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const creator = await creatorService.setupProfile(userId, req.body);
    sendSuccess(res, "Creator profile set up successfully", creator, 201);
  },

  /**
   * PUT /api/creator/profile — Update creator profile.
   */
  updateProfile: async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const creator = await creatorService.updateProfile(userId, req.body);
    sendSuccess(res, "Profile updated", creator);
  },

  /**
   * GET /api/creator/:username — Public creator storefront.
   */
  getPublicProfile: async (req: Request, res: Response) => {
    const creator = await creatorService.getPublicProfile(req.params.username as string);
    sendSuccess(res, "Creator profile", creator);
  },

  /**
   * GET /api/creator/check/:username — Check username availability.
   */
  checkUsername: async (req: Request, res: Response) => {
    const currentUserId = (req as any).user?.id;
    const result = await creatorService.checkUsername(
      req.params.username as string,
      currentUserId
    );
    sendSuccess(res, "Username check", result);
  },
};
