import { S3Client } from "@aws-sdk/client-s3";

/**
 * S3-compatible client — works with both MinIO (dev) and AWS S3 (prod).
 * Switch between them by changing env vars only.
 */
export function createStorageClient() {
  const endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
  const accessKey = process.env.S3_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.S3_SECRET_KEY || "minioadmin123";
  const region = process.env.S3_REGION || "us-east-1";

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    forcePathStyle: true, // Required for MinIO
  });
}

export const BUCKET_NAME = process.env.S3_BUCKET || "gumroad-files";

export const storageClient = createStorageClient();
