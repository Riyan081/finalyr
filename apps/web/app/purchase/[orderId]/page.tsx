"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Key, CheckCircle, Loader2, FileText, Package, Star, Trash2, Send, ShieldCheck, ShieldAlert, Laptop, Terminal, RefreshCw, Copy, Check } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { checkoutApi, reviewsApi, licenseApi, API_BASE, type OrderDetail, type DownloadOrderInfo, type LicenseVerifyResult } from "@/lib/api";
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

  // License Validator Playground state
  const [testKey, setTestKey] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [decrementLoading, setDecrementLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<LicenseVerifyResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
            if (dl.order.licenseKeys && dl.order.licenseKeys[0]) {
              setTestKey(dl.order.licenseKeys[0].licenseKey);
            }
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

  const handleVerify = async (increment = true) => {
    if (!testKey.trim()) {
      toast.error("Please enter a license key to verify");
      return;
    }
    setVerifyLoading(true);
    try {
      const res = await licenseApi.verify(testKey.trim(), increment);
      setVerifyResult(res);
      if (res.valid) {
        toast.success(res.message || "License key is valid!");
      } else {
        toast.error(res.message || "License key is invalid");
      }
    } catch (e: any) {
      toast.error(e.message || "Validation failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDecrement = async () => {
    if (!testKey.trim()) {
      toast.error("Please enter a license key to deactivate");
      return;
    }
    setDecrementLoading(true);
    try {
      const res = await licenseApi.decrement(testKey.trim());
      setVerifyResult(res);
      toast.success(res.message || "Device seat released successfully");
    } catch (e: any) {
      toast.error(e.message || "Deactivation failed");
    } finally {
      setDecrementLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    if (!downloadInfo) return;
    setDownloadLoading(true);
    try {
      const url = checkoutApi.buildFileDownloadUrl(downloadInfo.token, fileId);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Download failed";
      toast.error("Download failed", { description: msg });
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

        {/* License Keys Display */}
        {downloadInfo && downloadInfo.info.licenseKeys.length > 0 && (
          <div className="brutal-card mb-6">
            <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-primary" />
                <h2 className="font-heading font-bold text-lg">Issued License Keys</h2>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-0.5 bg-primary/20 text-primary brutal-border">
                Gumroad v2 Format
              </span>
            </div>
            <div className="divide-y-2 divide-border">
              {downloadInfo.info.licenseKeys.map((lk, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="font-mono text-sm bg-muted p-3 brutal-border mb-2 flex items-center justify-between gap-2">
                    <span className="font-bold tracking-wider">{lk.licenseKey}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTestKey(lk.licenseKey);
                          toast.info("Key loaded into Validator Playground below!");
                        }}
                        className="text-xs bg-card hover:bg-muted px-2 py-1 brutal-border font-semibold"
                      >
                        Use in Tester
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lk.licenseKey);
                          setCopiedKey(lk.licenseKey);
                          toast.success("License key copied!");
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground shrink-0 flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === lk.licenseKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copiedKey === lk.licenseKey ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      <strong>{lk.uses}</strong> of <strong>{lk.maxUses}</strong> device seats activated
                    </span>
                    {lk.isDisabled ? (
                      <span className="text-destructive font-bold">● Key Disabled</span>
                    ) : (
                      <span className="text-emerald-500 font-bold">● Active & Valid</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Software License Key Validator Playground */}
        <div className="brutal-card mb-6 border-2 border-primary/30">
          <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-primary" />
              <div>
                <h2 className="font-heading font-bold text-lg">License Validation Playground</h2>
                <p className="text-xs text-muted-foreground">
                  Simulate external desktop app or script validation requests against DigiStore&apos;s API
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs bg-muted px-2 py-1 brutal-border font-mono">
              POST /api/licenses/verify
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5 flex items-center justify-between">
                <span>License Key to Test</span>
                <span className="text-[11px] text-muted-foreground font-normal">Format: DIGI-XXXX-XXXX-XXXX</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  placeholder="e.g. DIGI-8F3A-4C2B-91E5"
                  className="brutal-input flex-1 p-2.5 font-mono text-sm uppercase"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleVerify(true)}
                disabled={verifyLoading || decrementLoading}
                className="brutal-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 py-2.5 px-4 disabled:opacity-60"
              >
                {verifyLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                Verify & Activate Seat (+1 Use)
              </button>

              <button
                type="button"
                onClick={() => handleVerify(false)}
                disabled={verifyLoading || decrementLoading}
                className="brutal-btn bg-card hover:bg-muted text-xs font-bold flex items-center gap-1.5 py-2.5 px-4 disabled:opacity-60"
              >
                <RefreshCw size={14} />
                Read-Only Check (0 Uses)
              </button>

              <button
                type="button"
                onClick={handleDecrement}
                disabled={verifyLoading || decrementLoading}
                className="brutal-btn bg-destructive/15 hover:bg-destructive/25 text-destructive text-xs font-bold flex items-center gap-1.5 py-2.5 px-4 disabled:opacity-60"
              >
                {decrementLoading ? <Loader2 size={14} className="animate-spin" /> : <Laptop size={14} />}
                Deactivate Seat (Uninstall App)
              </button>
            </div>

            {/* Verification Result Output */}
            {verifyResult && (
              <div className="mt-4 p-4 brutal-border bg-muted/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {verifyResult.valid ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 brutal-border">
                        <CheckCircle size={14} /> VALID & LICENSED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold bg-destructive/20 text-destructive px-2.5 py-1 brutal-border">
                        <ShieldAlert size={14} /> INVALID / REJECTED
                      </span>
                    )}
                    <span className="text-xs text-foreground font-medium">
                      {verifyResult.message}
                    </span>
                  </div>

                  {verifyResult.uses !== undefined && verifyResult.maxUses !== undefined && (
                    <span className="text-xs font-mono font-bold">
                      Seats: {verifyResult.uses} / {verifyResult.maxUses}
                    </span>
                  )}
                </div>

                {/* API JSON Payload preview */}
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1">
                    API Response Payload (Gumroad Format):
                  </p>
                  <pre className="bg-black text-emerald-400 p-3 brutal-border text-xs font-mono overflow-x-auto">
                    {JSON.stringify(verifyResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Anti-Piracy PDF Stamping & DRM Card */}
        <div className="brutal-card mb-6 border-2 border-indigo-500/30">
          <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between bg-indigo-950/10">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-indigo-500" />
              <div>
                <h2 className="font-heading font-bold text-lg">Anti-Piracy PDF Stamping (DRM)</h2>
                <p className="text-xs text-muted-foreground">
                  Dynamic server-side document watermarking powered by <code className="font-mono">pdf-lib</code>
                </p>
              </div>
            </div>
            <span className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-0.5 brutal-border font-bold">
              Active Protection
            </span>
          </div>
          <div className="p-6">
            <p className="text-sm text-foreground/90 mb-4 leading-relaxed">
              To prevent illegal redistribution and content leaks, digital PDF deliverables on DigiStore are dynamically stamped on the fly during download with the verified buyer&apos;s email, order number, and timestamp.
            </p>

            <div className="bg-muted/50 p-3 brutal-border mb-4 font-mono text-xs text-muted-foreground">
              <span className="text-foreground font-bold">Watermark stamp: </span>
              🔒 Licensed to: {order?.customerEmail || "buyer@student.edu"} • Order #{order?.id.slice(0, 8) || "ORD-DEMO"} • DigiStore DRM Protected
            </div>

            <a
              href={`${API_BASE}/api/drm/demo-stamp?orderId=${encodeURIComponent(order?.id || "ORD-FINAL-PROTOTYPE")}&email=${encodeURIComponent(order?.customerEmail || "evaluator@university.edu")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 py-2.5 px-4"
            >
              <Download size={14} />
              Download Live Stamped PDF Demo
            </a>
          </div>
        </div>

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
