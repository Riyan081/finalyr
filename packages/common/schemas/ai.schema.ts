import { z } from "zod";

export const generateCopyInputSchema = z.object({
  concept: z.string().min(3, "Concept must be at least 3 characters").max(500),
  category: z.string().optional(),
  tone: z.enum(["persuasive", "technical", "minimal", "storytelling", "indie"]).default("persuasive"),
  targetAudience: z.string().max(200).optional(),
});

export type GenerateCopyInput = z.infer<typeof generateCopyInputSchema>;

export const generatedCopyOutputSchema = z.object({
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  suggestedPriceCents: z.number().int().nonnegative(),
  callToAction: z.string(),
  keyFeatures: z.array(z.string()),
});

export type GeneratedCopyOutput = z.infer<typeof generatedCopyOutputSchema>;

export const semanticSearchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required"),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().optional(),
});

export type SemanticSearchQuery = z.infer<typeof semanticSearchQuerySchema>;
