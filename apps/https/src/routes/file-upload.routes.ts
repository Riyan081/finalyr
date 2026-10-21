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

import { getFileStream } from "@repo/storage";

// Direct file streaming route (e.g. for /api/files/stream/products/...)
router.get("/api/files/stream/*path", async (req, res) => {
  try {
    const rawParts = (req.params as any).path;
    const fileKey = Array.isArray(rawParts) ? rawParts.join("/") : String(rawParts || "");
    const fileName = fileKey.split("/").pop()?.replace(/^[a-f0-9]+-/, "") || "download";

    const s3Obj = await getFileStream(fileKey);

    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    if (s3Obj.ContentType) res.setHeader("Content-Type", s3Obj.ContentType);
    if (s3Obj.ContentLength) res.setHeader("Content-Length", s3Obj.ContentLength);

    if (s3Obj.Body) {
      if (typeof (s3Obj.Body as any).pipe === "function") {
        (s3Obj.Body as any).pipe(res);
      } else if (typeof (s3Obj.Body as any).transformToByteArray === "function") {
        const bytes = await (s3Obj.Body as any).transformToByteArray();
        res.send(Buffer.from(bytes));
      } else {
        res.status(500).send("Unsupported body format");
      }
    } else {
      res.status(404).send("File empty or not found in storage");
    }
  } catch (err: any) {
    res.status(404).send("File not found in storage: " + (err.message || "Unknown error"));
  }
});

export default router;
