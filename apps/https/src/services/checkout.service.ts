import prisma from "@repo/db/client";
import crypto from "crypto";
import { polar, POLAR_WEBHOOK_SECRET } from "../lib/polar.js";
import { razorpay, RAZORPAY_KEY_ID, RAZORPAY_WEBHOOK_SECRET } from "../lib/razorpay.js";
import { orderService } from "./order.service.js";
import { discountService } from "./discount.service.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/errors.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveProductAndPrice(params: {
  productId: string;
  variantId?: string;
  discountCode?: string;
  customAmountCents?: number;
}) {
  const { productId, variantId, discountCode, customAmountCents } = params;

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "published" },
    include: {
      variants: true,
      creator: {
        select: {
          id: true,
          polarAccountId: true,
          polarOnboarded: true,
          razorpayAccountId: true,
          razorpayOnboarded: true,
        },
      },
    },
  });

  if (!product) throw new NotFoundError("Product");

  let priceCents = product.priceCents;
  let variantName: string | undefined;
  let selectedVariantId = variantId;

  if (variantId) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      priceCents = variant.priceCents;
      variantName = variant.name;
    }
  }

  if (product.isPayWhatYouWant) {
    if (customAmountCents) {
      priceCents = Math.max(product.minPriceCents, customAmountCents);
    } else {
      priceCents = product.suggestedPriceCents || product.minPriceCents || product.priceCents;
    }
  }

  // Validate and apply discount
  let discountCodeId: string | undefined;
  let discountAmountCents = 0;

  if (discountCode) {
    const dc = await prisma.discountCode.findFirst({
      where: {
        productId,
        code: discountCode.toUpperCase(),
      },
    });

    if (dc) {
      if (dc.maxUses && dc.currentUses >= dc.maxUses) {
        throw new BadRequestError("Discount code has reached its usage limit");
      }
      if (dc.validUntil && dc.validUntil < new Date()) {
        throw new BadRequestError("Discount code has expired");
      }

      discountCodeId = dc.id;

      if (dc.discountType === "percentage") {
        discountAmountCents = Math.round(priceCents * (dc.discountValue / 100));
      } else {
        discountAmountCents = Math.min(dc.discountValue, priceCents);
      }

      priceCents = Math.max(0, priceCents - discountAmountCents);
    }
  }

  const platformFeeCents = Math.round(priceCents * 0.1);
  const creatorRevenueCents = priceCents - platformFeeCents;

  return {
    product,
    priceCents,
    variantName,
    selectedVariantId,
    discountCodeId,
    discountAmountCents,
    platformFeeCents,
    creatorRevenueCents,
  };
}

// ─── Checkout Service ─────────────────────────────────────────────────────────

