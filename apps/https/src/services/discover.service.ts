import prisma from "@repo/db/client";

/**
 * Discover / marketplace service.
 * Full-text search, category browse, trending products.
 */
export const discoverService = {
  /**
   * Search published products by name/description/tags.
   */
  async search(query: {
    q?: string;
    category?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      q,
      category,
      type,
      minPrice,
      maxPrice,
      sort = "popular",
      page = 1,
      limit = 20,
    } = query;

    const where: any = {
      status: "published",
      isListedOnDiscover: true,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (type) {
      where.productType = type;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceCents = {};
      if (minPrice !== undefined) where.priceCents.gte = minPrice;
      if (maxPrice !== undefined) where.priceCents.lte = maxPrice;
    }

    const orderBy: any =
      sort === "popular"
        ? { salesCount: "desc" }
        : sort === "newest"
          ? { publishedAt: "desc" }
          : sort === "rating"
            ? { ratingAvg: "desc" }
            : sort === "price_asc"
              ? { priceCents: "asc" }
              : sort === "price_desc"
                ? { priceCents: "desc" }
                : { salesCount: "desc" };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          thumbnailUrl: true,
          priceCents: true,
          currency: true,
          isPayWhatYouWant: true,
          productType: true,
          salesCount: true,
          ratingAvg: true,
          category: true,
          tags: true,
          creator: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get trending products (high sales in last 30 days).
   */
  async getTrending(limit = 8) {
    return prisma.product.findMany({
      where: {
        status: "published",
        isListedOnDiscover: true,
      },
      orderBy: { salesCount: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        priceCents: true,
        currency: true,
        isPayWhatYouWant: true,
        productType: true,
        salesCount: true,
        ratingAvg: true,
        creator: {
          select: { name: true, username: true, image: true },
        },
      },
    });
  },

  /**
   * Get all unique categories with product counts.
   */
  async getCategories() {
    const results = await prisma.product.groupBy({
      by: ["category"],
      where: {
        status: "published",
        isListedOnDiscover: true,
        category: { not: null },
      },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    });

    return results.map((r) => ({
      name: r.category!,
      count: r._count.category,
    }));
  },

  /**
   * Get featured creators with most published products.
   */
  async getFeaturedCreators(limit = 6) {
    const creators = await prisma.user.findMany({
      where: {
        role: "creator",
        products: {
          some: { status: "published", isListedOnDiscover: true },
        },
      },
      orderBy: {
        products: { _count: "desc" },
      },
      take: limit,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        accentColor: true,
        _count: {
          select: {
            products: { where: { status: "published" } },
            followers: true,
          },
        },
      },
    });

    return creators;
  },
};
