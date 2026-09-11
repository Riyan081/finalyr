import { Router } from "express";
import { followerController } from "../controllers/follower.controller.js";
import { requireAuth } from "../middleware/index.js";

const router: import("express").Router = Router();

// All follower routes require authentication
router.get("/my/following", requireAuth, followerController.getFollowing);
router.post("/:creatorId/follow", requireAuth, followerController.follow);
router.delete("/:creatorId/follow", requireAuth, followerController.unfollow);
router.get("/:creatorId/following", requireAuth, followerController.isFollowing);

export default router;
