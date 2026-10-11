"use client";

import { useState } from "react";
import { Sparkles, Loader2, X, Check, ArrowRight, Wand2, Tag, DollarSign, FileText } from "lucide-react";
import { aiApi, type GenerateCopyResponse } from "@/lib/api";
import { CATEGORY_LABELS } from "@/lib/mock-data";
import { toast } from "sonner";

interface CreatorAIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  onApply: (generated: GenerateCopyResponse) => void;
}

const TONES = [
  { value: "persuasive", label: "Persuasive 🚀", desc: "High-converting sales copy" },
  { value: "technical", label: "Technical 🛠️", desc: "Precise engineering focus" },
  { value: "minimal", label: "Minimal ✨", desc: "Clean & essential summary" },
  { value: "storytelling", label: "Storytelling 📖", desc: "Engaging origin narrative" },
  { value: "indie", label: "Indie Hacker ⚡", desc: "Direct, transparent & authentic" },
] as const;

export default function CreatorAIStudioModal({
  isOpen,
  onClose,
  initialCategory,
  onApply,
}: CreatorAIStudioModalProps) {
  const [concept, setConcept] = useState("");
  const [category, setCategory] = useState(initialCategory || "software");
  const [tone, setTone] = useState<"persuasive" | "technical" | "minimal" | "storytelling" | "indie">("persuasive");
  const [targetAudience, setTargetAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateCopyResponse | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a rough product concept");
      return;
    }

    setLoading(true);
    try {
      const data = await aiApi.generateCopy({
        concept: concept.trim(),
        category,
        tone,
        targetAudience: targetAudience.trim() || undefined,
      });
      setResult(data);
      toast.success("✨ Copy generated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI copy");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result);
    toast.success("Applied AI copy to product form!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card brutal-border brutal-shadow rounded-none">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-digi-pink text-black border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-black text-white rounded">
              <Sparkles size={20} className="text-digi-yellow animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-heading font-black text-xl tracking-tight">Creator AI Studio</h2>
              <p className="text-xs font-semibold opacity-90">
                Generate high-converting titles, rich Markdown descriptions & SEO tags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1">
                Product Concept or Idea <span className="text-red-500">*</span>
              </label>
              <textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={2}
                placeholder="e.g. Next.js SaaS starter kit with Better-Auth, Polar payments, and Tailwind dark mode..."
                className="w-full p-3 brutal-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-digi-pink resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 brutal-border bg-background text-sm font-medium focus:outline-none"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-1">
                  Target Audience (Optional)
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Indie hackers, Figma designers, junior devs"
                  className="w-full p-2.5 brutal-border bg-background text-sm font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Copywriting Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`p-2.5 text-left brutal-border text-xs font-bold transition-all ${
                      tone === t.value
                        ? "bg-black text-white translate-x-0.5 translate-y-0.5 shadow-none"
                        : "bg-muted/50 hover:bg-muted text-foreground"
                    }`}
                  >
                    <div>{t.label}</div>
                    <div className="text-[10px] opacity-70 font-normal truncate mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !concept.trim()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-digi-yellow text-black font-black text-sm brutal-btn disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Synthesizing High-Impact Copy...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate Magic Marketing Copy
                </>
              )}
            </button>
          </form>

          {/* Generated Result Preview */}
          {result && (
            <div className="mt-6 pt-6 border-t-2 border-black space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Check size={14} className="text-green-500" /> AI Generated Blueprint
                </span>
                <span className="text-xs font-bold px-2 py-0.5 bg-digi-mint text-black border border-black">
                  Optimal Price: ${(result.suggestedPriceCents / 100).toFixed(2)}
                </span>
              </div>

              {/* Title & Summary */}
              <div className="p-4 bg-muted/40 brutal-border space-y-2">
                <div className="text-lg font-black">{result.name}</div>
                <div className="text-xs text-muted-foreground">{result.summary}</div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {result.tags.map((t) => (
                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 bg-card border border-foreground/30 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Markdown Description Snippet */}
              <div className="p-4 bg-background brutal-border max-h-48 overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                {result.description}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-digi-mint text-black font-black text-sm brutal-btn"
                >
                  <ArrowRight size={16} />
                  Apply to Product Form
                </button>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="p-3 bg-card border-2 border-black text-sm font-bold hover:bg-muted"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
