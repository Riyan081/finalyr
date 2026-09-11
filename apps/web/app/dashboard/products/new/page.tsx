"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus, Info, Upload, Trash2, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/mock-data";
import { productsApi, fileUploadApi, variantsApi, type ProductFile, type ProductVariant } from "@/lib/api";
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

const CTA_PRESETS = [
  "I want this!",
  "Buy now",
  "Get access",
  "Enroll now",
  "Download",
  "Subscribe",
];

export default function NewProductPage() {
  const router = useRouter();

  // ─── Core fields ────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState<
    "digital" | "course" | "membership" | "bundle"
  >("digital");
  const [recurrence, setRecurrence] = useState<
    "monthly" | "quarterly" | "yearly" | ""
  >("");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [systemRequirements, setSystemRequirements] = useState("");

  // ─── Pricing ────────────────────────────────────────────────────
  const [priceStr, setPriceStr] = useState("");
  const [currency] = useState("usd");
  const [isPayWhatYouWant, setIsPayWhatYouWant] = useState(false);
  const [minPriceStr, setMinPriceStr] = useState("0");
  const [suggestedPriceStr, setSuggestedPriceStr] = useState("");

  // ─── Settings ───────────────────────────────────────────────────
  const [isListedOnDiscover, setIsListedOnDiscover] = useState(true);
  const [maxPurchaseCount, setMaxPurchaseCount] = useState("");
  const [callToAction, setCallToAction] = useState("I want this!");

  const [submitting, setSubmitting] = useState(false);

  // ─── Step 2: after creation ──────────────────────────────────────
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [createdProductName, setCreatedProductName] = useState("");

  // Thumbnail
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Product files
  const [uploadedFiles, setUploadedFiles] = useState<ProductFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantDesc, setVariantDesc] = useState("");
  const [addingVariant, setAddingVariant] = useState(false);

  // ─── Tag helpers ─────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!t || tags.includes(t) || tags.length >= 20) return;
    setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (
    e: React.FormEvent,
    action: "draft" | "publish"
  ) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    const priceCents = Math.round(parseFloat(priceStr || "0") * 100);
    if (!isPayWhatYouWant && priceCents < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
        productType,
        recurrence: (recurrence || null) as any,
        priceCents,
        currency,
        isPayWhatYouWant,
        minPriceCents: isPayWhatYouWant
          ? Math.round(parseFloat(minPriceStr || "0") * 100)
          : 0,
        suggestedPriceCents: suggestedPriceStr
          ? Math.round(parseFloat(suggestedPriceStr) * 100)
          : null,
        category: (category || null) as any,
        tags,
        systemRequirements: category === "software" ? systemRequirements.trim() || null : null,
        isListedOnDiscover,
        maxPurchaseCount: maxPurchaseCount
          ? parseInt(maxPurchaseCount, 10)
          : null,
        callToAction,
      };

      const product = await productsApi.create(payload);
      setCreatedProductId(product.id);
      setCreatedProductName(product.name);

      if (action === "publish") {
        await productsApi.publish(product.id);
        toast.success("Product created & published!", {
          description: `Now add files and thumbnail to complete your listing.`,
        });
      } else {
        toast.success("Draft saved!", {
          description: `Add files, thumbnail, and variants in the next step.`,
        });
      }
      // Stay on page — step 2 appears
    } catch (err: any) {
      toast.error("Could not save product", { description: err.message });
      setSubmitting(false);
    }
  };

  // ─── Step 2 handlers ─────────────────────────────────────────────

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdProductId) return;
    setThumbnailFile(file);
    setUploadingThumb(true);
    try {
      const result = await fileUploadApi.uploadThumbnail(createdProductId, file);
      setThumbnailUrl(result.thumbnailUrl);
      toast.success("Thumbnail uploaded!");
    } catch (err: any) {
      toast.error("Thumbnail upload failed", { description: err.message });
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdProductId) return;
    setUploadingFile(true);
    setFileProgress(0);
    try {
      const result = await fileUploadApi.uploadFile(createdProductId, file, setFileProgress);
      setUploadedFiles((prev) => [...prev, result]);
      toast.success(`"${file.name}" uploaded!`);
    } catch (err: any) {
      toast.error("File upload failed", { description: err.message });
    } finally {
      setUploadingFile(false);
      setFileProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!createdProductId) return;
    try {
      await fileUploadApi.deleteFile(createdProductId, fileId);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File removed");
    } catch (err: any) {
      toast.error("Delete failed", { description: err.message });
    }
  };

  const handleAddVariant = async () => {
    if (!variantName.trim() || !variantPrice || !createdProductId) return;
    setAddingVariant(true);
    try {
      const v = await variantsApi.create(createdProductId, {
        name: variantName.trim(),
        priceCents: Math.round(parseFloat(variantPrice) * 100),
        description: variantDesc.trim() || undefined,
      });
      setVariants((prev) => [...prev, v]);
      setVariantName("");
      setVariantPrice("");
      setVariantDesc("");
      toast.success(`Variant "${v.name}" added!`);
    } catch (err: any) {
      toast.error("Could not add variant", { description: err.message });
    } finally {
      setAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!createdProductId) return;
    try {
      await variantsApi.remove(createdProductId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    } catch (err: any) {
      toast.error("Delete failed", { description: err.message });
    }
  };


  return (
    <>
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <h1 className="font-heading font-black text-3xl mb-8">New Product</h1>

      <form className="space-y-6">
        {/* ── Product Type ── */}
        <div className="brutal-card p-6 space-y-5">
          <h2 className="font-heading font-bold text-lg">Product Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRODUCT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setProductType(pt.value)}
                className={`py-3 px-4 text-sm font-semibold brutal-border transition-colors ${
                  productType === pt.value
                    ? "bg-primary text-primary-foreground brutal-shadow"
                    : "bg-card hover:bg-muted"
                }`}
              >
                {pt.label}
              </button>
            ))}
          </div>
          {productType === "membership" && (
            <div>
              <label className="block text-sm font-bold mb-2">
                Billing Frequency
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as any)}
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none"
              >
                <option value="">Select frequency…</option>
                {RECURRENCE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Basic Info ── */}
        <div className="brutal-card p-6 space-y-5">
          <h2 className="font-heading font-bold text-lg">Basic Information</h2>

          <div>
            <label className="block text-sm font-bold mb-2">
              Product Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ultimate Design System"
              className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={200}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {name.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Short Summary
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (shown on product cards)
              </span>
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="One-liner describing your product…"
              className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              Full Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product in detail. Supports Markdown."
              rows={6}
              className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              maxLength={50000}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none cursor-pointer"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* System Requirements - shown only for software category */}
            {category === "software" && (
              <div className="sm:col-span-2">
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

            <div>
              <label className="block text-sm font-bold mb-2">
                Tags
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (max 20)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag…"
                  className="flex-1 px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="brutal-btn bg-card px-3"
                >
                  <Plus size={16} />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted px-3 py-1 text-xs font-semibold brutal-border flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pricing ── */}
        <div className="brutal-card p-6 space-y-5">
          <h2 className="font-heading font-bold text-lg">Pricing</h2>

          {/* PWYW toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPayWhatYouWant}
              onChange={(e) => setIsPayWhatYouWant(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-semibold">Pay What You Want</span>
            <Info size={14} className="text-muted-foreground" aria-label="Buyers choose their own price above the minimum" />
          </label>

          {isPayWhatYouWant ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Minimum Price ($)
                </label>
                <input
                  type="number"
                  value={minPriceStr}
                  onChange={(e) => setMinPriceStr(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Suggested Price ($)
                </label>
                <input
                  type="number"
                  value={suggestedPriceStr}
                  onChange={(e) => setSuggestedPriceStr(e.target.value)}
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold mb-2">
                Price ($) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="9.99"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set to $0 for a free product.
              </p>
            </div>
          )}
        </div>

        {/* ── Settings ── */}
        <div className="brutal-card p-6 space-y-5">
          <h2 className="font-heading font-bold text-lg">Settings</h2>

          <div>
            <label className="block text-sm font-bold mb-2">
              Call-to-Action Button
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CTA_PRESETS.map((cta) => (
                <button
                  key={cta}
                  type="button"
                  onClick={() => setCallToAction(cta)}
                  className={`text-xs px-3 py-1.5 brutal-border font-semibold transition-colors ${
                    callToAction === cta
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-muted"
                  }`}
                >
                  {cta}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              placeholder="I want this!"
              className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={100}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isListedOnDiscover}
              onChange={(e) => setIsListedOnDiscover(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-semibold">
              List on Discover page
            </span>
          </label>

          <div>
            <label className="block text-sm font-bold mb-2">
              Maximum Purchase Count
              <span className="text-xs font-normal text-muted-foreground ml-2">
                (optional — limits total sales)
              </span>
            </label>
            <input
              type="number"
              value={maxPurchaseCount}
              onChange={(e) => setMaxPurchaseCount(e.target.value)}
              placeholder="Unlimited"
              min="1"
              className="w-full sm:w-48 px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, "publish")}
            className="brutal-btn bg-primary text-primary-foreground font-bold py-4 px-8 text-lg flex-1 sm:flex-none disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish Product"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="brutal-btn bg-card font-semibold py-4 px-8 disabled:opacity-60"
          >
            Save Draft
          </button>
          <Link
            href="/dashboard/products"
            className="brutal-btn bg-card font-semibold py-4 px-8"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* -- Step 2: Upload Files + Thumbnail + Variants -- */}
      {createdProductId && (
        <div className="mt-8 space-y-6">
          <div className="brutal-card p-6 bg-digi-mint/20">
            <p className="font-heading font-bold text-lg">? Product created! Now add your files.</p>
            <p className="text-sm text-muted-foreground mt-1">Upload a thumbnail, downloadable files, and optional pricing variants.</p>
          </div>

          {/* Thumbnail */}
          <div className="brutal-card p-6">
            <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2"><ImageIcon size={18} /> Thumbnail</h3>
            <div className="flex items-center gap-4">
              {thumbnailUrl ? (<img src={thumbnailUrl} alt="Thumbnail" className="w-24 h-24 object-cover brutal-border" />) : (<div className="w-24 h-24 bg-muted brutal-border flex items-center justify-center"><ImageIcon size={24} className="text-muted-foreground" /></div>)}
              <div>
                <input ref={thumbInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
                <button type="button" onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb} className="brutal-btn bg-card text-sm flex items-center gap-2 disabled:opacity-60">
                  {uploadingThumb ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{uploadingThumb ? "Uploading�" : thumbnailUrl ? "Change" : "Upload Thumbnail"}
                </button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP. Recommended 1200�800px</p>
              </div>
            </div>
          </div>

          {/* Files */}
          <div className="brutal-card p-6">
            <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2"><FileText size={18} /> Downloadable Files</h3>
            {uploadedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploadedFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-muted/50 brutal-border">
                    <div><p className="text-sm font-semibold">{f.fileName}</p><p className="text-xs text-muted-foreground">{f.fileType}</p></div>
                    <button type="button" onClick={() => handleDeleteFile(f.id)} className="p-1.5 text-muted-foreground hover:text-destructive brutal-border"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
            {uploadingFile && (<div className="w-full h-2 bg-muted brutal-border mb-3 overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${fileProgress}%` }} /></div>)}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile} className="brutal-btn bg-card text-sm flex items-center gap-2 disabled:opacity-60">
              {uploadingFile ? <><Loader2 size={14} className="animate-spin" /> Uploading {fileProgress}%�</> : <><Upload size={14} /> Add File</>}
            </button>
          </div>

          {/* Variants */}
          <div className="brutal-card p-6">
            <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2"><Plus size={18} /> Pricing Variants <span className="text-xs font-normal text-muted-foreground">(optional)</span></h3>
            {variants.length > 0 && (<div className="mb-4 space-y-2">{variants.map((v) => (<div key={v.id} className="flex items-center justify-between p-3 bg-muted/50 brutal-border"><div><p className="text-sm font-semibold">{v.name}</p>{v.description && <p className="text-xs text-muted-foreground">{v.description}</p>}</div><div className="flex items-center gap-3"><span className="font-bold text-sm">${(v.priceCents / 100).toFixed(2)}</span><button type="button" onClick={() => handleDeleteVariant(v.id)} className="p-1.5 text-muted-foreground hover:text-destructive brutal-border"><Trash2 size={12} /></button></div></div>))}</div>)}
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input type="text" value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="e.g. Pro Plan" className="px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none" />
              <input type="number" value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} placeholder="Price (29)" min="0" step="0.01" className="px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none" />
              <input type="text" value={variantDesc} onChange={(e) => setVariantDesc(e.target.value)} placeholder="Description (opt)" className="px-3 py-2.5 brutal-border bg-background text-sm focus:outline-none" />
            </div>
            <button type="button" onClick={handleAddVariant} disabled={addingVariant || !variantName || !variantPrice} className="brutal-btn bg-card text-sm flex items-center gap-2 disabled:opacity-60">
              {addingVariant ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Variant
            </button>
          </div>

          <button type="button" onClick={() => router.push("/dashboard/products")} className="brutal-btn bg-primary text-primary-foreground font-bold w-full py-3 text-center">Done � View My Products</button>
        </div>
      )}
    </>
  );
}
