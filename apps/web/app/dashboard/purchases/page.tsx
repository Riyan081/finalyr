"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Loader2, ShoppingBag, Key, Repeat, Crown, XCircle, CheckCircle, ExternalLink } from "lucide-react";
import { ordersApi, checkoutApi, membershipApi, type OrderItem, type MembershipItem } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

const PROVIDER_LABELS: Record<string, string> = {
  polar: "🌍 Polar",
  razorpay: "🇮🇳 Razorpay",
  direct: "⚡ Instant Checkout",
};

export default function PurchasesPage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "subscriptions">("purchases");
  const [purchases, setPurchases] = useState<OrderItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<MembershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [cancellingSubId, setCancellingSubId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resPurchases, resSubs] = await Promise.all([
        ordersApi.getPurchases({ limit: 50 }).catch(() => ({ data: [] })),
        membershipApi.getMySubscriptions().catch(() => []),
      ]);
      setPurchases(resPurchases.data ?? []);
      setSubscriptions(resSubs);
    } catch (e: any) {
      toast.error("Could not load purchases", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelSubscription = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription? You will retain access until the end of your billing period.")) return;
    setCancellingSubId(id);
    try {
      await membershipApi.cancel(id);
      toast.success("Subscription cancelled successfully");
      const updated = await membershipApi.getMySubscriptions();
      setSubscriptions(updated);
    } catch (e: any) {
      toast.error("Cancellation failed", { description: e.message });
    } finally {
      setCancellingSubId(null);
    }
  };

  const handleDownload = async (orderId: string) => {
    setDownloadingId(orderId);
    try {
      const dl = await checkoutApi.getDownloadToken(orderId);
      if (dl.order.files.length === 0) {
        toast.info("No downloadable files for this product.");
        return;
      }
      // Download all files
      dl.order.files.forEach((file) => {
        const url = checkoutApi.buildFileDownloadUrl(dl.token, file.id);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.fileName;
        a.click();
      });
      toast.success(`Downloading ${dl.order.files.length} file(s)…`);
    } catch (e: any) {
      toast.error("Download failed", { description: e.message });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="font-heading font-black text-3xl mb-1">Purchases & Subscriptions</h1>
        <p className="text-muted-foreground">Digital products you&apos;ve bought and active membership plans.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-border mb-6">
        <button
          onClick={() => setActiveTab("purchases")}
          className={`px-4 py-2 font-heading font-bold text-sm flex items-center gap-2 border-b-2 -mb-[2px] transition-colors ${
            activeTab === "purchases"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingBag size={16} /> Purchases ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          className={`px-4 py-2 font-heading font-bold text-sm flex items-center gap-2 border-b-2 -mb-[2px] transition-colors ${
            activeTab === "subscriptions"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Repeat size={16} /> Subscriptions ({subscriptions.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : activeTab === "purchases" ? (
        purchases.length === 0 ? (
          <div className="brutal-card p-12 text-center">
            <ShoppingBag size={32} className="mx-auto mb-3 text-muted-foreground" />
            <h2 className="font-heading font-bold text-xl mb-2">No purchases yet</h2>
            <p className="text-muted-foreground mb-4">
              Browse the Discover page to find great digital products!
            </p>
            <Link href="/discover" className="brutal-btn bg-primary text-primary-foreground text-sm">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((order) => (
              <div key={order.id} className="brutal-card p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  {order.product.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.product.thumbnailUrl}
                      alt={order.product.name}
                      className="w-14 h-14 object-cover brutal-border shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-digi-pink brutal-border flex items-center justify-center shrink-0">
                      <span className="font-heading font-black text-xl text-primary-foreground/40">
                        {order.product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{order.product.name}</p>
                    {order.variant && (
                      <p className="text-xs text-muted-foreground">{order.variant.name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatPrice(order.amountCents, order.currency)}</span>
                      <span>•</span>
                      <span>{PROVIDER_LABELS[order.paymentProvider] || order.paymentProvider}</span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/purchase/${order.id}`}
                    className="brutal-btn bg-card text-xs font-semibold flex items-center gap-1"
                  >
                    <Key size={12} /> View
                  </Link>
                  <button
                    onClick={() => handleDownload(order.id)}
                    disabled={downloadingId === order.id || order.status !== "completed"}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 disabled:opacity-60"
                  >
                    {downloadingId === order.id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Download size={12} />}
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Subscriptions Tab */
        subscriptions.length === 0 ? (
          <div className="brutal-card p-12 text-center">
            <Repeat size={32} className="mx-auto mb-3 text-muted-foreground" />
            <h2 className="font-heading font-bold text-xl mb-2">No active subscriptions</h2>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t joined any creator memberships yet.
            </p>
            <Link href="/discover" className="brutal-btn bg-primary text-primary-foreground text-sm">
              Discover Creators
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="brutal-card p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 bg-amber-500/20 brutal-border flex items-center justify-center shrink-0 text-amber-500">
                    <Crown size={24} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold truncate">{sub.product.name}</p>
                      {sub.status === "active" ? (
                        <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 brutal-border">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-destructive/15 text-destructive px-2 py-0.5 brutal-border">
                          {sub.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      By {sub.product.creator?.name || "Creator"}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatPrice(sub.product.priceCents, sub.product.currency)}/{sub.product.recurrence || "month"}</span>
                      <span>•</span>
                      <span>
                        {sub.currentPeriodEnd
                          ? `Valid until ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                          : `Started ${new Date(sub.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sub.product.creator?.username && (
                    <Link
                      href={`/product/${sub.product.creator.username}/${sub.product.slug}#member-lounge`}
                      className="brutal-btn bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Member Lounge
                    </Link>
                  )}
                  {sub.status === "active" && (
                    <button
                      onClick={() => handleCancelSubscription(sub.id)}
                      disabled={cancellingSubId === sub.id}
                      className="brutal-btn bg-card hover:bg-muted text-destructive text-xs font-semibold px-3 py-2 disabled:opacity-60"
                    >
                      {cancellingSubId === sub.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}
