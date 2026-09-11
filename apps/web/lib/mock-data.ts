// ─── Static UI Helpers (no mock data) ───────────────────────────────────────
// All product/user/review data now comes from the real backend API.
// See lib/api.ts for types and API calls.

export { type ApiProduct, type DiscoverProduct, formatCents } from "./api";

// ─── Categories (for forms and filters) ─────────────────────────────────────
// These match the backend PRODUCT_CATEGORIES enum in packages/common/schemas/product.schema.ts
export const CATEGORIES = [
  "3d",
  "audio",
  "business",
  "comics",
  "design",
  "drawing",
  "education",
  "fiction",
  "film",
  "music",
  "photography",
  "software",
  "other",
] as const;

export type ProductCategory = (typeof CATEGORIES)[number];

// Display labels for categories
export const CATEGORY_LABELS: Record<string, string> = {
  "3d": "3D",
  audio: "Audio",
  business: "Business & Money",
  comics: "Comics & Graphic Novels",
  design: "Design",
  drawing: "Drawing & Painting",
  education: "Education",
  fiction: "Fiction Books",
  film: "Film",
  music: "Music & Sound Design",
  photography: "Photography",
  software: "Software Development",
  other: "Other",
};

// ─── Category Colors ─────────────────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string> = {
  design: "bg-digi-pink",
  drawing: "bg-digi-peach",
  software: "bg-digi-yellow",
  education: "bg-digi-mint",
  fiction: "bg-digi-lavender",
  comics: "bg-digi-peach",
  music: "bg-digi-lavender",
  photography: "bg-digi-pink",
  business: "bg-digi-yellow",
  "3d": "bg-digi-peach",
  audio: "bg-digi-lavender",
  film: "bg-digi-mint",
  other: "bg-digi-pink",
};

// ─── Price Formatter ─────────────────────────────────────────────────────────
/**
 * Format a price in cents to a display string.
 * The backend stores all prices in cents (e.g. 999 = $9.99).
 */
export const formatPrice = (cents: number, currency = "usd"): string => {
  if (currency === "inr" || currency === "INR") {
    return `₹${(cents / 100).toLocaleString("en-IN")}`;
  }
  return `$${(cents / 100).toFixed(2)}`;
};
