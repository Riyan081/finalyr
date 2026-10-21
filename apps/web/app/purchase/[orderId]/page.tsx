"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, CheckCircle, Loader2, FileText, Package, Star, Trash2, Send, Key, Copy, Check, ShieldCheck } from "lucide-react";
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const handleDownload = (fileId: string, fileName: string) => {
    if (!downloadInfo) return;
    try {
      const url = checkoutApi.buildFileDownloadUrl(downloadInfo.token, fileId);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading "${fileName}"...`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Download failed";
      toast.error("Download failed", { description: msg });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("License key copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not post review";
      toast.error("Could not post review", { description: msg });
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not remove review";
      toast.error("Could not remove review", { description: msg });
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
        <div className="brutal-card p-8 mb-6 text-center border-emerald-500/50 bg-emerald-950/20">
          <CheckCircle size={48} className="mx-auto mb-4 text-emerald-400" />
          <h1 className="font-heading font-black text-3xl text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-foreground/90 font-medium">
            {order
              ? `You purchased "${order.product.name}"`
              : "Your payment has been processed."}
          </p>
          {order && (
            <p className="text-muted-foreground text-sm mt-1">
              {formatPrice(order.amountCents, order.currency)} via{" "}
              <span className="capitalize font-semibold text-foreground">{order.paymentProvider}</span>
            </p>
          )}
        </div>

        {/* License Keys Section */}
        {((order?.licenseKeys && order.licenseKeys.length > 0) ||
          (downloadInfo?.info?.licenseKeys && downloadInfo.info.licenseKeys.length > 0)) && (
          <div className="brutal-card p-6 mb-6 bg-card brutal-border space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 brutal-border text-primary shrink-0">
                  <Key size={22} />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg flex items-center gap-2">
                    {(order?.licenseKeys?.length || downloadInfo?.info?.licenseKeys?.length || 0) > 1
                      ? "Your Software License Keys"
                      : "Your Software License Key"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Use this key to activate and unlock full functionality in your application or plugin.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-500 text-white px-2.5 py-1 rounded font-black flex items-center gap-1 shadow-sm">
                <ShieldCheck size={13} /> Active License
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {(order?.licenseKeys?.length ? order.licenseKeys : (downloadInfo?.info?.licenseKeys || [])).map((lk, idx) => (
                <div key={idx} className="p-4 bg-muted/40 brutal-border space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
                      License #{idx + 1} • {lk.uses} of {lk.maxUses} device seats registered
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(lk.licenseKey)}
                      className="brutal-btn bg-background hover:bg-muted text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
                    >
                      {copiedKey === lk.licenseKey ? (
                        <>
                          <Check size={14} className="text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-950 text-zinc-100 p-3 brutal-border font-mono text-base font-black tracking-wider text-primary select-all overflow-x-auto">
                    <code>{lk.licenseKey}</code>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    💡 <strong>Activation instructions:</strong> Launch your application (e.g. <code>demo_client_app.py</code>), paste your key above, and click <strong>Activate</strong> to unlock your software.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  <a
                    href={checkoutApi.buildFileDownloadUrl(downloadInfo.token, file.id)}
                    download={file.fileName}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 bg-muted/40 text-xs text-muted-foreground">
              ⏰ Download links expire in 24 hours. Download to save permanently.
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
            href="/dashboard/purchases"
            className="brutal-btn bg-primary text-primary-foreground text-sm font-bold flex-1 text-center py-3"
          >
            My Purchases
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
