"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Repeat,
  DollarSign,
  TrendingUp,
  PlusCircle,
  RefreshCw,
  Loader2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Key,
  CreditCard,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  Ban,
  ExternalLink,
} from "lucide-react";
import {
  membershipApi,
  licenseApi,
  type CreatorMembersData,
  type MembershipItem,
  type CreatorLicenseKey,
} from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState<"members" | "licenses">("members");

  // Memberships state
  const [membersData, setMembersData] = useState<CreatorMembersData | null>(null);
  const [membersLoading, setMembersLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "cancelled">("all");
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Licenses state
  const [licenses, setLicenses] = useState<CreatorLicenseKey[]>([]);
  const [licensesLoading, setLicensesLoading] = useState(false);
  const [togglingLicenseId, setTogglingLicenseId] = useState<string | null>(null);

  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const data = await membershipApi.getCreatorMembers();
      setMembersData(data);
    } catch (e: any) {
      toast.error("Failed to load subscribers", { description: e.message });
    } finally {
      setMembersLoading(false);
    }
  };

  const loadLicenses = async () => {
    setLicensesLoading(true);
    try {
      const data = await licenseApi.getCreatorKeys();
      setLicenses(data);
    } catch (e: any) {
      toast.error("Failed to load license keys", { description: e.message });
    } finally {
      setLicensesLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (activeTab === "licenses" && licenses.length === 0) {
      loadLicenses();
    }
  }, [activeTab]);

  const handleRenew = async (id: string, customerEmail?: string) => {
    setRenewingId(id);
    try {
      const updated = await membershipApi.renew(id);
      toast.success(`Simulated monthly renewal processed for ${customerEmail || "member"}!`, {
        description: `Next billing date extended to ${new Date(updated.currentPeriodEnd || "").toLocaleDateString()}`,
      });
      loadMembers();
    } catch (e: any) {
      toast.error("Renewal simulation failed", { description: e.message });
    } finally {
      setRenewingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this membership?")) return;
    setCancellingId(id);
    try {
      await membershipApi.cancel(id);
      toast.success("Membership cancelled successfully");
      loadMembers();
    } catch (e: any) {
      toast.error("Cancellation failed", { description: e.message });
    } finally {
      setCancellingId(null);
    }
  };

  const handleToggleLicense = async (id: string) => {
    setTogglingLicenseId(id);
    try {
      const res = await licenseApi.toggleKey(id);
      toast.success(res.isDisabled ? "License key disabled" : "License key enabled");
      setLicenses((prev) =>
        prev.map((k) => (k.id === id ? { ...k, isDisabled: res.isDisabled } : k))
      );
    } catch (e: any) {
      toast.error("Failed to update license key", { description: e.message });
    } finally {
      setTogglingLicenseId(null);
    }
  };

  const stats = membersData?.stats || {
    totalMembers: 0,
    activeMembers: 0,
    cancelledMembers: 0,
    mrrCents: 0,
  };

  const membersList = (membersData?.members || []).filter((m) => {
    if (filterStatus === "all") return true;
    return m.status === filterStatus;
  });

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-black text-3xl">Memberships & Subscriptions</h1>
            <span className="text-xs bg-digi-mint/30 text-digi-mint-dark font-bold px-2 py-0.5 brutal-border">
              PROTOTYPE
            </span>
          </div>
          <p className="text-muted-foreground">
            Manage recurring subscribers, track monthly recurring revenue (MRR), and inspect software licenses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products/new"
            className="brutal-btn bg-primary text-primary-foreground text-sm flex items-center gap-2"
          >
            <PlusCircle size={15} /> Create Membership Tier
          </Link>
          <button
            onClick={() => {
              if (activeTab === "members") loadMembers();
              else loadLicenses();
            }}
            className="brutal-btn bg-card text-foreground text-sm p-2 hover:bg-muted"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={membersLoading || licensesLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="brutal-card p-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Monthly Recurring (MRR)</span>
            <DollarSign size={16} className="text-primary" />
          </div>
          <p className="font-heading font-black text-3xl">
            {formatPrice(stats.mrrCents, "usd")}
          </p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-emerald-500" /> Active monthly run rate
          </p>
        </div>

        <div className="brutal-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Active Subscribers</span>
            <Users size={16} className="text-emerald-500" />
          </div>
          <p className="font-heading font-black text-3xl">{stats.activeMembers}</p>
          <p className="text-xs text-muted-foreground mt-1">Paying recurring patrons</p>
        </div>

        <div className="brutal-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Total Historical</span>
            <Repeat size={16} className="text-amber-500" />
          </div>
          <p className="font-heading font-black text-3xl">{stats.totalMembers}</p>
          <p className="text-xs text-muted-foreground mt-1">All subscriptions ever initiated</p>
        </div>

        <div className="brutal-card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-bold uppercase tracking-wide">Churned / Cancelled</span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <p className="font-heading font-black text-3xl">{stats.cancelledMembers}</p>
          <p className="text-xs text-muted-foreground mt-1">Cancelled subscriptions</p>
        </div>
      </div>

      {/* Final Year Project Sandbox Notice */}
      <div className="brutal-card p-4 mb-8 bg-amber-500/10 border-amber-500/40 flex items-start gap-3">
        <Zap className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div className="text-sm">
          <p className="font-bold text-foreground">
            Academic Project Defense Sandbox: Recurring Billing Simulation
          </p>
          <p className="text-muted-foreground text-xs mt-0.5">
            Since real subscriptions renew automatically after 30 days, you can test recurring billing on-demand by clicking{" "}
            <strong className="text-foreground">⚡ Simulate Monthly Renewal</strong> on any active subscriber.
            This instantly triggers recurring charge verification, extends their access by 30 days, and credits monthly revenue.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-border mb-6">
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2.5 font-heading font-bold text-sm flex items-center gap-2 border-b-2 -mb-[2px] transition-colors ${
            activeTab === "members"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={16} /> Subscribers ({stats.totalMembers})
        </button>
        <button
          onClick={() => setActiveTab("licenses")}
          className={`px-4 py-2.5 font-heading font-bold text-sm flex items-center gap-2 border-b-2 -mb-[2px] transition-colors ${
            activeTab === "licenses"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Key size={16} /> Software License Keys ({licenses.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === "members" && (
        <>
          {/* Status Filter */}
          <div className="flex items-center gap-2 mb-4">
            {(["all", "active", "cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold capitalize brutal-border transition-colors ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted text-muted-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {membersLoading ? (
            <div className="brutal-card p-12 text-center">
              <Loader2 size={32} className="animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading subscribers...</p>
            </div>
          ) : membersList.length === 0 ? (
            <div className="brutal-card p-12 text-center">
              <Users size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
              <h3 className="font-heading font-bold text-lg mb-1">No subscribers found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                {filterStatus === "all"
                  ? "You don't have any recurring subscribers yet. Create a product with 'Membership' type to start offering memberships."
                  : `No subscribers currently match the "${filterStatus}" status.`}
              </p>
              <Link
                href="/dashboard/products/new"
                className="brutal-btn bg-primary text-primary-foreground text-xs font-bold inline-flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Create Membership Product
              </Link>
            </div>
          ) : (
            <div className="brutal-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 border-b-2 border-border text-xs uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Member</th>
                      <th className="px-5 py-3">Membership Tier</th>
                      <th className="px-5 py-3">Price / Cycle</th>
                      <th className="px-5 py-3">Next Billing</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Interactive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-border">
                    {membersList.map((sub) => {
                      const isExpired = sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd) < new Date()
                        : false;

                      return (
                        <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                          {/* Member */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                {sub.customer?.name?.[0] || sub.customer?.email?.[0] || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {sub.customer?.name || "Patron"}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                  {sub.customer?.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Tier */}
                          <td className="px-5 py-4">
                            <p className="font-semibold">{sub.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Member since {new Date(sub.createdAt).toLocaleDateString()}
                            </p>
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4 font-mono font-bold">
                            {formatPrice(sub.product.priceCents, sub.product.currency)}
                            <span className="text-xs text-muted-foreground font-normal">
                              /{sub.product.recurrence || "month"}
                            </span>
                          </td>

                          {/* Next billing date */}
                          <td className="px-5 py-4">
                            {sub.currentPeriodEnd ? (
                              <div>
                                <p className="text-xs font-semibold">
                                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                </p>
                                {isExpired ? (
                                  <span className="text-[10px] text-destructive font-bold">Expired</span>
                                ) : (
                                  <span className="text-[10px] text-emerald-500 font-bold">Access Active</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            {sub.status === "active" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 brutal-border">
                                <CheckCircle size={12} /> Active
                              </span>
                            ) : sub.status === "cancelled" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-500/15 px-2.5 py-0.5 brutal-border">
                                <XCircle size={12} /> Cancelled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/15 px-2.5 py-0.5 brutal-border">
                                {sub.status}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === "active" && (
                                <>
                                  <button
                                    onClick={() => handleRenew(sub.id, sub.customer?.email)}
                                    disabled={renewingId === sub.id}
                                    className="brutal-btn bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-1.5 px-3 flex items-center gap-1 shrink-0 disabled:opacity-60"
                                    title="Simulate automated monthly renewal cycle"
                                  >
                                    {renewingId === sub.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Zap size={12} />
                                    )}
                                    Simulate Renewal
                                  </button>
                                  <button
                                    onClick={() => handleCancel(sub.id)}
                                    disabled={cancellingId === sub.id}
                                    className="brutal-btn bg-card hover:bg-muted text-destructive text-xs font-semibold py-1.5 px-2.5 shrink-0 disabled:opacity-60"
                                    title="Cancel Membership"
                                  >
                                    {cancellingId === sub.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      "Cancel"
                                    )}
                                  </button>
                                </>
                              )}
                              {sub.status === "cancelled" && (
                                <button
                                  onClick={() => handleRenew(sub.id, sub.customer?.email)}
                                  disabled={renewingId === sub.id}
                                  className="brutal-btn bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 flex items-center gap-1 shrink-0 disabled:opacity-60"
                                  title="Reactivate subscription"
                                >
                                  {renewingId === sub.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <RefreshCw size={12} />
                                  )}
                                  Reactivate
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
            </div>
          )}
        </>
      )}

      {/* TAB 2: LICENSES */}
      {activeTab === "licenses" && (
        <>
          {licensesLoading ? (
            <div className="brutal-card p-12 text-center">
              <Loader2 size={32} className="animate-spin mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading software license keys...</p>
            </div>
          ) : licenses.length === 0 ? (
            <div className="brutal-card p-12 text-center">
              <Key size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
              <h3 className="font-heading font-bold text-lg mb-1">No license keys issued yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                When buyers purchase software or digital products, unique keys in format{" "}
                <code className="font-mono font-bold">DIGI-XXXX-XXXX-XXXX</code> will appear here.
              </p>
            </div>
          ) : (
            <div className="brutal-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 border-b-2 border-border text-xs uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">License Key</th>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Buyer Email</th>
                      <th className="px-5 py-3">Activations / Seats</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-border">
                    {licenses.map((key) => (
                      <tr key={key.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-sm tracking-wider">
                          {key.licenseKey}
                        </td>
                        <td className="px-5 py-4 font-semibold">{key.product.name}</td>
                        <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
                          {key.order.customerEmail}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono font-semibold">
                            {key.uses} / {key.maxUses} seats
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {key.isDisabled ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/15 px-2.5 py-0.5 brutal-border">
                              <Ban size={12} /> Disabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 brutal-border">
                              <ShieldCheck size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleToggleLicense(key.id)}
                            disabled={togglingLicenseId === key.id}
                            className={`brutal-btn text-xs font-bold py-1.5 px-3 ${
                              key.isDisabled
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                : "bg-card hover:bg-muted text-destructive"
                            }`}
                          >
                            {togglingLicenseId === key.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : key.isDisabled ? (
                              "Enable Key"
                            ) : (
                              "Revoke Key"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
