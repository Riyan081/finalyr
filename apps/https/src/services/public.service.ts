import prisma from "@repo/db/client";
import { NotFoundError } from "../utils/errors.js";

export const publicService = {
  async getProductBySlug(username: string, slug: string) {
    const creator = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!creator) throw new NotFoundError("Creator");

    const product = await prisma.product.findFirst({
      where: { creatorId: creator.id, slug, status: "published" },
      include: {
        creator: {
          select: { id: true, name: true, username: true, image: true, bio: true, accentColor: true },
        },
        variants: { orderBy: { sortOrder: "asc" } },
        files: {
          select: { id: true, fileName: true, fileSizeBytes: true, fileType: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product) throw new NotFoundError("Product");

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    const fileSizeTotal = product.files.reduce(
      (acc: number, f: any) => acc + Number(f.fileSizeBytes),
      0
    );

    // Fetch bundled products for bundles
    let bundledProducts: any[] = [];
    if (product.productType === "bundle" && product.bundledProductIds.length > 0) {
      bundledProducts = await prisma.product.findMany({
        where: {
          id: { in: product.bundledProductIds },
          status: "published",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          thumbnailUrl: true,
          priceCents: true,
          currency: true,
          productType: true,
          creator: { select: { username: true, name: true } },
        },
      });
    }

    return {
      ...product,
      revenueCents: Number(product.revenueCents),
      viewCount: product.viewCount + 1,
      fileCount: product.files.length,
      fileSizeTotal,
      reviewCount: product._count.reviews,
      bundledProducts,
      files: product.files.map((f: any) => ({
        id: f.id,
        fileName: f.fileName,
        fileSizeBytes: f.fileSizeBytes.toString(),
        fileType: f.fileType,
      })),
    };
  },

  async getCreatorStorefront(username: string) {
    const creator = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, image: true, bio: true,
        accentColor: true, coverUrl: true, socialTwitter: true, socialYoutube: true,
        socialInstagram: true, socialWebsite: true, createdAt: true,
      },
    });
    if (!creator) throw new NotFoundError("Creator");

    const [products, followerCount] = await Promise.all([
      prisma.product.findMany({
        where: { creatorId: creator.id, status: "published" },
        select: {
          id: true, name: true, slug: true, summary: true, thumbnailUrl: true,
          priceCents: true, currency: true, isPayWhatYouWant: true,
          productType: true, salesCount: true, ratingAvg: true,
          recurrence: true,
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.follower.count({ where: { creatorId: creator.id } }),
    ]);

    return {
      creator: { ...creator, followerCount },
      products: products.map((p) => ({
        ...p,
        reviewCount: p._count.reviews,
        _count: undefined,
      })),
    };
  },

  async getFeaturedProducts(limit = 12) {
    return prisma.product.findMany({
      where: { status: "published", isListedOnDiscover: true },
      select: {
        id: true, name: true, slug: true, summary: true, thumbnailUrl: true,
        priceCents: true, currency: true, isPayWhatYouWant: true,
        productType: true, salesCount: true, ratingAvg: true,
        recurrence: true,
        creator: { select: { name: true, username: true, image: true } },
      },
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  },
};
