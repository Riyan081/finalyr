"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Loader2, ShoppingBag, Key } from "lucide-react";
import { ordersApi, checkoutApi, type OrderItem } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

const PROVIDER_LABELS: Record<string, string> = {
  polar: "🌍 Polar",
  razorpay: "🇮🇳 Razorpay",
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    ordersApi.getPurchases({ limit: 50 })
      .then((res) => setPurchases(res.data ?? []))
      .catch((e) => toast.error("Could not load purchases", { description: e.message }))
      .finally(() => setLoading(false));
  }, []);

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
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl mb-1">My Purchases</h1>
        <p className="text-muted-foreground">Products you&apos;ve bought and their downloads.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : purchases.length === 0 ? (
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
      )}
    </>
  );
}
