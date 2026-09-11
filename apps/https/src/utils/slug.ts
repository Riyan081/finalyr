import prisma from "@repo/db/client";

/**
 * Generate a URL-safe slug from a string.
 *
 * "My Cool Product!" → "my-cool-product"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, "-") // Spaces → hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
}

/**
 * Generate a short random suffix for slug collision handling.
 */
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 6);
}

/**
 * Ensure a slug is unique for a given creator.
 * If a collision is found, appends a random 4-char suffix.
 *
 * This checks the `product` table for the (creatorId, slug) unique constraint.
 */
export async function ensureUniqueSlug(
  slug: string,
  creatorId: string
): Promise<string> {
  let candidate = slug;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await prisma.product.findUnique({
      where: {
        creatorId_slug: {
          creatorId,
          slug: candidate,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${slug}-${randomSuffix()}`;
    attempts++;
  }

  // Extremely unlikely fallback — use timestamp
  return `${slug}-${Date.now()}`;
}
