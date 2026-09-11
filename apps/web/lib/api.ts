import axios from "axios";

// ─── Axios Instance ─────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send auth cookies
  headers: { "Content-Type": "application/json" },
});

// ─── Response Interceptor — unwrap { success, data } envelope ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

// ─── Typed API helpers ──────────────────────────────────────────────────────

/** Extract `.data` field from the standard { success, message, data } envelope */
function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

// ─── Products ───────────────────────────────────────────────────────────────

export const productsApi = {
  /** GET /api/products — list creator's own products (auth required) */
  list: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: string;
    status?: string;
    productType?: string;
    search?: string;
  }) => {
    const res = await api.get("/api/products", { params });
    return res.data as {
      success: boolean;
      message: string;
      data: ApiProduct[];
      pagination: Pagination;
    };
  },

  /** GET /api/products/:id — get a single product (auth required) */
  getById: async (id: string) => {
    const res = await api.get(`/api/products/${id}`);
    return unwrap<ApiProduct>(res);
  },

  /** POST /api/products — create a product (auth required) */
  create: async (data: CreateProductPayload) => {
    const res = await api.post("/api/products", data);
    return unwrap<ApiProduct>(res);
  },

  /** PUT /api/products/:id — update a product (auth required) */
  update: async (id: string, data: Partial<CreateProductPayload>) => {
    const res = await api.put(`/api/products/${id}`, data);
    return unwrap<ApiProduct>(res);
  },

  /** DELETE /api/products/:id — archive a product (auth required) */
  archive: async (id: string) => {
    const res = await api.delete(`/api/products/${id}`);
    return unwrap<ApiProduct>(res);
  },

  /** POST /api/products/:id/publish — publish a product (auth required) */
  publish: async (id: string) => {
    const res = await api.post(`/api/products/${id}/publish`);
    return unwrap<ApiProduct>(res);
  },
};

// ─── Discover (Public, no auth) ─────────────────────────────────────────────