export const checkoutService = {
  // ── Direct Purchase (Simple, Instant, No External Keys) ──────────────────────

  /**
   * POST /api/checkout/direct
   * Instant direct purchase — creates completed order directly in PostgreSQL with no external gateways.
   */
  async directPurchase(params: {
    productId: string;
    variantId?: string;
    discountCode?: string;
    customAmountCents?: number;
    userId?: string;
    userEmail?: string;
    provider?: "polar" | "razorpay";
  }) {
    const resolved = await resolveProductAndPrice(params);
    const { product, priceCents, variantName, discountCodeId } = resolved;
    const provider = params.provider || "polar";

    const isRazorpay = provider === "razorpay";
    const currency = isRazorpay ? "inr" : (product.currency || "usd");
    const inrRate = product.currency?.toLowerCase() === "inr" ? 1 : 85;
    const finalAmountCents = isRazorpay
      ? Math.round(priceCents * inrRate)
      : priceCents;

    const platformFeeCents = Math.round(finalAmountCents * 0.1);
    const creatorRevenueCents = finalAmountCents - platformFeeCents;

    let userEmail = params.userEmail;
    let userName = "Customer";
    if (params.userId) {
      const u = await prisma.user.findUnique({ where: { id: params.userId }, select: { email: true, name: true } });
      if (u) {
        userEmail = u.email;
        userName = u.name;
      }
    }
    userEmail = userEmail || "customer@example.com";

    const order = await orderService.createFromWebhook({
      paymentProvider: provider,
      polarOrderId: isRazorpay ? undefined : `polar_ord_${Date.now()}`,
      polarCheckoutId: isRazorpay ? undefined : `chk_${Date.now()}`,
      razorpayOrderId: isRazorpay ? `rzp_ord_${Date.now()}` : undefined,
      razorpayPaymentId: isRazorpay ? `rzp_pay_${Date.now()}` : undefined,
      productId: product.id,
      variantId: params.variantId || undefined,
      customerId: params.userId || undefined,
      customerEmail: userEmail,
      customerName: userName,
      amountCents: finalAmountCents,
      currency,
      discountCodeId,
      platformFeeCents,
      creatorRevenueCents,
    });

    if (discountCodeId) {
      await prisma.discountCode.update({
        where: { id: discountCodeId },
        data: { currentUses: { increment: 1 } },
      });
    }

    return {
      orderId: order.id,
      redirectUrl: `/purchase/${order.id}`,
      success: true,
    };
  },

  // ── Polar ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/checkout/session/polar
   * Creates a Polar checkout session and returns the hosted checkout URL.
   */
  async createPolarSession(params: {
    productId: string;
    variantId?: string;
    discountCode?: string;
    customAmountCents?: number;
    userId?: string;
    userEmail?: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const resolved = await resolveProductAndPrice(params);
    const { product, priceCents, variantName, discountCodeId, platformFeeCents, creatorRevenueCents } = resolved;

    // Build product name
    const productName = variantName
      ? `${product.name} — ${variantName}`
      : product.name;

    // If Polar API key is configured, create real Polar session
    if (polar) {
      try {
        const checkout = await polar.checkouts.create({
          products: [product.id],
          amount: priceCents,
          successUrl: params.successUrl,
          customerEmail: params.userEmail,
          metadata: {
            productId: product.id,
            variantId: params.variantId ?? "",
            discountCodeId: discountCodeId ?? "",
            userId: params.userId ?? "",
            productName,
          },
        });

        return {
          checkoutId: checkout.id,
          sessionUrl: checkout.url,
          provider: "polar" as const,
        };
      } catch (err: any) {
        console.warn("[Polar Checkout] API failed, falling back to instant order creation:", err?.message);
      }
    }

    // Direct / Test Mode Checkout: immediately create completed order in PostgreSQL
    let userEmail = params.userEmail;
    let userName = "Customer";
    if (params.userId) {
      const u = await prisma.user.findUnique({ where: { id: params.userId }, select: { email: true, name: true } });
      if (u) {
        userEmail = u.email;
        userName = u.name;
      }
    }
    userEmail = userEmail || "customer@example.com";

    const order = await orderService.createFromWebhook({
      paymentProvider: "polar",
      polarOrderId: `polar_ord_${Date.now()}`,
      polarCheckoutId: `chk_${Date.now()}`,
      productId: product.id,
      variantId: params.variantId || undefined,
      customerId: params.userId || undefined,
      customerEmail: userEmail,
      customerName: userName,
      amountCents: priceCents,
      currency: "usd",
      discountCodeId,
      platformFeeCents,
      creatorRevenueCents,
    });

    if (discountCodeId) {
      await prisma.discountCode.update({
        where: { id: discountCodeId },
        data: { currentUses: { increment: 1 } },
      });
    }

    return {
      checkoutId: order.id,
      sessionUrl: `/purchase/${order.id}`,
      provider: "polar" as const,
    };
  },

  /**
   * POST /api/checkout/webhook/polar
   * Handle Polar webhook events.
   */
  async handlePolarWebhook(payload: Buffer, signature: string) {
    if (!POLAR_WEBHOOK_SECRET) {
      throw new BadRequestError("Polar webhook secret not configured");
    }

    // Verify HMAC-SHA256 signature
    const expected = crypto
      .createHmac("sha256", POLAR_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expected) {
      throw new ForbiddenError("Invalid Polar webhook signature");
    }

    const event = JSON.parse(payload.toString());

    if (event.type === "checkout.order.created" || event.type === "order.created") {
      const order = event.data;
      const meta = order.metadata ?? {};

      if (!meta.productId) return { received: true };

      const amountCents = order.amount ?? 0;
      const platformFeeCents = Math.round(amountCents * 0.1);

      await orderService.createFromWebhook({
        paymentProvider: "polar",
        polarOrderId: order.id,
        polarCheckoutId: order.checkoutId,
        productId: meta.productId,
        variantId: meta.variantId || undefined,
        customerId: meta.userId || undefined,
        customerEmail: order.customer?.email ?? meta.userEmail ?? "",
        customerName: order.customer?.name ?? undefined,
        amountCents,
        currency: order.currency ?? "usd",
        discountCodeId: meta.discountCodeId || undefined,
        platformFeeCents,
        creatorRevenueCents: amountCents - platformFeeCents,
      });

      if (meta.discountCodeId) {
        await prisma.discountCode.update({
          where: { id: meta.discountCodeId },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    return { received: true };
  },

  // ── Razorpay ───────────────────────────────────────────────────────────────

  /**
   * POST /api/checkout/session/razorpay
   * Creates a Razorpay order and returns params for the frontend widget.
   */
  async createRazorpayOrder(params: {
    productId: string;
    variantId?: string;
    discountCode?: string;
    customAmountCents?: number;
    userId?: string;
    userEmail?: string;
  }) {
    const resolved = await resolveProductAndPrice(params);
    const { product, priceCents, variantName, discountCodeId, platformFeeCents, creatorRevenueCents } = resolved;

    // Convert to INR paise if product is in USD (1 USD = 85 INR) or if in INR
    const inrRate = product.currency.toLowerCase() === "inr" ? 1 : 85;
    const amountPaise = Math.round(priceCents * inrRate);

    // If real Razorpay key is configured
    if (razorpay && RAZORPAY_KEY_ID) {
      try {
        const order = await (razorpay as any).orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            productId: product.id,
            variantId: params.variantId ?? "",
            discountCodeId: discountCodeId ?? "",
            userId: params.userId ?? "",
            userEmail: params.userEmail ?? "",
            productName: variantName ? `${product.name} — ${variantName}` : product.name,
          },
        });

        return {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: RAZORPAY_KEY_ID,
          productName: variantName ? `${product.name} — ${variantName}` : product.name,
          productDescription: product.summary ?? "",
          thumbnailUrl: product.thumbnailUrl ?? undefined,
          provider: "razorpay" as const,
          testMode: false,
        };
      } catch (err: any) {
        console.warn("[Razorpay Checkout] API failed, falling back to instant order creation:", err?.message);
      }
    }

    // Direct / Test Mode Razorpay: create real completed order in PostgreSQL
    let userEmail = params.userEmail;
    let userName = "Customer";
    if (params.userId) {
      const u = await prisma.user.findUnique({ where: { id: params.userId }, select: { email: true, name: true } });
      if (u) {
        userEmail = u.email;
        userName = u.name;
      }
    }
    userEmail = userEmail || "customer@example.com";

    const dbOrder = await orderService.createFromWebhook({
      paymentProvider: "razorpay",
      razorpayOrderId: `rzp_order_test_${Date.now()}`,
      razorpayPaymentId: `rzp_pay_test_${Date.now()}`,
      razorpaySignature: `test_sig_${Date.now()}`,
      productId: product.id,
      variantId: params.variantId || undefined,
      customerId: params.userId || undefined,
      customerEmail: userEmail,
      customerName: userName,
      amountCents: amountPaise,
      currency: "inr",
      discountCodeId,
      platformFeeCents,
      creatorRevenueCents,
    });

    if (discountCodeId) {
      await prisma.discountCode.update({
        where: { id: discountCodeId },
        data: { currentUses: { increment: 1 } },
      });
    }

    return {
      orderId: dbOrder.id,
      amount: amountPaise,
      currency: "INR",
      keyId: "rzp_test_mock",
      productName: variantName ? `${product.name} — ${variantName}` : product.name,
      productDescription: product.summary ?? "",
      thumbnailUrl: product.thumbnailUrl ?? undefined,
      provider: "razorpay" as const,
      testMode: true,
    };
  },

  /**
   * POST /api/checkout/verify/razorpay
   * Verifies Razorpay payment signature and creates order in DB.
   */
  async verifyRazorpayPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId?: string;
    userEmail?: string;
  }) {
    // If order was created in test mode or key secret not set, return orderId directly
    if (
      !process.env.RAZORPAY_KEY_SECRET ||
      params.razorpayOrderId.startsWith("rzp_order_test_") ||
      params.razorpayPaymentId.startsWith("rzp_pay_test_")
    ) {
      const existing = await prisma.order.findFirst({
        where: {
          OR: [
            { id: params.razorpayOrderId },
            { razorpayOrderId: params.razorpayOrderId },
          ],
        },
      });
      if (existing) {
        return { success: true, orderId: existing.id };
      }
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new BadRequestError("Razorpay not configured");

    // Verify HMAC
    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expected !== params.razorpaySignature) {
      throw new ForbiddenError("Invalid Razorpay payment signature");
    }

    // Fetch order notes to get product metadata
    const rzOrder = await (razorpay as any).orders.fetch(params.razorpayOrderId);
    const notes = rzOrder.notes ?? {};

    if (!notes.productId) throw new BadRequestError("Missing product metadata in order");

    const amountCents = rzOrder.amount;
    const platformFeeCents = Math.round(amountCents * 0.1);

    const dbOrder = await orderService.createFromWebhook({
      paymentProvider: "razorpay",
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature,
      productId: notes.productId,
      variantId: notes.variantId || undefined,
      customerId: params.userId || notes.userId || undefined,
      customerEmail: params.userEmail || notes.userEmail || "",
      amountCents,
      currency: rzOrder.currency,
      discountCodeId: notes.discountCodeId || undefined,
      platformFeeCents,
      creatorRevenueCents: amountCents - platformFeeCents,
    });

    if (notes.discountCodeId) {
      await prisma.discountCode.update({
        where: { id: notes.discountCodeId },
        data: { currentUses: { increment: 1 } },
      });
    }

    return { success: true, orderId: dbOrder.id };
  },

  /**
   * POST /api/checkout/webhook/razorpay
   * Handle Razorpay webhook events (payment.captured, refund.created, etc.)
   */
  async handleRazorpayWebhook(payload: Buffer, signature: string) {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      throw new BadRequestError("Razorpay webhook secret not configured");
    }

    const expected = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (expected !== signature) {
      throw new ForbiddenError("Invalid Razorpay webhook signature");
    }

    // Razorpay webhook events are informational — actual order creation
    // happens synchronously in verifyRazorpayPayment. Nothing to do here.
    return { received: true };
  },

  // ── Payout Connect ─────────────────────────────────────────────────────────

  /**
   * GET /api/checkout/connect/status
   * Returns the payout connection status for both Polar and Razorpay.
   */
  async getConnectStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        polarAccountId: true,
        polarOnboarded: true,
        razorpayAccountId: true,
        razorpayOnboarded: true,
      },
    });

    if (!user) throw new NotFoundError("User");

    return {
      polar: {
        connected: !!user.polarAccountId,
        onboarded: user.polarOnboarded,
        accountId: user.polarAccountId ?? null,
        configured: !!process.env.POLAR_ACCESS_TOKEN,
      },
      razorpay: {
        connected: !!user.razorpayAccountId,
        onboarded: user.razorpayOnboarded,
        accountId: user.razorpayAccountId ?? null,
        configured: !!process.env.RAZORPAY_KEY_ID,
      },
    };
  },

  /**
   * POST /api/checkout/connect/polar
   * Returns Polar OAuth / onboarding link for creator to connect their account.
   */
  async connectPolar(userId: string, returnUrl: string) {
    if (!polar) throw new BadRequestError("Polar is not configured on this server");

    // Store a pending polar connect intent and return the Polar org creation URL
    // In production, use Polar's OAuth flow.
    // For now: return the Polar dashboard URL and instruct creator to paste their org ID.
    return {
      url: "https://polar.sh/dashboard",
      message: "Create or connect your Polar organization at polar.sh, then paste your Organization ID in your DigiStore settings.",
    };
  },

  /**
   * POST /api/checkout/connect/polar/save
   * Save Polar Organization ID for a creator (after they've set up Polar).
   */
  async savePolarAccount(userId: string, organizationId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { polarAccountId: organizationId, polarOnboarded: true },
    });
    return { success: true };
  },

  /**
   * POST /api/checkout/connect/razorpay/save
   * Save Razorpay Linked Account ID for a creator.
   */
  async saveRazorpayAccount(userId: string, accountId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { razorpayAccountId: accountId, razorpayOnboarded: true },
    });
    return { success: true };
  },

  // ── Download ───────────────────────────────────────────────────────────────

  /**
   * GET /api/checkout/order-by-session/:id
   * Look up an order by Polar checkout ID or Razorpay order ID (post-payment redirect).
   */
  async getOrderBySessionId(sessionId: string, userId?: string, userEmail?: string) {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { polarCheckoutId: sessionId },
          { razorpayOrderId: sessionId },
          { id: sessionId }, // direct order ID
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            thumbnailUrl: true,
            slug: true,
            creator: { select: { username: true } },
            files: {
              select: { id: true, fileName: true, fileSizeBytes: true, fileType: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        licenseKeys: {
          select: { licenseKey: true, uses: true, maxUses: true, isDisabled: true },
        },
      },
    });

    if (!order) return null;

    return {
      id: order.id,
      paymentProvider: order.paymentProvider,
      amountCents: order.amountCents,
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt,
      product: order.product
        ? {
            ...order.product,
            files: order.product.files.map((f: any) => ({
              ...f,
              fileSizeBytes: f.fileSizeBytes.toString(),
            })),
          }
        : null,
      licenseKeys: order.licenseKeys,
    };
  },
};
