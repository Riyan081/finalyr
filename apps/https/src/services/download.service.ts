import prisma from "@repo/db/client";
import crypto from "crypto";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * Download service — generates time-limited signed download tokens.
 * After purchase, customers get a token to download product files.
 */
export const downloadService = {
  /**
   * Generate a signed download token for an order.
   * Token expires in 24 hours.
   */
  async generateToken(orderId: string, userId?: string, userEmail?: string) {
    // Find the order
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

    // Verify ownership if user is logged in
    if (userId && order.customerId && order.customerId !== userId) {
      throw new ForbiddenError("You do not have access to this order");
    }

    if (order.status !== "completed") {
      throw new ForbiddenError("This order is not completed");
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Store token (we use the Order model for this — add to a simple cache)
    // In production this would go in Redis. For now we embed it in the URL
    // and verify using HMAC signature
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
        })),
        licenseKeys: order.licenseKeys,
      },
    };
  },

  /**
   * Verify a download token and return the order.
   */
  async verifyToken(token: string) {
    const secret = process.env.DOWNLOAD_TOKEN_SECRET || "download-secret-change-me";

    const [encodedPayload, sig] = token.split(".");
    if (!encodedPayload || !sig) throw new ForbiddenError("Invalid download token");

    const payload = Buffer.from(encodedPayload, "base64url").toString();
    const expectedSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) {
      throw new ForbiddenError("Invalid download token signature");
    }

    const [orderId, expiresAtStr] = payload.split(":");
    if (!orderId || !expiresAtStr) throw new ForbiddenError("Malformed token");

    const expiresAt = new Date(parseInt(expiresAtStr, 10));
    if (expiresAt < new Date()) throw new ForbiddenError("Download token has expired");

    return orderId;
  },

  /**
   * Get a signed S3/MinIO download URL for a file.
   */
  async getFileDownloadUrl(token: string, fileId: string) {
    const orderId = await this.verifyToken(token);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: {
            files: { where: { id: fileId } },
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

    // In production: generate a pre-signed S3 URL
    // For now: return the file key to be streamed by the proxy endpoint
    return {
      fileKey: file.fileKey,
      fileName: file.fileName,
      fileType: file.fileType,
    };
  },
};
