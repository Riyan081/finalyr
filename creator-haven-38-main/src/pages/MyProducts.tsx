import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, PlusCircle, BarChart3, Settings, LogOut,
  Eye, ShoppingCart, Trash2, Image as ImageIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useMyProducts } from "@/hooks/useMyProducts";
import { formatPrice } from "@/data/mockData";
import { toast } from "sonner";

const SIDEBAR_LINKS = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Package, label: "Products", href: "/dashboard/products" },
  { icon: PlusCircle, label: "New Product", href: "/dashboard/products/new" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Design": "bg-digi-pink",
  "Drawing & Painting": "bg-digi-peach",
  "Software Development": "bg-digi-yellow",
  "Self Improvement": "bg-digi-mint",
  "Fiction Books": "bg-digi-lavender",
  "Education": "bg-digi-yellow",
  "Comics & Graphic Novels": "bg-digi-peach",
  "Fitness & Health": "bg-digi-mint",
  "Music & Sound Design": "bg-digi-lavender",
  "Photography": "bg-digi-pink",
  "Business & Money": "bg-digi-yellow",
  "3D": "bg-digi-peach",
  "Audio": "bg-digi-lavender",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
};

const MyProducts = () => {
  const location = useLocation();
  const { products, removeProduct } = useMyProducts();

  const handleDelete = (id: string, name: string) => {
    removeProduct(id);
    toast.success(`Deleted "${name}"`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-card brutal-border border-t-0 border-l-0 border-b-0 p-4">
          <nav className="space-y-1 flex-1">
            {SIDEBAR_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary text-primary-foreground brutal-border"
                    : "hover:bg-muted"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            ))}
          </nav>
          <button className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-auto">
            <LogOut size={18} />
            Log out
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full">
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="font-heading font-black text-3xl mb-1">My Products</h1>
              <p className="text-muted-foreground">
                {products.length} {products.length === 1 ? "product" : "products"} published
              </p>
            </div>
            <Link
              to="/dashboard/products/new"
              className="brutal-btn bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2"
            >
              <PlusCircle size={16} /> New Product
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="brutal-card p-12 text-center">
              <div className="w-16 h-16 bg-muted brutal-border mx-auto mb-4 flex items-center justify-center">
                <Package size={28} className="text-muted-foreground" />
              </div>
              <h2 className="font-heading font-bold text-xl mb-2">No products yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first digital product and it will appear here, ready to sell.
              </p>
              <Link
                to="/dashboard/products/new"
                className="brutal-btn bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2"
              >
                <PlusCircle size={16} /> Create Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => {
                const colorClass = CATEGORY_COLORS[product.category] || "bg-digi-pink";
                return (
                  <div key={product.id} className="brutal-card overflow-hidden group flex flex-col">
                    {/* Thumbnail */}
                    <div className={`aspect-video ${colorClass} relative overflow-hidden`}>
                      {product.coverImage ? (
                        <img
                          src={product.coverImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-heading font-black text-primary-foreground/30 text-7xl select-none">
                            {product.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-card brutal-border px-2 py-0.5 text-xs font-bold">
                        {formatPrice(product.price)}
                      </div>
                      {!product.coverImage && (
                        <div className="absolute bottom-2 left-2 bg-background/80 brutal-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground inline-flex items-center gap-1">
                          <ImageIcon size={10} /> No cover
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-3 truncate">
                        {product.category}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={12} /> {product.views.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ShoppingCart size={12} /> {product.sales} sales
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-border">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(product.createdAt)}
                        </span>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors brutal-border opacity-0 group-hover:opacity-100"
                          aria-label="Delete product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyProducts;
