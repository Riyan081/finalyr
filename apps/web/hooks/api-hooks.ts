"use client";

import { useState, useEffect, useCallback } from "react";
import {
  analyticsApi,
  discoverApi,
  productsApi,
  storefrontApi,
  creatorApi,
  userApi,
  adminApi,
  premiumApi,
  type ApiProduct,
  type DiscoverProduct,
  type AnalyticsOverview,
  type RevenueDay,
  type TopProduct,
  type RecentSale,
  type PublicProduct,
  type StorefrontData,
  type PublicCreatorProfile,
  type FeaturedCreator,
  type Pagination,
  type AuthUser,
  type AdminStats,
  type AdminUser,
} from "@/lib/api";

// ─── Generic async state ─────────────────────────────────────────────────────

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
    } catch (e: any) {
      setState({ data: null, loading: false, error: e.message });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, refetch: run };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useMe() {
  return useAsync(() => userApi.getMe(), []);
}

// ─── Creator's own products (auth required) ───────────────────────────────────

export function useMyProducts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const [data, setData] = useState<{
    data: ApiProduct[];
    pagination: Pagination;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productsApi.list(params);
      setData({ data: res.data, pagination: res.pagination });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const deleteProduct = useCallback(
    async (id: string) => {
      await productsApi.archive(id);
      fetch();
    },
    [fetch]
  );

  const publishProduct = useCallback(
    async (id: string) => {
      await productsApi.publish(id);
      fetch();
    },
    [fetch]
  );

  return { ...data, loading, error, refetch: fetch, deleteProduct, publishProduct };
}

// ─── Discover ────────────────────────────────────────────────────────────────

export function useDiscoverProducts(params?: {
  q?: string;
  category?: string;
  type?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<{
    products: DiscoverProduct[];
    pagination: Pagination;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await discoverApi.search(params);
      setData({ products: res.data, pagination: res.pagination });
    } catch (e: any) {
      setError(e.message);
      setData({ products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } });
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}

export function useTrendingProducts(limit = 8) {
  return useAsync(() => discoverApi.trending(limit), [limit]);
}

export function useDiscoverCategories() {
  return useAsync(() => discoverApi.categories(), []);
}

export function useFeaturedCreators(limit = 6) {
  return useAsync<FeaturedCreator[]>(() => discoverApi.featuredCreators(limit), [limit]);
}

export function useFeaturedProducts(limit = 8) {
  return useAsync<DiscoverProduct[]>(() => storefrontApi.featured(limit), [limit]);
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useAnalyticsOverview() {
  return useAsync<AnalyticsOverview>(() => analyticsApi.overview(), []);
}

export function useAnalyticsRevenue(days = 30) {
  return useAsync<RevenueDay[]>(() => analyticsApi.revenue(days), [days]);
}

export function useTopProducts(limit = 5) {
  return useAsync<TopProduct[]>(() => analyticsApi.topProducts(limit), [limit]);
}

export function useRecentSales(limit = 10) {
  return useAsync<RecentSale[]>(() => analyticsApi.recentSales(limit), [limit]);
}

// ─── Public product detail ────────────────────────────────────────────────────

export function usePublicProduct(username: string, slug: string) {
  return useAsync<PublicProduct>(
    () => storefrontApi.getProduct(username, slug),
    [username, slug]
  );
}

// ─── Storefront ───────────────────────────────────────────────────────────────

export function useStorefront(username: string) {
  return useAsync<StorefrontData>(() => storefrontApi.getCreator(username), [username]);
}

// ─── Creator public profile ───────────────────────────────────────────────────

export function useCreatorProfile(username: string) {
  return useAsync<PublicCreatorProfile>(
    () => creatorApi.getPublicProfile(username),
    [username]
  );
}

// ─── Admin & Premium ─────────────────────────────────────────────────────────

export function useAdminStats() {
  return useAsync<AdminStats>(() => adminApi.getStats(), []);
}

export function useAllUsers() {
  return useAsync<AdminUser[]>(() => adminApi.getUsers(), []);
}

export function usePremiumFeatures() {
  return useAsync<string[]>(() => premiumApi.getFeatures(), []);
}
