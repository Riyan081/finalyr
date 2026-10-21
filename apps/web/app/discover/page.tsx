"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { type DiscoverProduct, aiApi, type SemanticSearchResultItem } from "@/lib/api";
import { useDiscoverProducts, useDiscoverCategories, useFeaturedCreators } from "@/hooks/api-hooks";
import Link from "next/link";

type SortOption = "popular" | "newest" | "price_asc" | "price_desc" | "rating";

const QUICK_SUGGESTIONS = [
  "Notion templates for students",
  "Python automation scripts",
  "Figma design system kits",
  "Fullstack SaaS boilerplates",
  "Lo-fi synthwave audio stems",
  "3D low-poly blender models",
];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [page, setPage] = useState(1);

  // Semantic search state
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResultItem[]>([]);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);

  const { data: featuredCreators, loading: creatorsLoading } = useFeaturedCreators(8);

  const { products, pagination, loading, error } = useDiscoverProducts({
    category: selectedCategory || undefined,
    sort: sortBy,
    page,
    limit: 20,
  });

  const performSemanticSearch = useCallback(
    async (query: string, category?: string | null) => {
      if (!query.trim()) {
        setSemanticResults([]);
        setDidYouMean(null);
        return;
      }
      setSemanticLoading(true);
      setSemanticError(null);
      setDidYouMean(null);
      try {
        const res = await aiApi.semanticSearch(
          query.trim(),
          24,
          category || undefined
        );
        setSemanticResults(res.items);
        setDidYouMean(res.didYouMean || null);
      } catch (err: unknown) {
        console.error("Semantic search failed:", err);
        setSemanticError(
          err instanceof Error
            ? err.message
            : "Search query failed. Please try again."
        );
      } finally {
        setSemanticLoading(false);
      }
    },
    []
  );

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
      const q = searchInput.trim();
      setSearch(q);
      setPage(1);
      setDidYouMean(null);
      if (q) {
        performSemanticSearch(q, selectedCategory);
      } else {
        setSemanticResults([]);
      }
    },
    [searchInput, selectedCategory, performSemanticSearch]
  );

  const handleClearSearch = () => {
    setSearch("");
    setSearchInput("");
    setSemanticResults([]);
    setSemanticError(null);
    setDidYouMean(null);
    setPage(1);
  };

  const handleApplySuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearch(suggestion);
    setPage(1);
    setDidYouMean(null);
    performSemanticSearch(suggestion, selectedCategory);
  };

  const handleCategorySelect = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
    if (search.trim()) {
      performSemanticSearch(search.trim(), cat);
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setSearch(suggestion);
    setPage(1);
    setDidYouMean(null);
    performSemanticSearch(suggestion, selectedCategory);
  };

  // Sort semantic results client-side according to active sort option
  const sortedSemanticResults = useMemo(() => {
    if (!semanticResults.length) return [];
    const items = [...semanticResults];
    switch (sortBy) {
      case "price_asc":
        return items.sort((a, b) => a.priceCents - b.priceCents);
      case "price_desc":
        return items.sort((a, b) => b.priceCents - a.priceCents);
      case "popular":
      default:
        return items.sort((a, b) => b.matchScore - a.matchScore);
    }
  }, [semanticResults, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-black text-4xl md:text-5xl mb-2">
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
        <div className="mb-8 space-y-3">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search products in plain English (e.g., 'minimalist student notion template', 'python scripts')..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 brutal-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={semanticLoading}
              className="brutal-btn text-sm font-bold px-6 py-3 flex items-center justify-center gap-2 bg-primary text-primary-foreground"
            >
              {semanticLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Search</span>
                </>
              )}
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

          {/* Quick Query Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground font-medium mr-1">
              Try:
            </span>
            {QUICK_SUGGESTIONS.slice(0, 4).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickSuggestion(q)}
                className="text-xs font-semibold px-2 py-1 bg-card brutal-border hover:bg-muted transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

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

          {/* Product Grid Area */}
          <div className="flex-1">
            {search.trim() ? (
              /* Search Results (powered by Semantic Search) */
              semanticLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="font-heading font-bold text-lg">
                    Searching products…
                  </p>
                </div>
              ) : semanticError ? (
                <div className="brutal-card p-12 text-center">
                  <p className="font-heading font-bold text-xl mb-2 text-destructive">
                    Search Error
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">{semanticError}</p>
                  <button
                    type="button"
                    onClick={() => performSemanticSearch(search, selectedCategory)}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold px-4 py-2"
                  >
                    Retry Search
                  </button>
                </div>
              ) : sortedSemanticResults.length === 0 ? (
                <div className="brutal-card p-10 text-center space-y-5">
                  <div className="space-y-2">
                    <p className="font-heading font-black text-2xl">
                      No products found for &ldquo;<span className="text-destructive font-mono">{search}</span>&rdquo;
                    </p>
                    {didYouMean && (
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-base">
                        <span className="text-muted-foreground font-semibold">Did you mean:</span>
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(didYouMean)}
                          className="font-heading font-black text-primary underline underline-offset-4 hover:text-primary/80 transition-colors text-lg inline-flex items-center gap-1.5"
                        >
                          <span>{didYouMean}</span>
                          <span className="text-xs font-bold bg-digi-mint text-black px-2 py-0.5 rounded border border-black no-underline shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Click to search
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {didYouMean
                      ? `We couldn't find any products matching "${search}", but found products matching "${didYouMean}".`
                      : "Try checking your spelling, using broader natural language terms, or selecting another category."}
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {didYouMean && (
                      <button
                        type="button"
                        onClick={() => handleApplySuggestion(didYouMean)}
                        className="brutal-btn bg-digi-mint text-black text-xs font-bold px-4 py-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Search for &ldquo;{didYouMean}&rdquo;
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="brutal-btn bg-card text-xs font-semibold px-4 py-2.5"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 bg-muted/40 p-3 brutal-border">
                    <span className="text-xs md:text-sm font-semibold">
                      Found {sortedSemanticResults.length} {sortedSemanticResults.length === 1 ? "product" : "products"} for &ldquo;{search}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="text-xs font-bold text-muted-foreground underline hover:text-foreground self-start sm:self-auto"
                    >
                      Clear Search
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {sortedSemanticResults.map((item) => (
                      <ProductCard
                        key={item.id}
                        product={item}
                        matchScore={item.matchScore}
                        matchReason={item.matchReason}
                      />
                    ))}
                  </div>
                </>
              )
            ) : (
              /* Standard Product Browse */
              loading ? (
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
                    Try adjusting your category or filters.
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
              )
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
