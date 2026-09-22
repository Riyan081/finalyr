import nodemailer from "nodemailer";

/**
 * Email service — sends transactional emails (receipts, updates, etc.)
 * 
 * Uses Nodemailer with configurable transport:
 * - Development: Ethereal (free fake SMTP) or console output
 * - Production: Any SMTP provider (Resend, SendGrid, AWS SES, etc.)
 */

let transporter: any;

function getTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    // Production SMTP
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  } else {
    // Development: log to console
    transporter = nodemailer.createTransport({
      jsonTransport: true, // Outputs email as JSON to console
    });
    console.log("[Email] No SMTP configured — emails will be logged to console");
  }

  return transporter;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "DigiStore <noreply@digistore.app>";

export const emailService = {
  /**
   * Send a purchase receipt email to the buyer.
   */
  async sendPurchaseReceipt(data: {
    buyerEmail: string;
    buyerName: string;
    productName: string;
    creatorName: string;
    amountCents: number;
    currency: string;
    orderId: string;
    licenseKey?: string;
    productType: string;
    downloadUrl?: string;
  }) {
    const amount = (data.amountCents / 100).toFixed(2);
    const currencySymbol = data.currency.toUpperCase() === "INR" ? "₹" : "$";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border: 3px solid #000; }
    .header { background: #000; color: #fff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: -0.5px; }
    .body { padding: 24px; }
    .product-name { font-size: 22px; font-weight: 800; margin: 0 0 4px; }
    .creator { color: #666; font-size: 14px; margin: 0 0 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .detail-label { color: #666; }
    .detail-value { font-weight: 600; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 800; border-top: 2px solid #000; margin-top: 8px; }
    .license-box { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 16px; margin: 20px 0; text-align: center; }
    .license-key { font-family: monospace; font-size: 16px; font-weight: 700; letter-spacing: 2px; color: #0369a1; }
    .cta-btn { display: block; background: #000; color: #fff; text-decoration: none; padding: 14px 24px; text-align: center; font-weight: 700; font-size: 15px; margin: 20px 0; border: 2px solid #000; }
    .cta-btn:hover { background: #333; }
    .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .type-badge { display: inline-block; background: #f3f4f6; border: 1px solid #d1d5db; padding: 2px 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Purchase Confirmed!</h1>
    </div>
    <div class="body">
      <p class="product-name">${data.productName}</p>
      <p class="creator">by ${data.creatorName} · <span class="type-badge">${data.productType}</span></p>
      
      <div class="detail-row">
        <span class="detail-label">Order ID</span>
        <span class="detail-value">${data.orderId.slice(0, 12)}…</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
      <div class="total-row">
        <span>Total</span>
        <span>${data.amountCents === 0 ? "Free" : `${currencySymbol}${amount}`}</span>
      </div>

      ${data.licenseKey ? `
      <div class="license-box">
        <p style="margin: 0 0 8px; font-size: 12px; color: #666; font-weight: 600;">YOUR LICENSE KEY</p>
        <p class="license-key">${data.licenseKey}</p>
      </div>
      ` : ""}

      <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/library" class="cta-btn">
        ${data.productType === "course" ? "📚 Start Learning" : 
          data.productType === "membership" ? "🔑 Access Membership" : 
          "📥 Access Your Library"}
      </a>

      <p style="font-size: 13px; color: #666; text-align: center;">
        Your purchase is saved forever in your Library. You can re-download anytime.
      </p>
    </div>
    <div class="footer">
      <p>You received this email because you purchased from DigiStore.</p>
      <p>Questions? Contact the creator directly.</p>
    </div>
  </div>
</body>
</html>`;

    try {
      const result = await getTransporter().sendMail({
        from: FROM_EMAIL,
        to: data.buyerEmail,
        subject: `Receipt: ${data.productName}`,
        html,
      });

      // In dev mode (jsonTransport), log the email
      if (result.message) {
        console.log("[Email] Receipt sent (dev mode):", JSON.parse(result.message).subject);
      }

      return { sent: true };
    } catch (err) {
      console.error("[Email] Failed to send receipt:", err);
      return { sent: false, error: (err as Error).message };
    }
  },

  /**
   * Send a membership status email (cancelled/restarted/expired).
   */
  async sendMembershipUpdate(data: {
    buyerEmail: string;
    buyerName: string;
    productName: string;
    action: "cancelled" | "restarted" | "expired";
    periodEnd?: string;
  }) {
    const subjects: Record<string, string> = {
      cancelled: `Membership cancelled: ${data.productName}`,
      restarted: `Membership restarted: ${data.productName}`,
      expired: `Membership expired: ${data.productName}`,
    };

    const messages: Record<string, string> = {
      cancelled: `Your membership to <strong>${data.productName}</strong> has been cancelled. You'll retain access until ${data.periodEnd || "the end of your current billing period"}.`,
      restarted: `Welcome back! Your membership to <strong>${data.productName}</strong> has been restarted. You now have full access again.`,
      expired: `Your membership to <strong>${data.productName}</strong> has expired. Restart it anytime from your Library to regain access.`,
    };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .container { max-width: 560px; margin: 0 auto; background: #fff; border: 3px solid #000; padding: 32px; }
  h2 { margin: 0 0 16px; }
  .cta { display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; font-weight: 700; margin-top: 20px; }
</style>
</head>
<body>
<div class="container">
  <h2>${data.action === "restarted" ? "🎉" : "📋"} Membership Update</h2>
  <p>Hi ${data.buyerName},</p>
  <p>${messages[data.action]}</p>
  <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/library" class="cta">Go to Library</a>
</div>
</body>
</html>`;

    try {
      await getTransporter().sendMail({
        from: FROM_EMAIL,
        to: data.buyerEmail,
        subject: subjects[data.action] || "Membership Update",
        html,
      });
    } catch (err) {
      console.error("[Email] Failed to send membership update:", err);
    }
  },
};
