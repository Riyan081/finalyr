import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";
import crypto from "crypto";

/**
 * Order service — create, list, refund.
 * Uses correct schema: customerEmail, customerName, creatorId, licenseKeys relation.
 */
export const orderService = {
  /**
   * Create an order after successful payment (called from webhook or verify endpoint).
   */
  async createFromWebhook(data: {
    paymentProvider: "polar" | "razorpay";
    polarOrderId?: string;
    polarCheckoutId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    productId: string;
    variantId?: string;
    customerId?: string;
    customerEmail: string;
    customerName?: string;
    amountCents: number;
    currency: string;
    affiliateId?: string;
    discountCodeId?: string;
    discountAmountCents?: number;
    platformFeeCents?: number;
    creatorRevenueCents?: number;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { id: true, creatorId: true, productType: true },
    });
    if (!product) throw new NotFoundError("Product");

    const order = await prisma.order.create({
      data: {
        productId: data.productId,
        variantId: data.variantId,
        customerId: data.customerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        creatorId: product.creatorId,
        amountCents: data.amountCents,
        currency: data.currency,
        status: "completed",
        paymentProvider: data.paymentProvider,
        polarOrderId: data.polarOrderId,
        polarCheckoutId: data.polarCheckoutId,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        razorpaySignature: data.razorpaySignature,
        affiliateId: data.affiliateId,
        discountCodeId: data.discountCodeId,
        discountAmountCents: data.discountAmountCents ?? 0,
        platformFeeCents: data.platformFeeCents ?? 0,
        creatorRevenueCents: data.creatorRevenueCents ?? data.amountCents,
      },
    });

    // Create license key for digital and software products
    if (product.productType === "digital" || product.productType === "software") {
      const part = () => crypto.randomBytes(2).toString("hex").toUpperCase();
      const licenseKey = `DIGI-${part()}-${part()}-${part()}`;

      await prisma.licenseKey.create({
        data: {
          orderId: order.id,
          productId: data.productId,
          licenseKey,
          maxUses: 5,
        },
      });
    }

    // Increment product stats
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        salesCount: { increment: 1 },
        revenueCents: { increment: BigInt(data.amountCents) },
      },
    });

    return order;
  },

  /**
   * Get all orders for a creator (their sales).
   */
  async getCreatorSales(
    creatorId: string,
    query: { page?: number; limit?: number; status?: string; productId?: string }
  ) {
    const { page = 1, limit = 20, status, productId } = query;
    const skip = (page - 1) * limit;

    const where: any = { creatorId };
    if (status) where.status = status;
    if (productId) where.productId = productId;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, thumbnailUrl: true, slug: true } },
          customer: { select: { name: true, email: true, image: true } },
          variant: { select: { name: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => ({ ...o, amountCents: Number(o.amountCents) })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get a single order with ownership check.
   */
  async getOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: {
            id: true, name: true, thumbnailUrl: true, slug: true, creatorId: true,
            creator: { select: { name: true, username: true } },
            files: { select: { id: true, fileName: true, fileType: true, fileSizeBytes: true } },
          },
        },
        customer: { select: { name: true, email: true } },
        variant: { select: { name: true } },
        licenseKeys: { select: { licenseKey: true, uses: true, maxUses: true, isDisabled: true } },
      },
    });

    if (!order) throw new NotFoundError("Order");
    if (order.customerId !== userId && order.creatorId !== userId) {
      throw new NotFoundError("Order");
    }

    return { ...order, amountCents: Number(order.amountCents) };
  },

  /**
   * Get all purchases for a customer.
   */
  async getCustomerPurchases(customerId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId, status: "completed" },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true, name: true, thumbnailUrl: true, slug: true,
              creator: { select: { name: true, username: true } },
            },
          },
          variant: { select: { name: true } },
        },
      }),
      prisma.order.count({ where: { customerId, status: "completed" } }),
    ]);

    return {
      orders: orders.map((o) => ({ ...o, amountCents: Number(o.amountCents) })),
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Refund an order (creator only).
   */
  async refund(orderId: string, creatorId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, creatorId, status: "completed" },
    });
    if (!order) throw new NotFoundError("Order");

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: "refunded", refundedAt: new Date() },
    });

    await prisma.product.update({
      where: { id: order.productId },
      data: { revenueCents: { decrement: BigInt(order.amountCents) } },
    });

    return { ...updated, amountCents: Number(updated.amountCents) };
  },
};
