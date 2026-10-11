import type { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { generateCopyInputSchema } from "@repo/common";

export class AIController {
  // ─── GET /api/ai/semantic-search ──────────────────────────────────────────
  async semanticSearch(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string) || "";
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
      const category = req.query.category as string | undefined;

      if (!q.trim()) {
        res.status(400).json({
          success: false,
          error: "Search query 'q' parameter is required",
        });
        return;
      }

      const results = await aiService.semanticSearch(q, limit, category);

      res.json({
        success: true,
        data: results,
        total: results.length,
        query: q,
      });
    } catch (error) {
      console.error("[AIController.semanticSearch] Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error performing semantic search",
      });
    }
  }

  // ─── GET /api/ai/recommendations/:productId ───────────────────────────────
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const productIdParam = req.params.productId;
      const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 4;

      if (!productId) {
        res.status(400).json({
          success: false,
          error: "Product ID parameter is required",
        });
        return;
      }

      const recommendations = await aiService.getRecommendations(productId, limit);

      res.json({
        success: true,
        data: recommendations,
        total: recommendations.length,
      });
    } catch (error) {
      console.error("[AIController.getRecommendations] Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error retrieving recommendations",
      });
    }
  }

  // ─── POST /api/ai/generate-copy ───────────────────────────────────────────
  async generateCopy(req: Request, res: Response): Promise<void> {
    try {
      const parsed = generateCopyInputSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten(),
        });
        return;
      }

      const generated = await aiService.generateCopy(parsed.data);

      res.json({
        success: true,
        data: generated,
      });
    } catch (error) {
      console.error("[AIController.generateCopy] Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error generating copy",
      });
    }
  }
}

export const aiController = new AIController();
