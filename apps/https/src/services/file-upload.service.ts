import prisma from "@repo/db/client";
import {
  generateUploadUrl,
  generateFileKey,
  validateFileUpload,
  deleteFile,
  ensureBucketExists,
} from "@repo/storage";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errors.js";

// ─── Allowed MIME Types ──────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Service ─────────────────────────────────────────────────────

export const fileUploadService = {
  /**
   * Upload a product file (the actual deliverable).
   * Generates a presigned URL, uploads via fetch, creates ProductFile record.
   */
  async uploadProductFile(
    productId: string,
    creatorId: string,
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }
  ) {
    // Verify product ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    // Validate file using storage package's validator
    try {
      validateFileUpload(file.mimetype, file.size);
    } catch (err: any) {
      throw new BadRequestError(err.message);
    }

    // Sanitize filename — remove path traversal, special chars
    const safeName = file.originalname
      .replace(/[^\w\s.-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 200);

    // Generate presigned upload URL and file key using storage package
    // Note: generateUploadUrl(productId, fileName, fileType, fileSizeBytes)
    await ensureBucketExists();
    const { uploadUrl, fileKey } = await generateUploadUrl(
      productId,
      safeName,
      file.mimetype,
      file.size
    );

    // Upload file buffer to MinIO via presigned URL
    await fetch(uploadUrl, {
      method: "PUT",
      body: new Uint8Array(file.buffer),
      headers: {
        "Content-Type": file.mimetype,
        "Content-Length": String(file.size),
      },
    });

    // Get current max sort order
    const lastFile = await prisma.productFile.findFirst({
      where: { productId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    // Create DB record
    const productFile = await prisma.productFile.create({
      data: {
        productId,
        fileName: safeName,
        fileKey,
        fileSizeBytes: BigInt(file.size),
        fileType: file.mimetype,
        sortOrder: (lastFile?.sortOrder ?? -1) + 1,
      },
    });

    return {
      id: productFile.id,
      fileName: productFile.fileName,
      fileType: productFile.fileType,
      fileSizeBytes: productFile.fileSizeBytes.toString(),
      sortOrder: productFile.sortOrder,
      createdAt: productFile.createdAt,
    };
  },

  /**
   * Delete a product file from storage and DB.
   */
  async deleteProductFile(
    productId: string,
    fileId: string,
    creatorId: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    const file = await prisma.productFile.findUnique({
      where: { id: fileId },
      select: { id: true, productId: true, fileKey: true },
    });

    if (!file || file.productId !== productId) {
      throw new NotFoundError("File");
    }

    // Delete from storage
    try {
      await deleteFile(file.fileKey);
    } catch (err) {
      console.error("[FileUpload] Failed to delete from storage:", err);
      // Continue with DB deletion even if storage fails
    }

    // Delete DB record
    await prisma.productFile.delete({ where: { id: fileId } });

    return { deleted: true };
  },

  /**
   * Upload or replace a product thumbnail image.
   */
  async uploadThumbnail(
    productId: string,
    creatorId: string,
    file: {
      originalname: string;
      mimetype: string;
      buffer: Buffer;
      size: number;
    }
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true, thumbnailUrl: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    // Validate image type
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      throw new BadRequestError("Thumbnail must be PNG, JPEG, GIF, or WebP");
    }
    if (file.size > MAX_THUMBNAIL_SIZE) {
      throw new BadRequestError("Thumbnail size exceeds the 10 MB limit");
    }

    // Use generateFileKey from storage package for consistency
    const fileKey = generateFileKey(productId, `thumbnail.${file.mimetype.split("/")[1] || "png"}`);

    await ensureBucketExists();

    // Generate presigned URL for thumbnail
    const { uploadUrl } = await generateUploadUrl(
      productId,
      `thumbnail.${file.mimetype.split("/")[1] || "png"}`,
      file.mimetype,
      file.size
    );

    await fetch(uploadUrl, {
      method: "PUT",
      body: new Uint8Array(file.buffer),
      headers: {
        "Content-Type": file.mimetype,
        "Content-Length": String(file.size),
      },
    });

    // Build the public URL for the thumbnail
    const s3Endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
    const bucket = process.env.S3_BUCKET || "gumroad-files";
    const thumbnailUrl = `${s3Endpoint}/${bucket}/${fileKey}`;

    // Update product with thumbnail URL
    await prisma.product.update({
      where: { id: productId },
      data: { thumbnailUrl },
    });

    return { thumbnailUrl };
  },
};
