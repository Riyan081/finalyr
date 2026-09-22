import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { storageClient, BUCKET_NAME } from "@repo/storage/client";

/**
 * PDF Stamping Service — adds buyer's email as a watermark to the first page.
 * This discourages unauthorized sharing by personalizing each download.
 * 
 * How it works:
 * 1. Downloads the original PDF from S3
 * 2. Adds the buyer's email as a watermark on the first page
 * 3. Uploads the stamped version to a separate key
 * 4. Returns the stamped file key for presigned URL generation
 * 
 * Stamped files are cached in S3 under: stamped/{orderId}/{originalKey}
 */
export const pdfStampingService = {
  /**
   * Check if a file is a PDF that should be stamped.
   */
  shouldStamp(fileType: string): boolean {
    return fileType === "application/pdf";
  },

  /**
   * Get or create a stamped version of a PDF.
   * Returns the S3 key of the stamped file.
   */
  async getStampedKey(
    originalKey: string,
    orderId: string,
    buyerEmail: string
  ): Promise<string> {
    const stampedKey = `stamped/${orderId}/${originalKey.split("/").pop()}`;

    // Check if stamped version already exists
    try {
      await storageClient.send(
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: stampedKey })
      );
      // Already stamped
      return stampedKey;
    } catch {
      // Need to create stamped version
    }

    try {
      // Download original PDF
      const original = await storageClient.send(
        new GetObjectCommand({ Bucket: BUCKET_NAME, Key: originalKey })
      );

      const bodyBytes = await original.Body?.transformToByteArray();
      if (!bodyBytes) throw new Error("Empty PDF body");

      // Load and stamp the PDF
      const pdfDoc = await PDFDocument.load(bodyBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      if (pages.length > 0) {
        const firstPage = pages[0]!;
        const { width } = firstPage.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const stampText = `Licensed to: ${buyerEmail}`;
        const fontSize = 8;
        const textWidth = font.widthOfTextAtSize(stampText, fontSize);

        // Bottom-right corner watermark
        firstPage.drawText(stampText, {
          x: width - textWidth - 20,
          y: 15,
          size: fontSize,
          font,
          color: rgb(0.6, 0.6, 0.6), // Light gray
          opacity: 0.7,
        });
      }

      // Save stamped PDF
      const stampedBytes = await pdfDoc.save();

      // Upload to S3
      await storageClient.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: stampedKey,
          Body: Buffer.from(stampedBytes),
          ContentType: "application/pdf",
        })
      );

      return stampedKey;
    } catch (err) {
      console.error("[PDF Stamp] Failed to stamp PDF, using original:", err);
      // Fallback to original if stamping fails
      return originalKey;
    }
  },
};
