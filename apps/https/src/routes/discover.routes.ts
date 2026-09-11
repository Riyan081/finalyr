import { Router } from "express";
import { discoverService } from "../services/discover.service.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router: import("express").Router = Router();

// GET /api/discover?q=...&category=...&type=...&sort=...&page=1
router.get("/", async (req: Request, res: Response) => {
  const { q, category, type, sort, page, limit, minPrice, maxPrice } =
    req.query as Record<string, string>;

  const result = await discoverService.search({
    q,
    category,
    type,
    sort,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
    minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
  });

  sendSuccess(res, "Search results", result.products, 200, result.pagination);
});

// GET /api/discover/trending
router.get("/trending", async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
  const products = await discoverService.getTrending(limit);
  sendSuccess(res, "Trending products", products);
});

// GET /api/discover/categories
router.get("/categories", async (_req: Request, res: Response) => {
  const categories = await discoverService.getCategories();
  sendSuccess(res, "Categories", categories);
});

// GET /api/discover/creators
router.get("/creators", async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
  const creators = await discoverService.getFeaturedCreators(limit);
  sendSuccess(res, "Featured creators", creators);
});

export default router;
