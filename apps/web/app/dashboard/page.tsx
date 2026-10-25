"use client";

import Link from "next/link";
import {
  IndianRupee,
  ShoppingCart,
  Eye,
  PlusCircle,
  BarChart3,
  Users,
  Wallet,
  ShoppingBag,
  Sparkles,
  Heart,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/mock-data";
import {
  useAnalyticsOverview,
  useRecentSales,
  useMyProducts,
} from "@/hooks/api-hooks";
import { authClient } from "@repo/auth/client";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  subtitle,
  href,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  subtitle?: string;
  href?: string;
}) {
  const content = (
    <div className={`brutal-card p-5 h-full flex flex-col justify-between ${href ? "hover:translate-x-0.5 hover:translate-y-0.5 transition-transform" : ""}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate mr-1">
            {label}
          </span>
          <div className={`w-8 h-8 ${color} brutal-border flex items-center justify-center shrink-0`}>
            <Icon size={14} className="text-black" />
          </div>
        </div>
        {loading ? (
          <div className="h-8 bg-muted animate-pulse rounded w-24" />
        ) : (
          <p className="font-heading font-black text-2xl text-foreground">{value}</p>
        )}
      </div>
      {subtitle && (
        <p className="text-[11px] text-muted-foreground mt-2 border-t border-border/50 pt-1.5 flex items-center justify-between">
          <span>{subtitle}</span>
          {href && <ArrowUpRight size={12} className="opacity-70" />}
        </p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}

function CreatorDashboard() {
  const { data: overview, loading: overviewLoading } = useAnalyticsOverview();
  const { data: recentSales, loading: salesLoading } = useRecentSales(5);
  const { data: myProducts, loading: productsLoading } = useMyProducts({
    limit: 5,
  });

  const stats = [
    {
      label: "Total Revenue",
      value: overview
        ? formatPrice(overview.totalRevenueCents, "inr")
        : "₹0",
      icon: IndianRupee,
      color: "bg-digi-pink",
    },
    {
      label: "Ready to Withdraw",
      value: overview
        ? formatPrice(overview.withdrawableRevenueCents, "inr")
        : "₹0",
      subtitle: overview
        ? overview.withdrawableRevenueCents >= overview.minimumWithdrawalCents
          ? "Available to withdraw"
          : `Min ${formatPrice(overview.minimumWithdrawalCents, "inr")}`
        : undefined,
      icon: Wallet,
      color: "bg-digi-mint",
      href: "/dashboard/payouts",
    },
    {
      label: "In 30-Day Escrow",
      value: overview
        ? formatPrice(overview.escrowRevenueCents ?? 0, "inr")
        : "₹0",
      subtitle: "Unlocks after 30 days",
      icon: Clock,
      color: "bg-digi-yellow",
      href: "/dashboard/payouts",
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
      label: "Published",
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

      {/* Pending Payout Banner if any */}
      {overview && (overview.pendingPayoutCents ?? 0) > 0 && (
        <div className="mb-6 p-4 brutal-card bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white brutal-border flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="font-heading font-bold text-sm">
                Withdrawal in Progress: {formatPrice(overview.pendingPayoutCents!, "inr")}
              </p>
              <p className="text-xs text-muted-foreground">
                Your payout request is being processed by administration.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/payouts"
            className="brutal-btn bg-blue-500 text-white text-xs font-bold px-3 py-1.5 shrink-0"
          >
            View Details
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
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
                    +{formatPrice(sale.amountCents, "inr")}
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
              <Link
                href="/dashboard/payouts"
                className="w-full brutal-btn bg-card text-sm font-semibold py-3 flex items-center justify-center gap-2"
              >
                <Wallet size={16} /> Payouts & Escrow
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

function BuyerDashboard() {
  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl mb-1">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back! Manage your purchases, subscriptions, and settings.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/purchases" className="brutal-card p-6 hover:bg-muted/50 transition-colors group">
          <div className="w-10 h-10 bg-digi-pink brutal-border flex items-center justify-center mb-4">
            <ShoppingBag size={18} className="text-primary-foreground" />
          </div>
          <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            My Purchases
          </h3>
          <p className="text-sm text-muted-foreground">
            View and download your digital products.
          </p>
        </Link>

        <Link href="/dashboard/following" className="brutal-card p-6 hover:bg-muted/50 transition-colors group">
          <div className="w-10 h-10 bg-digi-lavender brutal-border flex items-center justify-center mb-4">
            <Heart size={18} className="text-primary-foreground" />
          </div>
          <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            Following
          </h3>
          <p className="text-sm text-muted-foreground">
            Creators and stores you follow.
          </p>
        </Link>

        <Link href="/dashboard/settings" className="brutal-card p-6 hover:bg-muted/50 transition-colors group">
          <div className="w-10 h-10 bg-digi-mint brutal-border flex items-center justify-center mb-4">
            <Users size={18} className="text-primary-foreground" />
          </div>
          <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Account preferences and profile.
          </p>
        </Link>
      </div>

      {/* Become a Creator CTA */}
      <div className="brutal-card p-8 bg-primary/5 border-2 border-dashed border-primary">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary brutal-border flex items-center justify-center shrink-0">
            <Sparkles size={22} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading font-black text-xl mb-2">
              Want to sell on DigiStore?
            </h2>
            <p className="text-muted-foreground mb-4 max-w-lg">
              Set up your creator profile to sell digital products, courses,
              memberships, and more. It only takes a minute!
            </p>
            <Link
              href="/dashboard/creator-setup"
              className="brutal-btn bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-2"
            >
              <Sparkles size={16} /> Become a Creator
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const user = session?.user as any;
  const isCreator = user?.role === "creator" || Boolean(user?.username);

  if (isCreator) {
    return <CreatorDashboard />;
  }

  return <BuyerDashboard />;
}

