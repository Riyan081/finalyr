"use client";

import { useState } from "react";
import {
  Wallet,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  HelpCircle,
  IndianRupee,
  Calendar,
} from "lucide-react";
import { usePayoutStatus } from "@/hooks/api-hooks";
import { payoutsApi } from "@/lib/api";
import { formatPrice } from "@/lib/mock-data";
import { toast } from "sonner";

export default function PayoutsPage() {
  const { data, loading, error, refetch } = usePayoutStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [amountInput, setAmountInput] = useState<string>("");

  const overview = data?.overview;
  const payouts = data?.payouts ?? [];

  const withdrawableCents = overview?.withdrawableRevenueCents ?? 0;
  const escrowCents = overview?.escrowRevenueCents ?? 0;
  const pendingCents = overview?.pendingPayoutCents ?? 0;
  const alreadyPaidCents = overview?.alreadyPaidOutCents ?? 0;
  const totalNetCents = overview?.creatorNetRevenueCents ?? 0;
  const minWithdrawalCents = overview?.minimumWithdrawalCents ?? 10_000;

  const canWithdraw = withdrawableCents >= minWithdrawalCents && pendingCents === 0;

  const handleOpenModal = () => {
    setAmountInput((withdrawableCents / 100).toString());
    setShowModal(true);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw) return;

    const requestedAmountRupees = parseFloat(amountInput);
    if (isNaN(requestedAmountRupees) || requestedAmountRupees <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const requestedAmountCents = Math.round(requestedAmountRupees * 100);
    if (requestedAmountCents < minWithdrawalCents) {
      toast.error(`Minimum withdrawal amount is ${formatPrice(minWithdrawalCents, "inr")}`);
      return;
    }

    if (requestedAmountCents > withdrawableCents) {
      toast.error("Requested amount exceeds your ready-to-withdraw balance");
      return;
    }

    try {
      setIsSubmitting(true);
      await payoutsApi.requestPayout(requestedAmountCents);
      toast.success("Withdrawal request submitted! Our team will process it shortly.");
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit withdrawal request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl mb-1">Payouts & Escrow</h1>
          <p className="text-muted-foreground text-sm">
            Manage your creator earnings, view 30-day escrow holdings, and withdraw funds.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          disabled={!canWithdraw || loading}
          className="brutal-btn bg-primary text-primary-foreground font-bold px-5 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowUpRight size={18} />
          Request Withdrawal
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ready to Withdraw */}
        <div className="brutal-card p-6 bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ready to Withdraw
              </span>
              <div className="w-8 h-8 bg-digi-mint brutal-border flex items-center justify-center text-black">
                <Wallet size={16} />
              </div>
            </div>
            {loading ? (
              <div className="h-9 bg-muted animate-pulse rounded w-28" />
            ) : (
              <p className="font-heading font-black text-3xl text-foreground">
                {formatPrice(withdrawableCents, "inr")}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40">
            {withdrawableCents >= minWithdrawalCents
              ? "✓ Available for immediate payout"
              : `Min. threshold is ${formatPrice(minWithdrawalCents, "inr")}`}
          </p>
        </div>

        {/* 30-Day Escrow Balance */}
        <div className="brutal-card p-6 bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                In 30-Day Escrow
              </span>
              <div className="w-8 h-8 bg-digi-yellow brutal-border flex items-center justify-center text-black">
                <Clock size={16} />
              </div>
            </div>
            {loading ? (
              <div className="h-9 bg-muted animate-pulse rounded w-28" />
            ) : (
              <p className="font-heading font-black text-3xl text-foreground">
                {formatPrice(escrowCents, "inr")}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40">
            Protected sales under 30 days old
          </p>
        </div>

        {/* Pending Payout Requests */}
        <div className="brutal-card p-6 bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pending Payout
              </span>
              <div className="w-8 h-8 bg-digi-pink brutal-border flex items-center justify-center text-black">
                <AlertCircle size={16} />
              </div>
            </div>
            {loading ? (
              <div className="h-9 bg-muted animate-pulse rounded w-28" />
            ) : (
              <p className="font-heading font-black text-3xl text-foreground">
                {formatPrice(pendingCents, "inr")}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40">
            {pendingCents > 0 ? "Under review by admin" : "No pending withdrawals"}
          </p>
        </div>

        {/* Total Net Sales */}
        <div className="brutal-card p-6 bg-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Net Earnings
              </span>
              <div className="w-8 h-8 bg-digi-lavender brutal-border flex items-center justify-center text-black">
                <IndianRupee size={16} />
              </div>
            </div>
            {loading ? (
              <div className="h-9 bg-muted animate-pulse rounded w-28" />
            ) : (
              <p className="font-heading font-black text-3xl text-foreground">
                {formatPrice(totalNetCents, "inr")}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/40">
            Lifetime paid out: {formatPrice(alreadyPaidCents, "inr")}
          </p>
        </div>
      </div>

      {/* 30-Day Escrow Policy Notice */}
      <div className="brutal-card p-6 bg-card flex flex-col md:flex-row items-start gap-4">
        <div className="w-10 h-10 bg-primary text-black brutal-border flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={20} />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
            How the 30-Day Escrow Window Works
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To safeguard creators, customers, and DigiStore against fraudulent card disputes and refund chargebacks,
            sales revenue is held in an anti-fraud escrow window for exactly <strong>30 days</strong> from the order completion date.
            Once an order is 30 days old, its revenue automatically matures and unlocks into your <strong>Ready to Withdraw</strong> balance.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Auto-unlocks after 30 days
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Minimum withdrawal: ₹100
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> Direct bank transfer / Razorpay
            </span>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="brutal-card">
        <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg">Withdrawal History</h2>
            <p className="text-xs text-muted-foreground">
              Record of all requested creator payouts and disbursement statuses.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Wallet size={36} className="mx-auto opacity-30" />
            <p className="font-semibold text-sm">No payout requests yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Once you have ₹100 or more in mature sales (orders older than 30 days), click &ldquo;Request Withdrawal&rdquo; above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase font-bold tracking-wider text-muted-foreground border-b-2 border-border">
                <tr>
                  <th className="px-6 py-3">Payout ID</th>
                  <th className="px-6 py-3">Requested Date</th>
                  <th className="px-6 py-3">Sales Cutoff (30-Day Window)</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border font-medium">
                {payouts.map((payout) => {
                  const statusStyles: Record<string, string> = {
                    pending: "bg-digi-yellow text-black border-2 border-border",
                    processing: "bg-digi-lavender text-black border-2 border-border",
                    completed: "bg-digi-mint text-black border-2 border-border",
                    failed: "bg-destructive text-destructive-foreground border-2 border-border",
                  };

                  return (
                    <tr key={payout.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {payout.id.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4">
                        {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {payout.periodEnd
                          ? new Date(payout.periodEnd).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Orders 30+ days old"}
                      </td>
                      <td className="px-6 py-4 font-heading font-bold text-base text-foreground">
                        {formatPrice(payout.amountCents, payout.currency || "inr")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-black uppercase tracking-wider ${
                            statusStyles[payout.status] || "bg-muted text-foreground border-2 border-border"
                          }`}
                        >
                          {payout.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="brutal-card max-w-md w-full p-6 space-y-6 bg-card border-2 border-border shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-border pb-3">
              <h3 className="font-heading font-black text-xl text-foreground">Request Payout</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Available Mature Balance
                </label>
                <p className="font-heading font-black text-3xl text-foreground">
                  {formatPrice(withdrawableCents, "inr")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Only funds from sales completed 30+ days ago are eligible for payout.
                </p>
              </div>

              <div>
                <label
                  htmlFor="withdrawalAmount"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Withdrawal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                    ₹
                  </span>
                  <input
                    id="withdrawalAmount"
                    type="number"
                    step="0.01"
                    min="100"
                    max={withdrawableCents / 100}
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2.5 brutal-input border-2 border-border font-heading font-bold text-lg"
                    placeholder="100.00"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                  <span>Minimum: ₹100</span>
                  <button
                    type="button"
                    onClick={() => setAmountInput((withdrawableCents / 100).toString())}
                    className="text-primary font-bold hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              <div className="bg-muted p-3 brutal-border border text-xs space-y-1 text-muted-foreground">
                <p className="font-bold text-foreground">Disbursement Timing</p>
                <p>
                  Payout requests are processed by platform administration within 1-2 business days.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="brutal-btn bg-card text-foreground text-sm font-semibold px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="brutal-btn bg-primary text-primary-foreground text-sm font-bold px-5 py-2 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
