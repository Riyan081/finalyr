"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Tag, Copy } from "lucide-react";
import { discountsApi, productsApi, type DiscountCode } from "@/lib/api";
import { toast } from "sonner";

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [productId, setProductId] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [dc, prods] = await Promise.all([
        discountsApi.list(),
        productsApi.list({ limit: 100 }),
      ]);
      setDiscounts(dc);
      setProducts(prods.data ?? []);
      if (prods.data?.[0]?.id) setProductId((prev) => prev || prods.data[0]?.id || "");
    } catch (e: any) {
      toast.error("Could not load discounts", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setCode(code);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !code || !discountValue) {
      toast.error("Fill in all required fields");
      return;
    }
    setCreating(true);
    try {
      await discountsApi.create({
        productId,
        code: code.toUpperCase(),
        discountType,
        discountValue:
          discountType === "percentage"
            ? parseInt(discountValue, 10)
            : Math.round(parseFloat(discountValue) * 100),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        validUntil: validUntil || null,
      });
      toast.success(`Discount code "${code.toUpperCase()}" created!`);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setValidUntil("");
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error("Could not create discount", { description: e.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete code "${code}"?`)) return;
    try {
      await discountsApi.delete(id);
      toast.success(`"${code}" deleted`);
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      toast.error("Delete failed", { description: e.message });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl mb-1">Discount Codes</h1>
          <p className="text-muted-foreground">Create and manage promo codes for your products.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="brutal-btn bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2"
        >
          <Plus size={16} /> New Code
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="brutal-card p-6 mb-6">
          <h2 className="font-heading font-bold text-lg mb-4">Create Discount Code</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none"
                  required
                >
                  {products.length === 0 && <option value="">No published products</option>}
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SAVE20"
                    className="flex-1 px-4 py-3 brutal-border bg-background font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    maxLength={20}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="brutal-btn bg-card text-xs px-3"
                  >
                    Auto
                  </button>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Type *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Value * {discountType === "percentage" ? "(0-100%)" : "($)"}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "20" : "5"}
                  min="1"
                  max={discountType === "percentage" ? "100" : undefined}
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Max Uses</label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Expires</label>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="brutal-btn bg-primary text-primary-foreground font-bold disabled:opacity-60 flex items-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create Code
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="brutal-btn bg-card"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discount List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : discounts.length === 0 ? (
        <div className="brutal-card p-12 text-center">
          <Tag size={32} className="mx-auto mb-3 text-muted-foreground" />
          <h2 className="font-heading font-bold text-xl mb-2">No discount codes yet</h2>
          <p className="text-muted-foreground mb-4">
            Create codes to offer promotions to your customers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="brutal-btn bg-primary text-primary-foreground text-sm"
          >
            Create First Code
          </button>
        </div>
      ) : (
        <div className="brutal-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider">Uses</th>
                <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider hidden md:table-cell">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-border">
              {discounts.map((dc) => (
                <tr key={dc.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold tracking-wider">{dc.code}</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(dc.code); toast.success("Copied!"); }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[160px]">
                    {dc.product.name}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {dc.discountType === "percentage"
                      ? `${dc.discountValue}% off`
                      : `$${(dc.discountValue / 100).toFixed(2)} off`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dc.currentUses}{dc.maxUses ? `/${dc.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                    {dc.validUntil ? new Date(dc.validUntil).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(dc.id, dc.code)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 brutal-border transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
