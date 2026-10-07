import type { Request, Response } from "express";
import { licenseService } from "../services/license.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const licenseController = {
  /**
   * POST /api/licenses/verify
   * Public API endpoint for desktop / software apps to verify and activate license.
   */
  verify: async (req: Request, res: Response) => {
    try {
      const { licenseKey, key, incrementUses } = req.body;
      const targetKey = licenseKey || key;
      if (!targetKey) {
        sendError(res, "Missing license key in request body", 400);
        return;
      }

      const result = await licenseService.verifyKey(
        targetKey,
        incrementUses !== false
      );

      if (!result.valid) {
        res.status(400).json(result);
        return;
      }

      sendSuccess(res, result.message, result);
    } catch (err: any) {
      sendError(res, err.message || "Failed to verify license key", 500);
    }
  },

  /**
   * POST /api/licenses/decrement
   * Public API endpoint to unbind / deactivate a license on a device.
   */
  decrement: async (req: Request, res: Response) => {
    try {
      const { licenseKey, key } = req.body;
      const targetKey = licenseKey || key;
      if (!targetKey) {
        sendError(res, "Missing license key in request body", 400);
        return;
      }

      const result = await licenseService.decrementKey(targetKey);
      sendSuccess(res, result.message, result);
    } catch (err: any) {
      sendError(res, err.message || "Failed to deactivate license key", 500);
    }
  },

  /**
   * GET /api/licenses/creator-keys
   * Authenticated creator endpoint to inspect all issued license keys.
   */
  getCreatorKeys: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const keys = await licenseService.getCreatorKeys(user.id);
      sendSuccess(res, "License keys fetched", keys);
    } catch (err: any) {
      sendError(res, err.message || "Failed to fetch license keys", 500);
    }
  },

  /**
   * POST /api/licenses/:id/toggle
   * Creator endpoint to revoke/enable a specific key.
   */
  toggleKey: async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id!;
      const result = await licenseService.toggleDisableKey(id, user.id);
      sendSuccess(
        res,
        result.isDisabled ? "License revoked" : "License enabled",
        result
      );
    } catch (err: any) {
      sendError(res, err.message || "Failed to toggle license key", 500);
    }
  },
};
