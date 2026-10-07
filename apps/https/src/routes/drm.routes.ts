import { Router, type Router as ExpressRouter, type Request, type Response } from "express";
import { optionalAuth } from "../middleware/index.js";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const router: ExpressRouter = Router();

/**
 * Generate a clean sample PDF publication and stamp anti-piracy licensing metadata.
 */
export async function generateStampedSamplePdf(
  buyerEmail: string,
  orderId: string
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

  page1.drawText(`Authorized Licensee: ${buyerEmail}`, {
    x: 70,
    y: 525,
    size: 10,
    font: fontRegular,
    color: rgb(0.1, 0.1, 0.1),
  });

  page1.drawText(`Transaction Hash: ${orderId}`, {
    x: 70,
    y: 505,
    size: 9,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  page1.drawText(`Protocol: DigiStore Dynamic DRM v2.1 • Non-Transferable`, {
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

  // Apply DRM Watermark to ALL pages (Top and Bottom)
  const pages = pdfDoc.getPages();
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const watermarkText = `🔒 Licensed to: ${buyerEmail} • Order #${orderId.slice(0, 12)} • ${dateStr} • DigiStore DRM Protected`;

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Top Header Watermark
    page.drawText(watermarkText, {
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

    // Bottom Footer Watermark
    page.drawLine({
      start: { x: 40, y: 35 },
      end: { x: width - 40, y: 35 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText(watermarkText, {
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
