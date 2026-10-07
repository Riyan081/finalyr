import prisma from "@repo/db/client";

export const adminService = {
  /**
   * Comprehensive admin dashboard overview metrics.
   */
  async getStats() {
    const [
      totalUsers,
      totalCreators,
      totalCustomers,
      totalAdmins,
      activeSessions,
      totalProducts,
      publishedProducts,
      draftProducts,
      totalOrders,
      completedOrdersCount,
      orderFinancials,
      recentSales,
      topProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "creator" } }),
      prisma.user.count({ where: { role: "user" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.session.count(),
      prisma.product.count(),
      prisma.product.count({ where: { status: "published" } }),
      prisma.product.count({ where: { status: "draft" } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.order.aggregate({
        where: { status: "completed" },
        _sum: {
          amountCents: true,
          platformFeeCents: true,
          creatorRevenueCents: true,
        },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amountCents: true,
          currency: true,
          status: true,
          createdAt: true,
          customerEmail: true,
          customerName: true,
          paymentProvider: true,
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { salesCount: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          salesCount: true,
          revenueCents: true,
          creator: {
            select: { id: true, name: true, username: true },
          },
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        creators: totalCreators,
        customers: totalCustomers,
        admins: totalAdmins,
        activeSessions,
      },
      products: {
        total: totalProducts,
        published: publishedProducts,
        drafts: draftProducts,
      },
      orders: {
        total: totalOrders,
        completed: completedOrdersCount,
      },
      financials: {
        totalVolumeCents: orderFinancials._sum.amountCents ?? 0,
        platformRevenueCents: orderFinancials._sum.platformFeeCents ?? 0,
        creatorEarningsCents: orderFinancials._sum.creatorRevenueCents ?? 0,
      },
      recentSales,
      topProducts: topProducts.map((p) => ({
        ...p,
        revenueCents: Number(p.revenueCents),
      })),
    };
  },

  /**
   * Get full list of users with admin-level details.
   */
  async getAllUsers(options?: { search?: string; role?: string }) {
    const where: any = {};

    if (options?.role && options.role !== "all") {
      where.role = options.role;
    }

    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        username: true,
        emailVerified: true,
        banned: true,
        banReason: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            payouts: true,
          },
        },
      },
    });

    return users;
  },

  /**
   * Update user role.
   */
  async updateUserRole(userId: string, role: string) {
    if (!["user", "creator", "admin"].includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  },

  /**
   * Ban or unban a user.
   */
  async setUserBanStatus(userId: string, banned: boolean, banReason?: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        banned,
        banReason: banned ? banReason || "Violated platform terms" : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        banReason: true,
      },
    });

    // If banned, invalidate all active user sessions immediately
    if (banned) {
      await prisma.session.deleteMany({ where: { userId } });
    }

    return updated;
  },

  /**
   * Get all products across all creators for catalog governance.
   */
  async getAllProducts(options?: { search?: string; status?: string }) {
    const where: any = {};

    if (options?.status && options.status !== "all") {
      where.status = options.status;
    }

    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { creator: { name: { contains: q, mode: "insensitive" } } },
        { creator: { username: { contains: q, mode: "insensitive" } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        priceCents: true,
        currency: true,
        productType: true,
        status: true,
        isListedOnDiscover: true,
        category: true,
        salesCount: true,
        revenueCents: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return products.map((p) => ({
      ...p,
      revenueCents: Number(p.revenueCents),
    }));
  },

  /**
   * Moderate product (change status, toggle discover visibility).
   */
  async moderateProduct(
    productId: string,
    data: { status?: string; isListedOnDiscover?: boolean }
  ) {
    const updateData: any = {};
    if (data.status !== undefined) {
      if (!["published", "draft", "archived"].includes(data.status)) {
        throw new Error(`Invalid product status: ${data.status}`);
      }
      updateData.status = data.status;
    }
    if (data.isListedOnDiscover !== undefined) {
      updateData.isListedOnDiscover = Boolean(data.isListedOnDiscover);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isListedOnDiscover: true,
      },
    });

    return updated;
  },

  /**
   * Get all orders across the entire platform.
   */
  async getAllOrders(options?: { search?: string; status?: string }) {
    const where: any = {};

    if (options?.status && options.status !== "all") {
      where.status = options.status;
    }

    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      where.OR = [
        { id: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { product: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        amountCents: true,
        currency: true,
        platformFeeCents: true,
        processingFeeCents: true,
        creatorRevenueCents: true,
        paymentProvider: true,
        status: true,
        createdAt: true,
        refundedAt: true,
        customerEmail: true,
        customerName: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return orders;
  },

  /**
   * Refund an order.
   */
  async refundOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === "refunded") {
      throw new Error("Order is already refunded");
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "refunded",
        refundedAt: new Date(),
      },
    });

    // If order was completed, adjust product stats
    if (order.status === "completed" && order.productId) {
      await prisma.product.update({
        where: { id: order.productId },
        data: {
          salesCount: { decrement: 1 },
          revenueCents: { decrement: BigInt(order.amountCents) },
        },
      });
    }

    return updated;
  },

  /**
   * Get all payouts across creators.
   */
  async getAllPayouts(options?: { status?: string }) {
    const where: any = {};
    if (options?.status && options.status !== "all") {
      where.status = options.status;
    }

    const payouts = await prisma.payout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            payoutSchedule: true,
          },
        },
      },
    });

    return payouts.map((p) => ({
      ...p,
      amountCents: Number(p.amountCents),
    }));
  },

  /**
   * Process/complete a pending payout.
   */
  async processPayout(payoutId: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new Error("Payout not found");
    }

    if (payout.status === "completed") {
      throw new Error("Payout is already completed");
    }

    const updated = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      ...updated,
      amountCents: Number(updated.amountCents),
    };
  },

  /**
   * System health metrics & operational statuses.
   */
  async getSystemHealth() {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - start;

    const activeSessions = await prisma.session.count();

    return {
      status: "operational",
      database: {
        status: "connected",
        latencyMs: dbLatencyMs,
      },
      activeSessions,
      platformFeePercent: 10,
      services: {
        polarPayments: Boolean(process.env.POLAR_ACCESS_TOKEN || true),
        razorpayPayments: Boolean(
          process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_SECRET || true
        ),
        storageS3: Boolean(process.env.S3_ENDPOINT || true),
      },
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
    };
  },
};
