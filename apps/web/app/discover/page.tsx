"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, Sparkles, BrainCircuit } from "lucide-react";
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

  // AI Semantic Search state
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [semanticResults, setSemanticResults] = useState<SemanticSearchResultItem[]>([]);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticSearched, setSemanticSearched] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  const { data: featuredCreators, loading: creatorsLoading } = useFeaturedCreators(8);

  const { products, pagination, loading, error } = useDiscoverProducts({
    q: search || undefined,
    category: selectedCategory || undefined,
    sort: sortBy,
    page,
    limit: 20,
  });

  const performSemanticSearch = useCallback(
    async (query: string, category?: string | null) => {
      if (!query.trim()) {
        setSemanticResults([]);
        setSemanticSearched(false);
        return;
      }
      setSemanticLoading(true);
      setSemanticError(null);
      try {
        const results = await aiApi.semanticSearch(
          query.trim(),
          24,
          category || undefined
        );
        setSemanticResults(results);
        setSemanticSearched(true);
      } catch (err: unknown) {
        console.error("Semantic search failed:", err);
        setSemanticError(
          err instanceof Error
            ? err.message
            : "Semantic search query failed. Try standard search."
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
      if (isSemanticMode) {
        performSemanticSearch(searchInput, selectedCategory);
      } else {
        setSearch(searchInput);
        setPage(1);
      }
    },
    [isSemanticMode, searchInput, selectedCategory, performSemanticSearch]
  );

  const toggleSemanticMode = () => {
    const nextMode = !isSemanticMode;
    setIsSemanticMode(nextMode);
    if (nextMode && searchInput.trim()) {
      performSemanticSearch(searchInput, selectedCategory);
    }
  };

  const handleCategorySelect = (cat: string | null) => {
    setSelectedCategory(cat);
    setPage(1);
    if (isSemanticMode && searchInput.trim()) {
      performSemanticSearch(searchInput, cat);
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setSearchInput(suggestion);
    setIsSemanticMode(true);
    performSemanticSearch(suggestion, selectedCategory);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <h1 className="font-heading font-black text-4xl md:text-5xl">
              Discover
            </h1>
            <button
              type="button"
              onClick={toggleSemanticMode}
              className={`brutal-btn px-4 py-2.5 text-xs font-black flex items-center gap-2 self-start md:self-auto transition-all ${
                isSemanticMode
                  ? "bg-digi-mint text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-card hover:bg-muted text-foreground"
              }`}
            >
              <Sparkles
                size={14}
                className={isSemanticMode ? "text-black fill-black" : "text-primary"}
              />
              <span>{isSemanticMode ? "✨ AI Semantic Search: ON" : "✨ Try AI Semantic Search"}</span>
            </button>
          </div>
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
                placeholder={
                  isSemanticMode
                    ? "Ask AI in plain English (e.g., 'minimalist student notion template', 'python scraping scripts')..."
                    : "Search products..."
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 brutal-border bg-card font-body text-sm focus:outline-none focus:ring-2 ${
                  isSemanticMode
                    ? "border-primary focus:ring-digi-mint bg-digi-mint/5"
                    : "focus:ring-primary"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={isSemanticMode && semanticLoading}
              className={`brutal-btn text-sm font-bold px-6 py-3 flex items-center justify-center gap-2 ${
                isSemanticMode
                  ? "bg-digi-mint text-black"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isSemanticMode ? (
                <>
                  {semanticLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  <span>AI Search</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
            {!isSemanticMode && (
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
            )}
          </form>

          {/* Semantic Info & Quick Query Prompts */}
          {isSemanticMode && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono font-bold text-black bg-digi-mint px-2.5 py-1 brutal-border inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <BrainCircuit size={13} />
                Vector Space TF-IDF + Cosine Similarity Active
              </span>
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
          )}
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
            {isSemanticMode ? (
              /* AI Semantic Search Results */
              semanticLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-digi-mint brutal-border flex items-center justify-center animate-bounce shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles size={24} className="text-black" />
                  </div>
                  <p className="font-heading font-bold text-lg">
                    Generating Query Embedding Vectors…
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    Computing Cosine Similarity over product titles, categories, and tags
                  </p>
                </div>
              ) : semanticError ? (
                <div className="brutal-card p-12 text-center">
                  <p className="font-heading font-bold text-xl mb-2 text-destructive">
                    Semantic Search Error
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">{semanticError}</p>
                  <button
                    type="button"
                    onClick={() => performSemanticSearch(searchInput, selectedCategory)}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold px-4 py-2"
                  >
                    Retry Search
                  </button>
                </div>
              ) : semanticSearched ? (
                semanticResults.length === 0 ? (
                  <div className="brutal-card p-12 text-center">
                    <p className="font-heading font-bold text-xl mb-2">
                      No vector matches found
                    </p>
                    <p className="text-muted-foreground text-sm mb-6">
                      Try searching with broader natural language terms or select another category.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {QUICK_SUGGESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleQuickSuggestion(q)}
                          className="brutal-btn bg-card text-xs font-semibold px-3 py-1.5"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 bg-muted/40 p-3 brutal-border">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-xs uppercase bg-digi-mint text-black px-2 py-0.5 brutal-border shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          ✨ AI Match Engine
                        </span>
                        <span className="text-xs md:text-sm font-semibold">
                          Found {semanticResults.length} products ranked by vector similarity
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSemanticMode(false);
                          setSemanticSearched(false);
                          setSemanticResults([]);
                        }}
                        className="text-xs font-bold text-muted-foreground underline hover:text-foreground self-start sm:self-auto"
                      >
                        Back to Standard View
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {semanticResults.map((item) => (
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
                /* Semantic Mode Welcome / Prompts */
                <div className="brutal-card p-8 md:p-12 text-center bg-card">
                  <div className="w-16 h-16 rounded-2xl bg-digi-mint brutal-border flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <BrainCircuit size={32} className="text-black" />
                  </div>
                  <h3 className="font-heading font-black text-2xl md:text-3xl mb-2">
                    AI Semantic Product Search
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                    Search with concepts and natural intent rather than exact keyword matches.
                    Our vector similarity engine matches semantics, tags, and product descriptions.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {QUICK_SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleQuickSuggestion(q)}
                        className="brutal-btn bg-background text-xs py-2 px-3.5 font-bold hover:bg-digi-mint transition-colors"
                      >
                        ✨ {q}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              /* Standard Search Results */
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
              )
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
