import { PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storageClient, BUCKET_NAME } from "./client.js";
import crypto from "crypto";

/** Allowed MIME types for digital product uploads */
const ALLOWED_MIME_TYPES = [
  // Documents
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Code / Text
  "text/plain",
  "text/csv",
  "application/json",
  // Archives
  "application/x-tar",
  "application/gzip",
  "application/x-rar-compressed",
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

/**
 * Validate file metadata before generating upload URL.
 * Throws on invalid input.
 */
export function validateFileUpload(fileType: string, fileSizeBytes: number) {
  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
    throw new Error(`File type "${fileType}" is not allowed. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`);
  }
  if (fileSizeBytes > MAX_FILE_SIZE) {
    throw new Error(`File size ${fileSizeBytes} exceeds max ${MAX_FILE_SIZE} bytes (500MB)`);
  }
}

/**
 * Generate a unique S3 object key for a product file.
 * Format: products/{productId}/{randomId}-{originalName}
 */
export function generateFileKey(productId: string, fileName: string): string {
  const id = crypto.randomUUID().slice(0, 8);
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `products/${productId}/${id}-${sanitized}`;
}

/**
 * Generate a presigned PUT URL for direct browser → MinIO upload.
 * The browser uploads directly to storage — never through our Express server.
 *
 * @returns { uploadUrl, fileKey } — the URL to PUT to & the key to save in DB
 */
export async function generateUploadUrl(
  productId: string,
  fileName: string,
  fileType: string,
  fileSizeBytes: number
): Promise<{ uploadUrl: string; fileKey: string }> {
  validateFileUpload(fileType, fileSizeBytes);

  const fileKey = generateFileKey(productId, fileName);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ContentLength: fileSizeBytes,
  });

  const uploadUrl = await getSignedUrl(storageClient, command, {
    expiresIn: 3600, // 1 hour to complete upload
  });

  return { uploadUrl, fileKey };
}

/**
 * Ensure the storage bucket exists. Call once at startup.
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    await storageClient.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch {
    await storageClient.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`[Storage] Created bucket: ${BUCKET_NAME}`);
  }
}
