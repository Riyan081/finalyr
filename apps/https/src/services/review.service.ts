import prisma from "@repo/db/client";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors.js";

/**
 * Review service — purchase-verified reviews with rating aggregation.
 * Uses Review model: customerId, content (not body), orderId required.
 */
export const reviewService = {
  /**
   * Create a review. Buyer must have a completed order for the product.
   */
  async create(
    customerId: string,
    data: { productId: string; rating: number; content?: string; orderId: string }
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }

    // Verify the order belongs to this customer and is for this product
    const order = await prisma.order.findFirst({
      where: {
        id: data.orderId,
        customerId,
        productId: data.productId,
        status: "completed",
      },
    });
    if (!order) throw new ForbiddenError("You must purchase this product to review it");

    // Check not already reviewed (order is unique)
    const existingByOrder = await prisma.review.findUnique({
      where: { orderId: data.orderId },
    });
    if (existingByOrder) throw new BadRequestError("You have already reviewed this purchase");

    const review = await prisma.review.create({
      data: {
        customerId,
        productId: data.productId,
        orderId: data.orderId,
        rating: data.rating,
        content: data.content,
      },
      include: {
        customer: { select: { name: true, image: true } },
      },
    });

    await this._updateProductRating(data.productId);
    return review;
  },

  /**
   * Get paginated reviews for a product.
   */
  async getForProduct(productId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          customer: { select: { name: true, image: true } },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    const ratingDist = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    return {
      reviews,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      ratingDistribution: ratingDist.reduce<Record<number, number>>((acc, r) => {
        acc[r.rating] = r._count.rating;
        return acc;
      }, {}),
    };
  },

  /**
   * Delete a review (own review only).
   */
  async delete(customerId: string, reviewId: string) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, customerId },
    });
    if (!review) throw new NotFoundError("Review");

    await prisma.review.delete({ where: { id: reviewId } });
    await this._updateProductRating(review.productId);
    return { deleted: true };
  },

  /**
   * Recalculate and save product rating average + count.
   */
  async _updateProductRating(productId: string) {
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count.rating,
      },
    });
  },
};
