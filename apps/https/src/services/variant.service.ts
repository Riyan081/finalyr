import prisma from "@repo/db/client";
import type {
  CreateVariantInput,
  UpdateVariantInput,
} from "@repo/common/schemas";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

// ─── Service ─────────────────────────────────────────────────────

export const variantService = {
  /**
   * Add a variant to a product.
   */
  async create(productId: string, creatorId: string, data: CreateVariantInput) {
    // Verify product ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: data.name,
        priceCents: data.priceCents,
        description: data.description,
        sortOrder: data.sortOrder,
        maxPurchaseCount: data.maxPurchaseCount,
      },
    });

    return variant;
  },

  /**
   * Update a variant. Verifies product ownership.
   */
  async update(
    productId: string,
    variantId: string,
    creatorId: string,
    data: UpdateVariantInput
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    });

    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Variant");
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data,
    });

    return updated;
  },

  /**
   * Delete a variant. Verifies product ownership.
   */
  async remove(productId: string, variantId: string, creatorId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    });

    if (!variant || variant.productId !== productId) {
      throw new NotFoundError("Variant");
    }

    await prisma.productVariant.delete({ where: { id: variantId } });

    return { deleted: true };
  },

  /**
   * List all variants for a product.
   */
  async listByProduct(productId: string) {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });

    return variants;
  },
};
