"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { authClient } from "@repo/auth/client";
import { creatorApi, checkoutApi, type PayoutProviderStatus } from "@/lib/api";

// ─── Payout Section ──────────────────────────────────────────────────────────

function PayoutSection() {
  const [status, setStatus] = useState<{ polar: PayoutProviderStatus; razorpay: PayoutProviderStatus } | null>(null);
  const [loading, setLoading] = useState(true);
  const [polarOrgId, setPolarOrgId] = useState("");
  const [razorpayAccId, setRazorpayAccId] = useState("");
  const [saving, setSaving] = useState<"polar" | "razorpay" | null>(null);

  useEffect(() => {
    checkoutApi.getConnectStatus()
      .then(setStatus)
      .catch(() => {}) // silently ignore if not logged in
      .finally(() => setLoading(false));
  }, []);

  const savePolar = async () => {
    if (!polarOrgId.trim()) { toast.error("Enter your Polar Organization ID"); return; }
    setSaving("polar");
    try {
      await checkoutApi.savePolarAccount(polarOrgId.trim());
      toast.success("Polar account connected!");
      const s = await checkoutApi.getConnectStatus();
      setStatus(s);
      setPolarOrgId("");
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    } finally {
      setSaving(null);
    }
  };

  const saveRazorpay = async () => {
    if (!razorpayAccId.trim()) { toast.error("Enter your Razorpay Account ID"); return; }
    setSaving("razorpay");
    try {
      await checkoutApi.saveRazorpayAccount(razorpayAccId.trim());
      toast.success("Razorpay account connected!");
      const s = await checkoutApi.getConnectStatus();
      setStatus(s);
      setRazorpayAccId("");
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="brutal-card p-6">
      <h2 className="font-heading font-bold text-lg mb-1">Payout Settings</h2>
      <p className="text-muted-foreground text-sm mb-5">
        Connect your payment accounts to receive earnings from your sales.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 size={14} className="animate-spin" /> Loading status…
        </div>
      ) : (
        <div className="space-y-4">
          {/* Polar */}
          <div className="brutal-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="font-bold">Polar</p>
                  <p className="text-xs text-muted-foreground">International payments (USD, EUR…)</p>
                </div>
              </div>
              {status?.polar.connected ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                  <CheckCircle2 size={14} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <XCircle size={14} /> Not connected
                </span>
              )}
            </div>

            {status?.polar.connected ? (
              <p className="text-xs text-muted-foreground">
                Org ID: <span className="font-mono">{status.polar.accountId}</span>
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  1.{" "}
                  <a href="https://polar.sh/dashboard" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                    Create a Polar organization <ExternalLink size={10} />
                  </a>
                  {" "}→ 2. Paste your Organization ID below.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={polarOrgId}
                    onChange={(e) => setPolarOrgId(e.target.value)}
                    placeholder="org_xxxxxxxxxxxxxxxx"
                    className="flex-1 px-3 py-2 brutal-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={savePolar}
                    disabled={saving === "polar"}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60"
                  >
                    {saving === "polar" ? <Loader2 size={12} className="animate-spin" /> : "Connect"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Razorpay */}
          <div className="brutal-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇮🇳</span>
                <div>
                  <p className="font-bold">Razorpay</p>
                  <p className="text-xs text-muted-foreground">India, UPI, credit/debit cards</p>
                </div>
              </div>
              {status?.razorpay.connected ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400">
                  <CheckCircle2 size={14} /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <XCircle size={14} /> Not connected
                </span>
              )}
            </div>

            {status?.razorpay.connected ? (
              <p className="text-xs text-muted-foreground">
                Account ID: <span className="font-mono">{status.razorpay.accountId}</span>
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  1.{" "}
                  <a href="https://razorpay.com/x/linked-accounts" target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                    Set up a Razorpay Linked Account <ExternalLink size={10} />
                  </a>
                  {" "}→ 2. Paste your Account ID below.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={razorpayAccId}
                    onChange={(e) => setRazorpayAccId(e.target.value)}
                    placeholder="acc_xxxxxxxxxxxxxxxx"
                    className="flex-1 px-3 py-2 brutal-border bg-background font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={saveRazorpay}
                    disabled={saving === "razorpay"}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold disabled:opacity-60"
                  >
                    {saving === "razorpay" ? <Loader2 size={12} className="animate-spin" /> : "Connect"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [accentColor, setAccentColor] = useState("#FF90E8");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    const u = user as any;
    setBio(u.bio || "");
    setUsername(u.username || "");
    setSocialTwitter(u.socialTwitter || "");
    setSocialYoutube(u.socialYoutube || "");
    setSocialInstagram(u.socialInstagram || "");
    setSocialWebsite(u.socialWebsite || "");
    setAccentColor(u.accentColor || "#FF90E8");
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        bio: bio.trim() || null,
        socialTwitter: socialTwitter.trim() || null,
        socialYoutube: socialYoutube.trim() || null,
        socialInstagram: socialInstagram.trim() || null,
        socialWebsite: socialWebsite.trim() || null,
        accentColor,
      };
      if (username.trim()) {
        payload.username = username.trim().toLowerCase();
      }

      try {
        await creatorApi.updateProfile(payload);
      } catch (err: any) {
        if (err.message?.includes("setup") || err.message?.includes("creator")) {
          if (username.trim()) {
            await creatorApi.setup({
              username: username.trim().toLowerCase(),
              bio: bio.trim() || undefined,
              socialTwitter: socialTwitter || null,
              socialYoutube: socialYoutube || null,
              socialInstagram: socialInstagram || null,
              socialWebsite: socialWebsite || null,
              accentColor,
            });
          } else {
            throw new Error("Username is required to set up your creator profile.");
          }
        } else {
          throw err;
        }
      }

      toast.success("Settings saved!");
    } catch (err: any) {
      toast.error("Could not save settings", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and creator profile.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Account */}
        <div className="brutal-card p-6">
          <h2 className="font-heading font-bold text-lg mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
              <p className="text-xs text-muted-foreground mt-1">Name is managed by your auth provider.</p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full px-4 py-3 brutal-border bg-muted/50 font-body text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Creator Profile */}
        <div className="brutal-card p-6">
          <h2 className="font-heading font-bold text-lg mb-4">Creator Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Username
                <span className="text-xs font-normal text-muted-foreground ml-2">(your store URL)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-username"
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                minLength={3}
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your audience about yourself…"
                rows={3}
                className="w-full px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                maxLength={500}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-12 brutal-border cursor-pointer" />
                <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} placeholder="#FF90E8" className="px-4 py-3 brutal-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary w-32" />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="brutal-card p-6">
          <h2 className="font-heading font-bold text-lg mb-4">Social Links</h2>
          <div className="space-y-4">
            {[
              { label: "Twitter / X", value: socialTwitter, setter: setSocialTwitter, placeholder: "https://twitter.com/you" },
              { label: "YouTube", value: socialYoutube, setter: setSocialYoutube, placeholder: "https://youtube.com/@you" },
              { label: "Instagram", value: socialInstagram, setter: setSocialInstagram, placeholder: "https://instagram.com/you" },
              { label: "Website", value: socialWebsite, setter: setSocialWebsite, placeholder: "https://yoursite.com" },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-bold mb-2">{label}</label>
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
        </div>

        <button
          type="submit"
          disabled={saving}
          className="brutal-btn bg-primary text-primary-foreground font-bold py-3 px-8 disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {/* Payout section outside the form */}
      <div className="max-w-2xl mt-6">
        <PayoutSection />
      </div>
    </>
  );
}
