"use client";

import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Loader2,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import {
  useAnalyticsOverview,
  useAnalyticsRevenue,
  useTopProducts,
  useRecentSales,
} from "@/hooks/api-hooks";

export default function AnalyticsPage() {
  const { data: overview, loading: overviewLoading } = useAnalyticsOverview();
  const { data: revenueData, loading: revenueLoading } =
    useAnalyticsRevenue(30);
  const { data: topProducts, loading: topLoading } = useTopProducts(5);
  const { data: recentSales, loading: salesLoading } = useRecentSales(10);

  // Build chart data from last 30 days
  const maxRevenue =
    revenueData && revenueData.length > 0
      ? Math.max(...revenueData.map((d) => d.revenueCents))
      : 0;

  // Show only last 12 days in the bar chart for readability
  const chartData = revenueData ? revenueData.slice(-12) : [];

  const stats = [
    {
      label: "Total Revenue",
      value: overview ? formatPrice(overview.totalRevenueCents, "usd") : "—",
      icon: DollarSign,
      color: "bg-digi-pink",
    },
    {
      label: "Total Sales",
      value: overview ? String(overview.totalSales) : "—",
      icon: ShoppingCart,
      color: "bg-digi-yellow",
    },
    {
      label: "Followers",
      value: overview ? String(overview.followerCount) : "—",
      icon: Users,
      color: "bg-digi-mint",
    },
    {
      label: "Published Products",
      value: overview ? String(overview.productCount) : "—",
      icon: TrendingUp,
      color: "bg-digi-lavender",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl mb-1">Analytics</h1>
        <p className="text-muted-foreground">
          Track your sales and performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="brutal-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 ${stat.color} brutal-border flex items-center justify-center`}
                >
                  <Icon size={14} className="text-primary-foreground" />
                </div>
              </div>
              {overviewLoading ? (
                <div className="h-8 bg-muted animate-pulse rounded w-24" />
              ) : (
                <p className="font-heading font-black text-2xl">{stat.value}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Revenue Chart (last 12 days) */}
      <div className="brutal-card p-6 mb-6">
        <h2 className="font-heading font-bold text-lg mb-6">
          Revenue — Last 30 Days
        </h2>
        {revenueLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 || maxRevenue === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No revenue data yet.
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-1 h-48">
            {chartData.map((d) => {
              const pct =
                maxRevenue > 0 ? (d.revenueCents / maxRevenue) * 100 : 0;
              const label = new Date(d.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${label}: ${formatPrice(d.revenueCents, "usd")}`}
                >
                  {d.revenueCents > 0 && (
                    <span className="text-[10px] font-bold text-muted-foreground">
                      ${(d.revenueCents / 100).toFixed(0)}
                    </span>
                  )}
                  <div
                    className="w-full bg-primary brutal-border transition-all duration-500"
                    style={{
                      height: `${Math.max(pct, 4)}%`,
                      opacity: d.revenueCents > 0 ? 1 : 0.2,
                    }}
                  />
                  <span className="text-[9px] font-semibold">
                    {new Date(d.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="brutal-card">
          <div className="px-6 py-4 border-b-2 border-border">
            <h2 className="font-heading font-bold text-lg">Top Products</h2>
          </div>
          <div className="divide-y-2 divide-border">
            {topLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-3">
                  <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))
            ) : topProducts && topProducts.length > 0 ? (
              topProducts.map((p, i) => (
                <div key={p.id} className="px-6 py-4 flex items-center gap-3">
                  <span className="text-muted-foreground font-bold text-sm w-5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.salesCount} sales •{" "}
                      {formatPrice(p.revenueCents, "usd")} revenue
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 brutal-border ${
                      p.status === "published"
                        ? "bg-digi-mint text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No products yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="brutal-card">
          <div className="px-6 py-4 border-b-2 border-border">
            <h2 className="font-heading font-bold text-lg">Recent Sales</h2>
          </div>
          <div className="divide-y-2 divide-border">
            {salesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-3">
                  <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))
            ) : recentSales && recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-sm truncate pr-2">
                      {sale.product.name}
                    </p>
                    <span className="text-sm font-bold shrink-0 text-digi-mint">
                      +{formatPrice(sale.amountCents, "usd")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sale.customerName || sale.customerEmail} •{" "}
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No sales yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
