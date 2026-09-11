import type { Request, Response } from "express";
import { publicService } from "../services/public.service.js";
import { sendSuccess } from "../utils/response.js";

export const publicController = {
  getProductBySlug: async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const slug = req.params.slug as string;
    const product = await publicService.getProductBySlug(username, slug);
    sendSuccess(res, "Product fetched", product);
  },

  getCreatorStorefront: async (req: Request, res: Response) => {
    const username = req.params.username as string;
    const storefront = await publicService.getCreatorStorefront(username);
    sendSuccess(res, "Storefront fetched", storefront);
  },

  getFeaturedProducts: async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 12;
    const products = await publicService.getFeaturedProducts(limit);
    sendSuccess(res, "Featured products", products);
  },
};
