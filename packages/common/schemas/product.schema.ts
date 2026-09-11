import { z } from "zod";

// ─── Product Type Enum ────────────────────────────────────────────
export const PRODUCT_TYPES = [
  "digital",
  "membership",
  "course",
  "bundle",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_CATEGORIES = [
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
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const RECURRENCE_OPTIONS = [
  "monthly",
  "quarterly",
  "yearly",
] as const;

// ─── Create Product Schema ───────────────────────────────────────
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Product name must be under 200 characters")
    .trim(),
  description: z
    .string()
    .max(50000, "Description must be under 50,000 characters")
    .optional(),
  summary: z
    .string()
    .max(500, "Summary must be under 500 characters")
    .optional(),

  // Pricing
  priceCents: z
    .number()
    .int()
    .min(0, "Price cannot be negative")
    .max(100_000_00, "Price cannot exceed $100,000")
    .default(0),
  currency: z.string().length(3).default("usd"),
  isPayWhatYouWant: z.boolean().default(false),
  minPriceCents: z
    .number()
    .int()
    .min(0)
    .max(100_000_00)
    .default(0),
  suggestedPriceCents: z
    .number()
    .int()
    .min(0)
    .max(100_000_00)
    .optional()
    .nullable(),

  // Type
  productType: z.enum(PRODUCT_TYPES).default("digital"),
  recurrence: z.enum(RECURRENCE_OPTIONS).optional().nullable(),

  // Settings
  isListedOnDiscover: z.boolean().default(true),
  maxPurchaseCount: z.number().int().min(1).optional().nullable(),
  callToAction: z
    .string()
    .max(100)
    .default("I want this!"),

  // Categorization
  category: z.enum(PRODUCT_CATEGORIES).optional().nullable(),
  tags: z
    .array(z.string().max(50).trim())
    .max(20, "Maximum 20 tags")
    .default([]),

  // Software-specific
  systemRequirements: z
    .string()
    .max(5000, "System requirements must be under 5,000 characters")
    .optional()
    .nullable(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// ─── Update Product Schema (all fields optional) ─────────────────
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ─── Product Query Schema (for listing/filtering) ────────────────
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum(["createdAt", "updatedAt", "name", "priceCents", "salesCount"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(PRODUCT_STATUSES).optional(),
  productType: z.enum(PRODUCT_TYPES).optional(),
  search: z.string().max(200).optional(),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

// ─── Product Params Schema ───────────────────────────────────────
export const productParamsSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export type ProductParams = z.infer<typeof productParamsSchema>;

// ─── Product Variant Schema ──────────────────────────────────────
export const createVariantSchema = z.object({
  name: z
    .string()
    .min(1, "Variant name is required")
    .max(100)
    .trim(),
  priceCents: z
    .number()
    .int()
    .min(0)
    .max(100_000_00),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
  maxPurchaseCount: z.number().int().min(1).optional().nullable(),
});

export type CreateVariantInput = z.infer<typeof createVariantSchema>;

export const updateVariantSchema = createVariantSchema.partial();
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

export const variantParamsSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
});

export type VariantParams = z.infer<typeof variantParamsSchema>;
