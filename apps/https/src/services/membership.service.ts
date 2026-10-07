import prisma from "@repo/db/client";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/errors.js";

export const membershipService = {
  /**
   * Subscribe a customer to a membership product.
   */
  async subscribe(params: {
    customerId: string;
    productId: string;
    recurrence?: "monthly" | "yearly";
    customerEmail?: string;
    customerName?: string;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: { creator: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.productType !== "membership") {
      throw new BadRequestError("This product is not configured as a membership");
    }

    const recurrence =
      params.recurrence || (product.recurrence as "monthly" | "yearly") || "monthly";
    const durationDays = recurrence === "yearly" ? 365 : 30;

    const startDate = new Date();
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Check if user already has an active membership for this product
    const existing = await prisma.membership.findFirst({
      where: {
        customerId: params.customerId,
        productId: params.productId,
        status: "active",
      },
    });

    if (existing) {
      // Extend existing membership
      const baseTime = (existing.currentPeriodEnd || new Date()).getTime();
      const updated = await prisma.membership.update({
        where: { id: existing.id },
        data: {
          currentPeriodEnd: new Date(baseTime + durationDays * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              priceCents: true,
              currency: true,
              recurrence: true,
            },
          },
          customer: { select: { id: true, name: true, email: true, image: true } },
        },
      });
      return { membership: updated, isExtension: true };
    }

    // Create completed order for initial billing period
    const platformFeeCents = Math.round(product.priceCents * 0.1);
    const creatorRevenueCents = product.priceCents - platformFeeCents;

    const order = await prisma.order.create({
      data: {
        productId: product.id,
        customerId: params.customerId,
        creatorId: product.creatorId,
        customerEmail: params.customerEmail || "member@example.com",
        customerName: params.customerName || "Subscribed Member",
        amountCents: product.priceCents,
        currency: product.currency,
        status: "completed",
        paymentProvider: "polar",
        platformFeeCents,
        creatorRevenueCents,
      },
    });

    // Create Membership record
    const membership = await prisma.membership.create({
      data: {
        customerId: params.customerId,
        productId: product.id,
        creatorId: product.creatorId,
        status: "active",
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            priceCents: true,
            currency: true,
            recurrence: true,
          },
        },
        customer: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    // Increment product sales & revenue
    await prisma.product.update({
      where: { id: product.id },
      data: {
        salesCount: { increment: 1 },
        revenueCents: { increment: BigInt(product.priceCents) },
      },
    });

    return { membership, orderId: order.id, isExtension: false };
  },

  /**
   * Get buyer's active and past memberships.
   */
  async getMySubscriptions(customerId: string) {
    return prisma.membership.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            priceCents: true,
            currency: true,
            recurrence: true,
            creator: {
              select: { id: true, name: true, username: true, image: true },
            },
          },
        },
      },
    });
  },

  /**
   * Creator view: subscriber roster, MRR, active count.
   */
  async getCreatorMembers(creatorId: string) {
    const members = await prisma.membership.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, name: true, email: true, image: true },
        },
        product: {
          select: {
            id: true,
            name: true,
            priceCents: true,
            currency: true,
            recurrence: true,
          },
        },
      },
    });

    const activeMembers = members.filter((m) => m.status === "active");

    // Monthly Recurring Revenue (MRR) = sum of monthly rate of active members
    const mrrCents = activeMembers.reduce((acc, m) => {
      const price = m.product.priceCents;
      return acc + (m.product.recurrence === "yearly" ? Math.round(price / 12) : price);
    }, 0);

    return {
      stats: {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        cancelledMembers: members.filter((m) => m.status === "cancelled").length,
        mrrCents,
      },
      members,
    };
  },

  /**
   * Cancel membership (cancels subscription).
   */
  async cancelMembership(membershipId: string, customerId: string) {
    const mem = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!mem) throw new NotFoundError("Membership");
    if (mem.customerId !== customerId) throw new ForbiddenError("Not authorized");

    return prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "cancelled",
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });
  },

  /**
   * Simulate recurring monthly renewal charge (Demo feature for project evaluation).
   */
  async renewMembership(membershipId: string) {
    const mem = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: { product: true, customer: true },
    });
    if (!mem) throw new NotFoundError("Membership");

    const durationDays = mem.product.recurrence === "yearly" ? 365 : 30;
    const baseTime = (mem.currentPeriodEnd || new Date()).getTime();
    const newEnd = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);

    // Create renewal order
    const platformFeeCents = Math.round(mem.product.priceCents * 0.1);
    const creatorRevenueCents = mem.product.priceCents - platformFeeCents;

    await prisma.order.create({
      data: {
        productId: mem.productId,
        customerId: mem.customerId,
        creatorId: mem.creatorId,
        customerEmail: mem.customer.email,
        customerName: mem.customer.name,
        amountCents: mem.product.priceCents,
        currency: mem.product.currency,
        status: "completed",
        paymentProvider: "polar",
        platformFeeCents,
        creatorRevenueCents,
      },
    });

    // Update product stats
    await prisma.product.update({
      where: { id: mem.productId },
      data: {
        salesCount: { increment: 1 },
        revenueCents: { increment: BigInt(mem.product.priceCents) },
      },
    });

    // Advance period
    return prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "active",
        currentPeriodEnd: newEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
      include: { product: true, customer: true },
    });
  },

  /**
   * Check if customer has active membership access to a product.
   */
  async checkAccess(customerId?: string, productId?: string) {
    if (!customerId || !productId) return { hasAccess: false };

    const activeMem = await prisma.membership.findFirst({
      where: {
        customerId,
        productId,
        status: "active",
      },
    });

    return {
      hasAccess: Boolean(activeMem),
      membership: activeMem,
    };
  },
};
