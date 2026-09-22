import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";
import crypto from "crypto";
import { emailService } from "./email.service.js";

/**
 * Order service — create, list, refund.
 * Handles all product types: digital, course, membership, bundle.
 */
export const orderService = {
  /**
   * Create an order after successful payment (called from webhook or verify endpoint).
   * Handles license key generation, membership creation, and bundle access.
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
      select: {
        id: true,
        name: true,
        creatorId: true,
        productType: true,
        recurrence: true,
        bundledProductIds: true,
      },
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

    // Generate license key for all product types
    const licenseKey = crypto
      .randomBytes(16)
      .toString("hex")
      .toUpperCase()
      .match(/.{4}/g)!
      .join("-");

    await prisma.licenseKey.create({
      data: {
        orderId: order.id,
        productId: data.productId,
        licenseKey,
        maxUses: 5,
      },
    });

    // Handle membership creation for subscription products
    if (product.productType === "membership" && data.customerId) {
      const recurrence = product.recurrence || "monthly";
      const periodMonths = recurrence === "yearly" ? 12 : recurrence === "quarterly" ? 3 : 1;
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + periodMonths);

      // Check for existing membership
      const existingMembership = await prisma.membership.findFirst({
        where: {
          customerId: data.customerId,
          productId: data.productId,
          status: "active",
        },
      });

      if (existingMembership) {
        // Extend existing membership
        await prisma.membership.update({
          where: { id: existingMembership.id },
          data: {
            currentPeriodEnd: periodEnd,
            status: "active",
          },
        });
      } else {
        // Create new membership
        await prisma.membership.create({
          data: {
            customerId: data.customerId,
            productId: data.productId,
            creatorId: product.creatorId,
            status: "active",
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
          },
        });
      }
    }

    // Handle bundle purchases — create orders/access for bundled products
    if (product.productType === "bundle" && product.bundledProductIds.length > 0 && data.customerId) {
      for (const bundledProductId of product.bundledProductIds) {
        const bundledProduct = await prisma.product.findUnique({
          where: { id: bundledProductId },
          select: { id: true, creatorId: true, productType: true },
        });
        if (!bundledProduct) continue;

        // Create a sub-order for each bundled product (with $0 amount)
        const subOrder = await prisma.order.create({
          data: {
            productId: bundledProductId,
            customerId: data.customerId,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            creatorId: bundledProduct.creatorId,
            amountCents: 0,
            currency: data.currency,
            status: "completed",
            paymentProvider: data.paymentProvider,
          },
        });

        // Generate license key for bundled product
        const bundledLicense = crypto
          .randomBytes(16)
          .toString("hex")
          .toUpperCase()
          .match(/.{4}/g)!
          .join("-");

        await prisma.licenseKey.create({
          data: {
            orderId: subOrder.id,
            productId: bundledProductId,
            licenseKey: bundledLicense,
            maxUses: 5,
          },
        });
      }
    }

    // Increment product stats
    await prisma.product.update({
      where: { id: data.productId },
      data: {
        salesCount: { increment: 1 },
        revenueCents: { increment: BigInt(data.amountCents) },
      },
    });

    // Send receipt email (fire-and-forget, don't block order creation)
    if (data.customerEmail) {
      const creatorUser = await prisma.user.findUnique({
        where: { id: product.creatorId },
        select: { name: true },
      });

      emailService.sendPurchaseReceipt({
        buyerEmail: data.customerEmail,
        buyerName: data.customerName || "Customer",
        productName: product.name || "Product",
        creatorName: creatorUser?.name || "Creator",
        amountCents: data.amountCents,
        currency: data.currency,
        orderId: order.id,
        licenseKey: licenseKey,
        productType: product.productType || "digital",
      }).catch((err) => console.error("[Email] Receipt failed:", err));
    }

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
            productType: true,
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
              id: true, name: true, thumbnailUrl: true, slug: true, productType: true,
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
      include: {
        product: { select: { productType: true } },
      },
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

    // Cancel membership if this was a membership product
    if (order.product.productType === "membership" && order.customerId) {
      await prisma.membership.updateMany({
        where: {
          customerId: order.customerId,
          productId: order.productId,
          status: "active",
        },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      });
    }

    return { ...updated, amountCents: Number(updated.amountCents) };
  },
};
