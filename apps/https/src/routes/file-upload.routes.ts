import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/index.js";
import { productFileUpload, thumbnailUpload } from "../middleware/multer.js";
import { fileUploadController } from "../controllers/file-upload.controller.js";

const router: ExpressRouter = Router();

// All file upload routes require authentication

router.post(
  "/api/products/:id/files",
  requireAuth,
  productFileUpload.single("file"),
  fileUploadController.uploadFile
);

router.delete(
  "/api/products/:id/files/:fileId",
  requireAuth,
  fileUploadController.deleteFile
);

router.post(
  "/api/products/:id/thumbnail",
  requireAuth,
  thumbnailUpload.single("thumbnail"),
  fileUploadController.uploadThumbnail
);

export default router;
