import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, ArrowLeft, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { CATEGORIES } from "@/data/mockData";
import { useMyProducts } from "@/hooks/useMyProducts";
import { toast } from "sonner";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const NewProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useMyProducts();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image too large", { description: "Please choose an image under 4MB." });
      return;
    }
    try {
      const dataUrl = await fileToBase64(file);
      setCoverImage(dataUrl);
    } catch {
      toast.error("Failed to read image");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      addProduct({
        name: name.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        category,
        coverImage,
      });
      toast.success("Product published!", { description: `"${name}" is now in My Products.` });
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      toast.error("Could not save product");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 w-full flex-1">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="font-heading font-black text-3xl mb-8">New Product</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="brutal-card p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ultimate Design System"
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={5}
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="999"
                  min="0"
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cover Upload */}
          <div className="brutal-card p-6 space-y-5">
            <h2 className="font-heading font-bold text-lg">Cover Image</h2>

            {coverImage ? (
              <div className="relative brutal-border overflow-hidden">
                <img src={coverImage} alt="Cover preview" className="w-full aspect-video object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 bg-card brutal-border p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label="Remove cover"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="block brutal-border border-dashed p-8 text-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="font-semibold text-sm mb-1">Upload cover image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 4MB</p>
                <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              </label>
            )}

            <div className="brutal-border border-dashed p-8 text-center bg-muted/50">
              <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold text-sm mb-1">Upload product file</p>
              <p className="text-xs text-muted-foreground">PDF, ZIP, MP4, or any file (demo only)</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="brutal-btn bg-primary text-primary-foreground font-bold py-4 px-8 text-lg flex-1 disabled:opacity-60"
            >
              {submitting ? "Publishing..." : "Publish Product"}
            </button>
            <button
              type="button"
              className="brutal-btn bg-card font-semibold py-4 px-8"
              onClick={() => toast.info("Saved as draft! (Demo)")}
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
