import { Router } from "express";
import express from "express";
import { checkoutService } from "../services/checkout.service.js";
import { downloadService } from "../services/download.service.js";
import { requireAuth, optionalAuth } from "../middleware/index.js";
import { sendSuccess } from "../utils/response.js";
import type { Request, Response } from "express";

const router: import("express").Router = Router();

// ─── Direct Purchase ────────────────────────────────────────────────────────
// POST /api/checkout/direct — 1-click simple direct purchase (no gateway keys required)
router.post("/direct", optionalAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { productId, variantId, discountCode, customAmountCents, provider } = req.body;

  const result = await checkoutService.directPurchase({
    productId,
    variantId,
    discountCode,
    customAmountCents,
    userId: user?.id,
    userEmail: user?.email,
    provider,
  });

  sendSuccess(res, "Purchase completed", result, 201);
});

// ─── Polar Checkout ───────────────────────────────────────────────────────────

// POST /api/checkout/session/polar — create Polar checkout session
router.post("/session/polar", optionalAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { productId, variantId, discountCode, customAmountCents } = req.body;
  const origin = req.headers.origin || "http://localhost:3000";

  const result = await checkoutService.createPolarSession({
    productId,
    variantId,
    discountCode,
    customAmountCents,
    userId: user?.id,
    userEmail: user?.email,
    successUrl: `${origin}/purchase/{CHECKOUT_SESSION_ID}`,
    cancelUrl: req.headers.referer || origin,
  });

  sendSuccess(res, "Polar checkout session created", result, 201);
});

// POST /api/checkout/webhook/polar — Polar webhook (raw body)
router.post(
  "/webhook/polar",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["polar-signature"] as string;
    const result = await checkoutService.handlePolarWebhook(req.body as Buffer, sig);
    res.json(result);
  }
);

// ─── Razorpay Checkout ────────────────────────────────────────────────────────

// POST /api/checkout/session/razorpay — create Razorpay order
router.post("/session/razorpay", optionalAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { productId, variantId, discountCode, customAmountCents } = req.body;

  const result = await checkoutService.createRazorpayOrder({
    productId,
    variantId,
    discountCode,
    customAmountCents,
    userId: user?.id,
    userEmail: user?.email,
  });

  sendSuccess(res, "Razorpay order created", result, 201);
});

// POST /api/checkout/verify/razorpay — verify Razorpay payment + create DB order
router.post("/verify/razorpay", optionalAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const result = await checkoutService.verifyRazorpayPayment({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    userId: user?.id,
    userEmail: user?.email,
  });

  sendSuccess(res, "Payment verified", result);
});

// POST /api/checkout/webhook/razorpay — Razorpay webhook (raw body)
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["x-razorpay-signature"] as string;
    const result = await checkoutService.handleRazorpayWebhook(req.body as Buffer, sig);
    res.json(result);
  }
);

// ─── Payout Connect ───────────────────────────────────────────────────────────

// GET /api/checkout/connect/status — check both Polar + Razorpay connect status
router.get("/connect/status", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await checkoutService.getConnectStatus(userId);
  sendSuccess(res, "Connect status", result);
});

// POST /api/checkout/connect/polar — get Polar onboarding link
router.post("/connect/polar", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const origin = req.headers.origin || "http://localhost:3000";
  const result = await checkoutService.connectPolar(userId, `${origin}/dashboard/settings`);
  sendSuccess(res, "Polar connect link", result);
});

// POST /api/checkout/connect/polar/save — save creator's Polar Org ID
router.post("/connect/polar/save", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { organizationId } = req.body;
  if (!organizationId) {
    res.status(400).json({ success: false, message: "organizationId is required" });
    return;
  }
  const result = await checkoutService.savePolarAccount(userId, organizationId);
  sendSuccess(res, "Polar account saved", result);
});

// POST /api/checkout/connect/razorpay/save — save creator's Razorpay Linked Account ID
router.post("/connect/razorpay/save", requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { accountId } = req.body;
  if (!accountId) {
    res.status(400).json({ success: false, message: "accountId is required" });
    return;
  }
  const result = await checkoutService.saveRazorpayAccount(userId, accountId);
  sendSuccess(res, "Razorpay account saved", result);
});

// ─── Order Lookup ────────────────────────────────────────────────────────────

// GET /api/checkout/order-by-session/:id — find order by Polar/Razorpay session ID
router.get("/order-by-session/:id", async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await checkoutService.getOrderBySessionId(
    req.params.id as string,
    user?.id,
    user?.email
  );
  sendSuccess(res, result ? "Order found" : "Order not found", result, result ? 200 : 404);
});

// ─── Download ────────────────────────────────────────────────────────────────

// GET /api/checkout/download/:orderId — generate download token
router.get("/download/:orderId", async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await downloadService.generateToken(
    req.params.orderId as string,
    user?.id,
    user?.email
  );
  sendSuccess(res, "Download token generated", result);
});

// GET /api/checkout/file?token=...&fileId=... — get presigned download URL for a file
router.get("/file", async (req: Request, res: Response) => {
  const { token, fileId } = req.query as { token: string; fileId: string };

  if (!token || !fileId) {
    res.status(400).json({ error: "BAD_REQUEST", message: "token and fileId are required" });
    return;
  }

  const { downloadUrl, fileName, fileType } = await downloadService.getFileDownloadUrl(token, fileId);

  // Redirect buyer to the presigned S3 download URL
  res.redirect(302, downloadUrl);
});

export default router;
