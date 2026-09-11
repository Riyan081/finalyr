import type { Request, Response } from "express";
import { fileUploadService } from "../services/file-upload.service.js";
import { sendSuccess } from "../utils/response.js";
import { BadRequestError } from "../utils/errors.js";

export const fileUploadController = {
  /**
   * POST /api/products/:id/files — Upload a product file.
   */
  uploadFile: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const productId = req.params.id as string;
    const file = req.file;

    if (!file) {
      throw new BadRequestError("No file provided");
    }

    const result = await fileUploadService.uploadProductFile(
      productId,
      creatorId,
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      }
    );

    sendSuccess(res, "File uploaded", result, 201);
  },

  /**
   * DELETE /api/products/:id/files/:fileId — Delete a product file.
   */
  deleteFile: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const productId = req.params.id as string;
    const fileId = req.params.fileId as string;

    const result = await fileUploadService.deleteProductFile(
      productId,
      fileId,
      creatorId
    );

    sendSuccess(res, "File deleted", result);
  },

  /**
   * POST /api/products/:id/thumbnail — Upload product thumbnail.
   */
  uploadThumbnail: async (req: Request, res: Response) => {
    const creatorId = (req as any).user.id;
    const productId = req.params.id as string;
    const file = req.file;

    if (!file) {
      throw new BadRequestError("No image provided");
    }

    const result = await fileUploadService.uploadThumbnail(
      productId,
      creatorId,
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        buffer: file.buffer,
        size: file.size,
      }
    );

    sendSuccess(res, "Thumbnail uploaded", result);
  },
};
