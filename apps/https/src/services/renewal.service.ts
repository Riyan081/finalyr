import prisma from "@repo/db/client";
import { emailService } from "./email.service.js";

/**
 * Membership renewal service.
 * 
 * In a full production setup, this would be triggered by payment provider webhooks
 * (e.g., Stripe subscription.invoice.paid). For now, this provides:
 * 
 * 1. expireOverdueMemberships() — marks memberships as expired when their period ends
 * 2. Webhook-compatible renewal handler for when payment providers confirm renewal
 * 
 * Call expireOverdueMemberships() on a cron schedule (e.g., every hour).
 */
export const renewalService = {
  /**
   * Check all active/cancelled memberships and expire those past their period end.
   * Should be called on a cron schedule (e.g., every hour or daily).
   */
  async expireOverdueMemberships() {
    const now = new Date();

    // Find memberships that have passed their billing period
    const overdueActive = await prisma.membership.findMany({
      where: {
        status: "active",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: { lt: now },
      },
      include: {
        customer: { select: { email: true, name: true } },
        product: { select: { name: true } },
      },
    });

    const overdueCancelled = await prisma.membership.findMany({
      where: {
        status: "cancelled",
        currentPeriodEnd: { lt: now },
      },
      include: {
        customer: { select: { email: true, name: true } },
        product: { select: { name: true } },
      },
    });

    const toExpire = [...overdueActive, ...overdueCancelled];

    let expiredCount = 0;
    for (const membership of toExpire) {
      await prisma.membership.update({
        where: { id: membership.id },
        data: { status: "expired" },
      });

      // Send expiry notification
      emailService.sendMembershipUpdate({
        buyerEmail: membership.customer.email,
        buyerName: membership.customer.name,
        productName: membership.product.name,
        action: "expired",
      }).catch(() => {}); // fire-and-forget

      expiredCount++;
    }

    if (expiredCount > 0) {
      console.log(`[Renewal] Expired ${expiredCount} overdue memberships`);
    }

    return { expiredCount };
  },

  /**
   * Renew a membership after successful payment.
   * Called from payment webhook when a recurring charge succeeds.
   */
  async renewMembership(membershipId: string) {
    const membership = await prisma.membership.findUnique({
      where: { id: membershipId },
      include: {
        product: { select: { recurrence: true } },
      },
    });

    if (!membership) return null;

    const recurrence = membership.product.recurrence || "monthly";
    const periodMonths = recurrence === "yearly" ? 12 : recurrence === "quarterly" ? 3 : 1;

    const newPeriodStart = new Date();
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + periodMonths);

    const updated = await prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: "active",
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    });

    return updated;
  },

  /**
   * Get membership stats for admin dashboard.
   */
  async getMembershipStats() {
    const [active, cancelled, expired, total] = await Promise.all([
      prisma.membership.count({ where: { status: "active" } }),
      prisma.membership.count({ where: { status: "cancelled" } }),
      prisma.membership.count({ where: { status: "expired" } }),
      prisma.membership.count(),
    ]);

    return { active, cancelled, expired, total };
  },
};
