import type { Request, Response } from "express";
import { variantService } from "../services/variant.service.js";
import { sendSuccess } from "../utils/response.js";

export const variantController = {
  /**
   * POST /api/products/:id/variants — Add a variant.
   */
  create: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const variant = await variantService.create(req.params.id as string, creatorId, req.body);
    sendSuccess(res, "Variant created", variant, 201);
  },

  /**
   * PUT /api/products/:id/variants/:variantId — Update a variant.
   */
  update: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const productId = req.params.id as string;
    const variantId = req.params.variantId as string;
    const variant = await variantService.update(
      productId,
      variantId,
      creatorId,
      req.body
    );
    sendSuccess(res, "Variant updated", variant);
  },

  /**
   * DELETE /api/products/:id/variants/:variantId — Delete a variant.
   */
  remove: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const productId = req.params.id as string;
    const variantId = req.params.variantId as string;
    const result = await variantService.remove(
      productId,
      variantId,
      creatorId
    );
    sendSuccess(res, "Variant deleted", result);
  },

  /**
   * GET /api/products/:id/variants — List variants for a product.
   */
  list: async (req: Request, res: Response) => {
    const variants = await variantService.listByProduct(req.params.id as string);
    sendSuccess(res, "Variants fetched", variants);
  },
};
