import prisma from "@repo/db/client";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * Creator Posts service — member-only / exclusive content.
 * Creators can publish posts visible only to buyers/members of specific products.
 */
export const postService = {
  /**
   * Create a new post (creator only).
   */
  async createPost(creatorId: string, data: {
    title: string;
    content: string;
    productId?: string | null;
    isPublic?: boolean;
  }) {
    // Verify product belongs to this creator (if productId is specified)
    if (data.productId) {
      const product = await prisma.product.findFirst({
        where: { id: data.productId, creatorId },
      });
      if (!product) throw new NotFoundError("Product");
    }

    return prisma.creatorPost.create({
      data: {
        creatorId,
        productId: data.productId || null,
        title: data.title,
        content: data.content,
        isPublic: data.isPublic ?? false,
      },
      include: {
        creator: { select: { id: true, name: true, username: true } },
      },
    });
  },

  /**
   * Update a post.
   */
  async updatePost(creatorId: string, postId: string, data: {
    title?: string;
    content?: string;
    productId?: string | null;
    isPublic?: boolean;
    isPinned?: boolean;
  }) {
    const post = await prisma.creatorPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post");
    if (post.creatorId !== creatorId) throw new ForbiddenError("Not your post");

    return prisma.creatorPost.update({
      where: { id: postId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.productId !== undefined && { productId: data.productId }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      },
    });
  },

  /**
   * Delete a post.
   */
  async deletePost(creatorId: string, postId: string) {
    const post = await prisma.creatorPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError("Post");
    if (post.creatorId !== creatorId) throw new ForbiddenError("Not your post");

    await prisma.creatorPost.delete({ where: { id: postId } });
    return { deleted: true };
  },

  /**
   * Get posts by a creator (for creator dashboard).
   */
  async getCreatorPosts(creatorId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      prisma.creatorPost.findMany({
        where: { creatorId },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, name: true, username: true, image: true } },
        },
      }),
      prisma.creatorPost.count({ where: { creatorId } }),
    ]);

    return { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  },

  /**
   * Get public posts for a creator's storefront.
   * Includes access-gating logic:
   * - Public posts are visible to everyone
   * - Product-gated posts show title only (content locked) unless buyer has purchased
   */
  async getPublicPosts(creatorId: string, viewerId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const posts = await prisma.creatorPost.findMany({
      where: { creatorId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        creator: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    // Check which products the viewer has purchased
    let purchasedProductIds = new Set<string>();
    let activeMembershipProductIds = new Set<string>();

    if (viewerId) {
      const [orders, memberships] = await Promise.all([
        prisma.order.findMany({
          where: { customerId: viewerId, status: "completed" },
          select: { productId: true },
        }),
        prisma.membership.findMany({
          where: { customerId: viewerId, status: "active" },
          select: { productId: true },
        }),
      ]);
      purchasedProductIds = new Set(orders.map((o) => o.productId));
      activeMembershipProductIds = new Set(memberships.map((m) => m.productId));
    }

    const enrichedPosts = posts.map((post) => {
      const isPublicPost = post.isPublic || !post.productId;
      const hasPurchased = post.productId ? purchasedProductIds.has(post.productId) : false;
      const hasActiveMembership = post.productId ? activeMembershipProductIds.has(post.productId) : false;
      const hasAccess = isPublicPost || hasPurchased || hasActiveMembership || post.creatorId === viewerId;

      return {
        id: post.id,
        title: post.title,
        content: hasAccess ? post.content : null, // Lock content if no access
        isPublic: post.isPublic,
        isPinned: post.isPinned,
        isLocked: !hasAccess,
        productId: post.productId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        creator: post.creator,
      };
    });

    const total = await prisma.creatorPost.count({ where: { creatorId } });

    return {
      posts: enrichedPosts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },
};
