"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Key, CheckCircle, Loader2, FileText, Package, Star, Trash2, Send } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { checkoutApi, reviewsApi, type OrderDetail, type DownloadOrderInfo } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PurchaseSuccessPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{ token: string; info: DownloadOrderInfo } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [createdReviewId, setCreatedReviewId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Try to find by session ID first, then as direct order ID
        const found = await checkoutApi.getOrderBySession(orderId);
        setOrder(found);

        if (found) {
          // Get download token
          try {
            const dl = await checkoutApi.getDownloadToken(found.id);
            setDownloadInfo({ token: dl.token, info: dl.order });
          } catch {
            // order might not be completed yet
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handleDownload = async (fileId: string, fileName: string) => {
    if (!downloadInfo) return;
    setDownloadLoading(true);
    try {
      const url = checkoutApi.buildFileDownloadUrl(downloadInfo.token, fileId);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (e: any) {
      toast.error("Download failed", { description: e.message });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!order) return;
    setReviewSubmitting(true);
    try {
      const res = await reviewsApi.create({
        productId: order.product.id,
        orderId: order.id,
        rating: reviewRating,
        content: reviewComment.trim() || undefined,
      });
      setCreatedReviewId(res.id);
      setReviewSubmitted(true);
      toast.success("Review submitted! Thank you for your feedback.");
    } catch (e: any) {
      toast.error("Could not post review", { description: e.message });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!createdReviewId) return;
    setReviewSubmitting(true);
    try {
      await reviewsApi.delete(createdReviewId);
      setCreatedReviewId(null);
      setReviewSubmitted(false);
      setReviewComment("");
      toast.success("Review removed.");
    } catch (e: any) {
      toast.error("Could not remove review", { description: e.message });
    } finally {
      setReviewSubmitting(false);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12 flex-1 w-full">

        {/* Success Banner */}
        <div className="brutal-card p-8 mb-6 text-center bg-digi-mint">
          <CheckCircle size={48} className="mx-auto mb-4 text-primary-foreground" />
          <h1 className="font-heading font-black text-3xl text-primary-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-primary-foreground/80">
            {order
              ? `You purchased "${order.product.name}"`
              : "Your payment has been processed."}
          </p>
          {order && (
            <p className="text-primary-foreground/60 text-sm mt-1">
              {formatPrice(order.amountCents, order.currency)} via{" "}
              <span className="capitalize font-semibold">{order.paymentProvider}</span>
            </p>
          )}
        </div>

        {/* Download Files */}
        {downloadInfo && downloadInfo.info.files.length > 0 && (
          <div className="brutal-card mb-6">
            <div className="px-6 py-4 border-b-2 border-border flex items-center gap-3">
              <Package size={20} />
              <h2 className="font-heading font-bold text-lg">Your Downloads</h2>
            </div>
            <div className="divide-y-2 divide-border">
              {downloadInfo.info.files.map((file) => (
                <div key={file.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.fileSizeBytes)} • {file.fileType}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(file.id, file.fileName)}
                    disabled={downloadLoading}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 shrink-0 disabled:opacity-60"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-muted/40 text-xs text-muted-foreground">
              ⏰ Download links expire in 24 hours. Download to save permanently.
            </div>
          </div>
        )}

        {/* License Keys */}
        {downloadInfo && downloadInfo.info.licenseKeys.length > 0 && (
          <div className="brutal-card mb-6">
            <div className="px-6 py-4 border-b-2 border-border flex items-center gap-3">
              <Key size={20} />
              <h2 className="font-heading font-bold text-lg">License Keys</h2>
            </div>
            <div className="divide-y-2 divide-border">
              {downloadInfo.info.licenseKeys.map((lk, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="font-mono text-sm bg-muted p-3 brutal-border mb-2 flex items-center justify-between gap-2">
                    <span className="truncate">{lk.licenseKey}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lk.licenseKey);
                        toast.success("Copied!");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lk.uses}/{lk.maxUses} activations used
                    {lk.isDisabled && " · Disabled"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No files state */}
        {!loading && !downloadInfo && order && (
          <div className="brutal-card p-8 text-center mb-6">
            <FileText size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold mb-1">Files will be available shortly</p>
            <p className="text-sm text-muted-foreground">
              Your payment is being processed. Check your dashboard purchases in a moment.
            </p>
          </div>
        )}

        {/* Customer Review Section */}
        {order && (
          <div className="brutal-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                <Star className="text-digi-yellow fill-digi-yellow" size={20} />
                Leave a Product Review
              </h2>
              {reviewSubmitted && (
                <span className="text-xs bg-digi-mint/30 px-2 py-1 brutal-border font-bold">
                  Verified Review
                </span>
              )}
            </div>

            {reviewSubmitted ? (
              <div className="bg-muted/50 p-4 brutal-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= reviewRating
                            ? "text-digi-yellow fill-digi-yellow"
                            : "text-muted-foreground"
                        }
                      />
                    ))}
                  </div>
                  {createdReviewId && (
                    <button
                      onClick={handleDeleteReview}
                      disabled={reviewSubmitting}
                      className="text-xs text-destructive hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Trash2 size={12} /> Delete Review
                    </button>
                  )}
                </div>
                {reviewComment && (
                  <p className="text-sm text-foreground/90 italic">
                    &ldquo;{reviewComment}&rdquo;
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Thank you! Your feedback helps other creators and buyers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={
                            star <= reviewRating
                              ? "text-digi-yellow fill-digi-yellow"
                              : "text-muted-foreground/40 hover:text-digi-yellow"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">
                    Review Comment (Optional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How was your experience with this product?"
                    rows={3}
                    className="w-full brutal-input p-3 text-sm resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  className="brutal-btn bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2 disabled:opacity-60"
                >
                  {reviewSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Submit Review
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/library"
            className="brutal-btn bg-primary text-primary-foreground text-sm font-bold flex-1 text-center py-3"
          >
            My Library
          </Link>
          <Link
            href="/discover"
            className="brutal-btn bg-card text-sm font-semibold flex-1 text-center py-3"
          >
            Discover More
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
