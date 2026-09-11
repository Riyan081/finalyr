import multer from "multer";

/**
 * Multer configuration for file uploads.
 *
 * Uses memory storage — files are buffered in RAM and streamed directly
 * to MinIO. No disk writes, reducing attack surface and cleanup needs.
 *
 * Limits:
 * - Single file: 5 GB max
 * - Thumbnail: 10 MB max (use thumbnailUpload)
 */

// ─── Product File Upload (up to 5 GB) ───────────────────────────
export const productFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5 GB
    files: 1,
  },
});

// ─── Thumbnail Upload (up to 10 MB, images only) ────────────────
export const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG, JPEG, GIF, and WebP images are allowed"));
    }
  },
});
