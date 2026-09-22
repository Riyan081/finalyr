import multer from "multer";

/**
 * Multer configuration for file uploads.
 *
 * Uses memory storage — files are buffered in RAM and streamed directly
 * to MinIO. No disk writes, reducing attack surface and cleanup needs.
 *
 * Limits:
 * - Single file: 500 MB max (buffered in memory, then uploaded to S3)
 * - Thumbnail: 10 MB max (use thumbnailUpload)
 */

// ─── Product File Upload (up to 500 MB) ─────────────────────────
export const productFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB (memory safe)
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
