"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, X, Plus, Upload, Trash2, Loader2,
  Image as ImageIcon, FileText, CheckCircle2, AlertCircle,
} from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/mock-data";
import {
  productsApi, fileUploadApi, variantsApi,
  type ApiProduct, type ProductFile, type ProductVariant,
} from "@/lib/api";
import { toast } from "sonner";

const PRODUCT_TYPES = [
  { value: "digital", label: "Digital Download" },
  { value: "course", label: "Online Course" },
  { value: "membership", label: "Membership" },
  { value: "bundle", label: "Bundle" },
] as const;

const RECURRENCE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const;

const CTA_PRESETS = ["I want this!", "Buy now", "Get access", "Enroll now", "Download", "Subscribe"];

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<"digital" | "course" | "membership" | "bundle">("digital");
  const [recurrence, setRecurrence] = useState<"monthly" | "quarterly" | "yearly" | "">("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [systemRequirements, setSystemRequirements] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [isPayWhatYouWant, setIsPayWhatYouWant] = useState(false);
  const [minPriceStr, setMinPriceStr] = useState("0");
  const [suggestedPriceStr, setSuggestedPriceStr] = useState("");
  const [isListedOnDiscover, setIsListedOnDiscover] = useState(true);
  const [maxPurchaseCount, setMaxPurchaseCount] = useState("");
  const [callToAction, setCallToAction] = useState("I want this!");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<ProductFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantDesc, setVariantDesc] = useState("");
  const [addingVariant, setAddingVariant] = useState(false);

  useEffect(() => {
    if (!productId) return;
    productsApi.getById(productId)
      .then((p: ApiProduct) => {
        setName(p.name);
        setSummary(p.summary ?? "");
        setDescription(p.description ?? "");
        setProductType(p.productType);
        setRecurrence((p.recurrence as any) ?? "");
        setCategory(p.category ?? "");
        setTags(p.tags ?? []);
        setSystemRequirements(p.systemRequirements ?? "");
        setPriceStr(p.isPayWhatYouWant ? "" : String(p.priceCents / 100));
        setCurrency(p.currency ?? "usd");
        setIsPayWhatYouWant(p.isPayWhatYouWant);
        setMinPriceStr(String(p.minPriceCents / 100));
        setSuggestedPriceStr(p.suggestedPriceCents ? String(p.suggestedPriceCents / 100) : "");
        setIsListedOnDiscover(p.isListedOnDiscover);
        setMaxPurchaseCount(p.maxPurchaseCount ? String(p.maxPurchaseCount) : "");
        setCallToAction(p.callToAction);
        setStatus(p.status);
        setThumbnailUrl(p.thumbnailUrl ?? null);
        setUploadedFiles(p.files ?? []);
        setVariants(p.variants ?? []);
      })
      .catch((e: any) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || tags.includes(t) || tags.length >= 20) return;
    setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Product name is required"); return; }
    setSaving(true); setSaved(false);
    try {
      const priceCents = Math.round(parseFloat(priceStr || "0") * 100);
      await productsApi.update(productId, {
        name: name.trim(),
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
        productType,
        recurrence: (recurrence || null) as any,
        priceCents,
        currency,
        isPayWhatYouWant,
        minPriceCents: isPayWhatYouWant ? Math.round(parseFloat(minPriceStr || "0") * 100) : 0,
        suggestedPriceCents: suggestedPriceStr ? Math.round(parseFloat(suggestedPriceStr) * 100) : null,
        category: (category || null) as any,
        tags,
        systemRequirements: category === "software" ? systemRequirements.trim() || null : null,
        isListedOnDiscover,
        maxPurchaseCount: maxPurchaseCount ? parseInt(maxPurchaseCount, 10) : null,
        callToAction,
      });
      setSaved(true);
      toast.success("Changes saved!");
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast.error("Could not save", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await productsApi.publish(productId);
      setStatus("published");
      toast.success("Product is now live!");
    } catch (e: any) {
      toast.error("Could not publish", { description: e.message });
    } finally { setSaving(false); }
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const result = await fileUploadApi.uploadThumbnail(productId, file);
      setThumbnailUrl(result.thumbnailUrl);
      toast.success("Thumbnail updated!");
    } catch (e: any) {
      toast.error("Upload failed", { description: e.message });
    } finally { setUploadingThumb(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true); setFileProgress(0);
    try {
      const result = await fileUploadApi.uploadFile(productId, file, setFileProgress);
      setUploadedFiles((prev) => [...prev, result]);
      toast.success(file.name + " added!");
    } catch (e: any) {
      toast.error("Upload failed", { description: e.message });
    } finally {
      setUploadingFile(false); setFileProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await fileUploadApi.deleteFile(productId, fileId);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File removed");
    } catch (e: any) { toast.error("Delete failed", { description: e.message }); }
  };

  const handleAddVariant = async () => {
    if (!variantName.trim() || !variantPrice) return;
    setAddingVariant(true);
    try {
      const v = await variantsApi.create(productId, {
        name: variantName.trim(),
        priceCents: Math.round(parseFloat(variantPrice) * 100),
        description: variantDesc.trim() || undefined,
      });
      setVariants((prev) => [...prev, v]);
      setVariantName(""); setVariantPrice(""); setVariantDesc("");
      toast.success("Variant added!");
    } catch (e: any) { toast.error("Could not add variant", { description: e.message }); }
    finally { setAddingVariant(false); }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await variantsApi.remove(productId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    } catch (e: any) { toast.error("Delete failed", { description: e.message }); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin text-muted-foreground" />
    </div>
  );

  if (loadError) return (
    <div className="brutal-card p-8 text-center max-w-md mx-auto mt-12">
      <AlertCircle size={40} className="mx-auto mb-4 text-destructive" />
      <h2 className="font-heading font-bold text-xl mb-2">Failed to load product</h2>
      <p className="text-muted-foreground mb-6">{loadError}</p>
      <Link href="/dashboard/products" className="brutal-btn bg-primary text-primary-foreground font-bold">Back</Link>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products" className="brutal-btn bg-card p-2.5">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-heading font-black text-2xl">Edit Product</h1>
            <p className="text-muted-foreground text-sm">{name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-xs font-bold brutal-border ${
            status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : status === "draft" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : "bg-muted text-muted-foreground"
          }`}>{status.toUpperCase()}</span>
          {status === "draft" && (
            <button onClick={handlePublish} disabled={saving} className="brutal-btn bg-green-600 text-white font-bold text-sm disabled:opacity-60">
              Publish
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="brutal-btn bg-primary text-primary-foreground font-bold flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : null}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="brutal-card p-6">
            <h2 className="font-heading font-bold text-base mb-5">Product Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Product Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
                  className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Short Summary</label>
                <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={200}
                  placeholder="One-line description shown in listings"
                  className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Full product description..."
                  className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Product Type</label>
                  <select value={productType} onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">No category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
                  </select>
                </div>
              </div>

              {/* System Requirements - shown only for software category */}
              {category === "software" && (
                <div>
                  <label className="block text-sm font-bold mb-2">
                    System Requirements{" "}
                    <span className="text-destructive font-normal">*</span>
                  </label>
                  <textarea
                    value={systemRequirements}
                    onChange={(e) => setSystemRequirements(e.target.value)}
                    placeholder={"Specify the PC/device requirements for your software.\n\nExample:\n- Windows 10 or later / macOS 12+\n- 8 GB RAM minimum\n- 500 MB free disk space\n- DirectX 11 compatible GPU"}
                    rows={5}
                    maxLength={5000}
                    className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemRequirements.length}/5000 - Required before publishing
                  </p>
                </div>
              )}

              {(productType === "membership" || productType === "course") && (
                <div>
                  <label className="block text-sm font-bold mb-2">Billing Recurrence</label>
                  <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">One-time</option>
                    {RECURRENCE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 brutal-border bg-muted text-xs font-semibold">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
                    placeholder="Add tag, press Enter"
                    className="flex-1 px-3 py-2 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={addTag} className="brutal-btn bg-card text-sm px-4">Add</button>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="brutal-card p-6">
            <h2 className="font-heading font-bold text-base mb-5">Pricing</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isPayWhatYouWant} onChange={(e) => setIsPayWhatYouWant(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-semibold">Pay What You Want</span>
              </label>
              {!isPayWhatYouWant ? (
                <div>
                  <label className="block text-sm font-bold mb-2">Price (USD)</label>
                  <input type="number" value={priceStr} onChange={(e) => setPriceStr(e.target.value)} placeholder="0 for free" min="0" step="0.01"
                    className="w-full sm:w-48 px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Minimum Price</label>
                    <input type="number" value={minPriceStr} onChange={(e) => setMinPriceStr(e.target.value)} min="0" step="0.01"
                      className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Suggested Price</label>
                    <input type="number" value={suggestedPriceStr} onChange={(e) => setSuggestedPriceStr(e.target.value)} min="0" step="0.01" placeholder="Optional"
                      className="w-full px-4 py-3 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Variants */}
          <div className="brutal-card p-6">
            <h2 className="font-heading font-bold text-base mb-5">Pricing Variants <span className="text-xs font-normal text-muted-foreground">(optional)</span></h2>
            {variants.length > 0 && (
              <div className="mb-4 space-y-2">
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-muted/50 brutal-border">
                    <div>
                      <p className="text-sm font-semibold">{v.name}</p>
                      {v.description && <p className="text-xs text-muted-foreground">{v.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">${(v.priceCents / 100).toFixed(2)}</span>
                      <button type="button" onClick={() => handleDeleteVariant(v.id)} className="p-1.5 text-muted-foreground hover:text-destructive brutal-border"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input type="text" value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="e.g. Pro Plan"
                className="px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="number" value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} placeholder="Price" min="0" step="0.01"
                className="px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <input type="text" value={variantDesc} onChange={(e) => setVariantDesc(e.target.value)} placeholder="Description (opt)"
                className="px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button type="button" onClick={handleAddVariant} disabled={addingVariant || !variantName || !variantPrice}
              className="brutal-btn bg-card text-sm flex items-center gap-2 disabled:opacity-60">
              {addingVariant ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Variant
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <div className="brutal-card p-5">
            <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2"><ImageIcon size={16} /> Thumbnail</h2>
            <div className="space-y-3">
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl} alt="Thumbnail" className="w-full aspect-video object-cover brutal-border" />
              ) : (
                <div className="w-full aspect-video bg-muted brutal-border flex items-center justify-center">
                  <ImageIcon size={32} className="text-muted-foreground" />
                </div>
              )}
              <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
              <button type="button" onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb}
                className="w-full brutal-btn bg-card text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {uploadingThumb ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploadingThumb ? "Uploading..." : thumbnailUrl ? "Change Thumbnail" : "Upload Thumbnail"}
              </button>
            </div>
          </div>

          {/* Files */}
          <div className="brutal-card p-5">
            <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2"><FileText size={16} /> Downloadable Files</h2>
            {uploadedFiles.length > 0 && (
              <div className="mb-3 space-y-2">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 bg-muted/50 brutal-border">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{f.fileName}</p>
                      <p className="text-xs text-muted-foreground">{f.fileType}</p>
                    </div>
                    <button type="button" onClick={() => handleDeleteFile(f.id)} className="ml-2 p-1.5 text-muted-foreground hover:text-destructive brutal-border shrink-0"><Trash2 size={11} /></button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
            {uploadingFile && (
              <div className="w-full h-1.5 bg-muted brutal-border mb-2 overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${fileProgress}%` }} />
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
              className="w-full brutal-btn bg-card text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {uploadingFile ? <><Loader2 size={14} className="animate-spin" /> {fileProgress}%</> : <><Upload size={14} /> Add File</>}
            </button>
          </div>

          {/* Settings */}
          <div className="brutal-card p-5">
            <h2 className="font-heading font-bold text-base mb-4">Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={isListedOnDiscover} onChange={(e) => setIsListedOnDiscover(e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm font-semibold">List on Discover page</span>
              </label>
              <div>
                <label className="block text-sm font-bold mb-2">Max Purchase Count</label>
                <input type="number" value={maxPurchaseCount} onChange={(e) => setMaxPurchaseCount(e.target.value)} placeholder="Unlimited" min="1"
                  className="w-full px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Call To Action</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CTA_PRESETS.map((cta) => (
                    <button key={cta} type="button" onClick={() => setCallToAction(cta)}
                      className={`px-2 py-1 text-xs font-semibold brutal-border ${callToAction === cta ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
                      {cta}
                    </button>
                  ))}
                </div>
                <input type="text" value={callToAction} onChange={(e) => setCallToAction(e.target.value)} maxLength={100}
                  className="w-full px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full brutal-btn bg-primary text-primary-foreground font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : null}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
