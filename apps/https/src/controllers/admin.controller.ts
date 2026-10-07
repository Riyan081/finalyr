import type { Request, Response } from "express";
import { adminService } from "../services/admin.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getParamId = (req: Request): string =>
  (Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!) || "";

export const adminController = {
  /**
   * GET /api/admin/stats
   */
  getStats: async (_req: Request, res: Response) => {
    try {
      const stats = await adminService.getStats();
      sendSuccess(res, "Admin stats fetched", stats);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch admin stats", 500);
    }
  },

  /**
   * GET /api/admin/users
   */
  getUsers: async (req: Request, res: Response) => {
    try {
      const { search, role } = req.query;
      const users = await adminService.getAllUsers({
        search: typeof search === "string" ? search : undefined,
        role: typeof role === "string" ? role : undefined,
      });
      sendSuccess(res, "Admin users fetched", users);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch users", 500);
    }
  },

  /**
   * PATCH /api/admin/users/:id/role
   */
  updateUserRole: async (req: Request, res: Response) => {
    try {
      const id = getParamId(req);
      const { role } = req.body;
      if (!role) {
        sendError(res, "Role is required", 400);
        return;
      }
      const updated = await adminService.updateUserRole(id, role);
      sendSuccess(res, "User role updated", updated);
    } catch (err: any) {
      sendError(res, err.message || "Failed to update role", 400);
    }
  },

  /**
   * POST /api/admin/users/:id/ban
   */
  banUser: async (req: Request, res: Response) => {
    try {
      const id = getParamId(req);
      const { banned, reason } = req.body;
      const updated = await adminService.setUserBanStatus(
        id,
        Boolean(banned),
        reason
      );
      sendSuccess(
        res,
        banned ? "User suspended" : "User reinstated",
        updated
      );
    } catch (err: any) {
      sendError(res, err.message || "Failed to update ban status", 400);
    }
  },

  /**
   * GET /api/admin/products
   */
  getProducts: async (req: Request, res: Response) => {
    try {
      const { search, status } = req.query;
      const products = await adminService.getAllProducts({
        search: typeof search === "string" ? search : undefined,
        status: typeof status === "string" ? status : undefined,
      });
      sendSuccess(res, "Catalog products fetched", products);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch products", 500);
    }
  },

  /**
   * PATCH /api/admin/products/:id
   */
  moderateProduct: async (req: Request, res: Response) => {
    try {
      const id = getParamId(req);
      const { status, isListedOnDiscover } = req.body;
      const updated = await adminService.moderateProduct(id, {
        status,
        isListedOnDiscover,
      });
      sendSuccess(res, "Product moderated successfully", updated);
    } catch (err: any) {
      sendError(res, err.message || "Failed to moderate product", 400);
    }
  },

  /**
   * GET /api/admin/orders
   */
  getOrders: async (req: Request, res: Response) => {
    try {
      const { search, status } = req.query;
      const orders = await adminService.getAllOrders({
        search: typeof search === "string" ? search : undefined,
        status: typeof status === "string" ? status : undefined,
      });
      sendSuccess(res, "Platform orders fetched", orders);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch orders", 500);
    }
  },

  /**
   * POST /api/admin/orders/:id/refund
   */
  refundOrder: async (req: Request, res: Response) => {
    try {
      const id = getParamId(req);
      const refunded = await adminService.refundOrder(id);
      sendSuccess(res, "Order refunded successfully", refunded);
    } catch (err: any) {
      sendError(res, err.message || "Failed to refund order", 400);
    }
  },

  /**
   * GET /api/admin/payouts
   */
  getPayouts: async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const payouts = await adminService.getAllPayouts({
        status: typeof status === "string" ? status : undefined,
      });
      sendSuccess(res, "Creator payouts fetched", payouts);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch payouts", 500);
    }
  },

  /**
   * POST /api/admin/payouts/:id/process
   */
  processPayout: async (req: Request, res: Response) => {
    try {
      const id = getParamId(req);
      const processed = await adminService.processPayout(id);
      sendSuccess(res, "Payout processed successfully", processed);
    } catch (err: any) {
      sendError(res, err.message || "Failed to process payout", 400);
    }
  },

  /**
   * GET /api/admin/system
   */
  getSystemHealth: async (_req: Request, res: Response) => {
    try {
      const health = await adminService.getSystemHealth();
      sendSuccess(res, "System health fetched", health);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch system health", 500);
    }
  },
};
