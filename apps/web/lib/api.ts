import axios from "axios";

// ─── Axios Instance ─────────────────────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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
  /** GET /api/admin/stats */
  getStats: async () => {
    const res = await api.get("/api/admin/stats");
    return unwrap<AdminStats>(res);
  },
  /** GET /api/admin/users */
  getUsers: async (params?: { search?: string; role?: string }) => {
    const res = await api.get("/api/admin/users", { params });
    return unwrap<AdminUser[]>(res);
  },
  /** PATCH /api/admin/users/:id/role */
  updateUserRole: async (id: string, role: string) => {
    const res = await api.patch(`/api/admin/users/${id}/role`, { role });
    return unwrap<{ id: string; role: string }>(res);
  },
  /** POST /api/admin/users/:id/ban */
  banUser: async (id: string, banned: boolean, reason?: string) => {
    const res = await api.post(`/api/admin/users/${id}/ban`, { banned, reason });
    return unwrap<AdminUser>(res);
  },
  /** GET /api/admin/products */
  getProducts: async (params?: { search?: string; status?: string }) => {
    const res = await api.get("/api/admin/products", { params });
    return unwrap<AdminProduct[]>(res);
  },
  /** PATCH /api/admin/products/:id */
  moderateProduct: async (id: string, data: { status?: string; isListedOnDiscover?: boolean }) => {
    const res = await api.patch(`/api/admin/products/${id}`, data);
    return unwrap<{ id: string; status: string; isListedOnDiscover: boolean }>(res);
  },
  /** GET /api/admin/orders */
  getOrders: async (params?: { search?: string; status?: string }) => {
    const res = await api.get("/api/admin/orders", { params });
    return unwrap<AdminOrder[]>(res);
  },
  /** POST /api/admin/orders/:id/refund */
  refundOrder: async (id: string) => {
    const res = await api.post(`/api/admin/orders/${id}/refund`);
    return unwrap<AdminOrder>(res);
  },
  /** GET /api/admin/payouts */
  getPayouts: async (params?: { status?: string }) => {
    const res = await api.get("/api/admin/payouts", { params });
    return unwrap<AdminPayout[]>(res);
  },
  /** POST /api/admin/payouts/:id/process */
  processPayout: async (id: string) => {
    const res = await api.post(`/api/admin/payouts/${id}/process`);
    return unwrap<AdminPayout>(res);
  },
  /** GET /api/admin/system */
  getSystemHealth: async () => {
    const res = await api.get("/api/admin/system");
    return unwrap<AdminSystemHealth>(res);
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
  totalUsers?: number;
  activeSessions?: number;
  users?: {
    total: number;
    creators: number;
    customers: number;
    admins: number;
    activeSessions: number;
  };
  products?: {
    total: number;
    published: number;
    drafts: number;
  };
  orders?: {
    total: number;
    completed: number;
  };
  financials?: {
    totalVolumeCents: number;
    platformRevenueCents: number;
    creatorEarningsCents: number;
  };
  recentSales?: Array<{
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    createdAt: string;
    customerEmail: string;
    customerName?: string | null;
    paymentProvider: string;
    product: { id: string; name: string; slug: string };
  }>;
  topProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    salesCount: number;
    revenueCents: number;
    creator: { id: string; name: string; username: string | null };
  }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  username?: string | null;
  emailVerified?: boolean;
  banned?: boolean | null;
  banReason?: string | null;
  createdAt: string;
  _count?: {
    products: number;
    orders: number;
    payouts: number;
  };
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  summary?: string | null;
  priceCents: number;
  currency: string;
  productType: string;
  status: string;
  isListedOnDiscover: boolean;
  category?: string | null;
  salesCount: number;
  revenueCents: number;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    username: string | null;
    email: string;
    image?: string | null;
  };
}

export interface AdminOrder {
  id: string;
  amountCents: number;
  currency: string;
  platformFeeCents: number;
  processingFeeCents: number;
  creatorRevenueCents: number;
  paymentProvider: string;
  status: string;
  createdAt: string;
  refundedAt?: string | null;
  customerEmail: string;
  customerName?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  customer?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
}

