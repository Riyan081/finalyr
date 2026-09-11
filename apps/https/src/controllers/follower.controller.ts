import type { Request, Response } from "express";
import { followerService } from "../services/follower.service.js";
import { sendSuccess } from "../utils/response.js";

export const followerController = {
  follow: async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const creatorId = req.params.creatorId as string;
    const result = await followerService.follow(userId, creatorId);
    sendSuccess(res, "Followed", result, 201);
  },

  unfollow: async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const creatorId = req.params.creatorId as string;
    const result = await followerService.unfollow(userId, creatorId);
    sendSuccess(res, "Unfollowed", result);
  },

  isFollowing: async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const creatorId = req.params.creatorId as string;
    const result = await followerService.isFollowing(userId, creatorId);
    sendSuccess(res, "Follow status", result);
  },

  getFollowing: async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const result = await followerService.getFollowing(userId);
    sendSuccess(res, "Following creators", result);
  },
};
