"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Star, ShoppingBag } from "lucide-react";
import { aiApi, type RecommendationItem } from "@/lib/api";

interface SmartRecommendationsProps {
  currentProductId: string;
}

export default function SmartRecommendations({ currentProductId }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await aiApi.getRecommendations(currentProductId, 4);
        if (!cancelled) {
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (currentProductId) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="mt-16 pt-10 border-t-2 border-foreground/20">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-digi-pink text-black rounded border border-black animate-pulse">
            <Sparkles size={18} />
          </div>
          <h2 className="font-heading font-black text-2xl">Loading Recommendations...</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 brutal-card animate-pulse bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-10 border-t-2 border-foreground/20">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-digi-pink text-black rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles size={18} />
        </div>
        <h2 className="font-heading font-black text-2xl tracking-tight">
          Recommendations
        </h2>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((item) => {
          const productHref = item.creator.username
            ? `/product/${item.creator.username}/${item.slug}`
            : `/product/_/${item.slug}`;

          const priceStr =
            item.priceCents === 0 ? "Free" : `₹${(item.priceCents / 100).toLocaleString("en-IN")}`;

          // Distinct color token for match badge
          const badgeBg =
            item.recommendationType === "co-purchased"
              ? "bg-digi-yellow text-black"
              : item.recommendationType === "category-top"
              ? "bg-digi-mint text-black"
              : "bg-digi-lavender text-black";

          return (
            <Link
              key={item.id}
              href={productHref}
              className="group flex flex-col brutal-card bg-card p-0 overflow-hidden hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {/* Thumbnail with overlay badge */}
              <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden border-b-2 border-foreground">
                {item.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ShoppingBag size={32} className="text-muted-foreground" />
                  </div>
                )}

                {/* Match Score Badge */}
                <div className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${badgeBg}`}>
                  {item.badgeText}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.category || "Digital"}
                  </p>
                  <h3 className="font-heading font-black text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  {item.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-digi-yellow text-digi-yellow" />
                    <span className="text-xs font-bold">{item.ratingAvg.toFixed(1)}</span>
                  </div>
                  <div className="font-heading font-black text-sm">
                    {priceStr}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
