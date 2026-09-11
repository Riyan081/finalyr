import prisma from "@repo/db/client";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

/**
 * Follower service — uses email-based following (Gumroad style).
 * Followers are identified by email, with optional userId link.
 */
export const followerService = {
  /**
   * Follow a creator by userId (stores email from user record).
   */
  async follow(userId: string, creatorId: string) {
    if (userId === creatorId) {
      throw new BadRequestError("You cannot follow yourself");
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });
    if (!creator) throw new NotFoundError("Creator");

    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) throw new NotFoundError("User");

    // Check if already following by email
    const existing = await prisma.follower.findFirst({
      where: { creatorId, followerEmail: user.email },
    });
    if (existing) throw new BadRequestError("Already following this creator");

    await prisma.follower.create({
      data: {
        creatorId,
        followerEmail: user.email,
        followerId: userId,
        source: "profile",
      },
    });

    return { following: true };
  },

  /**
   * Unfollow a creator.
   */
  async unfollow(userId: string, creatorId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) throw new NotFoundError("User");

    const existing = await prisma.follower.findFirst({
      where: { creatorId, followerEmail: user.email },
    });
    if (!existing) throw new BadRequestError("Not following this creator");

    await prisma.follower.delete({ where: { id: existing.id } });
    return { following: false };
  },

  /**
   * Check if a user is following a creator.
   */
  async isFollowing(userId: string, creatorId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return { following: false };

    const existing = await prisma.follower.findFirst({
      where: { creatorId, followerEmail: user.email },
    });
    return { following: !!existing };
  },

  /**
   * Get follower count for a creator.
   */
  async getFollowerCount(creatorId: string) {
    const count = await prisma.follower.count({ where: { creatorId } });
    return { count };
  },

  /**
   * Get all creators that the user follows.
   */
  async getFollowing(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return [];

    const follows = await prisma.follower.findMany({
      where: {
        OR: [
          { followerId: userId },
          { followerEmail: user.email },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            accentColor: true,
            products: {
              where: { status: "published" },
              select: { id: true, name: true, slug: true, priceCents: true, thumbnailUrl: true },
              take: 3,
            },
            _count: {
              select: {
                followers: true,
                products: { where: { status: "published" } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return follows.map((f) => ({
      id: f.id,
      followedAt: f.createdAt,
      creator: {
        id: f.creator.id,
        name: f.creator.name,
        username: f.creator.username,
        image: f.creator.image,
        bio: f.creator.bio,
        accentColor: f.creator.accentColor,
        followerCount: f.creator._count.followers,
        productCount: f.creator._count.products,
        products: f.creator.products,
      },
    }));
  },
};