export interface AdminPayout {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  creator: {
    id: string;
    name: string;
    username?: string | null;
    email: string;
    payoutSchedule: string;
  };
}

export interface AdminSystemHealth {
  status: string;
  database: {
    status: string;
    latencyMs: number;
  };
  activeSessions: number;
  platformFeePercent: number;
  services: {
    polarPayments: boolean;
    razorpayPayments: boolean;
    storageS3: boolean;
  };
  environment: string;
  uptimeSeconds: number;
  nodeVersion: string;
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

// ─── Licenses & DRM ─────────────────────────────────────────────────────────

export interface LicenseVerifyResult {
  success: boolean;
  valid: boolean;
  message: string;
  uses?: number;
  maxUses?: number;
  key?: string;
  product?: { id: string; name: string; slug: string };
  order?: { id: string; customerEmail: string; customerName?: string | null; createdAt: string };
}

export interface CreatorLicenseKey {
  id: string;
  licenseKey: string;
  uses: number;
  maxUses: number;
  isDisabled: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string };
  order: { id: string; customerEmail: string; createdAt: string };
}

export const licenseApi = {
  /** POST /api/licenses/verify */
  verify: async (licenseKey: string, incrementUses: boolean = true) => {
    const res = await api.post("/api/licenses/verify", { licenseKey, incrementUses });
    return unwrap<LicenseVerifyResult>(res);
  },
  /** POST /api/licenses/decrement */
  decrement: async (licenseKey: string) => {
    const res = await api.post("/api/licenses/decrement", { licenseKey });
    return unwrap<LicenseVerifyResult>(res);
  },
  /** GET /api/licenses/creator-keys */
  getCreatorKeys: async () => {
    const res = await api.get("/api/licenses/creator-keys");
    return unwrap<CreatorLicenseKey[]>(res);
  },
  /** POST /api/licenses/:id/toggle */
  toggleKey: async (id: string) => {
    const res = await api.post(`/api/licenses/${id}/toggle`);
    return unwrap<{ id: string; licenseKey: string; isDisabled: boolean }>(res);
  },
};

// ─── Memberships & Subscriptions ───────────────────────────────────────────

export interface MembershipItem {
  id: string;
  createdAt: string;
  status: "active" | "paused" | "cancelled" | "past_due";
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    currency: string;
    recurrence?: string | null;
    creator?: {
      id: string;
      name: string;
      username?: string | null;
      image?: string | null;
    };
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface CreatorMembersData {
  stats: {
    totalMembers: number;
    activeMembers: number;
    cancelledMembers: number;
    mrrCents: number;
  };
  members: MembershipItem[];
}

export const membershipApi = {
  /** POST /api/memberships/subscribe */
  subscribe: async (productId: string, recurrence?: "monthly" | "yearly") => {
    const res = await api.post("/api/memberships/subscribe", { productId, recurrence });
    return unwrap<{ membership: MembershipItem; orderId: string; isExtension: boolean }>(res);
  },
  /** GET /api/memberships/my-subscriptions */
  getMySubscriptions: async () => {
    const res = await api.get("/api/memberships/my-subscriptions");
    return unwrap<MembershipItem[]>(res);
  },
  /** GET /api/memberships/creator-members */
  getCreatorMembers: async () => {
    const res = await api.get("/api/memberships/creator-members");
    return unwrap<CreatorMembersData>(res);
  },
  /** POST /api/memberships/:id/cancel */
  cancel: async (id: string) => {
    const res = await api.post(`/api/memberships/${id}/cancel`);
    return unwrap<MembershipItem>(res);
  },
  /** POST /api/memberships/:id/renew (Simulate recurring renewal) */
  renew: async (id: string) => {
    const res = await api.post(`/api/memberships/${id}/renew`);
    return unwrap<MembershipItem>(res);
  },
  /** GET /api/memberships/access/:productId */
  checkAccess: async (productId: string) => {
    const res = await api.get(`/api/memberships/access/${productId}`);
    return unwrap<{ hasAccess: boolean; membership?: MembershipItem }>(res);
  },
};
