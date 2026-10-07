import prisma from "@repo/db/client";
import crypto from "crypto";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * Generate a clean 16-character license key formatted as:
 * DIGI-XXXX-XXXX-XXXX
 */
export function formatLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No easily confused chars (I, O, 0, 1)
  const part = (len: number) => {
    let res = "";
    const bytes = crypto.randomBytes(len);
    for (let i = 0; i < len; i++) {
      res += chars[bytes[i]! % chars.length];
    }
    return res;
  };
  return `DIGI-${part(4)}-${part(4)}-${part(4)}`;
}

export const licenseService = {
  /**
   * Generate and store a new license key for an order.
   */
  async generateKey(orderId: string, productId: string, maxUses: number = 5) {
    const key = formatLicenseKey();
    const record = await prisma.licenseKey.create({
      data: {
        orderId,
        productId,
        licenseKey: key,
        maxUses,
        uses: 0,
        isDisabled: false,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    return record;
  },

  /**
   * Public Gumroad v2-compatible license verification endpoint.
   * Called by software apps (desktop, plugins, mobile) on activation.
   */
  async verifyKey(licenseKey: string, incrementUses: boolean = true) {
    const cleanKey = licenseKey.trim().toUpperCase();

    const license = await prisma.licenseKey.findUnique({
      where: { licenseKey: cleanKey },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        order: {
          select: {
            id: true,
            customerEmail: true,
            customerName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!license) {
      return {
        success: false,
        valid: false,
        message: "Invalid license key: not found in platform registry",
      };
    }

    if (license.isDisabled) {
      return {
        success: false,
        valid: false,
        message: "License key has been revoked or disabled by creator",
        uses: license.uses,
        maxUses: license.maxUses,
      };
    }

    if (license.order?.status === "refunded") {
      return {
        success: false,
        valid: false,
        message: "Order associated with this license was refunded",
        uses: license.uses,
        maxUses: license.maxUses,
      };
    }

    if (incrementUses && license.uses >= license.maxUses) {
      return {
        success: false,
        valid: false,
        message: `Activation limit exceeded: ${license.uses} of ${license.maxUses} seats in use. Deactivate an existing device first.`,
        uses: license.uses,
        maxUses: license.maxUses,
      };
    }

    // Increment use count if requested
    let currentUses = license.uses;
    if (incrementUses) {
      const updated = await prisma.licenseKey.update({
        where: { id: license.id },
        data: { uses: { increment: 1 } },
        select: { uses: true },
      });
      currentUses = updated.uses;
    }

    return {
      success: true,
      valid: true,
      uses: currentUses,
      maxUses: license.maxUses,
      key: license.licenseKey,
      product: license.product,
      order: {
        id: license.order.id,
        customerEmail: license.order.customerEmail,
        customerName: license.order.customerName,
        createdAt: license.order.createdAt,
      },
      message: `License verified successfully (${currentUses}/${license.maxUses} seats active)`,
    };
  },

  /**
   * Decrement license use count (e.g. app uninstalled or machine deactivated).
   */
  async decrementKey(licenseKey: string) {
    const cleanKey = licenseKey.trim().toUpperCase();
    const license = await prisma.licenseKey.findUnique({
      where: { licenseKey: cleanKey },
    });

    if (!license) {
      throw new NotFoundError("License key");
    }

    if (license.uses <= 0) {
      return {
        success: true,
        valid: true,
        uses: 0,
        maxUses: license.maxUses,
        message: "License has 0 active activations",
      };
    }

    const updated = await prisma.licenseKey.update({
      where: { id: license.id },
      data: { uses: { decrement: 1 } },
      select: { uses: true, maxUses: true, licenseKey: true },
    });

    return {
      success: true,
      valid: true,
      uses: updated.uses,
      maxUses: updated.maxUses,
      key: updated.licenseKey,
      message: `Device deactivated. Available seats: ${updated.maxUses - updated.uses}/${updated.maxUses}`,
    };
  },

  /**
   * Get all license keys for a creator's products.
   */
  async getCreatorKeys(creatorId: string) {
    return prisma.licenseKey.findMany({
      where: {
        product: { creatorId },
      },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        order: { select: { id: true, customerEmail: true, createdAt: true } },
      },
    });
  },

  /**
   * Toggle disabled status of a license key.
   */
  async toggleDisableKey(keyId: string, creatorId: string) {
    const license = await prisma.licenseKey.findUnique({
      where: { id: keyId },
      include: { product: true },
    });

    if (!license) throw new NotFoundError("License key");
    if (license.product.creatorId !== creatorId) {
      throw new ForbiddenError("Not authorized to manage this license key");
    }

    const updated = await prisma.licenseKey.update({
      where: { id: keyId },
      data: { isDisabled: !license.isDisabled },
      select: { id: true, licenseKey: true, isDisabled: true },
    });

    return updated;
  },
};
