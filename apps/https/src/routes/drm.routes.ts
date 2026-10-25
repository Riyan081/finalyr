import { Router, type Router as ExpressRouter, type Request, type Response } from "express";
import { optionalAuth } from "../middleware/index.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const router: ExpressRouter = Router();

/**
 * Sanitize text to ensure it only contains characters encodable by WinAnsi (Windows-1252 / ISO-8859-1).
 * Replaces lock emojis and unencodable characters safely so pdf-lib never throws WinAnsi error.
 */
export function sanitizeForWinAnsi(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F512}\u{1F513}]/gu, "[SECURE]") // Lock emojis (0x1f512, 0x1f513)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")         // All other emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, "")          // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, "")          // Dingbats
    .replace(/[^\x00-\xFF]/g, (char) => {
      // Safe ASCII transliterations for common symbols
      if (char === "—" || char === "–") return "-";
      if (char === "•") return "|";
      if (char === '"' || char === '"') return '"';
      if (char === "'" || char === "'") return "'";
      if (char === "©") return "(c)";
      if (char === "®") return "(R)";
      if (char === "™") return "TM";
      if (char === "₹") return "INR ";
      if (char === "€") return "EUR ";
      if (char === "£") return "GBP ";
      return "";
    });
}

/**
 * Stamp anti-piracy DRM watermarks onto each page of an existing PDF buffer.
 */
export async function stampPdf(
  inputBytes: Uint8Array | Buffer,
  buyerEmail: string,
  orderId: string,
  creatorName?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(inputBytes, { ignoreEncryption: true });
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const safeCreator = sanitizeForWinAnsi(creatorName || "Creator");
  const safeBuyer = sanitizeForWinAnsi(buyerEmail || "customer@digistore.io");
  const safeOrderId = sanitizeForWinAnsi(orderId.slice(0, 12));

  const headerWatermark = creatorName
    ? `[SECURE DRM] Created by: ${safeCreator} | DigiStore Official Publication | Order #${safeOrderId}`
    : `[SECURE DRM] Licensed to: ${safeBuyer} | Order #${safeOrderId} | ${dateStr} | DigiStore DRM Protected`;

  const footerWatermark = creatorName
    ? `(c) ${new Date().getFullYear()} ${safeCreator}. All Rights Reserved | Licensed to: ${safeBuyer}`
    : `[SECURE DRM] Licensed to: ${safeBuyer} | Order #${safeOrderId} | ${dateStr} | DigiStore DRM Protected`;

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Top Header Watermark
    page.drawText(headerWatermark, {
      x: 40,
      y: height - 25,
      size: 8,
      font: fontBold,
      color: rgb(0.7, 0.15, 0.2), // Noticeable security tint
    });

    // Top line
    page.drawLine({
      start: { x: 40, y: height - 32 },
      end: { x: width - 40, y: height - 32 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Bottom line
    page.drawLine({
      start: { x: 40, y: 35 },
      end: { x: width - 40, y: 35 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Bottom Footer Watermark
    page.drawText(footerWatermark, {
      x: 40,
      y: 20,
      size: 8,
      font: fontBold,
      color: rgb(0.7, 0.15, 0.2),
    });
  }

  return pdfDoc.save();
}

/**
 * Generate a clean sample PDF publication and stamp anti-piracy licensing metadata.
 */
export async function generateStampedSamplePdf(
  buyerEmail: string,
  orderId: string,
  creatorName?: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Page 1: Title & Overview
  const page1 = pdfDoc.addPage([595, 842]); // Standard A4
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page1.drawText("DigiStore Official Publication", {
    x: 50,
    y: 750,
    size: 24,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page1.drawText("Digital Rights Management (DRM) Demonstration Document", {
    x: 50,
    y: 720,
    size: 14,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page1.drawText(
    "This document illustrates Gumroad-grade server-side PDF watermarking.",
    {
      x: 50,
      y: 670,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    }
  );

  page1.drawText(
    "Each page is dynamically stamped during the secure download stream with the buyer's",
    {
      x: 50,
      y: 645,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    }
  );

  page1.drawText(
    "authenticated email address, order hash, and tamper-resistant licensing metadata.",
    {
      x: 50,
      y: 625,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    }
  );

  // Decorative Neo-Brutalist Box
  page1.drawRectangle({
    x: 50,
    y: 460,
    width: 495,
    height: 120,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
    color: rgb(0.96, 0.94, 0.9), // retro brutalist paper
  });

  page1.drawText("LICENSE CERTIFICATE", {
    x: 70,
    y: 550,
    size: 13,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  const safeBuyer = sanitizeForWinAnsi(buyerEmail || "customer@digistore.io");
  const safeOrderId = sanitizeForWinAnsi(orderId);

  page1.drawText(`Authorized Licensee: ${safeBuyer}`, {
    x: 70,
    y: 525,
    size: 10,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page1.drawText(`Transaction Hash: ${safeOrderId}`, {
    x: 70,
    y: 505,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page1.drawText(`Protocol: DigiStore Dynamic DRM v2.1 | Non-Transferable`, {
    x: 70,
    y: 485,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.1, 0.1),
  });

  // Page 2: Content Sample
  const page2 = pdfDoc.addPage([595, 842]);
  page2.drawText("Chapter 1: Principles of Creator Distribution", {
    x: 50,
    y: 750,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  page2.drawText(
    "Digital products represent frictionless intellectual property. To balance simplicity with",
    {
      x: 50,
      y: 700,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    }
  );

  page2.drawText(
    "creator protections, watermarking acts as a psychological deterrent against redistribution.",
    {
      x: 50,
      y: 680,
      size: 11,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    }
  );

  const rawBytes = await pdfDoc.save();
  return stampPdf(rawBytes, safeBuyer, safeOrderId, creatorName);
}

/**
 * GET /api/drm/demo-stamp
 * Instant 1-click DRM demo: generates and streams an anti-piracy watermarked PDF directly.
 */
router.get("/demo-stamp", optionalAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const email =
      (typeof req.query.email === "string" ? req.query.email : null) ||
      user?.email ||
      "evaluator@college.edu";
    const orderId =
      (typeof req.query.orderId === "string" ? req.query.orderId : null) ||
      `ord_demo_${Date.now()}`;

    const pdfBytes = await generateStampedSamplePdf(email, orderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="DigiStore-DRM-Watermarked-Sample.pdf"`
    );
    res.setHeader("Content-Length", pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to stamp PDF" });
  }
});

export default router;
