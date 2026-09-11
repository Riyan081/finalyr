"use client";

import { useState, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { type DiscoverProduct } from "@/lib/api";
import { useDiscoverProducts, useDiscoverCategories, useFeaturedCreators } from "@/hooks/api-hooks";
import Link from "next/link";

type SortOption = "popular" | "newest" | "price_asc" | "price_desc" | "rating";

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [page, setPage] = useState(1);

  const { data: featuredCreators, loading: creatorsLoading } = useFeaturedCreators(8);

  const { products, pagination, loading, error } = useDiscoverProducts({
    q: search || undefined,
    category: selectedCategory || undefined,
    sort: sortBy,
    page,
    limit: 20,
  });

  // Fetch real categories from backend
  const { data: apiCategories } = useDiscoverCategories();

  // Build category list — use API categories with counts if available, otherwise static list
  const categories =
    apiCategories && apiCategories.length > 0
      ? apiCategories.map((c) => ({
          key: c.name,
          label: CATEGORY_LABELS[c.name] || c.name,
          count: c.count,
        }))
      : Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
          key,
          label,
          count: 0,
        }));

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    },
    [searchInput]
  );

  const handleCategorySelect = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-black text-4xl md:text-5xl mb-4">
            Discover
          </h1>
          <p className="text-muted-foreground text-lg">
            Find the best digital products from creators worldwide.
          </p>
        </div>

        {/* Featured Creators Strip */}
        {(creatorsLoading || (featuredCreators && featuredCreators.length > 0)) && (
          <div className="mb-8">
            <h2 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Top Creators
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {creatorsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                      <div className="w-12 h-12 rounded-full brutal-border bg-muted animate-pulse" />
                      <div className="h-2 bg-muted animate-pulse rounded w-14" />
                    </div>
                  ))
                : featuredCreators!.map((creator) => (
                    <Link
                      key={creator.id}
                      href={`/creator/${creator.username}`}
                      className="flex flex-col items-center gap-2 min-w-[72px] group"
                    >
                      {creator.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={creator.image}
                          alt={creator.name}
                          className="w-12 h-12 rounded-full brutal-border object-cover group-hover:brutal-shadow transition-all"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full brutal-border flex items-center justify-center group-hover:brutal-shadow transition-all"
                          style={{ backgroundColor: creator.accentColor || "#FF90E8" }}
                        >
                          <span className="font-heading font-black text-white text-sm">
                            {creator.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <span className="text-[10px] font-semibold truncate max-w-[72px] text-center group-hover:text-primary transition-colors">
                        {creator.username ? `@${creator.username}` : creator.name}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>
        )}

        {/* Search & Sort */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 brutal-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="brutal-btn bg-primary text-primary-foreground text-sm font-bold px-6 py-3"
          >
            Search
          </button>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="brutal-border bg-card px-4 py-3 font-body text-sm focus:outline-none cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-muted-foreground">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground brutal-border"
                    : "hover:bg-muted"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategorySelect(cat.key)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategory === cat.key
                      ? "bg-primary text-primary-foreground brutal-border"
                      : "hover:bg-muted"
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span className="text-xs opacity-60">{cat.count}</span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={32} className="animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading products…</p>
              </div>
            ) : error ? (
              <div className="brutal-card p-12 text-center">
                <p className="font-heading font-bold text-xl mb-2">
                  Could not load products
                </p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : !products || products.length === 0 ? (
              <div className="brutal-card p-12 text-center">
                <p className="font-heading font-bold text-xl mb-2">
                  No products found
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {pagination?.total ?? products.length} products
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product: DiscoverProduct) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!pagination.hasPrev}
                      className="brutal-btn bg-card text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNext}
                      className="brutal-btn bg-card text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
