import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/mockData";

const Discover = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "price-low" | "price-high">("popular");

  const filtered = useMemo(() => {
    let products = [...MOCK_PRODUCTS];

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q))
      );
    }

    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory);
    }

    switch (sortBy) {
      case "newest": products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "price-low": products.sort((a, b) => a.price - b.price); break;
      case "price-high": products.sort((a, b) => b.price - a.price); break;
      default: products.sort((a, b) => b.salesCount - a.salesCount);
    }

    return products;
  }, [search, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-black text-4xl md:text-5xl mb-4">Discover</h1>
          <p className="text-muted-foreground text-lg">Find the best digital products from creators worldwide.</p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 brutal-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="brutal-border bg-card px-4 py-3 font-body text-sm focus:outline-none cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-muted-foreground">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                  !selectedCategory ? "bg-primary text-primary-foreground brutal-border" : "hover:bg-muted"
                }`}
              >
                All Products
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat ? "bg-primary text-primary-foreground brutal-border" : "hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="brutal-card p-12 text-center">
                <p className="font-heading font-bold text-xl mb-2">No products found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filtered.length} products</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Discover;
