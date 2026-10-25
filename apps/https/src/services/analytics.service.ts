import prisma from "@repo/db/client";

export const analyticsService = {
  async getOverview(creatorId: string) {
    // 30-day maturity threshold for withdrawals
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      revenueAgg,
      totalSales,
      productCount,
      followerCount,
      totalCreatorRevenueAgg,
      withdrawableAgg,
      pendingPayoutAgg,
      paidOutAgg,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { creatorId, status: "completed" },
        _sum: { amountCents: true },
      }),
      prisma.order.count({ where: { creatorId, status: "completed" } }),
      prisma.product.count({ where: { creatorId, status: "published" } }),
      prisma.follower.count({ where: { creatorId } }),
      // Total net creator earnings (after platform fees) across all completed orders
      prisma.order.aggregate({
        where: { creatorId, status: "completed" },
        _sum: { creatorRevenueCents: true },
      }),
      // Revenue from orders completed 30+ days ago (mature revenue)
      prisma.order.aggregate({
        where: { creatorId, status: "completed", createdAt: { lte: thirtyDaysAgo } },
        _sum: { creatorRevenueCents: true },
      }),
      // Pending payouts awaiting admin processing
      prisma.payout.aggregate({
        where: { creatorId, status: "pending" },
        _sum: { amountCents: true },
      }),
      // Already paid or currently processing
      prisma.payout.aggregate({
        where: { creatorId, status: { in: ["completed", "processing"] } },
        _sum: { amountCents: true },
      }),
    ]);

    const totalCreatorRevenue = Number(totalCreatorRevenueAgg._sum.creatorRevenueCents ?? 0);
    const matureRevenue = Number(withdrawableAgg._sum.creatorRevenueCents ?? 0);
    const pendingPayout = Number(pendingPayoutAgg._sum.amountCents ?? 0);
    const alreadyPaid = Number(paidOutAgg._sum.amountCents ?? 0);

    // Escrow revenue is net sales within the last 30 days still in fraud/chargeback holding
    const escrowRevenue = Math.max(0, totalCreatorRevenue - matureRevenue);

    // Withdrawable revenue is mature revenue minus already paid minus currently pending
    const withdrawable = Math.max(0, matureRevenue - alreadyPaid - pendingPayout);

    return {
      totalRevenueCents: Number(revenueAgg._sum.amountCents ?? 0),
      creatorNetRevenueCents: totalCreatorRevenue,
      escrowRevenueCents: escrowRevenue,
      alreadyPaidOutCents: alreadyPaid,
      pendingPayoutCents: pendingPayout,
      totalSales,
      productCount,
      followerCount,
      withdrawableRevenueCents: withdrawable,
      minimumWithdrawalCents: 10_000, // ₹100 / $100 depending on currency
      holdingWindowDays: 30,
    };
  },

  async getRevenueByDay(creatorId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: { creatorId, status: "completed", createdAt: { gte: since } },
      select: { amountCents: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const byDay: Record<string, number> = {};
    for (const order of orders) {
      const day = order.createdAt.toISOString().split("T")[0]!;
      byDay[day] = (byDay[day] ?? 0) + Number(order.amountCents);
    }

    const result: { date: string; revenueCents: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]!;
      result.push({ date: key, revenueCents: byDay[key] ?? 0 });
    }

    return result;
  },

  async getTopProducts(creatorId: string, limit = 5) {
    const products = await prisma.product.findMany({
      where: { creatorId },
      orderBy: { salesCount: "desc" },
      take: limit,
      select: {
        id: true, name: true, slug: true, thumbnailUrl: true,
        priceCents: true, salesCount: true, revenueCents: true,
        ratingAvg: true, status: true,
      },
    });

    return products.map((p) => ({ ...p, revenueCents: Number(p.revenueCents) }));
  },

  async getRecentSales(creatorId: string, limit = 10) {
    const orders = await prisma.order.findMany({
      where: { creatorId, status: { in: ["completed", "refunded"] } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true, amountCents: true, status: true, createdAt: true,
        customerEmail: true, customerName: true,
        product: { select: { id: true, name: true, thumbnailUrl: true } },
      },
    });

    return orders.map((o) => ({ ...o, amountCents: Number(o.amountCents) }));
  },
};
