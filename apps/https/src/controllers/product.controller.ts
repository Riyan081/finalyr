import type { Request, Response } from "express";
import { productService } from "../services/product.service.js";
import { sendSuccess } from "../utils/response.js";

export const productController = {
  /**
   * POST /api/products — Create a new product.
   */
  create: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const product = await productService.create(creatorId, req.body);
    sendSuccess(res, "Product created", product, 201);
  },

  /**
   * GET /api/products — List creator's products with pagination.
   */
  list: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const query = (req as any).validatedQuery || { ...req.query };
    const result = await productService.listByCreator(creatorId, query);
    res.json({
      success: true,
      message: "Products fetched",
      ...result,
    });
  },

  /**
   * GET /api/products/:id — Get a single product by ID.
   */
  getById: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const product = await productService.getById(req.params.id as string, creatorId);
    sendSuccess(res, "Product fetched", product);
  },

  /**
   * PUT /api/products/:id — Update a product.
   */
  update: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const product = await productService.update(req.params.id as string, creatorId, req.body);
    sendSuccess(res, "Product updated", product);
  },

  /**
   * DELETE /api/products/:id — Archive a product.
   */
  archive: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const product = await productService.archive(req.params.id as string, creatorId);
    sendSuccess(res, "Product archived", product);
  },

  /**
   * POST /api/products/:id/publish — Publish a product.
   */
  publish: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const product = await productService.publish(req.params.id as string, creatorId);
    sendSuccess(res, "Product published", product);
  },

  /**
   * PUT /api/products/:id/bundle — Update bundled product IDs.
   */
  updateBundle: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const { bundledProductIds } = req.body;
    const product = await productService.updateBundledProducts(
      req.params.id as string,
      creatorId,
      bundledProductIds || []
    );
    sendSuccess(res, "Bundle updated", product);
  },

  /**
   * GET /api/products/:id/bundle — Get bundled products (public).
   */
  getBundledProducts: async (req: Request, res: Response) => {
    const products = await productService.getBundledProducts(req.params.id as string);
    sendSuccess(res, "Bundled products", products);
  },
};
