"use client";

import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Eye,
  PlusCircle,
  BarChart3,
  Users,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import {
  useAnalyticsOverview,
  useRecentSales,
  useMyProducts,
} from "@/hooks/api-hooks";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="brutal-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={`w-8 h-8 ${color} brutal-border flex items-center justify-center`}>
          <Icon size={14} className="text-primary-foreground" />
        </div>
      </div>
      {loading ? (
        <div className="h-8 bg-muted animate-pulse rounded w-24" />
      ) : (
        <p className="font-heading font-black text-2xl">{value}</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: overview, loading: overviewLoading } = useAnalyticsOverview();
  const { data: recentSales, loading: salesLoading } = useRecentSales(5);
  const { data: myProducts, loading: productsLoading } = useMyProducts({
    limit: 5,
  });

  const stats = [
    {
      label: "Total Revenue",
      value: overview
        ? formatPrice(overview.totalRevenueCents, "usd")
        : "$0.00",
      icon: DollarSign,
      color: "bg-digi-pink",
    },
    {
      label: "Ready to Withdraw",
      value: overview
        ? overview.withdrawableRevenueCents >= overview.minimumWithdrawalCents
          ? formatPrice(overview.withdrawableRevenueCents, "usd")
          : `${formatPrice(overview.withdrawableRevenueCents, "usd")} (min $100)`
        : "$0.00",
      icon: Wallet,
      color: "bg-digi-mint",
    },
    {
      label: "Total Sales",
      value: overview ? String(overview.totalSales) : "0",
      icon: ShoppingCart,
      color: "bg-digi-yellow",
    },
    {
      label: "Followers",
      value: overview ? String(overview.followerCount) : "0",
      icon: Users,
      color: "bg-digi-lavender",
    },
    {
      label: "Published Products",
      value: overview ? String(overview.productCount) : "0",
      icon: Eye,
      color: "bg-digi-peach",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&rsquo;s your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
            loading={overviewLoading}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-3 brutal-card">
          <div className="px-6 py-4 border-b-2 border-border">
            <h2 className="font-heading font-bold text-lg">Recent Sales</h2>
          </div>
          <div className="divide-y-2 divide-border">
            {salesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))
            ) : recentSales && recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="px-6 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {sale.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.customerName || sale.customerEmail} •{" "}
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-bold text-sm shrink-0 bg-emerald-500/20 text-emerald-400 border-emerald-500/40 px-2 py-1 brutal-border text-xs">
                    +{formatPrice(sale.amountCents, "usd")}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                No sales yet. Share your products to get started!
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Top Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="brutal-card p-6">
            <h2 className="font-heading font-bold text-lg mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/products/new"
                className="w-full brutal-btn bg-primary text-primary-foreground text-sm font-bold py-3 flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} /> New Product
              </Link>
              <Link
                href="/dashboard/analytics"
                className="w-full brutal-btn bg-card text-sm font-semibold py-3 flex items-center justify-center gap-2"
              >
                <BarChart3 size={16} /> View Analytics
              </Link>
            </div>
          </div>

          <div className="brutal-card">
            <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg">Your Products</h2>
              <Link
                href="/dashboard/products"
                className="text-xs font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y-2 divide-border">
              {productsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-6 py-3 flex items-center justify-between">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-12" />
                  </div>
                ))
              ) : myProducts && myProducts.length > 0 ? (
                myProducts.map((product) => (
                  <div
                    key={product.id}
                    className="px-6 py-3 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium truncate pr-4 block">
                        {product.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {product.status}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {product.salesCount} sales
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No products yet
                  </p>
                  <Link
                    href="/dashboard/products/new"
                    className="brutal-btn bg-primary text-primary-foreground text-xs"
                  >
                    Create one
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
