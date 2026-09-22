import prisma from "@repo/db/client";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
} from "@repo/common/schemas";
import { generateSlug, ensureUniqueSlug } from "../utils/slug.js";
import {
  buildPagination,
  buildOrderBy,
  getSkip,
  type PaginatedResponse,
} from "../utils/pagination.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/errors.js";

// ─── Types ───────────────────────────────────────────────────────

/** Fields selected for product list cards. */
const PRODUCT_LIST_SELECT = {
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
  status: true,
  category: true,
  tags: true,
  salesCount: true,
  revenueCents: true,
  ratingAvg: true,
  ratingCount: true,
  viewCount: true,
  recurrence: true,
  bundledProductIds: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
} as const;

/** Full product detail with files and variants. */
const PRODUCT_DETAIL_INCLUDE = {
  files: {
    orderBy: { sortOrder: "asc" as const },
  },
  variants: {
    orderBy: { sortOrder: "asc" as const },
  },
  creator: {
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      accentColor: true,
    },
  },
} as const;

// ─── Service ─────────────────────────────────────────────────────

export const productService = {
  /**
   * Create a new product for a creator.
   * Auto-generates a unique slug from the product name.
   */
  async create(creatorId: string, data: CreateProductInput) {
    const slug = generateSlug(data.name);
    const uniqueSlug = await ensureUniqueSlug(slug, creatorId);

    // Validate product type specific fields
    if (data.productType === "membership" && !data.recurrence) {
      // Default to monthly if not provided
      data.recurrence = "monthly";
    }

    const product = await prisma.product.create({
      data: {
        creatorId,
        slug: uniqueSlug,
        name: data.name,
        description: data.description,
        summary: data.summary,
        priceCents: data.priceCents,
        currency: data.currency,
        isPayWhatYouWant: data.isPayWhatYouWant,
        minPriceCents: data.minPriceCents,
        suggestedPriceCents: data.suggestedPriceCents,
        productType: data.productType,
        recurrence: data.recurrence,
        isListedOnDiscover: data.isListedOnDiscover,
        maxPurchaseCount: data.maxPurchaseCount,
        callToAction: data.callToAction,
        category: data.category,
        tags: data.tags,
        systemRequirements: data.systemRequirements,
        bundledProductIds: (data as any).bundledProductIds ?? [],
        status: "draft",
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    return product;
  },

  /**
   * Update a product. Verifies ownership before modifying.
   */
  async update(productId: string, creatorId: string, data: UpdateProductInput) {
    // Verify ownership
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundError("Product");
    }
    if (existing.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    // If name changed, regenerate slug
    let slugUpdate: { slug?: string } = {};
    if (data.name) {
      const newSlug = generateSlug(data.name);
      if (newSlug !== existing.slug) {
        slugUpdate.slug = await ensureUniqueSlug(newSlug, creatorId);
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        ...slugUpdate,
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    return product;
  },

  /**
   * Update bundled product IDs for a bundle product.
   */
  async updateBundledProducts(productId: string, creatorId: string, bundledProductIds: string[]) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true, productType: true },
    });

    if (!product) throw new NotFoundError("Product");
    if (product.creatorId !== creatorId) throw new ForbiddenError("You do not own this product");
    if (product.productType !== "bundle") throw new BadRequestError("Only bundle products can have bundled products");

    // Validate that all referenced products exist and belong to this creator
    if (bundledProductIds.length > 0) {
      const validProducts = await prisma.product.findMany({
        where: {
          id: { in: bundledProductIds },
          creatorId,
          status: { in: ["draft", "published"] },
        },
        select: { id: true },
      });

      const validIds = new Set(validProducts.map((p) => p.id));
      const invalidIds = bundledProductIds.filter((id) => !validIds.has(id));
      if (invalidIds.length > 0) {
        throw new BadRequestError(`Products not found or not owned by you: ${invalidIds.join(", ")}`);
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { bundledProductIds },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    return updated;
  },

  /**
   * Soft-delete a product by setting status to "archived".
   */
  async archive(productId: string, creatorId: string) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, creatorId: true },
    });

    if (!existing) {
      throw new NotFoundError("Product");
    }
    if (existing.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: { status: "archived" },
      select: PRODUCT_LIST_SELECT,
    });

    return product;
  },

  /**
   * Get a single product by ID. Verifies ownership for creator endpoints.
   */
  async getById(productId: string, creatorId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    if (!product) {
      throw new NotFoundError("Product");
    }
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }

    return product;
  },

  /**
   * List products for a creator with pagination, sorting, and filters.
   */
  async listByCreator(
    creatorId: string,
    query: ProductQuery
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      status,
      productType,
      search,
    } = query || {};

    // Build where clause
    const where: any = { creatorId };
    if (status) where.status = status;
    if (productType) where.productType = productType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: PRODUCT_LIST_SELECT,
        orderBy: buildOrderBy(sort, order),
        skip: getSkip(page, limit),
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: buildPagination(page, limit, total),
    };
  },

  /**
   * Publish a product. Validates that required fields are set,
   * including type-specific validation.
   */
  async publish(productId: string, creatorId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { files: true },
    });

    if (!product) {
      throw new NotFoundError("Product");
    }
    if (product.creatorId !== creatorId) {
      throw new ForbiddenError("You do not own this product");
    }
    if (product.status === "published") {
      throw new BadRequestError("Product is already published");
    }

    // ── Common validation ──
    if (!product.name || product.name.trim().length === 0) {
      throw new BadRequestError("Product must have a name to publish");
    }
    if (product.priceCents <= 0 && !product.isPayWhatYouWant) {
      throw new BadRequestError(
        "Product must have a price or enable 'Pay What You Want' to publish"
      );
    }

    // ── Type-specific validation ──

    // Software products must have system requirements
    if (product.category === "software" && !product.systemRequirements?.trim()) {
      throw new BadRequestError(
        "Software products must specify system/device requirements before publishing"
      );
    }

    // Membership products must have a recurrence
    if (product.productType === "membership" && !product.recurrence) {
      throw new BadRequestError(
        "Membership products must have a billing frequency (monthly, quarterly, or yearly)"
      );
    }

    // Bundle products should reference at least one other product
    if (product.productType === "bundle" && product.bundledProductIds.length === 0) {
      throw new BadRequestError(
        "Bundle products must include at least one product"
      );
    }

    // Course and Digital products should have at least one file
    if (
      (product.productType === "digital" || product.productType === "course") &&
      product.files.length === 0
    ) {
      // Warning only — don't block publishing, but log
      console.warn(`[Product] Publishing ${product.productType} product "${product.name}" without files`);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    return updated;
  },

  /**
   * Atomically increment the view count for a product.
   * Called from public product page (no auth required).
   */
  async incrementViews(productId: string) {
    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
  },

  /**
   * Get a product by creator username and product slug.
   * Used for public product pages (no auth required).
   */
  async getBySlug(username: string, slug: string) {
    const creator = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!creator) {
      throw new NotFoundError("Creator");
    }

    const product = await prisma.product.findUnique({
      where: {
        creatorId_slug: {
          creatorId: creator.id,
          slug,
        },
      },
      include: {
        ...PRODUCT_DETAIL_INCLUDE,
        reviews: {
          include: {
            customer: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product || product.status !== "published") {
      throw new NotFoundError("Product");
    }

    return product;
  },

  /**
   * Get bundled products for a bundle product (public).
   */
  async getBundledProducts(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { bundledProductIds: true, productType: true },
    });

    if (!product || product.productType !== "bundle") return [];
    if (product.bundledProductIds.length === 0) return [];

    const bundledProducts = await prisma.product.findMany({
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
        creator: {
          select: { username: true, name: true },
        },
      },
    });

    return bundledProducts;
  },
};
