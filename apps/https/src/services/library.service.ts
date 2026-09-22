import prisma from "@repo/db/client";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * Library service — buyer's centralized purchase hub.
 * Provides permanent access to purchased products, membership management,
 * and download token regeneration.
 */
export const libraryService = {
  /**
   * Get all purchases for the logged-in buyer.
   * Includes product info, files, license keys, membership status, and download access.
   */
  async getLibrary(userId: string, query: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    creatorId?: string;
  }) {
    const { page = 1, limit = 20, search, type, creatorId } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      customerId: userId,
      status: { in: ["completed", "refunded"] },
    };

    if (creatorId) where.creatorId = creatorId;
    if (type) where.product = { ...where.product, productType: type };
    if (search) {
      where.product = {
        ...where.product,
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              summary: true,
              thumbnailUrl: true,
              productType: true,
              recurrence: true,
              updatedAt: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              files: {
                select: {
                  id: true,
                  fileName: true,
                  fileSizeBytes: true,
                  fileType: true,
                },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
          licenseKeys: {
            select: {
              licenseKey: true,
              uses: true,
              maxUses: true,
              isDisabled: true,
            },
          },
          variant: {
            select: { name: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Fetch active memberships for this user
    const membershipProductIds = orders
      .filter((o) => o.product.productType === "membership")
      .map((o) => o.productId);

    const memberships = membershipProductIds.length > 0
      ? await prisma.membership.findMany({
          where: {
            customerId: userId,
            productId: { in: membershipProductIds },
          },
          select: {
            id: true,
            productId: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            cancelledAt: true,
          },
        })
      : [];

    const membershipMap = new Map(memberships.map((m) => [m.productId, m]));

    // Build library items
    const items = orders.map((order) => {
      const membership = membershipMap.get(order.productId);
      const isRefunded = order.status === "refunded";

      // Determine access status
      let accessStatus: "active" | "expired" | "cancelled" | "refunded" = "active";
      if (isRefunded) {
        accessStatus = "refunded";
      } else if (membership) {
        if (membership.status === "cancelled") {
          accessStatus = membership.currentPeriodEnd && new Date() < membership.currentPeriodEnd ? "active" : "cancelled";
        } else if (membership.status === "expired") {
          accessStatus = "expired";
        } else {
          accessStatus = "active";
        }
      }

      // Check if product was updated after purchase
      const hasUpdates = order.product.updatedAt > order.createdAt;

      return {
        orderId: order.id,
        purchasedAt: order.createdAt,
        amountCents: Number(order.amountCents),
        currency: order.currency,
        status: order.status,
        accessStatus,
        hasUpdates,
        paymentProvider: order.paymentProvider,
        variant: order.variant?.name || null,
        product: {
          id: order.product.id,
          name: order.product.name,
          slug: order.product.slug,
          summary: order.product.summary,
          thumbnailUrl: order.product.thumbnailUrl,
          productType: order.product.productType,
          recurrence: order.product.recurrence,
          fileCount: order.product.files.length,
          files: accessStatus === "active" ? order.product.files.map((f) => ({
            id: f.id,
            fileName: f.fileName,
            fileSizeBytes: f.fileSizeBytes.toString(),
            fileType: f.fileType,
          })) : [],
          creator: order.product.creator,
        },
        licenseKeys: order.licenseKeys,
        membership: membership ? {
          id: membership.id,
          status: membership.status,
          currentPeriodStart: membership.currentPeriodStart,
          currentPeriodEnd: membership.currentPeriodEnd,
          cancelledAt: membership.cancelledAt,
        } : null,
      };
    });

    // Get unique creators for filter dropdown
    const creatorIds = new Set(orders.map((o) => o.product.creator.id));
    const creators = Array.from(
      new Map(
        orders.map((o) => [o.product.creator.id, o.product.creator])
      ).values()
    );

    return {
      items,
      creators,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Cancel a membership. Access stays until current period ends.
   */
  async cancelMembership(userId: string, membershipId: string) {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: { id: true, customerId: true, status: true, productId: true },
    });

    if (!membership) throw new NotFoundError("Membership");
    if (membership.customerId !== userId) {
      throw new ForbiddenError("You do not own this membership");
    }
    if (membership.status !== "active") {
      throw new ForbiddenError("Membership is not active");
    }

    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    return updated;
  },

  /**
   * Restart a cancelled membership.
   */
  async restartMembership(userId: string, membershipId: string) {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      select: {
        id: true,
        customerId: true,
        status: true,
        productId: true,
      },
    });

    if (!membership) throw new NotFoundError("Membership");
    if (membership.customerId !== userId) {
      throw new ForbiddenError("You do not own this membership");
    }
    if (membership.status === "active") {
      throw new ForbiddenError("Membership is already active");
    }

    // Restart with a new period
    const product = await prisma.product.findUnique({
      where: { id: membership.productId },
      select: { recurrence: true },
    });

    const recurrence = product?.recurrence || "monthly";
    const periodMonths = recurrence === "yearly" ? 12 : recurrence === "quarterly" ? 3 : 1;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + periodMonths);

    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "active",
        cancelledAt: null,
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
      },
    });

    return updated;
  },
};
