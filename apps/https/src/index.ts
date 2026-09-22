import "dotenv/config";
import app from "./app.js";
import { ensureBucketExists } from "@repo/storage";
import { renewalService } from "./services/renewal.service.js";

const PORT = process.env.PORT || 3002;

// Ensure S3 bucket exists before starting the server
ensureBucketExists()
  .then(() => {
    console.log("[Storage] Bucket ready");
  })
  .catch((err) => {
    console.warn("[Storage] Could not verify bucket (MinIO may not be running):", err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔐 Auth API at http://localhost:${PORT}/api/auth`);
  console.log(`📖 OpenAPI docs at http://localhost:${PORT}/api/auth/reference`);

  // ─── Membership Expiry Cron (every hour) ────────────────────
  const HOUR_MS = 60 * 60 * 1000;
  setInterval(() => {
    renewalService.expireOverdueMemberships().catch((err) => {
      console.error("[Renewal] Cron error:", err);
    });
  }, HOUR_MS);

  // Run once immediately on startup
  renewalService.expireOverdueMemberships().catch(() => {});
  console.log("⏰ Membership expiry cron scheduled (every hour)");
});
