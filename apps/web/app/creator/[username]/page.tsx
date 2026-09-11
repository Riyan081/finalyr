"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Twitter, Youtube, Globe, Instagram, Users, UserCheck } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useStorefront } from "@/hooks/api-hooks";
import { formatPrice } from "@/lib/mock-data";
import { followersApi } from "@/lib/api";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const { data: storefront, loading, error } = useStorefront(username);
  const { data: session } = authClient.useSession();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [creatorId, setCreatorId] = useState("");

  // Set follower count + check following status
  useEffect(() => {
    if (storefront?.creator) {
      setFollowerCount(storefront.creator.followerCount);
      setCreatorId(storefront.creator.id);
      if (session?.user && storefront.creator.id) {
        followersApi
          .isFollowing(storefront.creator.id)
          .then((r) => setIsFollowing(r.following))
          .catch(() => {});
      }
    }
  }, [storefront, session?.user]);

  const handleFollow = async () => {
    if (!session?.user) {
      toast.error("Sign in to follow creators");
      return;
    }
    if (!creatorId) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followersApi.unfollow(creatorId);
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        toast.success("Unfollowed");
      } else {
        await followersApi.follow(creatorId);
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        toast.success("Following!");
      }
    } catch (e: any) {
      toast.error("Action failed", { description: e.message });
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !storefront) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-black text-4xl mb-4">
              Creator not found
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              href="/discover"
              className="brutal-btn bg-primary text-primary-foreground"
            >
              Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { creator, products } = storefront;

  const socialLinks = [
    { icon: Twitter, href: creator.socialTwitter, label: "Twitter" },
    { icon: Youtube, href: creator.socialYoutube, label: "YouTube" },
    { icon: Instagram, href: creator.socialInstagram, label: "Instagram" },
    { icon: Globe, href: creator.socialWebsite, label: "Website" },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Profile Header */}
        <div className="brutal-card p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          {creator.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creator.image}
              alt={creator.name}
              className="w-24 h-24 rounded-full brutal-border brutal-shadow shrink-0"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full brutal-border brutal-shadow flex items-center justify-center shrink-0"
              style={{ backgroundColor: creator.accentColor || "#FF90E8" }}
            >
              <span className="font-heading font-black text-3xl text-white">
                {creator.name.charAt(0)}
              </span>
            </div>
          )}

          <div className="text-center sm:text-left flex-1">
            <h1 className="font-heading font-black text-3xl mb-1">
              {creator.name}
            </h1>
            {creator.username && (
              <p className="text-muted-foreground text-sm mb-3">
                @{creator.username}
              </p>
            )}
            {creator.bio && (
              <p className="text-muted-foreground leading-relaxed max-w-lg mb-4">
                {creator.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-5 mt-3 justify-center sm:justify-start flex-wrap">
              <div className="text-center sm:text-left">
                <p className="font-heading font-black text-xl">
                  {products.length}
                </p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-heading font-black text-xl">
                  {followerCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground mt-3">
                  Joined{" "}
                  {new Date(creator.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 brutal-border hover:bg-muted transition-colors"
                    title={label}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`brutal-btn text-sm font-bold flex items-center gap-2 shrink-0 disabled:opacity-60 ${
              isFollowing
                ? "bg-muted text-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {followLoading
              ? <Loader2 size={14} className="animate-spin" />
              : isFollowing
                ? <UserCheck size={16} />
                : <Users size={16} />}
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Products Grid */}
        <h2 className="font-heading font-bold text-2xl mb-6">
          Products by {creator.name}
        </h2>

        {products.length === 0 ? (
          <div className="brutal-card p-12 text-center">
            <p className="text-muted-foreground">No products published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${creator.username}/${product.slug}`}
                className="block"
              >
                <div className="brutal-card overflow-hidden group">
                  <div className="aspect-[4/3] bg-digi-pink relative overflow-hidden">
                    {product.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-heading font-black text-primary-foreground/30 text-6xl select-none">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-card brutal-border px-2 py-0.5 text-xs font-bold">
                      {product.isPayWhatYouWant
                        ? "PWYW"
                        : formatPrice(product.priceCents, product.currency)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{product.salesCount} sales</span>
                      {product.ratingAvg > 0 && (
                        <span>• ⭐ {product.ratingAvg.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
