"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Loader2,
  User,
  Palette,
  Globe,
  Sparkles,
} from "lucide-react";
import { authClient } from "@repo/auth/client";
import { creatorApi } from "@/lib/api";
import { toast } from "sonner";

const STEP_COUNT = 3;

const ACCENT_PRESETS = [
  "#FF90E8",
  "#FFE566",
  "#B8F0A0",
  "#93C5FD",
  "#FCA5A5",
  "#A78BFA",
  "#F9A8D4",
  "#6EE7B7",
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 brutal-border flex items-center justify-center text-xs font-bold transition-colors ${
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                  ? "bg-primary text-primary-foreground brutal-shadow"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < current ? <Check size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-8 ${i < current ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreatorSetupPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 — Username
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  // Step 2 — Bio & Color
  const [bio, setBio] = useState("");
  const [accentColor, setAccentColor] = useState("#FF90E8");

  // Step 3 — Social Links
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");

  // If user already has a username or is a creator, redirect away
  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/login");
      return;
    }
    const u = session.user as any;
    if (u.username || u.role === "creator") {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  // Username debounce check
  useEffect(() => {
    if (!username) {
      setUsernameStatus("idle");
      return;
    }

    // Basic format validation
    const usernameRegex = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;
    if (username.length < 3 || !usernameRegex.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const result = await creatorApi.checkUsername(username);
        setUsernameStatus(result.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const canProceedStep0 = usernameStatus === "available";
  const canProceedStep1 = true; // bio + color are optional
  const canSubmit =
    username && usernameStatus === "available";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await creatorApi.setup({
        username,
        bio: bio.trim() || undefined,
        accentColor,
        socialTwitter: socialTwitter.trim() || null,
        socialYoutube: socialYoutube.trim() || null,
        socialInstagram: socialInstagram.trim() || null,
        socialWebsite: socialWebsite.trim() || null,
      });
      toast.success("Creator profile created! 🎉", {
        description: "Now create your first product.",
      });
      window.location.href = "/dashboard/products/new";
    } catch (e: any) {
      toast.error("Setup failed", { description: e.message });
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 brutal-border brutal-shadow text-sm font-bold mb-4">
          <Sparkles size={14} />
          Creator Onboarding
        </div>
        <h1 className="font-heading font-black text-4xl md:text-5xl mb-2">
          Set Up Your Creator Profile
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Just a few steps to get your store ready. You can always update these
          in Settings later.
        </p>
      </div>

      <div className="w-full max-w-lg">
        <StepIndicator current={step} total={STEP_COUNT} />

        {/* ── Step 0: Username ── */}
        {step === 0 && (
          <div className="brutal-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary brutal-border flex items-center justify-center">
                <User size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl">
                  Choose Your Username
                </h2>
                <p className="text-sm text-muted-foreground">
                  This becomes your store URL: /creator/
                  <strong>{username || "you"}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Username{" "}
                  <span className="text-destructive font-normal">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "")
                    )
                  }
                  placeholder="your-username"
                  minLength={3}
                  maxLength={30}
                  className={`w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                    usernameStatus === "available"
                      ? "border-green-500 ring-2 ring-green-200"
                      : usernameStatus === "taken" ||
                          usernameStatus === "invalid"
                        ? "border-destructive ring-2 ring-destructive/20"
                        : ""
                  }`}
                />
                <div className="mt-1.5 text-xs flex items-center gap-1.5 min-h-5">
                  {usernameStatus === "checking" && (
                    <>
                      <Loader2 size={11} className="animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Checking…</span>
                    </>
                  )}
                  {usernameStatus === "available" && (
                    <>
                      <Check size={11} className="text-green-600" />
                      <span className="text-green-600 font-semibold">
                        Username available!
                      </span>
                    </>
                  )}
                  {usernameStatus === "taken" && (
                    <span className="text-destructive">
                      Username is already taken. Try another.
                    </span>
                  )}
                  {usernameStatus === "invalid" && username.length > 0 && (
                    <span className="text-destructive">
                      3–30 chars, lowercase letters, numbers, hyphens only.
                      No leading/trailing hyphens.
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 brutal-border p-4 text-xs text-muted-foreground space-y-1">
                <p>✓ Lowercase letters, numbers, and hyphens only</p>
                <p>✓ 3–30 characters</p>
                <p>✓ Cannot start or end with a hyphen</p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!canProceedStep0}
              className="mt-6 w-full brutal-btn bg-primary text-primary-foreground font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ── Step 1: Bio & Accent Color ── */}
        {step === 1 && (
          <div className="brutal-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary brutal-border flex items-center justify-center">
                <Palette size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl">
                  Personalize Your Profile
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tell your audience who you are.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Bio{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your audience what you create…"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bio.length}/500
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Store Accent Color
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccentColor(color)}
                      className={`w-8 h-8 brutal-border transition-all ${
                        accentColor === color
                          ? "brutal-shadow scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-12 brutal-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#FF90E8"
                    className="px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary w-32"
                  />
                  <div
                    className="flex-1 h-12 brutal-border brutal-shadow"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(0)}
                className="brutal-btn bg-card text-sm px-6"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 brutal-btn bg-primary text-primary-foreground font-bold py-3 flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Social Links + Submit ── */}
        {step === 2 && (
          <div className="brutal-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary brutal-border flex items-center justify-center">
                <Globe size={18} className="text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl">
                  Add Social Links
                </h2>
                <p className="text-sm text-muted-foreground">
                  All optional — add what you have.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Twitter / X",
                  value: socialTwitter,
                  setter: setSocialTwitter,
                  placeholder: "https://twitter.com/you",
                },
                {
                  label: "YouTube",
                  value: socialYoutube,
                  setter: setSocialYoutube,
                  placeholder: "https://youtube.com/@you",
                },
                {
                  label: "Instagram",
                  value: socialInstagram,
                  setter: setSocialInstagram,
                  placeholder: "https://instagram.com/you",
                },
                {
                  label: "Website",
                  value: socialWebsite,
                  setter: setSocialWebsite,
                  placeholder: "https://yoursite.com",
                },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-sm font-bold mb-2">
                    {label}
                  </label>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            <div
              className="mt-6 brutal-border p-4 flex items-center gap-3"
              style={{ borderLeftColor: accentColor, borderLeftWidth: 4 }}
            >
              <div
                className="w-10 h-10 rounded-full brutal-border flex items-center justify-center shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                <span className="font-heading font-black text-white text-sm">
                  {(session?.user?.name || "?").charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-bold text-sm">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{username}
                </p>
                {bio && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="brutal-btn bg-card text-sm px-6"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !canSubmit}
                className="flex-1 brutal-btn bg-primary text-primary-foreground font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {submitting ? "Creating Profile…" : "Launch My Store!"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can always update your profile from{" "}
          <span className="font-semibold">Settings</span> later.
        </p>
      </div>
    </div>
  );
}