export const discoverApi = {
  /** GET /api/discover — search products */
  search: async (params?: {
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const res = await api.get("/api/discover", { params });
    return res.data as {
      success: boolean;
      data: DiscoverProduct[];
      pagination: Pagination;
    };
  },

  /** GET /api/discover/trending */
  trending: async (limit = 8) => {
    const res = await api.get("/api/discover/trending", { params: { limit } });
    return unwrap<DiscoverProduct[]>(res);
  },

  /** GET /api/discover/categories */
  categories: async () => {
    const res = await api.get("/api/discover/categories");
    return unwrap<{ name: string; count: number }[]>(res);
  },

  /** GET /api/discover/creators */
  featuredCreators: async (limit = 6) => {
    const res = await api.get("/api/discover/creators", {
      params: { limit },
    });
    return unwrap<FeaturedCreator[]>(res);
  },
};

// ─── Public Storefront (No auth) ─────────────────────────────────────────────

export const storefrontApi = {
  /** GET /api/storefront/featured — featured products */
  featured: async (limit = 12) => {
    const res = await api.get("/api/storefront/featured", {
      params: { limit },
    });
    return unwrap<DiscoverProduct[]>(res);
  },

  /** GET /api/storefront/:username — creator storefront */
  getCreator: async (username: string) => {
    const res = await api.get(`/api/storefront/${username}`);
    return unwrap<StorefrontData>(res);
  },

  /** GET /api/storefront/:username/:slug — public product detail */
  getProduct: async (username: string, slug: string) => {
    const res = await api.get(`/api/storefront/${username}/${slug}`);
    return unwrap<PublicProduct>(res);
  },
};

// ─── Creator (Auth required for PUT, public for GET) ────────────────────────

export const creatorApi = {
  /** POST /api/creator/setup */
  setup: async (data: SetupCreatorPayload) => {
    const res = await api.post("/api/creator/setup", data);
    return unwrap<CreatorProfile>(res);
  },

  /** PUT /api/creator/profile */
  updateProfile: async (data: Partial<SetupCreatorPayload>) => {
    const res = await api.put("/api/creator/profile", data);
    return unwrap<CreatorProfile>(res);
  },

  /** GET /api/creator/:username */
  getPublicProfile: async (username: string) => {
    const res = await api.get(`/api/creator/${username}`);
    return unwrap<PublicCreatorProfile>(res);
  },

  /** GET /api/creator/check/:username */
  checkUsername: async (username: string) => {
    const res = await api.get(`/api/creator/check/${username}`);
    return unwrap<{ available: boolean }>(res);
  },
};

export const userApi = {
  /** GET /api/me */
  getMe: async () => {
    const res = await api.get("/api/me");
    return unwrap<AuthUser>(res);
  },
  /** GET /api/users (auth required) */
  getAll: async () => {
    const res = await api.get("/api/users");
    return unwrap<AdminUser[]>(res);
  },
};

export const adminApi = {
  /** GET /api/admin/stats (admin auth required) */
  getStats: async () => {
    const res = await api.get("/api/admin/stats");
    return unwrap<AdminStats>(res);
  },
  /** GET /api/users */
  getUsers: async () => {
    const res = await api.get("/api/users");
    return unwrap<AdminUser[]>(res);
  },
};

export const premiumApi = {
  /** GET /api/premium/features */
  getFeatures: async () => {
    const res = await api.get("/api/premium/features");
    return unwrap<string[]>(res);
  },
};

// ─── Analytics (Auth required) ───────────────────────────────────────────────

export const analyticsApi = {
  /** GET /api/analytics/overview */
  overview: async () => {
    const res = await api.get("/api/analytics/overview");
    return unwrap<AnalyticsOverview>(res);
  },

  /** GET /api/analytics/revenue?days=30 */
  revenue: async (days = 30) => {
    const res = await api.get("/api/analytics/revenue", { params: { days } });
    return unwrap<RevenueDay[]>(res);
  },

  /** GET /api/analytics/products?limit=5 */
  topProducts: async (limit = 5) => {
    const res = await api.get("/api/analytics/products", { params: { limit } });
    return unwrap<TopProduct[]>(res);
  },

  /** GET /api/analytics/sales?limit=10 */
  recentSales: async (limit = 10) => {
    const res = await api.get("/api/analytics/sales", { params: { limit } });
    return unwrap<RecentSale[]>(res);
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  priceCents: number;
  currency: string;
  isPayWhatYouWant: boolean;
  minPriceCents: number;
  suggestedPriceCents?: number | null;
  productType: "digital" | "membership" | "course" | "bundle";
  recurrence?: string | null;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  previewUrl?: string | null;
  status: "draft" | "published" | "archived";
  isListedOnDiscover: boolean;
  maxPurchaseCount?: number | null;
  callToAction: string;
  category?: string | null;
  tags: string[];
  systemRequirements?: string | null;
  salesCount: number;
  revenueCents: number;
  ratingAvg: number;
  ratingCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  creator?: {
    id: string;
    name: string;
    username?: string | null;
    image?: string | null;
    accentColor?: string | null;
  };
  files?: ProductFile[];
  variants?: ProductVariant[];
}

export interface ProductFile {
  id: string;
  fileName: string;
  fileSizeBytes: string;
  fileType: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceCents: number;
  description?: string | null;
  sortOrder: number;
}

export interface DiscoverProduct {
  id: string;
  name: string;
  slug: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  priceCents: number;
  currency: string;
  isPayWhatYouWant: boolean;
  productType: string;
  salesCount: number;
  ratingAvg: number;
  category?: string | null;
  tags?: string[];
  creator: {
    name: string;
    username?: string | null;
    image?: string | null;
  };
}

export interface PublicProduct extends ApiProduct {
  fileCount: number;
  fileSizeTotal: number;
  reviewCount: number;
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  rating: number;
  content?: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export interface FeaturedCreator {
  id: string;
  name: string;
  username?: string | null;
  image?: string | null;
  bio?: string | null;
  accentColor?: string | null;
  _count: {
    products: number;
    followers: number;
  };
}

export interface StorefrontData {
  creator: {
    id: string;
    name: string;
    username?: string | null;
    image?: string | null;
    bio?: string | null;
    coverUrl?: string | null;
    accentColor?: string | null;
    socialTwitter?: string | null;
    socialYoutube?: string | null;
    socialInstagram?: string | null;
    socialWebsite?: string | null;
    createdAt: string;
    followerCount: number;
  };
  products: Array<{
    id: string;
    name: string;
    slug: string;
    summary?: string | null;
    thumbnailUrl?: string | null;
    priceCents: number;
    currency: string;
    isPayWhatYouWant: boolean;
    productType: string;
    salesCount: number;
    ratingAvg: number;
    reviewCount: number;
  }>;
}

export interface CreatorProfile {
  id: string;
  name: string;
  username?: string | null;
  bio?: string | null;
  image?: string | null;
  coverUrl?: string | null;
  accentColor?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  socialInstagram?: string | null;
  socialWebsite?: string | null;
  createdAt: string;
}

export interface PublicCreatorProfile extends CreatorProfile {
  products: DiscoverProduct[];
  _count: {
    followers: number;
    products: number;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  username?: string | null;
  bio?: string | null;
  accentColor?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSessions: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalRevenueCents: number;
  totalSales: number;
  productCount: number;
  followerCount: number;
  withdrawableRevenueCents: number;
  minimumWithdrawalCents: number;
}

export interface RevenueDay {
  date: string;
  revenueCents: number;
}

export interface TopProduct {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
  priceCents: number;
  salesCount: number;
  revenueCents: number;
  ratingAvg: number;
  status: string;
}

export interface RecentSale {
  id: string;
  amountCents: number;
  status: string;
  createdAt: string;
  customerEmail: string;
  customerName?: string | null;
  product: {
    id: string;
    name: string;
    thumbnailUrl?: string | null;
  };
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  summary?: string;
  priceCents: number;
  currency?: string;
  isPayWhatYouWant?: boolean;
  minPriceCents?: number;
  suggestedPriceCents?: number | null;
  productType?: "digital" | "membership" | "course" | "bundle";
  recurrence?: "monthly" | "quarterly" | "yearly" | null;
  isListedOnDiscover?: boolean;
  maxPurchaseCount?: number | null;
  callToAction?: string;
  category?: string | null;
  tags?: string[];
  systemRequirements?: string | null;
}

export interface SetupCreatorPayload {
  username: string;
  bio?: string;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  socialInstagram?: string | null;
  socialWebsite?: string | null;
  accentColor?: string;
}

/** Format priceCents to display string */
export function formatCents(cents: number, currency = "usd"): string {
  if (currency === "inr" || currency === "INR") {
    return `₹${(cents / 100).toLocaleString("en-IN")}`;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

// --- Checkout � Polar + Razorpay ---------------------------------------------

export const checkoutApi = {
  directPurchase: async (data: { productId: string; variantId?: string; discountCode?: string; customAmountCents?: number; provider?: "polar" | "razorpay" }) => {
    const res = await api.post("/api/checkout/direct", data);
    return unwrap<{ orderId: string; redirectUrl: string; success: boolean }>(res);
  },
  createPolarSession: async (data: { productId: string; variantId?: string; discountCode?: string; customAmountCents?: number }) => {
    const res = await api.post("/api/checkout/session/polar", data);
    return unwrap<{ checkoutId: string; sessionUrl: string; provider: "polar" }>(res);
  },
  createRazorpayOrder: async (data: { productId: string; variantId?: string; discountCode?: string; customAmountCents?: number }) => {
    const res = await api.post("/api/checkout/session/razorpay", data);
    return unwrap<{ orderId: string; amount: number; currency: string; keyId: string; productName: string; productDescription: string; thumbnailUrl?: string; provider: "razorpay"; testMode?: boolean }>(res);
  },
  verifyRazorpay: async (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => {
    const res = await api.post("/api/checkout/verify/razorpay", data);
    return unwrap<{ success: boolean; orderId: string }>(res);
  },
  getConnectStatus: async () => {
    const res = await api.get("/api/checkout/connect/status");
    return unwrap<{ polar: PayoutProviderStatus; razorpay: PayoutProviderStatus }>(res);
  },
  connectPolar: async () => {
    const res = await api.post("/api/checkout/connect/polar");
    return unwrap<{ url: string; message: string }>(res);
  },
  savePolarAccount: async (organizationId: string) => {
    const res = await api.post("/api/checkout/connect/polar/save", { organizationId });
    return unwrap<{ success: boolean }>(res);
  },
  saveRazorpayAccount: async (accountId: string) => {
    const res = await api.post("/api/checkout/connect/razorpay/save", { accountId });
    return unwrap<{ success: boolean }>(res);
  },
  getOrderBySession: async (sessionId: string) => {
    const res = await api.get(`/api/checkout/order-by-session/${sessionId}`);
    return unwrap<OrderDetail | null>(res);
  },
  getDownloadToken: async (orderId: string) => {
    const res = await api.get(`/api/checkout/download/${orderId}`);
    return unwrap<{ token: string; expiresAt: string; order: DownloadOrderInfo }>(res);
  },
  buildFileDownloadUrl: (token: string, fileId: string): string =>
    `${API_BASE}/api/checkout/file?token=${encodeURIComponent(token)}&fileId=${encodeURIComponent(fileId)}`,
};

export const ordersApi = {
  getSales: async (params?: { page?: number; limit?: number; status?: string; productId?: string }) => {
    const res = await api.get("/api/orders/sales", { params });
    return res.data as { data: OrderItem[]; pagination: Pagination; success: boolean };
  },
  getPurchases: async (params?: { page?: number; limit?: number }) => {
    const res = await api.get("/api/orders/purchases", { params });
    return res.data as { data: OrderItem[]; pagination: Pagination; success: boolean };
  },
  getOrder: async (id: string) => {
    const res = await api.get(`/api/orders/${id}`);
    return unwrap<OrderDetail>(res);
  },
  refund: async (id: string) => {
    const res = await api.post(`/api/orders/${id}/refund`);
    return unwrap<OrderItem>(res);
  },
};

export const reviewsApi = {
  getForProduct: async (productId: string, params?: { page?: number; limit?: number }) => {
    const res = await api.get(`/api/reviews/${productId}`, { params });
    return res.data as { data: ProductReview[]; pagination: Pagination; success: boolean };
  },
  create: async (data: { productId: string; orderId: string; rating: number; content?: string }) => {
    const res = await api.post("/api/reviews", data);
    return unwrap<ProductReview>(res);
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/reviews/${id}`);
    return unwrap<{ success: boolean }>(res);
  },
};

export const discountsApi = {
  validate: async (code: string, productId: string) => {
    const res = await api.get("/api/discounts/validate", { params: { code, productId } });
    return unwrap<DiscountValidation>(res);
  },
  list: async () => {
    const res = await api.get("/api/discounts");
    return unwrap<DiscountCode[]>(res);
  },
  create: async (data: CreateDiscountPayload) => {
    const res = await api.post("/api/discounts", data);
    return unwrap<DiscountCode>(res);
  },
  delete: async (id: string) => {
    const res = await api.delete(`/api/discounts/${id}`);
    return unwrap<{ success: boolean }>(res);
  },
};

export const variantsApi = {
  list: async (productId: string) => {
    const res = await api.get(`/api/products/${productId}/variants`);
    return unwrap<ProductVariant[]>(res);
  },
  create: async (productId: string, data: CreateVariantPayload) => {
    const res = await api.post(`/api/products/${productId}/variants`, data);
    return unwrap<ProductVariant>(res);
  },
  update: async (productId: string, variantId: string, data: Partial<CreateVariantPayload>) => {
    const res = await api.put(`/api/products/${productId}/variants/${variantId}`, data);
    return unwrap<ProductVariant>(res);
  },
  remove: async (productId: string, variantId: string) => {
    const res = await api.delete(`/api/products/${productId}/variants/${variantId}`);
    return unwrap<{ success: boolean }>(res);
  },
};

export const fileUploadApi = {
  uploadThumbnail: async (productId: string, file: File) => {
    const form = new FormData();
    form.append("thumbnail", file);
    const res = await api.post(`/api/products/${productId}/thumbnail`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<{ thumbnailUrl: string }>(res);
  },
  uploadFile: async (productId: string, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post(`/api/products/${productId}/files`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress ? (e) => { if (e.total) onProgress(Math.round((e.loaded * 100) / e.total)); } : undefined,
    });
    return unwrap<ProductFile>(res);
  },
  deleteFile: async (productId: string, fileId: string) => {
    const res = await api.delete(`/api/products/${productId}/files/${fileId}`);
    return unwrap<{ success: boolean }>(res);
  },
};

export const followersApi = {
  getFollowing: async () => {
    const res = await api.get("/api/followers/my/following");
    return unwrap<FollowingItem[]>(res);
  },
  follow: async (creatorId: string) => {
    const res = await api.post(`/api/followers/${creatorId}/follow`);
    return unwrap<{ success: boolean }>(res);
  },
  unfollow: async (creatorId: string) => {
    const res = await api.delete(`/api/followers/${creatorId}/follow`);
    return unwrap<{ success: boolean }>(res);
  },
  isFollowing: async (creatorId: string) => {
    const res = await api.get(`/api/followers/${creatorId}/following`);
    return unwrap<{ following: boolean }>(res);
  },
};

export interface FollowingItem {
  id: string;
  followedAt: string;
  creator: {
    id: string;
    name: string;
    username?: string | null;
    image?: string | null;
    bio?: string | null;
    accentColor?: string | null;
    followerCount: number;
    productCount: number;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      priceCents: number;
      thumbnailUrl?: string | null;
    }>;
  };
}

export interface PayoutProviderStatus { connected: boolean; onboarded: boolean; accountId: string | null; configured: boolean; }
export interface OrderItem { id: string; amountCents: number; currency: string; status: string; paymentProvider: string; createdAt: string; customerEmail: string; customerName?: string | null; product: { id: string; name: string; slug: string; thumbnailUrl?: string | null }; variant?: { name: string } | null; }
export interface OrderDetail extends OrderItem { licenseKeys: Array<{ licenseKey: string; uses: number; maxUses: number; isDisabled: boolean }>; product: OrderItem["product"] & { files: ProductFile[]; creator?: { username?: string | null } }; }
export interface DownloadOrderInfo { id: string; productName: string; files: ProductFile[]; licenseKeys: Array<{ licenseKey: string; uses: number; maxUses: number; isDisabled: boolean }>; }
export interface DiscountCode { id: string; code: string; discountType: "percentage" | "fixed"; discountValue: number; maxUses?: number | null; currentUses: number; validFrom: string; validUntil?: string | null; product: { id: string; name: string }; createdAt: string; }
export interface DiscountValidation { discount: { id: string; code: string; type: "percentage" | "fixed"; value: number; }; originalPriceCents: number; discountedPriceCents: number; savingsCents: number; }
export interface CreateDiscountPayload { productId: string; code: string; discountType: "percentage" | "fixed"; discountValue: number; maxUses?: number | null; validUntil?: string | null; }
export interface CreateVariantPayload { name: string; priceCents: number; description?: string; sortOrder?: number; }
