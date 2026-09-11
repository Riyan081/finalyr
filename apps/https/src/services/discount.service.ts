import prisma from "@repo/db/client";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

/**
 * Discount code service — CRUD and validation.
 * Uses DiscountCode model from schema.
 */
export const discountService = {
  /**
   * Create a discount code (productId is required by schema).
   */
  async create(
    creatorId: string,
    data: {
      code: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      productId: string;
      maxUses?: number | null;
      validUntil?: Date | string | null;
    }
  ) {
    const code = (data.code || "").toUpperCase().trim();
    if (!code) throw new BadRequestError("Discount code is required");
    if (!data.productId) throw new BadRequestError("Product is required");

    const discountValue = Number(data.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      throw new BadRequestError("Discount value must be a positive number");
    }
    if (data.discountType === "percentage" && discountValue > 100) {
      throw new BadRequestError("Percentage discount cannot exceed 100%");
    }

    // Check code uniqueness for this product
    const existing = await prisma.discountCode.findFirst({
      where: { code, productId: data.productId },
    });
    if (existing) throw new BadRequestError("Discount code already exists for this product");

    // Verify creator owns the product
    const product = await prisma.product.findFirst({
      where: { id: data.productId, creatorId },
    });
    if (!product) throw new NotFoundError("Product");

    // Parse validUntil safely
    let validUntilDate: Date | null = null;
    if (data.validUntil) {
      const parsed = new Date(data.validUntil);
      if (!isNaN(parsed.getTime())) {
        validUntilDate = parsed;
      }
    }

    // Parse maxUses safely
    let maxUsesCount: number | null = null;
    if (data.maxUses !== undefined && data.maxUses !== null && data.maxUses !== ("" as any)) {
      const parsedUses = parseInt(String(data.maxUses), 10);
      if (!isNaN(parsedUses) && parsedUses > 0) {
        maxUsesCount = parsedUses;
      }
    }

    return prisma.discountCode.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue,
        productId: data.productId,
        creatorId,
        maxUses: maxUsesCount,
        validUntil: validUntilDate,
      },
    });
  },

  /**
   * Validate a discount code for a product.
   */
  async validate(code: string, productId: string) {
    const discount = await prisma.discountCode.findFirst({
      where: {
        code: code.toUpperCase(),
        productId,
      },
    });

    if (!discount) throw new NotFoundError("Discount code");

    if (discount.validUntil && discount.validUntil < new Date()) {
      throw new BadRequestError("Discount code has expired");
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      throw new BadRequestError("Discount code has reached its usage limit");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { priceCents: true },
    });
    if (!product) throw new NotFoundError("Product");

    let discountedCents = product.priceCents;
    if (discount.discountType === "percentage") {
      discountedCents = Math.round(product.priceCents * (1 - discount.discountValue / 100));
    } else {
      discountedCents = Math.max(0, product.priceCents - discount.discountValue);
    }

    return {
      discount: {
        id: discount.id,
        code: discount.code,
        type: discount.discountType,
        value: discount.discountValue,
      },
      originalPriceCents: product.priceCents,
      discountedPriceCents: discountedCents,
      savingsCents: product.priceCents - discountedCents,
    };
  },

  /**
   * Increment usage after successful purchase.
   */
  async incrementUse(discountId: string) {
    await prisma.discountCode.update({
      where: { id: discountId },
      data: { currentUses: { increment: 1 } },
    });
  },

  /**
   * List discount codes for a creator.
   */
  async list(creatorId: string) {
    return prisma.discountCode.findMany({
      where: { creatorId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Delete a discount code.
   */
  async delete(discountId: string, creatorId: string) {
    const discount = await prisma.discountCode.findFirst({
      where: { id: discountId, creatorId },
    });
    if (!discount) throw new NotFoundError("Discount");

    await prisma.discountCode.delete({ where: { id: discountId } });
    return { deleted: true };
  },
};
