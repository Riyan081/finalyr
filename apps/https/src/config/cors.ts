/**
 * CORS configuration for the Express API server.
 */
const rawOrigins = process.env.TRUSTED_ORIGINS || process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:3003,http://localhost:3005";
const allowedOrigins = rawOrigins.split(",").map((s) => s.trim());

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
