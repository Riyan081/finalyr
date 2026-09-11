import prisma from "@repo/db/client";
import type {
  SetupCreatorInput,
  UpdateCreatorInput,
} from "@repo/common/schemas";
import { NotFoundError, ConflictError, BadRequestError } from "../utils/errors.js";

// ─── Select Fields ───────────────────────────────────────────────

const CREATOR_PUBLIC_SELECT = {
  id: true,
  name: true,
  username: true,
  bio: true,
  image: true,
  coverUrl: true,
  accentColor: true,
  socialTwitter: true,
  socialYoutube: true,
  socialInstagram: true,
  socialWebsite: true,
  createdAt: true,
} as const;

// ─── Service ─────────────────────────────────────────────────────

export const creatorService = {
  /**
   * Set up a creator profile for the first time.
   * Upgrades the user's role from "user" to "creator" and sets username.
   */
  async setupProfile(userId: string, data: SetupCreatorInput) {
    // Check if user already has a username (already a creator)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, role: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.username) {
      // If user already has a username, gracefully update the profile instead of failing
      return this.updateProfile(userId, data);
    }

    // Check username availability
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true },
    });

    if (existingUsername && existingUsername.id !== userId) {
      throw new ConflictError("Username is already taken");
    }

    // Update user with creator profile data
    const creator = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "creator",
        username: data.username,
        bio: data.bio,
        accentColor: data.accentColor,
        socialTwitter: data.socialTwitter || null,
        socialYoutube: data.socialYoutube || null,
        socialInstagram: data.socialInstagram || null,
        socialWebsite: data.socialWebsite || null,
      },
      select: CREATOR_PUBLIC_SELECT,
    });

    return creator;
  },

  /**
   * Update an existing creator profile.
   */
  async updateProfile(userId: string, data: UpdateCreatorInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // If changing username, check availability
    if (data.username && data.username !== user.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      });

      if (existingUsername) {
        throw new ConflictError("Username is already taken");
      }
    }

    const creator = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        bio: data.bio,
        accentColor: data.accentColor,
        socialTwitter: data.socialTwitter,
        socialYoutube: data.socialYoutube,
        socialInstagram: data.socialInstagram,
        socialWebsite: data.socialWebsite,
      },
      select: CREATOR_PUBLIC_SELECT,
    });

    return creator;
  },

  /**
   * Get a public creator profile by username.
   * Includes their published products.
   */
  async getPublicProfile(username: string) {
    const creator = await prisma.user.findUnique({
      where: { username },
      select: {
        ...CREATOR_PUBLIC_SELECT,
        products: {
          where: { status: "published" },
          select: {
            id: true,
            name: true,
            slug: true,
            summary: true,
            priceCents: true,
            currency: true,
            isPayWhatYouWant: true,
            minPriceCents: true,
            productType: true,
            thumbnailUrl: true,
            category: true,
            tags: true,
            salesCount: true,
            ratingAvg: true,
            ratingCount: true,
            publishedAt: true,
          },
          orderBy: { publishedAt: "desc" },
        },
        _count: {
          select: {
            followers: true,
            products: { where: { status: "published" } },
          },
        },
      },
    });

    if (!creator) {
      throw new NotFoundError("Creator");
    }

    return creator;
  },

  /**
   * Check if a username is available.
   */
  async checkUsername(username: string, currentUserId?: string) {
    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) {
      return { available: true };
    }

    // If the username belongs to the currently authenticated user, it is valid for them
    if (currentUserId && existing.id === currentUserId) {
      return { available: true };
    }

    return { available: false };
  },
};
