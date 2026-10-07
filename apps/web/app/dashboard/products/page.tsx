"use client";

import Link from "next/link";
import {
  PlusCircle,
  Package,
  Eye,
  ShoppingCart,
  Trash2,
  Loader2,
  Globe,
  FileText,
} from "lucide-react";
import { useMyProducts } from "@/hooks/api-hooks";
import { formatPrice, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/mock-data";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  published: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-orange-500/20 text-orange-400 border-orange-500/40",
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

export default function MyProductsPage() {
  const { data: products, loading, error, refetch, deleteProduct } =
    useMyProducts({ limit: 100 });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? It will no longer be visible.`)) return;
    try {
      await deleteProduct(id);
      toast.success(`"${name}" archived`);
    } catch (e: any) {
      toast.error("Failed to archive", { description: e.message });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading font-black text-3xl mb-1">My Products</h1>
          <p className="text-muted-foreground">
            {loading
              ? "Loadingâ€¦"
              : `${products?.length ?? 0} ${
                  (products?.length ?? 0) === 1 ? "product" : "products"
                }`}
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="brutal-btn bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2"
        >
          <PlusCircle size={16} /> New Product
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading your productsâ€¦</p>
        </div>
      ) : error ? (
        <div className="brutal-card p-12 text-center">
          <p className="font-heading font-bold text-xl mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refetch}
            className="brutal-btn bg-primary text-primary-foreground text-sm"
          >
            Retry
          </button>
        </div>
      ) : !products || products.length === 0 ? (
        <div className="brutal-card p-12 text-center">
          <div className="w-16 h-16 bg-muted brutal-border mx-auto mb-4 flex items-center justify-center">
            <Package size={28} className="text-muted-foreground" />
          </div>
          <h2 className="font-heading font-bold text-xl mb-2">
            No products yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first digital product and it will appear here, ready to
            sell.
          </p>
          <Link
            href="/dashboard/products/new"
            className="brutal-btn bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2"
          >
            <PlusCircle size={16} /> Create Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const category = product.category || "other";
            const colorClass = CATEGORY_COLORS[category] || "bg-digi-pink";
            return (
              <div
                key={product.id}
                className="brutal-card overflow-hidden group flex flex-col"
              >
                {/* Thumbnail */}
                <div
                  className={`aspect-video ${colorClass} relative overflow-hidden`}
                >
                  {product.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.thumbnailUrl}
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
                    {product.isPayWhatYouWant
                      ? "PWYW"
                      : formatPrice(product.priceCents, product.currency)}
                  </div>
                  {/* Status badge */}
                  <div
                    className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold brutal-border ${
                      statusColors[product.status] || "bg-muted"
                    }`}
                  >
                    {product.status.toUpperCase()}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 truncate">
                    {CATEGORY_LABELS[category] || category} â€¢{" "}
                    {product.productType}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={12} /> {product.viewCount.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShoppingCart size={12} /> {product.salesCount} sales
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-border gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {product.status === "draft" && (
                        <button
                          onClick={async () => {
                            // Publish from list
                            try {
                              const { productsApi } = await import("@/lib/api");
                              await productsApi.publish(product.id);
                              toast.success(`"${product.name}" published!`);
                              refetch();
                            } catch (e: any) {
                              toast.error("Could not publish", {
                                description: e.message,
                              });
                            }
                          }}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors brutal-border opacity-0 group-hover:opacity-100"
                          title="Publish"
                        >
                          <Globe size={14} />
                        </button>
                      )}
                      {product.creator?.username && (
                        <Link
                          href={`/product/${product.creator.username}/${product.slug}`}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors brutal-border opacity-0 group-hover:opacity-100"
                          title="Preview"
                          target="_blank"
                        >
                          <FileText size={14} />
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors brutal-border opacity-0 group-hover:opacity-100"
                        title="Edit product"
                      >
                        <FileText size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors brutal-border opacity-0 group-hover:opacity-100"
                        aria-label="Archive product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
