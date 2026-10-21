// ─── Static UI Helpers (no mock data) ───────────────────────────────────────
// All product/user/review data now comes from the real backend API.
// See lib/api.ts for types and API calls.

export { type ApiProduct, type DiscoverProduct, formatCents } from "./api";

// ─── Categories (for forms and filters) ─────────────────────────────────────
// These match the backend PRODUCT_CATEGORIES enum in packages/common/schemas/product.schema.ts
export const CATEGORIES = [
  "3d",
  "animation",
  "audio",
  "business",
  "comics",
  "design",
  "drawing",
  "education",
  "fiction",
  "film",
  "fitness",
  "gaming",
  "music",
  "photography",
  "self-improvement",
  "software",
  "writing",
  "other",
] as const;

export type ProductCategory = (typeof CATEGORIES)[number];

// Display labels for categories
export const CATEGORY_LABELS: Record<string, string> = {
  "3d": "3D & CG Assets",
  animation: "Animation & VFX",
  audio: "Audio & Sound Effects",
  business: "Business & Finance",
  comics: "Comics & Graphic Novels",
  design: "Design & UI Kits",
  drawing: "Drawing & Digital Art",
  education: "Education & Courses",
  fiction: "Fiction Books",
  film: "Film & Video Templates",
  fitness: "Fitness & Health",
  gaming: "Gaming & Game Assets",
  music: "Music & Production",
  photography: "Photography & Presets",
  "self-improvement": "Self Improvement & Productivity",
  software: "Software, Plugins & Code",
  writing: "Writing & Publishing",
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
  animation: "bg-digi-mint",
  audio: "bg-digi-lavender",
  film: "bg-digi-mint",
  fitness: "bg-digi-peach",
  gaming: "bg-digi-yellow",
  "self-improvement": "bg-digi-mint",
  writing: "bg-digi-lavender",
  other: "bg-digi-pink",
};

// ─── Price Formatter ─────────────────────────────────────────────────────────
/**
 * Format a price in cents to a display string.
 * The backend stores all prices in cents (e.g. 999 = $9.99).
 */
export const formatPrice = (cents: number, currency = "inr"): string => {
  return `₹${((cents || 0) / 100).toLocaleString("en-IN")}`;
};
