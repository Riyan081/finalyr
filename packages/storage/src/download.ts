import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storageClient, BUCKET_NAME } from "./client.js";

/**
 * Generate a presigned GET URL for secure file download.
 * URL expires after the given duration — buyer must have a valid purchase.
 *
 * @param fileKey - The S3 object key
 * @param expiresInSeconds - URL lifetime (default: 15 minutes)
 * @param downloadFileName - Force a download filename via Content-Disposition
 */
export async function generateDownloadUrl(
  fileKey: string,
  expiresInSeconds: number = 900,
  downloadFileName?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ...(downloadFileName && {
      ResponseContentDisposition: `attachment; filename="${downloadFileName}"`,
    }),
  });

  return getSignedUrl(storageClient, command, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  await storageClient.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    })
  );
}
