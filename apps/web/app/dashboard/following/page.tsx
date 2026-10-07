"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, UserPlus, RefreshCw, Loader2, UserMinus, ExternalLink } from "lucide-react";
import { followersApi, type FollowingItem } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

export default function FollowingPage() {
  const [following, setFollowing] = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await followersApi.getFollowing();
      setFollowing(data);
    } catch (e: any) {
      toast.error("Could not load followed creators", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUnfollow = async (creatorId: string, creatorName: string) => {
    setUnfollowingId(creatorId);
    try {
      await followersApi.unfollow(creatorId);
      toast.success(`Unfollowed ${creatorName}`);
      setFollowing((prev) => prev.filter((item) => item.creator.id !== creatorId));
    } catch (e: any) {
      toast.error("Could not unfollow", { description: e.message });
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl mb-1">Followed Sellers</h1>
          <p className="text-muted-foreground">
            Creators you follow. You will get updates when they launch new products.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="brutal-btn bg-primary text-primary-foreground text-sm flex items-center gap-2"
          >
            <UserPlus size={14} /> Discover Creators
          </Link>
          <button
            onClick={load}
            className="brutal-btn bg-card text-sm flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : following.length === 0 ? (
        <div className="brutal-card p-12 text-center">
          <Users size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="font-heading font-bold text-xl mb-2">You aren&apos;t following anyone yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Follow your favorite creators to stay updated on new products, guides, and creative work.
          </p>
          <Link
            href="/discover"
            className="brutal-btn bg-primary text-primary-foreground inline-flex items-center gap-2"
          >
            <UserPlus size={16} /> Explore Creators & Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {following.map(({ id, creator }) => (
            <div key={id} className="brutal-card p-6 flex flex-col justify-between">
              <div>
                {/* Creator Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {creator.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={creator.image}
                        alt={creator.name}
                        className="w-12 h-12 rounded-full brutal-border object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full brutal-border flex items-center justify-center shrink-0"
                        style={{ backgroundColor: creator.accentColor || "#FF90E8" }}
                      >
                        <span className="text-xl text-white font-black">
                          {creator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-base truncate">{creator.name}</h3>
                      {creator.username && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{creator.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnfollow(creator.id, creator.name)}
                    disabled={unfollowingId === creator.id}
                    className="brutal-btn bg-card text-xs font-semibold px-3 py-1.5 flex items-center gap-1 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    {unfollowingId === creator.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <UserMinus size={12} />
                    )}
                    Unfollow
                  </button>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {creator.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                  <span>👥 {creator.followerCount} follower{creator.followerCount !== 1 ? "s" : ""}</span>
                  <span>📦 {creator.productCount} product{creator.productCount !== 1 ? "s" : ""}</span>
                </div>

                {/* Products Preview */}
                {creator.products && creator.products.length > 0 && (
                  <div className="border-t-2 border-border pt-3 mt-3">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Recent Products
                    </p>
                    <div className="space-y-1.5">
                      {creator.products.map((p) => (
                        <Link
                          key={p.id}
                          href={creator.username ? `/product/${creator.username}/${p.slug}` : `/discover`}
                          className="flex items-center justify-between text-xs p-2 brutal-border bg-muted/30 hover:bg-muted transition-colors rounded"
                        >
                          <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                          <span className="font-bold shrink-0">{formatPrice(p.priceCents)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Storefront Link */}
              {creator.username && (
                <div className="mt-4 pt-3 border-t-2 border-border">
                  <Link
                    href={`/creator/${creator.username}`}
                    className="w-full brutal-btn bg-primary text-primary-foreground text-xs font-bold py-2 flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={12} /> View Storefront
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
