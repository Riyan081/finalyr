"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft, ShoppingCart, Share2, Loader2, Star, Globe, CreditCard, ChevronDown,
  Check, X, Monitor
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { usePublicProduct, useTrendingProducts } from "@/hooks/api-hooks";
import { formatPrice, CATEGORY_COLORS } from "@/lib/mock-data";
import {
  checkoutApi, discountsApi, reviewsApi, type ProductVariant, type ProductReview,
  type DiscountValidation,
} from "@/lib/api";
import { authClient } from "@repo/auth/client";
import { toast } from "sonner";

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRatingDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? "fill-digi-yellow text-digi-yellow" : "fill-muted text-muted"}
        />
      ))}
      <span className="text-xs font-semibold ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            size={24}
            className={(hovered || value) >= s ? "fill-digi-yellow text-digi-yellow" : "fill-muted text-muted"}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Payment Provider Picker ──────────────────────────────────────────────────

type PaymentProvider = "polar" | "razorpay";

function PaymentProviderPicker({
  value,
  onChange,
}: {
  value: PaymentProvider;
  onChange: (v: PaymentProvider) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {(["polar", "razorpay"] as PaymentProvider[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex flex-col items-center gap-1 p-3 brutal-border text-sm font-semibold transition-all ${
            value === p ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
          }`}
        >
          <span className="text-lg">{p === "polar" ? "🌍" : "🇮🇳"}</span>
          <span>{p === "polar" ? "Polar" : "Razorpay"}</span>
          <span className={`text-[10px] font-normal ${value === p ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {p === "polar" ? "International ($)" : "India / UPI (₹)"}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.slug as string;

  const { data: product, loading, error } = usePublicProduct(username, slug);
  const { data: trendingProducts } = useTrendingProducts(4);
  const { data: session } = authClient.useSession();

  // Checkout state
  const [provider, setProvider] = useState<PaymentProvider>("polar");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState<DiscountValidation | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load reviews
  useEffect(() => {
    if (product?.id) {
      reviewsApi.getForProduct(product.id, { limit: 10 }).then((r) => setReviews(r.data ?? []));
    }
  }, [product?.id]);

  // Default custom amount for Pay What You Want
  useEffect(() => {
    if (product?.isPayWhatYouWant && !customAmount) {
      const defaultCents = product.suggestedPriceCents || product.minPriceCents || 200;
      if (provider === "razorpay") {
        setCustomAmount(String(Math.round((defaultCents / 100) * 85)));
      } else {
        setCustomAmount((defaultCents / 100).toFixed(2));
      }
    }
  }, [product, provider]);

  const formatPriceForProvider = (cents: number, cur: string = "usd") => {
    if (cents === 0) return "Free";
    if (provider === "razorpay") {
      const inrAmount = cur.toLowerCase() === "inr" ? cents / 100 : Math.round((cents / 100) * 85);
      return `₹${inrAmount.toLocaleString("en-IN")}`;
    }
    const usdAmount = cur.toLowerCase() === "usd" ? cents / 100 : (cents / 100) / 85;
    return `$${usdAmount.toFixed(2)}`;
  };

  const validateDiscount = async () => {
    if (!discountCode.trim() || !product) return;
    setValidatingCode(true);
    try {
      const info = await discountsApi.validate(discountCode.trim(), product.id);
      setDiscountInfo(info);
      const saved = info.savingsCents;
      const discountLabel = info.discount.type === "percentage"
        ? `${info.discount.value}% off`
        : provider === "razorpay"
          ? `₹${Math.round((saved / 100) * 85)} off`
          : `$${(saved / 100).toFixed(2)} off`;
      toast.success(`Discount applied: ${discountLabel}`);
    } catch {
      setDiscountInfo(null);
      toast.error("Invalid or expired discount code");
    } finally {
      setValidatingCode(false);
    }
  };

  const handleBuy = async () => {
    if (!product) return;
    setCheckingOut(true);

    try {
      const variantId = selectedVariant?.id;
      let customAmountCents: number | undefined;
      if (product.isPayWhatYouWant) {
        const enteredVal = parseFloat(customAmount || "0");
        if (!isNaN(enteredVal) && enteredVal > 0) {
          if (provider === "razorpay") {
            customAmountCents = Math.round((enteredVal / 85) * 100);
          } else {
            customAmountCents = Math.round(enteredVal * 100);
          }
        } else {
          customAmountCents = product.suggestedPriceCents || product.minPriceCents || product.priceCents;
        }
      }

      const result = await checkoutApi.directPurchase({
        productId: product.id,
        variantId,
        discountCode: discountCode || undefined,
        customAmountCents,
        provider,
      });

      toast.success("Purchase successful!");
      router.push(result.redirectUrl || `/purchase/${result.orderId}`);
    } catch (e: any) {
      toast.error("Checkout failed", { description: e.message });
      setCheckingOut(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReview = async (orderId: string) => {
    if (!product || reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      const r = await reviewsApi.create({
        productId: product.id,
        orderId,
        rating: reviewRating,
        content: reviewContent || undefined,
      });
      setReviews((prev) => [r, ...prev]);
      setReviewContent("");
      toast.success("Review submitted!");
    } catch (e: any) {
      toast.error("Review failed", { description: e.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ─── Loading / Error ──────────────────────────────────────────────────────

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

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading font-black text-4xl mb-4">Product not found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/discover" className="brutal-btn bg-primary text-primary-foreground inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const category = product.category || "other";
  const colorClass = CATEGORY_COLORS[category] || "bg-digi-pink";

  // Effective price after discount
  // Backend returns discountedPriceCents based on the base product price (not variant)
  const displayPriceCents = discountInfo
    ? discountInfo.discountedPriceCents
    : selectedVariant
      ? selectedVariant.priceCents
      : product.priceCents;

  const displayPrice = product.isPayWhatYouWant
    ? "Pay what you want"
    : formatPriceForProvider(displayPriceCents, product.currency);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/discover" className="hover:text-foreground transition-colors">Discover</Link>
          <span>/</span>
          <span className="capitalize">{category}</span>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left — Cover + Description + Reviews */}
          <div className="lg:col-span-3">
            {/* Thumbnail */}
            <div className={`aspect-[16/10] ${colorClass} brutal-border brutal-shadow-lg flex items-center justify-center mb-6 relative overflow-hidden`}>
              {product.thumbnailUrl || product.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.thumbnailUrl || product.coverUrl || ""} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-heading font-black text-8xl text-foreground/20 select-none">
                  {product.name.charAt(0)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="brutal-card p-8">
              <h2 className="font-heading font-bold text-xl mb-4">Description</h2>
              {product.summary && <p className="font-semibold text-foreground mb-4 leading-relaxed">{product.summary}</p>}
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || "No description provided."}
              </p>
              {product.fileCount > 0 && (
                <div className="mt-6 p-4 bg-muted/50 brutal-border">
                  <p className="text-sm font-semibold">📦 {product.fileCount} file{product.fileCount !== 1 ? "s" : ""} included</p>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-muted px-3 py-1 text-xs font-semibold brutal-border">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="brutal-card p-8 mt-6">
                <h2 className="font-heading font-bold text-xl mb-4">Choose a Plan</h2>
                <div className="space-y-3">
                  {/* Default option */}
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className={`w-full flex items-center justify-between p-4 brutal-border text-left ${!selectedVariant ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <div>
                      <p className="font-semibold text-sm">Basic</p>
                      <p className="text-xs opacity-70">Standard access</p>
                    </div>
                    <span className="font-bold text-sm">{formatPriceForProvider(product.priceCents, product.currency)}</span>
                  </button>
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`w-full flex items-center justify-between p-4 brutal-border text-left ${selectedVariant?.id === v.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <div>
                        <p className="font-semibold text-sm">{v.name}</p>
                        {v.description && <p className="text-xs opacity-70">{v.description}</p>}
                      </div>
                      <span className="font-bold text-sm">{formatPriceForProvider(v.priceCents, product.currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="brutal-card p-8 mt-6">
              <h2 className="font-heading font-bold text-xl mb-6">
                Reviews ({product.reviewCount})
              </h2>

              {reviews.length === 0 && (
                <p className="text-muted-foreground text-sm mb-6">No reviews yet. Be the first!</p>
              )}

              <div className="space-y-6 mb-8">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b-2 border-border last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      {review.customer.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={review.customer.image} alt={review.customer.name} className="w-8 h-8 rounded-full brutal-border" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary brutal-border flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-bold">{review.customer.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{review.customer.name}</p>
                        <StarRatingDisplay rating={review.rating} size={12} />
                      </div>
                    </div>
                    {review.content && <p className="text-muted-foreground text-sm">{review.content}</p>}
                  </div>
                ))}
              </div>

              {/* Write a review (requires login + orderId — simplified: show for logged in users) */}
              {session?.user && (
                <div className="bg-muted/40 brutal-border p-5">
                  <h3 className="font-bold text-sm mb-3">Write a Review</h3>
                  <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share your experience with this product…"
                    className="w-full mt-3 px-4 py-3 brutal-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-2 mb-3">
                    Note: You need an order ID to submit a verified review. Enter it below.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="review-order-id"
                      placeholder="Order ID (from your purchase)"
                      className="flex-1 px-3 py-2 brutal-border bg-background text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const orderId = (document.getElementById("review-order-id") as HTMLInputElement)?.value;
                        if (!orderId) { toast.error("Enter an Order ID"); return; }
                        handleReview(orderId);
                      }}
                      disabled={submittingReview}
                      className="brutal-btn bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60"
                    >
                      {submittingReview ? <Loader2 size={14} className="animate-spin" /> : "Submit"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — Purchase Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="brutal-card p-6">
                <h1 className="font-heading font-black text-2xl mb-2">{product.name}</h1>

                {product.ratingAvg > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <StarRatingDisplay rating={product.ratingAvg} />
                    <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
                  <span>{product.salesCount.toLocaleString()} sales</span>
                  <span>•</span>
                  <span className="capitalize">{category}</span>
                </div>

                {/* Price */}
                <div className="bg-digi-yellow brutal-border p-4 mb-4 text-center">
                  <span className="font-heading font-black text-3xl">{displayPrice}</span>
                  {discountInfo && (
                    <p className="text-xs mt-1 line-through opacity-60">
                      {formatPriceForProvider(discountInfo.originalPriceCents, product.currency)}
                    </p>
                  )}
                  {product.isPayWhatYouWant && product.minPriceCents > 0 && (
                    <p className="text-xs mt-1 opacity-70">
                      Minimum: {formatPriceForProvider(product.minPriceCents, product.currency)}
                    </p>
                  )}
                </div>

                {/* PWYW Input */}
                {product.isPayWhatYouWant && (
                  <div className="mb-4">
                    <label className="text-xs font-bold block mb-1">Your price</label>
                    <div className="flex items-center brutal-border">
                      <span className="px-3 py-3 text-sm font-bold border-r-2 border-border bg-muted">
                        {provider === "razorpay" ? "₹" : "$"}
                      </span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder={
                          provider === "razorpay"
                            ? `${Math.round(((product.suggestedPriceCents || product.minPriceCents || 0) / 100) * 85)}`
                            : `${((product.suggestedPriceCents || product.minPriceCents || 0) / 100).toFixed(2)}`
                        }
                        min={
                          provider === "razorpay"
                            ? Math.round(((product.minPriceCents || 0) / 100) * 85)
                            : (product.minPriceCents || 0) / 100
                        }
                        step={provider === "razorpay" ? "1" : "0.01"}
                        className="flex-1 px-3 py-3 bg-background text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Discount Code */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); }}
                      placeholder="Discount code"
                      className="flex-1 px-3 py-2.5 brutal-border bg-background text-sm font-mono uppercase focus:outline-none"
                    />
                    <button
                      onClick={validateDiscount}
                      disabled={validatingCode || !discountCode}
                      className="brutal-btn bg-card text-xs font-bold disabled:opacity-60"
                    >
                      {validatingCode ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {discountInfo && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <Check size={12} /> {discountInfo.discount.type === "percentage" ? `${discountInfo.discount.value}% off` : `${provider === "razorpay" ? `₹${Math.round((discountInfo.savingsCents / 100) * 85)}` : `$${(discountInfo.savingsCents / 100).toFixed(2)}`} off`} applied!
                    </p>
                  )}
                </div>

                {/* Payment Provider Toggle */}
                <p className="text-xs font-bold mb-2 text-muted-foreground uppercase tracking-wider">Pay with</p>
                <PaymentProviderPicker value={provider} onChange={setProvider} />

                {/* Buy Button */}
                <button
                  onClick={handleBuy}
                  disabled={checkingOut}
                  className="w-full brutal-btn bg-primary text-primary-foreground text-lg font-bold py-4 flex items-center justify-center gap-2 mb-3 disabled:opacity-70"
                >
                  {checkingOut
                    ? <Loader2 size={20} className="animate-spin" />
                    : <ShoppingCart size={20} />}
                  {checkingOut ? "Processing…" : (product.callToAction || "Buy Now")}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full brutal-btn bg-card text-foreground text-sm font-semibold py-3 flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> Share
                </button>

                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  {provider === "polar" ? "🌍 Instant international checkout ($)" : "🇮🇳 Instant India / UPI checkout (₹)"}
                </p>
              </div>

              {/* System Requirements */}
              {product.systemRequirements && (
                <div className="brutal-card p-6">
                  <h3 className="font-heading font-bold text-sm mb-3 flex items-center gap-2">
                    <Monitor size={16} /> System Requirements
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {product.systemRequirements}
                  </p>
                </div>
              )}

              {/* Creator Card */}
              {product.creator && (
                <div className="brutal-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {product.creator.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.creator.image} alt={product.creator.name} className="w-12 h-12 rounded-full brutal-border" />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full brutal-border flex items-center justify-center"
                        style={{ backgroundColor: product.creator.accentColor || "#FF90E8" }}
                      >
                        <span className="text-lg text-white font-black">{product.creator.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{product.creator.name}</p>
                      {product.creator.username && (
                        <p className="text-xs text-muted-foreground">@{product.creator.username}</p>
                      )}
                    </div>
                  </div>
                  {product.creator.username && (
                    <Link
                      href={`/creator/${product.creator.username}`}
                      className="block mt-4 text-center brutal-btn bg-card text-sm font-semibold"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related / Trending */}
        {trendingProducts && trendingProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading font-black text-2xl mb-6">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {trendingProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
