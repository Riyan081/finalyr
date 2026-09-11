"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, RefreshCw, Loader2, RotateCcw, Download } from "lucide-react";
import { ordersApi, checkoutApi, type OrderItem } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-digi-mint text-primary-foreground",
  pending: "bg-digi-yellow text-primary-foreground",
  refunded: "bg-muted text-muted-foreground",
  failed: "bg-destructive text-destructive-foreground",
};

const PROVIDER_LABELS: Record<string, string> = {
  polar: "🌍 Polar",
  razorpay: "🇮🇳 Razorpay",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await ordersApi.getSales({ page: p, limit: 20 });
      setOrders(res.data ?? []);
      setHasNext(res.pagination?.hasNext ?? false);
    } catch (e: any) {
      toast.error("Could not load orders", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleRefund = async (orderId: string, productName: string) => {
    if (!confirm(`Refund order for "${productName}"? This cannot be undone.`)) return;
    setRefunding(orderId);
    try {
      await ordersApi.refund(orderId);
      toast.success("Refund processed");
      load(page);
    } catch (e: any) {
      toast.error("Refund failed", { description: e.message });
    } finally {
      setRefunding(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl mb-1">Sales / Orders</h1>
          <p className="text-muted-foreground">All purchases made from your products.</p>
        </div>
        <button onClick={() => load(page)} className="brutal-btn bg-card text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="brutal-card p-12 text-center">
          <ShoppingCart size={32} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="font-heading font-bold text-xl mb-2">No sales yet</h2>
          <p className="text-muted-foreground mb-4">Share your products to start earning!</p>
          <Link href="/dashboard/products" className="brutal-btn bg-primary text-primary-foreground text-sm">
            My Products
          </Link>
        </div>
      ) : (
        <>
          <div className="brutal-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider hidden md:table-cell">Buyer</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Provider</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold truncate max-w-[160px]">{order.product.name}</p>
                      {order.variant && (
                        <p className="text-xs text-muted-foreground">{order.variant.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="truncate max-w-[180px] text-muted-foreground">
                        {order.customerName || order.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {formatPrice(order.amountCents, order.currency)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {PROVIDER_LABELS[order.paymentProvider] || order.paymentProvider}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 brutal-border ${STATUS_COLORS[order.status] || "bg-muted"}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {order.status === "completed" && (
                          <button
                            onClick={() => handleRefund(order.id, order.product.name)}
                            disabled={refunding === order.id}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 brutal-border transition-colors"
                            title="Refund"
                          >
                            {refunding === order.id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <RotateCcw size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="brutal-btn bg-card text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              className="brutal-btn bg-card text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
