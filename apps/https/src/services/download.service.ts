import prisma from "@repo/db/client";
import crypto from "crypto";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { generateStampedSamplePdf, stampPdf } from "../routes/drm.routes.js";
import { getFileStream } from "@repo/storage";

/**
 * Download service — generates time-limited signed download tokens.
 * After purchase, customers get a token to download product files.
 * Includes dynamic server-side DRM watermarking for PDF files.
 */
export const downloadService = {
  /**
   * Generate a signed download token for an order.
   * Token expires in 24 hours.
   */
  async generateToken(orderId: string, userId?: string, _userEmail?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            creatorId: true,
            files: {
              select: {
                id: true,
                fileName: true,
                fileKey: true,
                fileSizeBytes: true,
                fileType: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        licenseKeys: {
          select: { licenseKey: true, uses: true, maxUses: true, isDisabled: true },
        },
      },
    });

    if (!order) throw new NotFoundError("Order");

    if (userId && order.customerId && order.customerId !== userId) {
      throw new ForbiddenError("You do not have access to this order");
    }

    if (order.status !== "completed") {
      throw new ForbiddenError("This order is not completed");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const payload = `${orderId}:${expiresAt.getTime()}`;
    const secret = process.env.DOWNLOAD_TOKEN_SECRET || "download-secret-change-me";
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const signedToken = `${Buffer.from(payload).toString("base64url")}.${sig}`;

    return {
      token: signedToken,
      expiresAt: expiresAt.toISOString(),
      order: {
        id: order.id,
        productName: order.product.name,
        files: order.product.files.map((f) => ({
          id: f.id,
          fileName: f.fileName,
          fileSizeBytes: f.fileSizeBytes.toString(),
          fileType: f.fileType,
          isPdf:
            f.fileType === "application/pdf" ||
            f.fileName.toLowerCase().endsWith(".pdf"),
        })),
        licenseKeys: order.licenseKeys,
      },
    };
  },

  /**
   * Verify a download token and return the order ID.
   */
  async verifyToken(token: string) {
    const secret = process.env.DOWNLOAD_TOKEN_SECRET || "download-secret-change-me";

    const [encodedPayload, sig] = token.split(".");
    if (!encodedPayload || !sig) throw new ForbiddenError("Invalid download token");

    const payload = Buffer.from(encodedPayload, "base64url").toString();
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expectedSigBuf = Buffer.from(expectedSig, "hex");

    if (
      sigBuf.length !== expectedSigBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedSigBuf)
    ) {
      throw new ForbiddenError("Invalid download token signature");
    }

    const [orderId, expiresAtStr] = payload.split(":");
    if (!orderId || !expiresAtStr) throw new ForbiddenError("Malformed token");

    const expiresAt = new Date(parseInt(expiresAtStr, 10));
    if (expiresAt < new Date()) throw new ForbiddenError("Download token has expired");

    return orderId;
  },

  /**
   * Get file or dynamically stamp PDF with buyer's DRM anti-piracy banner.
   */
  async getFileOrStampedPdf(token: string, fileId: string) {
    const orderId = await this.verifyToken(token);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            files: { where: { id: fileId } },
            creator: {
              select: {
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!order || order.product.files.length === 0) {
      throw new NotFoundError("File");
    }

    const file = order.product.files[0]!;

    // Increment download count
    await prisma.order.update({
      where: { id: orderId },
      data: { downloadCount: { increment: 1 } },
    });

    const isPdf =
      file.fileType === "application/pdf" ||
      file.fileName.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      const creatorName =
        (order.product as any).watermarkPdf !== false
          ? (order.product as any).creator?.name ||
            (order.product as any).creator?.username ||
            "Creator"
          : undefined;

      // Check if actual file exists in S3 storage
      if (file.fileKey && file.fileKey !== "sample") {
        try {
          const s3Obj = await getFileStream(file.fileKey);
          if (s3Obj.Body) {
            let buffer: Buffer;
            if (typeof (s3Obj.Body as any).transformToByteArray === "function") {
              const bytes = await (s3Obj.Body as any).transformToByteArray();
              buffer = Buffer.from(bytes);
            } else if (Buffer.isBuffer(s3Obj.Body)) {
              buffer = s3Obj.Body;
            } else {
              const chunks: any[] = [];
              for await (const chunk of s3Obj.Body as any) {
                chunks.push(chunk);
              }
              buffer = Buffer.concat(chunks);
            }

            // Stamp forensic watermark if enabled
            if ((order.product as any).watermarkPdf !== false) {
              const stampedBytes = await stampPdf(
                buffer,
                order.customerEmail,
                order.id,
                creatorName
              );
              return {
                isPdf: true,
                pdfBytes: stampedBytes,
                fileName: file.fileName.toLowerCase().endsWith(".pdf")
                  ? file.fileName
                  : `${file.fileName}.pdf`,
              };
            } else {
              return {
                isPdf: true,
                pdfBytes: buffer,
                fileName: file.fileName,
              };
            }
          }
        } catch (err: any) {
          console.warn(
            `[DownloadService] Failed to load/stamp real PDF from S3 (${file.fileKey}):`,
            err.message
          );
        }
      }

      // Fallback for sample demo products without S3 upload
      const sampleBytes = await generateStampedSamplePdf(
        order.customerEmail,
        order.id,
        creatorName
      );
      return {
        isPdf: true,
        pdfBytes: sampleBytes,
        fileName: file.fileName.toLowerCase().endsWith(".pdf")
          ? file.fileName
          : `${file.fileName}.pdf`,
      };
    }

    return {
      isPdf: false,
      fileKey: file.fileKey,
      fileName: file.fileName,
      fileType: file.fileType,
    };
  },

  /**
   * Backward-compatible helper.
   */
  async getFileDownloadUrl(token: string, fileId: string) {
    const res = await this.getFileOrStampedPdf(token, fileId);
    return {
      fileKey: (res as any).fileKey || "sample",
      fileName: res.fileName,
      fileType: res.isPdf ? "application/pdf" : (res as any).fileType || "application/octet-stream",
    };
  },
};
