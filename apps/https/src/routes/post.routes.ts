import { Router } from "express";
import { postService } from "../services/post.service.js";
import { requireAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router = Router();

/**
 * POST /api/posts — Create a new post (creator only).
 */
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const { title, content, productId, isPublic } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Title and content are required" });
  }

  const post = await postService.createPost(creatorId, {
    title,
    content,
    productId: productId || null,
    isPublic: isPublic ?? false,
  });

  sendSuccess(res, "Post created", post, 201);
});

/**
 * GET /api/posts/mine — Get creator's own posts (dashboard).
 */
router.get("/mine", requireAuth, async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const result = await postService.getCreatorPosts(creatorId, page, limit);
  sendSuccess(res, "Posts loaded", result);
});

/**
 * PUT /api/posts/:id — Update a post.
 */
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const postId = req.params.id as string;
  const { title, content, productId, isPublic, isPinned } = req.body;

  const post = await postService.updatePost(creatorId, postId, {
    title,
    content,
    productId,
    isPublic,
    isPinned,
  });

  sendSuccess(res, "Post updated", post);
});

/**
 * DELETE /api/posts/:id — Delete a post.
 */
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const creatorId = (req as any).user.id;
  const postId = req.params.id as string;

  const result = await postService.deletePost(creatorId, postId);
  sendSuccess(res, "Post deleted", result);
});

/**
 * GET /api/posts/creator/:creatorId — Get public/gated posts for a creator's storefront.
 * Viewer's access is checked server-side.
 */
router.get("/creator/:creatorId", async (req: Request, res: Response) => {
  const creatorId = req.params.creatorId as string;
  const viewerId = (req as any).user?.id; // May be undefined for unauthenticated visitors
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;

  const result = await postService.getPublicPosts(creatorId, viewerId, page, limit);
  sendSuccess(res, "Posts loaded", result);
});

export default router;
