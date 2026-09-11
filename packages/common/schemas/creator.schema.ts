import { z } from "zod";

// ─── Username Validation ─────────────────────────────────────────
// Lowercase alphanumeric + hyphens, 3-30 chars, no leading/trailing hyphens
const usernameRegex = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

const optionalUrlSchema = z
  .string()
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((val) => {
    if (!val || !val.trim()) return null;
    const trimmed = val.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  });

// ─── Setup Creator Profile Schema ────────────────────────────────
export const setupCreatorSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be under 30 characters")
    .regex(
      usernameRegex,
      "Username must be lowercase, alphanumeric with hyphens only, no leading/trailing hyphens"
    )
    .transform((v) => v.toLowerCase()),
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters")
    .optional(),
  socialTwitter: optionalUrlSchema,
  socialYoutube: optionalUrlSchema,
  socialInstagram: optionalUrlSchema,
  socialWebsite: optionalUrlSchema,
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .default("#FF90E8"),
});

export type SetupCreatorInput = z.infer<typeof setupCreatorSchema>;

// ─── Update Creator Profile Schema (all optional) ────────────────
export const updateCreatorSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(usernameRegex, "Invalid username format")
    .transform((v) => v.toLowerCase())
    .optional(),
  bio: z.string().max(500).optional().nullable(),
  socialTwitter: optionalUrlSchema,
  socialYoutube: optionalUrlSchema,
  socialInstagram: optionalUrlSchema,
  socialWebsite: optionalUrlSchema,
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export type UpdateCreatorInput = z.infer<typeof updateCreatorSchema>;

// ─── Creator Username Params ─────────────────────────────────────
export const creatorUsernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .transform((v) => v.toLowerCase()),
});

export type CreatorUsernameParams = z.infer<typeof creatorUsernameSchema>;
