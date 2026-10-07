"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Sparkles,
  RefreshCw,
  Package,
  ShoppingCart,
  Wallet,
  DollarSign,
  Server,
  ExternalLink,
  Eye,
  RotateCcw,
  Ban,
  TrendingUp,
  Globe,
  Sliders,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import {
  useAdminStats,
  useAllUsers,
  useAdminProducts,
  useAdminOrders,
  useAdminPayouts,
  useAdminSystemHealth,
} from "@/hooks/api-hooks";
import {
  adminApi,
  formatCents,
  type AdminUser,
  type AdminOrder,
  type AdminPayout,
} from "@/lib/api";
import { toast } from "sonner";

type TabKey = "overview" | "users" | "products" | "orders" | "payouts" | "system";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Filter & Search states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");

  // Modal / Action states
  const [banModalUser, setBanModalUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Queries
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const {
    data: users,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useAllUsers({ search: userSearch, role: userRoleFilter });
  const {
    data: products,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useAdminProducts({ search: productSearch, status: productStatusFilter });
  const {
    data: orders,
    loading: ordersLoading,
    refetch: refetchOrders,
  } = useAdminOrders({ search: orderSearch, status: orderStatusFilter });
  const {
    data: payouts,
    loading: payoutsLoading,
    refetch: refetchPayouts,
  } = useAdminPayouts({ status: payoutStatusFilter });
  const {
    data: system,
    refetch: refetchSystem,
  } = useAdminSystemHealth();

  const handleRefreshAll = () => {
    refetchStats();
    refetchUsers();
    refetchProducts();
    refetchOrders();
    refetchPayouts();
    refetchSystem();
    toast.success("Platform data refreshed");
  };

  // ─── Actions ────────────────────────────────────────────────────────
  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoadingId(`role-${userId}`);
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      refetchUsers();
      refetchStats();
    } catch (e: any) {
      toast.error("Role update failed", { description: e.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBanSubmit = async () => {
    if (!banModalUser) return;
    setActionLoadingId(`ban-${banModalUser.id}`);
    try {
      await adminApi.banUser(banModalUser.id, true, banReason);
      toast.success(`User ${banModalUser.name} suspended`);
      setBanModalUser(null);
      setBanReason("");
      refetchUsers();
    } catch (e: any) {
      toast.error("Suspension failed", { description: e.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnban = async (user: AdminUser) => {
    if (!confirm(`Restore and unban user ${user.name}?`)) return;
    setActionLoadingId(`unban-${user.id}`);
    try {
      await adminApi.banUser(user.id, false);
      toast.success(`User ${user.name} reinstated`);
      refetchUsers();
    } catch (e: any) {
      toast.error("Reinstatement failed", { description: e.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleModerateProduct = async (
    productId: string,
    data: { status?: string; isListedOnDiscover?: boolean }
  ) => {
    setActionLoadingId(`prod-${productId}`);
    try {
      await adminApi.moderateProduct(productId, data);
      toast.success("Product updated");
      refetchProducts();
      refetchStats();
    } catch (e: any) {
      toast.error("Failed to moderate product", { description: e.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefundOrder = async (order: AdminOrder) => {
    if (
      !confirm(
        `Issue full refund for order ${order.id.slice(0, 8)} (${formatCents(
          order.amountCents,
          order.currency
        )})? This will reverse creator earnings.`
      )
    )
      return;

    setActionLoadingId(`refund-${order.id}`);
    try {
      await adminApi.refundOrder(order.id);
      toast.success("Order refunded successfully");
      refetchOrders();
      refetchStats();
    } catch (e: any) {
      toast.error("Refund failed", { description: e.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProcessPayout = async (payout: AdminPayout) => {
    if (
      !confirm(
        `Process payout of ${formatCents(payout.amountCents, payout.currency)} to ${
          payout.creator.name
        }?`
      )
    )
      return;

    setActionLoadingId(`payout-${payout.id}`);
    try {
      await adminApi.processPayout(payout.id);
      toast.success(`Payout processed for ${payout.creator.name}`);
      refetchPayouts();
      refetchStats();
    } catch (e: any) {
      toast.error("Payout failed", { description: e.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  interface AdminTabItem {
    key: TabKey;
    label: string;
    icon: any;
    count?: number;
  }

  // Nav tab definitions
  const TABS: AdminTabItem[] = [
    { key: "overview", label: "Overview", icon: TrendingUp },
    { key: "users", label: "Users & Creators", icon: Users, count: users?.length },
    { key: "products", label: "Catalog & Moderation", icon: Package, count: products?.length },
    { key: "orders", label: "Orders & Refunds", icon: ShoppingCart, count: orders?.length },
    { key: "payouts", label: "Creator Payouts", icon: DollarSign, count: payouts?.length },
    { key: "system", label: "System Health", icon: Server },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-black text-3xl">Admin Control Center</h1>
            <span className="bg-primary text-primary-foreground font-black text-[10px] px-2 py-0.5 brutal-border uppercase">
              Superuser
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Platform governance, revenue distribution, user registry, and catalog moderation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRefreshAll}
            className="brutal-btn bg-card text-xs font-bold flex items-center gap-2 py-2 px-3 hover:bg-muted transition-colors"
          >
            <RefreshCw
              size={14}
              className={
                statsLoading || usersLoading || productsLoading || ordersLoading
                  ? "animate-spin"
                  : ""
              }
            />
            <span>Refresh All</span>
          </button>
        </div>
      </div>

      {/* Neo-Brutalist Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-bold flex items-center gap-2 brutal-border whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-brutal translate-y-[-1px]"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 brutal-border ${
                    isActive
                      ? "bg-background text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 1. OVERVIEW TAB */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Hero Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* GMV */}
            <div className="brutal-card p-5 bg-digi-mint/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Platform GMV
                </span>
                <DollarSign size={18} className="text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="font-heading font-black text-3xl">
                {statsLoading
                  ? "…"
                  : formatCents(stats?.financials?.totalVolumeCents ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Gross transaction volume across platform
              </p>
            </div>

            {/* Platform Revenue (10%) */}
            <div className="brutal-card p-5 bg-digi-yellow/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Platform Net Cut (10%)
                </span>
                <TrendingUp size={18} className="text-amber-700 dark:text-amber-400" />
              </div>
              <div className="font-heading font-black text-3xl">
                {statsLoading
                  ? "…"
                  : formatCents(stats?.financials?.platformRevenueCents ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Protocol fees retained by DigiStore
              </p>
            </div>

            {/* Creator Earnings */}
            <div className="brutal-card p-5 bg-digi-pink/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Creator Earnings
                </span>
                <Wallet size={18} className="text-pink-700 dark:text-pink-400" />
              </div>
              <div className="font-heading font-black text-3xl">
                {statsLoading
                  ? "…"
                  : formatCents(stats?.financials?.creatorEarningsCents ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Net earnings distributed to creators
              </p>
            </div>

            {/* Total Orders */}
            <div className="brutal-card p-5 bg-digi-blue/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Orders
                </span>
                <ShoppingCart size={18} className="text-blue-700 dark:text-blue-400" />
              </div>
              <div className="font-heading font-black text-3xl">
                {statsLoading ? "…" : stats?.orders?.total ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {stats?.orders?.completed ?? 0} successfully completed
              </p>
            </div>
          </div>

          {/* Secondary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="brutal-card p-4 bg-card">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Active Creators
              </span>
              <p className="font-heading font-black text-xl mt-1">
                {statsLoading ? "…" : stats?.users?.creators ?? 0}
              </p>
            </div>
            <div className="brutal-card p-4 bg-card">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Registered Buyers
              </span>
              <p className="font-heading font-black text-xl mt-1">
                {statsLoading ? "…" : stats?.users?.customers ?? 0}
              </p>
            </div>
            <div className="brutal-card p-4 bg-card">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Published Catalog
              </span>
              <p className="font-heading font-black text-xl mt-1">
                {statsLoading
                  ? "…"
                  : `${stats?.products?.published ?? 0} / ${stats?.products?.total ?? 0}`}
              </p>
            </div>
            <div className="brutal-card p-4 bg-card">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Active Sessions
              </span>
              <p className="font-heading font-black text-xl mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {statsLoading ? "…" : stats?.users?.activeSessions ?? 0}
              </p>
            </div>
          </div>

          {/* Two-Column Grid: Recent Sales & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Sales Ledger */}
            <div className="brutal-card overflow-hidden">
              <div className="p-4 border-b-2 border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-primary" />
                  <h3 className="font-heading font-bold text-sm">Recent Platform Sales</h3>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View All <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="divide-y-2 divide-border">
                {statsLoading ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    Loading sales ticker...
                  </div>
                ) : !stats?.recentSales?.length ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No sales recorded yet.
                  </div>
                ) : (
                  stats.recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs truncate">
                          {sale.product?.name || "Digital Product"}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                          {sale.customerEmail} &bull;{" "}
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-heading font-black text-sm">
                          {formatCents(sale.amountCents, sale.currency)}
                        </span>
                        <div>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 brutal-border ${
                              sale.paymentProvider === "razorpay"
                                ? "bg-amber-500/15 text-amber-600 border-amber-500"
                                : "bg-blue-500/15 text-blue-600 border-blue-500"
                            }`}
                          >
                            {sale.paymentProvider}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Products Leaderboard */}
            <div className="brutal-card overflow-hidden">
              <div className="p-4 border-b-2 border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-digi-pink" />
                  <h3 className="font-heading font-bold text-sm">Top Performing Products</h3>
                </div>
                <button
                  onClick={() => setActiveTab("products")}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Manage Catalog <ArrowUpRight size={12} />
                </button>
              </div>
              <div className="divide-y-2 divide-border">
                {statsLoading ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    Loading top products...
                  </div>
                ) : !stats?.topProducts?.length ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No top products yet.
                  </div>
                ) : (
                  stats.topProducts.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="font-heading font-black text-sm text-muted-foreground w-4 text-center">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            by {p.creator?.name || "Creator"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-heading font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {p.salesCount} sales
                        </span>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {formatCents(p.revenueCents)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 2. USERS & CREATORS TAB */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="brutal-card overflow-hidden">
          {/* Table Header & Search Filter */}
          <div className="p-4 border-b-2 border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
            <div>
              <h2 className="font-heading font-bold text-base">User & Creator Registry</h2>
              <p className="text-xs text-muted-foreground">
                Manage roles, inspect storefronts, and suspend accounts violating policies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search name, email, username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="brutal-input pl-8 pr-3 py-1.5 text-xs w-full sm:w-64"
                />
              </div>

              <div className="flex gap-1">
                {["all", "creator", "user", "admin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-2.5 py-1.5 text-xs font-bold capitalize brutal-border transition-colors ${
                      userRoleFilter === r
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          {usersLoading ? (
            <div className="p-12 text-center text-muted-foreground text-sm font-semibold">
              Loading user registry...
            </div>
          ) : !users?.length ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No users matched your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b-2 border-border text-[11px] uppercase font-heading">
                    <th className="p-3 pl-4">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Activity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {users.map((u) => {
                    const isBanned = Boolean(u.banned);
                    const isLoading = actionLoadingId?.includes(u.id);

                    return (
                      <tr key={u.id} className={`hover:bg-muted/15 ${isBanned ? "bg-destructive/5" : ""}`}>
                        {/* User Details */}
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            {u.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.image}
                                alt={u.name}
                                className="w-7 h-7 rounded-full brutal-border object-cover"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                {u.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-bold">{u.name}</p>
                              {u.username ? (
                                <Link
                                  href={`/creator/${u.username}`}
                                  target="_blank"
                                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                >
                                  @{u.username} <ExternalLink size={9} />
                                </Link>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  ID: {u.id.slice(0, 10)}…
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-3 font-mono text-muted-foreground">
                          {u.email}
                        </td>

                        {/* Role Selector */}
                        <td className="p-3">
                          <select
                            disabled={isLoading}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="brutal-input text-xs py-1 px-2 font-bold cursor-pointer"
                          >
                            <option value="user">User</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        {/* Activity */}
                        <td className="p-3 text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {u._count?.products ?? 0}
                          </span>{" "}
                          prods &bull;{" "}
                          <span className="font-semibold text-foreground">
                            {u._count?.orders ?? 0}
                          </span>{" "}
                          orders
                        </td>

                        {/* Ban / Active Status */}
                        <td className="p-3">
                          {isBanned ? (
                            <span
                              className="text-[10px] font-black uppercase px-2 py-0.5 brutal-border bg-destructive/20 text-destructive border-destructive"
                              title={u.banReason || "Suspended account"}
                            >
                              Suspended
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 brutal-border bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500">
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isBanned ? (
                              <button
                                disabled={isLoading}
                                onClick={() => handleUnban(u)}
                                className="brutal-btn bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1"
                              >
                                Reopen
                              </button>
                            ) : (
                              <button
                                disabled={isLoading || u.role === "admin"}
                                onClick={() => {
                                  setBanModalUser(u);
                                  setBanReason("");
                                }}
                                className={`brutal-btn text-[11px] font-bold px-2.5 py-1 ${
                                  u.role === "admin"
                                    ? "opacity-30 cursor-not-allowed bg-muted"
                                    : "bg-destructive/15 text-destructive hover:bg-destructive hover:text-white"
                                }`}
                              >
                                Ban User
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 3. PRODUCTS & CATALOG MODERATION TAB */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === "products" && (
        <div className="brutal-card overflow-hidden">
          <div className="p-4 border-b-2 border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
            <div>
              <h2 className="font-heading font-bold text-base">Catalog Governance & Moderation</h2>
              <p className="text-xs text-muted-foreground">
                Audit listings, toggle Discover homepage features, or archive illicit content.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search product, creator, category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="brutal-input pl-8 pr-3 py-1.5 text-xs w-full sm:w-64"
                />
              </div>

              <div className="flex gap-1">
                {["all", "published", "draft", "archived"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setProductStatusFilter(st)}
                    className={`px-2.5 py-1.5 text-xs font-bold capitalize brutal-border transition-colors ${
                      productStatusFilter === st
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {productsLoading ? (
            <div className="p-12 text-center text-muted-foreground text-sm font-semibold">
              Loading catalog listings...
            </div>
          ) : !products?.length ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No products found in this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b-2 border-border text-[11px] uppercase font-heading">
                    <th className="p-3 pl-4">Product</th>
                    <th className="p-3">Creator</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Sales / Revenue</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Discover</th>
                    <th className="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {products.map((p) => {
                    const isLoading = actionLoadingId?.includes(p.id);

                    return (
                      <tr key={p.id} className="hover:bg-muted/15">
                        {/* Title & Category */}
                        <td className="p-3 pl-4 max-w-xs">
                          <p className="font-bold text-xs truncate">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground uppercase bg-muted px-1.5 py-0.2 brutal-border">
                              {p.productType}
                            </span>
                            {p.category && (
                              <span className="text-[10px] text-muted-foreground capitalize">
                                &bull; {p.category}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Creator */}
                        <td className="p-3">
                          <p className="font-medium text-xs">{p.creator?.name}</p>
                          {p.creator?.username && (
                            <Link
                              href={`/creator/${p.creator.username}`}
                              target="_blank"
                              className="text-[10px] text-primary hover:underline"
                            >
                              @{p.creator.username}
                            </Link>
                          )}
                        </td>

                        {/* Price */}
                        <td className="p-3 font-heading font-black text-xs">
                          {formatCents(p.priceCents, p.currency)}
                        </td>

                        {/* Sales */}
                        <td className="p-3">
                          <span className="font-bold">{p.salesCount}</span> sales
                          <p className="text-[10px] font-mono text-muted-foreground">
                            {formatCents(p.revenueCents)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 brutal-border ${
                              p.status === "published"
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500"
                                : p.status === "archived"
                                  ? "bg-destructive/20 text-destructive border-destructive"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        {/* Discover Toggle */}
                        <td className="p-3">
                          <button
                            disabled={isLoading}
                            onClick={() =>
                              handleModerateProduct(p.id, {
                                isListedOnDiscover: !p.isListedOnDiscover,
                              })
                            }
                            className={`px-2 py-1 text-[11px] font-bold brutal-border transition-colors ${
                              p.isListedOnDiscover
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {p.isListedOnDiscover ? "Featured" : "Hidden"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.creator?.username && p.slug && (
                              <Link
                                href={`/product/${p.creator.username}/${p.slug}`}
                                target="_blank"
                                className="brutal-btn bg-card text-[11px] font-bold px-2 py-1 flex items-center gap-1"
                                title="Preview Storefront Listing"
                              >
                                <Eye size={12} />
                              </Link>
                            )}

                            {p.status === "published" ? (
                              <button
                                disabled={isLoading}
                                onClick={() =>
                                  handleModerateProduct(p.id, { status: "archived" })
                                }
                                className="brutal-btn bg-destructive/15 text-destructive hover:bg-destructive hover:text-white text-[11px] font-bold px-2 py-1"
                              >
                                Take Down
                              </button>
                            ) : (
                              <button
                                disabled={isLoading}
                                onClick={() =>
                                  handleModerateProduct(p.id, { status: "published" })
                                }
                                className="brutal-btn bg-emerald-500 text-white text-[11px] font-bold px-2 py-1"
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 4. ORDERS & TRANSACTIONS TAB */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="brutal-card overflow-hidden">
          <div className="p-4 border-b-2 border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
            <div>
              <h2 className="font-heading font-bold text-base">Platform Transaction Ledger</h2>
              <p className="text-xs text-muted-foreground">
                Real-time purchase flow, protocol cuts, and administrative refund execution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search order ID, email, item..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="brutal-input pl-8 pr-3 py-1.5 text-xs w-full sm:w-64"
                />
              </div>

              <div className="flex gap-1">
                {["all", "completed", "pending", "refunded"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-2.5 py-1.5 text-xs font-bold capitalize brutal-border transition-colors ${
                      orderStatusFilter === st
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {ordersLoading ? (
            <div className="p-12 text-center text-muted-foreground text-sm font-semibold">
              Loading orders ledger...
            </div>
          ) : !orders?.length ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No orders matched this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b-2 border-border text-[11px] uppercase font-heading">
                    <th className="p-3 pl-4">Order ID / Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Gateway</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Platform Cut (10%)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border">
                  {orders.map((o) => {
                    const isRefunded = o.status === "refunded";
                    const isLoading = actionLoadingId?.includes(o.id);

                    return (
                      <tr key={o.id} className={`hover:bg-muted/15 ${isRefunded ? "opacity-60" : ""}`}>
                        {/* Order ID & Date */}
                        <td className="p-3 pl-4">
                          <p className="font-mono font-bold text-xs">{o.id.slice(0, 10)}…</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="p-3">
                          <p className="font-medium text-xs">{o.customerName || "Anonymous"}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{o.customerEmail}</p>
                        </td>

                        {/* Product */}
                        <td className="p-3 max-w-[200px] truncate">
                          <span className="font-semibold">{o.product?.name || "Product"}</span>
                        </td>

                        {/* Gateway Provider */}
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 brutal-border ${
                              o.paymentProvider === "razorpay"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500"
                            }`}
                          >
                            {o.paymentProvider === "razorpay" ? "🇮🇳 Razorpay" : "🌍 Polar"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="p-3 font-heading font-black text-xs">
                          {formatCents(o.amountCents, o.currency)}
                        </td>

                        {/* Cut */}
                        <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400">
                          +{formatCents(o.platformFeeCents, o.currency)}
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 brutal-border ${
                              o.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500"
                                : o.status === "refunded"
                                  ? "bg-destructive/20 text-destructive border-destructive"
                                  : "bg-amber-500/20 text-amber-600 border-amber-500"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="p-3 pr-4 text-right">
                          {isRefunded ? (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Refunded
                            </span>
                          ) : (
                            <button
                              disabled={isLoading || o.status !== "completed"}
                              onClick={() => handleRefundOrder(o)}
                              className="brutal-btn bg-destructive/15 text-destructive hover:bg-destructive hover:text-white text-[11px] font-bold px-2 py-1 flex items-center gap-1 ml-auto"
                            >
                              <RotateCcw size={11} />
                              <span>Refund</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 5. CREATOR PAYOUTS TAB */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          {/* Payout Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="brutal-card p-5 bg-card">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                Total Payout Records
              </span>
              <p className="font-heading font-black text-3xl mt-1">{payouts?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Creator distribution ledger entries</p>
            </div>

            <div className="brutal-card p-5 bg-digi-mint/20">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                Completed Distributions
              </span>
              <p className="font-heading font-black text-3xl mt-1">
                {payouts?.filter((p) => p.status === "completed").length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Successfully remitted to creators</p>
            </div>

            <div className="brutal-card p-5 bg-digi-yellow/20">
              <span className="text-xs font-bold uppercase text-muted-foreground">
                Pending Approval
              </span>
              <p className="font-heading font-black text-3xl mt-1">
                {payouts?.filter((p) => p.status === "pending").length ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting batch clearance</p>
            </div>
          </div>

          {/* Payout Table */}
          <div className="brutal-card overflow-hidden">
            <div className="p-4 border-b-2 border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="font-heading font-bold text-base">Creator Transfer Schedule</h3>
                <p className="text-xs text-muted-foreground">
                  Direct remittances via Stripe Connect / Polar / Razorpay.
                </p>
              </div>

              <div className="flex gap-1">
                {["all", "completed", "pending"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPayoutStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-bold capitalize brutal-border transition-colors ${
                      payoutStatusFilter === st
                        ? "bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {payoutsLoading ? (
              <div className="p-12 text-center text-muted-foreground text-sm font-semibold">
                Loading payout records...
              </div>
            ) : !payouts?.length ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No payout distributions recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b-2 border-border text-[11px] uppercase font-heading">
                      <th className="p-3 pl-4">Payout ID</th>
                      <th className="p-3">Creator</th>
                      <th className="p-3">Schedule</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Created</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Process</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-border">
                    {payouts.map((p) => {
                      const isCompleted = p.status === "completed";
                      const isLoading = actionLoadingId?.includes(p.id);

                      return (
                        <tr key={p.id} className="hover:bg-muted/15">
                          <td className="p-3 pl-4 font-mono font-bold">{p.id.slice(0, 12)}…</td>

                          <td className="p-3">
                            <p className="font-bold">{p.creator?.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {p.creator?.email}
                            </p>
                          </td>

                          <td className="p-3 uppercase font-mono text-[10px]">
                            {p.creator?.payoutSchedule || "weekly"}
                          </td>

                          <td className="p-3 font-heading font-black text-sm">
                            {formatCents(p.amountCents, p.currency)}
                          </td>

                          <td className="p-3 text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>

                          <td className="p-3">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 brutal-border ${
                                isCompleted
                                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500"
                                  : "bg-amber-500/20 text-amber-600 border-amber-500"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          <td className="p-3 pr-4 text-right">
                            {isCompleted ? (
                              <span className="text-[10px] text-emerald-600 font-mono">
                                Cleared
                              </span>
                            ) : (
                              <button
                                disabled={isLoading}
                                onClick={() => handleProcessPayout(p)}
                                className="brutal-btn bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1"
                              >
                                {isLoading ? "Processing..." : "Approve Payout"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* 6. SYSTEM HEALTH & INFRASTRUCTURE TAB */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database & Latency */}
            <div className="brutal-card p-6 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server size={20} className="text-primary" />
                  <h3 className="font-heading font-black text-base">Database Engine</h3>
                </div>
                <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black px-2 py-0.5 brutal-border uppercase">
                  Connected
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">PostgreSQL Host:</span>
                  <span className="font-bold">localhost:5432</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Ping Latency:</span>
                  <span className="font-bold text-emerald-600">
                    {system?.database?.latencyMs ?? 2}ms
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Active Web Sessions:</span>
                  <span className="font-bold">{system?.activeSessions ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span className="font-bold capitalize">{system?.environment || "development"}</span>
                </div>
              </div>
            </div>

            {/* Protocol Governance & Settings */}
            <div className="brutal-card p-6 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders size={20} className="text-digi-yellow" />
                  <h3 className="font-heading font-black text-base">Protocol Economics</h3>
                </div>
                <span className="bg-primary/20 text-primary text-xs font-black px-2 py-0.5 brutal-border uppercase">
                  Active Rule
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Platform Fee Cut:</span>
                  <span className="font-bold text-primary">10.0% fixed</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Default Payout Schedule:</span>
                  <span className="font-bold">Weekly (Fridays)</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Min. Payout Balance:</span>
                  <span className="font-bold">$10.00 USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Policy Window:</span>
                  <span className="font-bold">14 days</span>
                </div>
              </div>
            </div>

            {/* Connected Gateways */}
            <div className="brutal-card p-6 bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-blue-500" />
                <h3 className="font-heading font-black text-base">Payment Integrations</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 brutal-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">Polar (International / Global)</p>
                    <p className="text-[10px] text-muted-foreground">Credit Cards, Apple Pay, SEPA</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 brutal-border uppercase">
                    Configured
                  </span>
                </div>

                <div className="p-3 brutal-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">Razorpay (India / UPI)</p>
                    <p className="text-[10px] text-muted-foreground">UPI, NetBanking, RuPay</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 brutal-border uppercase">
                    Configured
                  </span>
                </div>
              </div>
            </div>

            {/* Object Storage (MinIO / S3) */}
            <div className="brutal-card p-6 bg-card space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-pink-500" />
                <h3 className="font-heading font-black text-base">Digital Asset Storage</h3>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Storage Engine:</span>
                  <span className="font-bold">MinIO S3 Compatible</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Endpoint:</span>
                  <span className="font-bold">http://localhost:9000</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Default Bucket:</span>
                  <span className="font-bold">gumroad-files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Signed URL Expiry:</span>
                  <span className="font-bold">3600 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* BAN USER MODAL */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="brutal-card max-w-md w-full p-6 bg-card brutal-shadow-lg animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-4 text-destructive">
              <Ban size={24} />
              <h3 className="font-heading font-black text-xl">Suspend User Account</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Suspending <strong>{banModalUser.name}</strong> ({banModalUser.email}) will immediately
              revoke their access, invalidate active sessions, and unpublish their products.
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider">
                Reason for Suspension
              </label>
              <input
                type="text"
                placeholder="e.g. Terms of Service violation, fraudulent items..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="brutal-input text-xs w-full py-2 px-3"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setBanModalUser(null)}
                className="brutal-btn bg-card text-xs font-bold py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleBanSubmit}
                className="brutal-btn bg-destructive text-white text-xs font-bold py-2 px-4"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
