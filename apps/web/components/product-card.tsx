import Link from "next/link";
import { Star } from "lucide-react";
import { type DiscoverProduct, formatPrice, CATEGORY_COLORS } from "@/lib/mock-data";

export interface ProductCardItem {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  priceCents: number;
  currency?: string;
  isPayWhatYouWant?: boolean;
  ratingAvg?: number;
  salesCount?: number;
  creator?: {
    name?: string;
    username?: string | null;
    image?: string | null;
  } | null;
}

interface ProductCardProps {
  product: ProductCardItem;
  matchScore?: number;
  matchReason?: string;
}

export default function ProductCard({ product, matchScore, matchReason }: ProductCardProps) {
  const category = product.category || "other";
  const colorClass = CATEGORY_COLORS[category] || "bg-digi-pink";

  // Build the link: /product/[username]/[slug]
  const username = product.creator?.username;
  const href = username
    ? `/product/${username}/${product.slug}`
    : `/product/_/${product.slug}`;

  const displayPrice = product.isPayWhatYouWant
    ? "Pay what you want"
    : formatPrice(product.priceCents, product.currency || "INR");

  const ratingAvg = product.ratingAvg ?? 0;
  const salesCount = product.salesCount ?? 0;

  return (
    <Link href={href} className="block">
      <div className="brutal-card overflow-hidden group">
        {/* Cover Image */}
        <div className={`aspect-[4/3] ${colorClass} relative overflow-hidden`}>
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnailUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading font-bold text-primary-foreground/30 text-6xl select-none">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
          {/* AI Match Badge */}
          {matchScore !== undefined && (
            <div className="absolute top-3 left-3 bg-digi-mint text-black brutal-border px-2.5 py-0.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ✨ {matchScore}% Match
            </div>
          )}
          {/* Price Tag */}
          <div className="absolute top-3 right-3 bg-card brutal-border px-3 py-1 font-bold text-sm">
            {displayPrice}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {product.creator?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.creator.image}
                alt={product.creator.name || ""}
                className="w-5 h-5 rounded-full brutal-border"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary brutal-border flex items-center justify-center">
                <span className="text-[8px] text-primary-foreground font-bold">
                  {product.creator?.name?.charAt(0)?.toUpperCase() || product.creator?.username?.charAt(0)?.toUpperCase() || "C"}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground font-medium truncate">
              {product.creator?.name || product.creator?.username || "Creator"}
            </span>
          </div>

          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {matchReason && (
            <p className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-2 py-1 rounded border border-border/50 truncate" title={matchReason}>
              💡 {matchReason}
            </p>
          )}

          <div className="flex items-center gap-1">
            <Star size={12} className="fill-digi-yellow text-digi-yellow" />
            <span className="text-xs font-semibold">
              {ratingAvg > 0 ? ratingAvg.toFixed(1) : "New"}
            </span>
            {salesCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({salesCount} sold)
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
