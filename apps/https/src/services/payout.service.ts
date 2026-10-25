import prisma from "@repo/db/client";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors.js";
import { analyticsService } from "./analytics.service.js";

export const payoutService = {
  /**
   * Get the creator's payout status, including 30-day holding window breakdown.
   */
  async getCreatorPayoutStatus(creatorId: string) {
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        email: true,
        payoutSchedule: true,
        polarAccountId: true,
        polarOnboarded: true,
        razorpayAccountId: true,
        razorpayOnboarded: true,
      },
    });

    if (!creator) throw new NotFoundError("Creator");

    const overview = await analyticsService.getOverview(creatorId);

    const payouts = await prisma.payout.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      overview,
      connectedGateways: {
        polar: Boolean(creator.polarOnboarded && creator.polarAccountId),
        razorpay: Boolean(creator.razorpayOnboarded && creator.razorpayAccountId),
      },
      payoutSchedule: creator.payoutSchedule || "monthly",
      payouts: payouts.map((p) => ({
        ...p,
        amountCents: Number(p.amountCents),
      })),
    };
  },

  /**
   * Request a creator withdrawal.
   * Enforces the 30-day maturity window — only mature orders (30+ days old) can be withdrawn.
   */
  async requestPayout(creatorId: string, requestedAmountCents?: number) {
    const overview = await analyticsService.getOverview(creatorId);

    if (overview.withdrawableRevenueCents < overview.minimumWithdrawalCents) {
      const minFormatted = (overview.minimumWithdrawalCents / 100).toLocaleString("en-IN");
      const currentFormatted = (overview.withdrawableRevenueCents / 100).toLocaleString("en-IN");
      throw new BadRequestError(
        `Insufficient mature funds. You currently have ₹${currentFormatted} available to withdraw. Minimum threshold is ₹${minFormatted}. Note that sales have a mandatory 30-day holding period before becoming withdrawable.`
      );
    }

    // Check if there is already a pending or processing payout
    const existingPending = await prisma.payout.findFirst({
      where: { creatorId, status: { in: ["pending", "processing"] } },
    });

    if (existingPending) {
      throw new BadRequestError(
        "You already have a payout request under review. Please wait for it to be processed before requesting another."
      );
    }

    const amountToWithdraw = requestedAmountCents
      ? Math.min(requestedAmountCents, overview.withdrawableRevenueCents)
      : overview.withdrawableRevenueCents;

    if (amountToWithdraw < overview.minimumWithdrawalCents) {
      throw new BadRequestError(
        `Requested amount is below minimum withdrawal limit of ₹${(overview.minimumWithdrawalCents / 100).toLocaleString("en-IN")}`
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const payout = await prisma.payout.create({
      data: {
        creatorId,
        amountCents: BigInt(amountToWithdraw),
        currency: "inr",
        status: "pending",
        periodEnd: thirtyDaysAgo,
      },
    });

    return {
      success: true,
      payout: {
        ...payout,
        amountCents: Number(payout.amountCents),
      },
      remainingWithdrawableCents: overview.withdrawableRevenueCents - amountToWithdraw,
    };
  },

  /**
   * Creator payout history.
   */
  async getMyPayoutHistory(creatorId: string) {
    const payouts = await prisma.payout.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
    });

    return payouts.map((p) => ({
      ...p,
      amountCents: Number(p.amountCents),
    }));
  },
};
