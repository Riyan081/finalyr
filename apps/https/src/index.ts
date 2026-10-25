import "dotenv/config";
import app from "./app.js";
import { ensureBucketExists } from "@repo/storage";

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🔐 Auth API at http://localhost:${PORT}/api/auth`);
  console.log(`📖 OpenAPI docs at http://localhost:${PORT}/api/auth/reference`);

  try {
    await ensureBucketExists();
  } catch (err: any) {
    console.warn(`[Storage] Storage bucket initialization warning: ${err.message}`);
  }
});
