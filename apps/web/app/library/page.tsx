"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Download, Key, Search, Filter, Package, BookOpen, Crown,
  Layers, RefreshCw, XCircle, ChevronLeft, ChevronRight,
  ExternalLink, Copy, Check, Clock, AlertCircle, Sparkles, Eye,
} from "lucide-react";
import { libraryApi, type LibraryItem, type LibraryResponse } from "@/lib/api";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

const TYPE_ICONS: Record<string, any> = {
  digital: Package,
  course: BookOpen,
  membership: Crown,
  bundle: Layers,
};

const TYPE_LABELS: Record<string, string> = {
  digital: "Digital Download",
  course: "Online Course",
  membership: "Membership",
  bundle: "Bundle",
};

const ACCESS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  expired: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  cancelled: "bg-gray-500/15 text-gray-500 border-gray-500/30",
  refunded: "bg-red-500/15 text-red-600 border-red-500/30",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

// ─── Library Item Card ──────────────────────────────────────────

function LibraryCard({ item, onDownload, onCancelMembership, onRestartMembership }: {
  item: LibraryItem;
  onDownload: (orderId: string) => void;
  onCancelMembership: (membershipId: string) => void;
  onRestartMembership: (membershipId: string) => void;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = TYPE_ICONS[item.product.productType] || Package;

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("License key copied!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const canAccess = item.accessStatus === "active";

  return (
    <div className="brutal-card overflow-hidden transition-all hover:translate-y-[-2px]">
      {/* Header */}
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Thumbnail */}
        {item.product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.product.thumbnailUrl}
            alt={item.product.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover brutal-border shrink-0"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted brutal-border flex items-center justify-center shrink-0">
            <TypeIcon size={28} className="text-muted-foreground" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-heading font-bold text-base sm:text-lg truncate">
                {item.product.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                by{" "}
                <Link
                  href={`/creator/${item.product.creator.username}`}
                  className="hover:text-foreground font-semibold"
                >
                  {item.product.creator.name}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.hasUpdates && canAccess && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 rounded-sm">
                  <Sparkles size={10} /> Updated
                </span>
              )}
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border rounded-sm ${ACCESS_COLORS[item.accessStatus]}`}>
                {item.accessStatus}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TypeIcon size={12} />
              {TYPE_LABELS[item.product.productType] || item.product.productType}
            </span>
            <span>•</span>
            <span>{formatDate(item.purchasedAt)}</span>
            <span>•</span>
            <span className="font-semibold text-foreground">
              {item.amountCents === 0 ? "Free" : formatPrice(item.amountCents, item.currency)}
            </span>
            {item.variant && (
              <>
                <span>•</span>
                <span>{item.variant}</span>
              </>
            )}
            {item.product.productType === "membership" && item.product.recurrence && (
              <>
                <span>•</span>
                <span className="capitalize">{item.product.recurrence}</span>
              </>
            )}
          </div>

          {/* Membership info */}
          {item.membership && (
            <div className="mt-2 text-xs">
              {item.membership.status === "active" && (
                <span className="text-emerald-600 flex items-center gap-1">
                  <Clock size={10} />
                  Renews {formatDate(item.membership.currentPeriodEnd)}
                </span>
              )}
              {item.membership.status === "cancelled" && (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertCircle size={10} />
                  Access until {formatDate(item.membership.currentPeriodEnd)}
                </span>
              )}
              {item.membership.status === "expired" && (
                <span className="text-red-500 flex items-center gap-1">
                  <XCircle size={10} />
                  Expired {item.membership.cancelledAt ? formatDate(item.membership.cancelledAt) : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t-2 border-foreground/10 px-4 sm:px-5 py-3 flex flex-wrap gap-2 bg-muted/30">
        {/* Download */}
        {canAccess && item.product.fileCount > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="brutal-btn bg-primary text-primary-foreground text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Download size={12} />
            {expanded ? "Hide Files" : `Download (${item.product.fileCount})`}
          </button>
        )}

        {/* License Key */}
        {item.licenseKeys.length > 0 && (
          <button
            onClick={() => copyLicenseKey(item.licenseKeys[0]!.licenseKey)}
            className="brutal-btn bg-card text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            {copiedKey === item.licenseKeys[0]!.licenseKey ? (
              <><Check size={12} className="text-emerald-500" /> Copied!</>
            ) : (
              <><Key size={12} /> License Key</>
            )}
          </button>
        )}

        {/* View Product */}
        <Link
          href={`/product/${item.product.creator.username}/${item.product.slug}`}
          className="brutal-btn bg-card text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <ExternalLink size={12} /> View Product
        </Link>

        {/* Membership Actions */}
        {item.membership?.status === "active" && (
          <button
            onClick={() => onCancelMembership(item.membership!.id)}
            className="brutal-btn bg-card text-xs py-1.5 px-3 flex items-center gap-1.5 text-destructive"
          >
            <XCircle size={12} /> Cancel Membership
          </button>
        )}
        {(item.membership?.status === "cancelled" || item.membership?.status === "expired") && (
          <button
            onClick={() => onRestartMembership(item.membership!.id)}
            className="brutal-btn bg-card text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-600"
          >
            <RefreshCw size={12} /> Restart Membership
          </button>
        )}
      </div>

      {/* Expanded: File List with Download Links */}
      {expanded && canAccess && (
        <div className="border-t-2 border-foreground/10 px-4 sm:px-5 py-3 space-y-2 bg-muted/10">
          {item.product.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 bg-background brutal-border text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs truncate">{file.fileName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {file.fileType} • {formatBytes(parseInt(file.fileSizeBytes, 10))}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(file.fileType === "application/pdf" || file.fileType === "application/epub+zip") && (
                  <button
                    onClick={async () => {
                      try {
                        const tokenData = await libraryApi.getDownloadToken(item.orderId);
                        const fileUrl = `${API_URL}/api/checkout/file?token=${encodeURIComponent(tokenData.token)}&fileId=${file.id}&inline=1`;
                        if (file.fileType === "application/pdf") {
                          window.open(`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`, "_blank");
                        } else {
                          window.open(fileUrl, "_blank");
                        }
                      } catch { toast.error("Could not open viewer"); }
                    }}
                    className="brutal-btn bg-card text-[10px] py-1 px-2 flex items-center gap-1"
                  >
                    <Eye size={10} /> View
                  </button>
                )}
                <button
                  onClick={() => onDownload(item.orderId)}
                  className="brutal-btn bg-primary text-primary-foreground text-[10px] py-1 px-2 flex items-center gap-1"
                >
                  <Download size={10} /> Download
                </button>
              </div>
            </div>
          ))}

          {/* License Keys Detail */}
          {item.licenseKeys.length > 0 && (
            <div className="mt-3 p-3 bg-background brutal-border">
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1.5">License Keys</p>
              {item.licenseKeys.map((lk, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <code className="font-mono font-bold tracking-wider">{lk.licenseKey}</code>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{lk.uses}/{lk.maxUses} uses</span>
                    <button onClick={() => copyLicenseKey(lk.licenseKey)} className="p-1 hover:text-primary">
                      {copiedKey === lk.licenseKey ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Library Page ────────────────────────────────────────────────

export default function LibraryPage() {
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await libraryApi.getLibrary({
        page,
        limit: 20,
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        creatorId: creatorFilter || undefined,
      });
      setLibrary(data);
    } catch (err: any) {
      toast.error("Failed to load library", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, typeFilter, creatorFilter]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDownload = async (orderId: string) => {
    setDownloading(orderId);
    try {
      const tokenData = await libraryApi.getDownloadToken(orderId);
      // Open each file download in a new tab
      for (const file of tokenData.order.files) {
        const downloadUrl = `${API_URL}/api/checkout/file?token=${encodeURIComponent(tokenData.token)}&fileId=${file.id}`;
        window.open(downloadUrl, "_blank");
      }
      toast.success("Download started!");
    } catch (err: any) {
      toast.error("Download failed", { description: err.message });
    } finally {
      setDownloading(null);
    }
  };

  const handleCancelMembership = async (membershipId: string) => {
    if (!confirm("Cancel this membership? You'll keep access until the current period ends.")) return;
    try {
      await libraryApi.cancelMembership(membershipId);
      toast.success("Membership cancelled. Access remains until period ends.");
      fetchLibrary();
    } catch (err: any) {
      toast.error("Could not cancel", { description: err.message });
    }
  };

  const handleRestartMembership = async (membershipId: string) => {
    try {
      await libraryApi.restartMembership(membershipId);
      toast.success("Membership restarted!");
      fetchLibrary();
    } catch (err: any) {
      toast.error("Could not restart", { description: err.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl sm:text-4xl">My Library</h1>
        <p className="text-muted-foreground mt-1">
          All your purchased products in one place. Download anytime.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search your purchases…"
            className="w-full pl-10 pr-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 brutal-border bg-background text-sm font-semibold cursor-pointer focus:outline-none sm:w-48"
        >
          <option value="">All Types</option>
          <option value="digital">📦 Digital Downloads</option>
          <option value="course">🎓 Courses</option>
          <option value="membership">🔑 Memberships</option>
          <option value="bundle">🎁 Bundles</option>
        </select>

        {library && library.creators.length > 1 && (
          <select
            value={creatorFilter}
            onChange={(e) => { setCreatorFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 brutal-border bg-background text-sm font-semibold cursor-pointer focus:outline-none sm:w-48"
          >
            <option value="">All Creators</option>
            {library.creators.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats Bar */}
      {library && !loading && (
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <span className="font-semibold">{library.pagination.total} purchase{library.pagination.total !== 1 ? "s" : ""}</span>
          {typeFilter && (
            <button onClick={() => setTypeFilter("")} className="flex items-center gap-1 text-primary hover:underline">
              <XCircle size={12} /> Clear filter
            </button>
          )}
          {searchQuery && (
            <button onClick={() => { setSearchInput(""); setSearchQuery(""); }} className="flex items-center gap-1 text-primary hover:underline">
              <XCircle size={12} /> Clear search
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="brutal-card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-3 w-64 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && library && library.items.length === 0 && (
        <div className="brutal-card p-12 text-center">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">
            {searchQuery || typeFilter ? "No matching purchases" : "Your library is empty"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {searchQuery || typeFilter
              ? "Try adjusting your search or filters."
              : "Products you purchase will appear here. Browse the discover page to find something amazing!"
            }
          </p>
          <Link href="/discover" className="brutal-btn bg-primary text-primary-foreground font-bold py-3 px-6">
            Discover Products
          </Link>
        </div>
      )}

      {/* Library Items */}
      {!loading && library && library.items.length > 0 && (
        <div className="space-y-4">
          {library.items.map((item) => (
            <LibraryCard
              key={item.orderId}
              item={item}
              onDownload={handleDownload}
              onCancelMembership={handleCancelMembership}
              onRestartMembership={handleRestartMembership}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {library && library.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!library.pagination.hasPrev}
            className="brutal-btn bg-card p-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold">
            Page {library.pagination.page} of {library.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!library.pagination.hasNext}
            className="brutal-btn bg-card p-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
