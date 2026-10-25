"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  Terminal,
  ShieldCheck,
  Cpu,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Laptop,
  Box,
  Layers,
  FileCode,
  Flame,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Key,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────

type CodeLanguage = "python" | "blender" | "electron" | "react" | "csharp" | "go" | "curl";

interface CodeSnippet {
  id: CodeLanguage;
  name: string;
  badge: string;
  filename: string;
  description: string;
  code: string;
}

// ── Code Snippets Database ────────────────────────────────────────

const CODE_SNIPPETS: Record<CodeLanguage, CodeSnippet> = {
  python: {
    id: "python",
    name: "Python (Tkinter, PyQt, CLI)",
    badge: "Most Popular",
    filename: "digistore_license.py",
    description: "Production-ready, zero-dependency client with local file caching, live seat synchronization, and reset/deactivation.",
    code: `import os
import json
import urllib.request
import urllib.error

class DigiStoreLicense:
    """
    Drop-in DigiStore License Client (Gumroad v2 API compatible).
    Works with standard library urllib (no external pip dependencies required).
    """
    def __init__(self, api_url="http://localhost:3002", config_file="license_config.json"):
        self.api_url = api_url.rstrip("/")
        self.config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), config_file)
        self.cache = self._load_cache()

    def _load_cache(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    def is_activated(self):
        """Check if this computer already has a saved valid activation."""
        return bool(self.cache and self.cache.get("license_key"))

    def activate(self, license_key):
        """
        Verify key and claim 1 device seat on DigiStore.
        Returns: dict with 'valid', 'uses', 'max_uses', and 'message'
        """
        key = license_key.strip().upper()
        payload = json.dumps({"licenseKey": key, "incrementUses": True}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.api_url}/api/licenses/verify",
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "DigiStoreApp/1.0"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=8) as res:
                data = json.loads(res.read().decode("utf-8"))
                uses = data.get("uses", 1)
                max_uses = data.get("maxUses", 5)
                # Save activation locally so user isn't prompted on next run
                self.cache = {"license_key": key, "uses": uses, "max_uses": max_uses}
                with open(self.config_path, "w", encoding="utf-8") as f:
                    json.dump(self.cache, f, indent=2)
                return {"valid": True, "uses": uses, "max_uses": max_uses, "message": "Unlocked!"}
        except urllib.error.HTTPError as he:
            err = json.loads(he.read().decode("utf-8"))
            return {
                "valid": False,
                "all_keys_used": (err.get("uses", 0) >= err.get("maxUses", 5)),
                "uses": err.get("uses"),
                "max_uses": err.get("maxUses"),
                "message": err.get("message", "License rejected")
            }

    def deactivate(self):
        """Release device seat on DigiStore server and clear local file."""
        if self.is_activated():
            key = self.cache.get("license_key")
            payload = json.dumps({"licenseKey": key}).encode("utf-8")
            req = urllib.request.Request(
                f"{self.api_url}/api/licenses/decrement",
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            try:
                urllib.request.urlopen(req, timeout=8)
            except Exception:
                pass
            if os.path.exists(self.config_path):
                os.remove(self.config_path)
            self.cache = None

# Example Usage:
# client = DigiStoreLicense()
# if client.is_activated():
#     print("Application is unlocked!")
# else:
#     result = client.activate("DIGI-XXXX-XXXX-XXXX")
#     if result["valid"]:
#         print(f"Activated successfully! ({result['uses']}/{result['max_uses']} seats used)")
#     elif result.get("all_keys_used"):
#         print("All 5 seats are currently registered on other devices.")`,
  },

  blender: {
    id: "blender",
    name: "Blender 3D & Maya Add-on",
    badge: "Creative Add-on",
    filename: "__init__.py",
    description: "Embed license verification directly inside Blender's Addon Preferences panel with persistent operator properties.",
    code: `bl_info = {
    "name": "SuperRender Pro",
    "author": "Your Name",
    "version": (1, 0),
    "blender": (3, 6, 0),
    "category": "Render",
}

import bpy
import urllib.request
import json

class DigiStorePreferences(bpy.types.AddonPreferences):
    bl_idname = __name__

    license_key: bpy.props.StringProperty(
        name="License Key",
        description="Enter your DigiStore license key (DIGI-XXXX-XXXX-XXXX)",
        default="",
    )
    is_activated: bpy.props.BoolProperty(
        name="Is Activated",
        default=False,
    )
    seats_info: bpy.props.StringProperty(
        name="Seats",
        default="",
    )

    def draw(self, context):
        layout = self.layout
        box = layout.box()
        box.label(text="DigiStore License Activation", icon='LOCKED')

        if not self.is_activated:
            box.prop(self, "license_key")
            box.operator("digistore.verify_license", text="Activate License", icon='CHECKMARK')
        else:
            box.label(text=f"✓ Licensed ({self.seats_info})", icon='SOLO_ON')
            box.operator("digistore.deactivate_license", text="Deactivate & Free Seat", icon='CANCEL')

class OT_VerifyLicense(bpy.types.Operator):
    bl_idname = "digistore.verify_license"
    bl_label = "Verify DigiStore License"

    def execute(self, context):
        prefs = context.preferences.addons[__name__].preferences
        key = prefs.license_key.strip().upper()
        if not key:
            self.report({'ERROR'}, "Please enter a valid license key.")
            return {'CANCELLED'}

        url = "http://localhost:3002/api/licenses/verify"
        payload = json.dumps({"licenseKey": key, "incrementUses": True}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})

        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.loads(res.read().decode("utf-8"))
                if data.get("valid"):
                    prefs.is_activated = True
                    prefs.seats_info = f"{data.get('uses')}/{data.get('maxUses')} seats in use"
                    self.report({'INFO'}, "Add-on successfully activated!")
                    return {'FINISHED'}
        except urllib.error.HTTPError as e:
            err = json.loads(e.read().decode("utf-8"))
            self.report({'ERROR'}, err.get("message", "License rejected."))
            return {'CANCELLED'}

def register():
    bpy.utils.register_class(DigiStorePreferences)
    bpy.utils.register_class(OT_VerifyLicense)

def unregister():
    bpy.utils.unregister_class(DigiStorePreferences)
    bpy.utils.unregister_class(OT_VerifyLicense)`,
  },

  electron: {
    id: "electron",
    name: "Node.js, Electron & VS Code",
    badge: "Cross-Platform",
    filename: "licenseManager.ts",
    description: "Complete TypeScript client for Electron apps and VS Code extensions with secure keytar/local storage support.",
    code: `export interface LicenseStatus {
  valid: boolean;
  uses: number;
  maxUses: number;
  customerEmail?: string;
  message: string;
}

export class DigiStoreLicenseClient {
  private apiBaseUrl: string;

  constructor(apiBaseUrl = "http://localhost:3002") {
    this.apiBaseUrl = apiBaseUrl.replace(/\\/+$/, "");
  }

  /**
   * Activate a license key on DigiStore and claim 1 device seat.
   */
  async activate(licenseKey: string): Promise<LicenseStatus> {
    const cleanKey = licenseKey.trim().toUpperCase();

    const response = await fetch(\`\${this.apiBaseUrl}/api/licenses/verify\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licenseKey: cleanKey,
        incrementUses: true, // Claim 1 machine seat
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      throw new Error(data.message || "License activation rejected.");
    }

    // Save key to Electron secure store or localStorage
    localStorage.setItem("digistore_license_key", cleanKey);
    localStorage.setItem("digistore_license_seats", \`\${data.uses}/\${data.maxUses}\`);

    return {
      valid: true,
      uses: data.uses,
      maxUses: data.maxUses,
      customerEmail: data.order?.customerEmail,
      message: data.message,
    };
  }

  /**
   * Release device seat when user logs out, resets, or uninstalls.
   */
  async deactivate(): Promise<void> {
    const cachedKey = localStorage.getItem("digistore_license_key");
    if (cachedKey) {
      await fetch(\`\${this.apiBaseUrl}/api/licenses/decrement\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: cachedKey }),
      }).catch(() => null);

      localStorage.removeItem("digistore_license_key");
      localStorage.removeItem("digistore_license_seats");
    }
  }

  isActivated(): boolean {
    return Boolean(localStorage.getItem("digistore_license_key"));
  }
}`,
  },

  react: {
    id: "react",
    name: "React, Next.js & Web Apps",
    badge: "Web Integration",
    filename: "useLicense.tsx",
    description: "Custom React Hook with optimistic states, error management, and persistent session storage.",
    code: `import { useState, useEffect } from "react";

export function useDigiStoreLicense(apiBase = "http://localhost:3002") {
  const [key, setKey] = useState<string>("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [seats, setSeats] = useState<{ uses: number; maxUses: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("app_license_key");
    if (saved) {
      setKey(saved);
      setIsUnlocked(true);
    }
  }, []);

  const activate = async (licenseKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(\`\${apiBase}/api/licenses/verify\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: licenseKey.trim().toUpperCase(), incrementUses: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.message || "License invalid or expired.");
      }

      localStorage.setItem("app_license_key", licenseKey.trim().toUpperCase());
      setKey(licenseKey);
      setIsUnlocked(true);
      setSeats({ uses: data.uses, maxUses: data.maxUses });
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async () => {
    if (key) {
      await fetch(\`\${apiBase}/api/licenses/decrement\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key }),
      }).catch(() => null);
      localStorage.removeItem("app_license_key");
      setKey("");
      setIsUnlocked(false);
      setSeats(null);
    }
  };

  return { isUnlocked, key, seats, loading, error, activate, deactivate };
}`,
  },

  csharp: {
    id: "csharp",
    name: "C#, .NET & Unity 3D",
    badge: "Windows & Unity",
    filename: "DigiStoreLicensing.cs",
    description: "Asynchronous C# class compatible with WPF, WinUI 3, Unity Engine, and ASP.NET tools.",
    code: `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class DigiStoreLicense
{
    private readonly string _apiUrl;
    private static readonly HttpClient _http = new HttpClient();

    public DigiStoreLicense(string apiUrl = "http://localhost:3002")
    {
        _apiUrl = apiUrl.TrimEnd('/');
    }

    public async Task<LicenseResponse> ActivateAsync(string licenseKey)
    {
        var payload = JsonSerializer.Serialize(new
        {
            licenseKey = licenseKey.Trim().ToUpper(),
            incrementUses = true
        });

        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        var res = await _http.PostAsync($"{_apiUrl}/api/licenses/verify", content);
        var rawJson = await res.Content.ReadAsStringAsync();

        var result = JsonSerializer.Deserialize<LicenseResponse>(rawJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (res.IsSuccessStatusCode && result.Valid)
        {
            // Save key to Windows Registry or Unity PlayerPrefs
            #if UNITY_5_3_OR_NEWER
            UnityEngine.PlayerPrefs.SetString("DigiStore_Key", licenseKey);
            UnityEngine.PlayerPrefs.Save();
            #endif
            return result;
        }

        throw new Exception(result?.Message ?? "License validation failed.");
    }

    public async Task DeactivateAsync(string licenseKey)
    {
        var payload = JsonSerializer.Serialize(new { licenseKey = licenseKey.Trim().ToUpper() });
        var content = new StringContent(payload, Encoding.UTF8, "application/json");
        await _http.PostAsync($"{_apiUrl}/api/licenses/decrement", content);
    }
}

public class LicenseResponse
{
    public bool Success { get; set; }
    public bool Valid { get; set; }
    public int Uses { get; set; }
    public int MaxUses { get; set; }
    public string Message { get; set; }
}`,
  },

  go: {
    id: "go",
    name: "Go (Golang CLI & Services)",
    badge: "High Performance",
    filename: "licensing.go",
    description: "Lightweight, zero-dependency Go package for licensing microservices and developer terminal CLI utilities.",
    code: `package licensing

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	ApiURL     string
	HTTPClient *http.Client
}

type VerifyResponse struct {
	Success bool   \`json:"success"\`
	Valid   bool   \`json:"valid"\`
	Uses    int    \`json:"uses"\`
	MaxUses int    \`json:"maxUses"\`
	Message string \`json:"message"\`
}

func NewClient(apiURL string) *Client {
	return &Client{
		ApiURL:     strings.TrimRight(apiURL, "/"),
		HTTPClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *Client) Activate(key string) (*VerifyResponse, error) {
	payload, _ := json.Marshal(map[string]interface{}{
		"licenseKey":    strings.TrimSpace(strings.ToUpper(key)),
		"incrementUses": true,
	})

	resp, err := c.HTTPClient.Post(c.ApiURL+"/api/licenses/verify", "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return nil, fmt.Errorf("connection error: %w", err)
	}
	defer resp.Body.Close()

	var result VerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed parsing server response: %w", err)
	}

	if resp.StatusCode != http.StatusOK || !result.Valid {
		return nil, fmt.Errorf("license rejected: %s", result.Message)
	}

	return &result, nil
}`,
  },

  curl: {
    id: "curl",
    name: "cURL & REST API",
    badge: "Universal HTTP",
    filename: "verify.sh",
    description: "Raw HTTP request examples compatible with Postman, bash scripts, GitHub Actions, and custom environments.",
    code: `# 1. Verify & Claim 1 Device Seat (POST /api/licenses/verify)
curl -X POST "http://localhost:3002/api/licenses/verify" \\
  -H "Content-Type: application/json" \\
  -d '{
    "licenseKey": "DIGI-34A9-4601-6945",
    "incrementUses": true
  }'

# Expected 200 OK Response:
# {
#   "success": true,
#   "valid": true,
#   "uses": 1,
#   "maxUses": 5,
#   "key": "DIGI-34A9-4601-6945",
#   "message": "License verified successfully (1/5 seats active)"
# }

# 2. Deactivate / Release 1 Seat (POST /api/licenses/decrement)
curl -X POST "http://localhost:3002/api/licenses/decrement" \\
  -H "Content-Type: application/json" \\
  -d '{
    "licenseKey": "DIGI-34A9-4601-6945"
  }'

# Expected 200 OK Response:
# {
#   "success": true,
#   "uses": 0,
#   "maxUses": 5,
#   "message": "Device deactivated. 0 of 5 seats now in use."
# }`,
  },
};

// ── Sidebar Navigation Items ──────────────────────────────────────

const NAV_SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { id: "overview", label: "Overview & Concept", icon: Sparkles },
      { id: "how-it-works", label: "How Licensing Works", icon: Layers },
      { id: "quickstart", label: "4-Step Implementation", icon: Zap },
    ],
  },
  {
    title: "Integration Guides",
    items: [
      { id: "python", label: "Python (Tkinter & CLI)", icon: Terminal },
      { id: "blender", label: "Blender 3D & Maya", icon: Box },
      { id: "electron", label: "Electron & VS Code", icon: Laptop },
      { id: "react", label: "React & Next.js", icon: Code2 },
      { id: "csharp", label: "C#, .NET & Unity", icon: Cpu },
      { id: "go", label: "Go (Golang CLI)", icon: FileCode },
      { id: "curl", label: "cURL & REST API", icon: BookOpen },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "endpoint-verify", label: "POST /api/licenses/verify", badge: "POST", icon: Key },
      { id: "endpoint-decrement", label: "POST /api/licenses/decrement", badge: "POST", icon: RotateCcw },
      { id: "error-codes", label: "Status & Error Codes", icon: AlertTriangle },
    ],
  },
  {
    title: "Testing & Playground",
    items: [
      { id: "simulator", label: "Live API Simulator", badge: "Live", icon: Play },
      { id: "sample-apps", label: "Calculator Sample App", icon: FileCode },
    ],
  },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<CodeLanguage>("python");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Playground State
  const [testKey, setTestKey] = useState("DIGI-34A9-4601-6945");
  const [testIncrement, setTestIncrement] = useState(true);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const runPlaygroundVerify = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    try {
      const res = await fetch("http://localhost:3002/api/licenses/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: testKey.trim().toUpperCase(),
          incrementUses: testIncrement,
        }),
      });
      setPlaygroundStatus(res.status);
      const json = await res.json();
      setPlaygroundResponse(json);
      if (res.ok && json.valid) {
        toast.success(`License Valid! (${json.uses}/${json.maxUses} seats active)`);
      } else {
        toast.error(`Verification Failed: ${json.message || "Invalid Key"}`);
      }
    } catch (e: any) {
      setPlaygroundStatus(0);
      setPlaygroundResponse({ error: e.message || "Failed to contact DigiStore API server at http://localhost:3002" });
      toast.error("Could not reach API server. Ensure backend is running on port 3002.");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const runPlaygroundDecrement = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    try {
      const res = await fetch("http://localhost:3002/api/licenses/decrement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseKey: testKey.trim().toUpperCase(),
        }),
      });
      setPlaygroundStatus(res.status);
      const json = await res.json();
      setPlaygroundResponse(json);
      if (res.ok) {
        toast.success(`Seat Released! (${json.uses}/${json.maxUses} seats active)`);
      } else {
        toast.error(`Release Failed: ${json.message}`);
      }
    } catch (e: any) {
      setPlaygroundStatus(0);
      setPlaygroundResponse({ error: e.message });
      toast.error("Network error.");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Filtered sidebar items
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return NAV_SECTIONS;
    const q = searchQuery.toLowerCase();
    return NAV_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (it) => it.label.toLowerCase().includes(q) || it.id.toLowerCase().includes(q)
      ),
    })).filter((sec) => sec.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Top Header Banner ────────────────────────────────────────── */}
      <div className="border-b-2 border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-foreground">Documentation</span>
                <span>/</span>
                <span className="text-primary">Software Licensing</span>
              </div>
              <h1 className="font-heading font-black text-3xl sm:text-4xl tracking-tight">
                Software License Integration Guide
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-3xl">
                The complete developer manual for protecting Python desktop apps, Blender add-ons, Electron apps, C# games, and CLI tools using DigiStore’s Gumroad-compatible license verification API.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-black brutal-border">
                <ShieldCheck size={14} /> Gumroad v2 Compatible
              </span>
              <a
                href="#simulator"
                className="brutal-btn bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 flex items-center gap-1.5"
              >
                <Play size={13} /> Live Simulator
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Documentation Container ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Sidebar Navigation (Sticky) ────────────────────── */}
          <aside className="lg:col-span-3 sticky top-20 space-y-6">
            {/* Search filter input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search docs or APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card brutal-border pl-9 pr-3 py-2 text-xs font-mono font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Nav list */}
            <nav className="space-y-6">
              {filteredSections.map((sec) => (
                <div key={sec.title} className="space-y-2">
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-muted-foreground px-2">
                    {sec.title}
                  </h3>
                  <div className="space-y-1">
                    {sec.items.map((item) => {
                      const Icon = item.icon;
                      const isLanguage = ["python", "blender", "electron", "react", "csharp", "go", "curl"].includes(item.id);
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={() => {
                            if (isLanguage) setActiveTab(item.id as CodeLanguage);
                          }}
                          className={`flex items-center justify-between px-3 py-2 text-xs font-semibold brutal-border transition-colors ${
                            activeTab === item.id
                              ? "bg-primary text-primary-foreground font-black"
                              : "bg-card hover:bg-muted text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon size={14} className="shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-background/80 text-foreground font-black rounded">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Quick Helper Box */}
            <div className="bg-primary/10 brutal-border p-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-primary">
                <Flame size={14} /> Sample Python App
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We've built a full desktop Tkinter Calculator showing key verification, 5/5 seats detection, and seat release.
              </p>
              <div className="pt-1">
                <code className="text-[10px] bg-card px-2 py-1 brutal-border block font-mono">
                  python "sample app/calculator.py"
                </code>
              </div>
            </div>
          </aside>

          {/* ── Main Content Body ───────────────────────────────────── */}
          <main className="lg:col-span-9 space-y-12">

            {/* ── SECTION 1: Overview & Concept ────────────────────── */}
            <section id="overview" className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/20 text-primary font-mono text-xs font-bold uppercase brutal-border">
                <Sparkles size={12} /> Getting Started
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">
                How Software Licensing Works on DigiStore
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                When you sell software products on DigiStore (such as a 3D plugin, video editing effect, desktop application, or Python automation tool), you can enable <strong>Automatic Serial Key Generation</strong>. Every customer receives a unique serial key (<code className="font-mono text-primary font-bold">DIGI-XXXX-XXXX-XXXX</code>) upon purchase that allows them to unlock and run your software.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-card brutal-border p-4 space-y-2">
                  <div className="w-8 h-8 bg-primary/20 flex items-center justify-center font-black text-primary brutal-border">
                    1
                  </div>
                  <h4 className="font-heading font-bold text-sm">Unique Key per Sale</h4>
                  <p className="text-xs text-muted-foreground">
                    Generated automatically when an order is completed, displayed on the customer's receipt, and emailed instantly.
                  </p>
                </div>
                <div className="bg-card brutal-border p-4 space-y-2">
                  <div className="w-8 h-8 bg-emerald-500/20 flex items-center justify-center font-black text-emerald-500 brutal-border">
                    2
                  </div>
                  <h4 className="font-heading font-bold text-sm">5 Device Seat Limit</h4>
                  <p className="text-xs text-muted-foreground">
                    Each key permits up to 5 concurrent installations. The 6th device is blocked until an old device is released.
                  </p>
                </div>
                <div className="bg-card brutal-border p-4 space-y-2">
                  <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center font-black text-blue-500 brutal-border">
                    3
                  </div>
                  <h4 className="font-heading font-bold text-sm">Gumroad v2 Compatible</h4>
                  <p className="text-xs text-muted-foreground">
                    Drop-in compatible with existing Gumroad license verification snippets. No architecture overhaul needed.
                  </p>
                </div>
              </div>
            </section>

            {/* ── SECTION 2: Architecture & Lifecycle Diagram ───────── */}
            <section id="how-it-works" className="space-y-4 pt-4 border-t-2 border-border">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-muted font-mono text-xs font-bold uppercase brutal-border">
                <Layers size={12} /> Architecture
              </div>
              <h2 className="font-heading font-black text-2xl tracking-tight">
                The 4-Step Application Lifecycle
              </h2>
              <p className="text-sm text-muted-foreground">
                A real-world licensed application follows a standard pattern to prevent users from being prompted for their serial key every time they boot up:
              </p>

              <div className="bg-card brutal-border p-6 space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-muted/40 brutal-border space-y-2">
                    <span className="font-black text-primary">STEP 1</span>
                    <h5 className="font-bold">Prompt & Verify</h5>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      App asks user for key & calls <code className="text-primary font-bold">/verify</code> with <code className="text-primary">incrementUses: true</code>.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/40 brutal-border space-y-2">
                    <span className="font-black text-emerald-500">STEP 2</span>
                    <h5 className="font-bold">Cache Locally</h5>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      App saves active token in local config (<code className="text-foreground">config.json</code> or Keychain).
                    </p>
                  </div>
                  <div className="p-4 bg-muted/40 brutal-border space-y-2">
                    <span className="font-black text-blue-500">STEP 3</span>
                    <h5 className="font-bold">Subsequent Boots</h5>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      App reads local config. Boots directly into full software without prompting user again.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/40 brutal-border space-y-2">
                    <span className="font-black text-rose-500">STEP 4</span>
                    <h5 className="font-bold">Reset / Transfer</h5>
                    <p className="text-[11px] text-muted-foreground font-sans">
                      User clicks Reset &rarr; app calls <code className="text-primary font-bold">/decrement</code> to free the seat for a new PC.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── SECTION 3: Code Snippets by Application Type ─────── */}
            <section id="quickstart" className="space-y-4 pt-4 border-t-2 border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/20 text-primary font-mono text-xs font-bold uppercase brutal-border mb-1">
                    <Code2 size={12} /> Code Snippets
                  </div>
                  <h2 className="font-heading font-black text-2xl tracking-tight">
                    Integration Code by Application Framework
                  </h2>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Select your stack below:
                </span>
              </div>

              {/* Language selection pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.keys(CODE_SNIPPETS) as CodeLanguage[]).map((lang) => {
                  const snippet = CODE_SNIPPETS[lang];
                  const isSelected = activeTab === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => setActiveTab(lang)}
                      className={`px-3 py-1.5 text-xs font-bold brutal-border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-primary text-primary-foreground brutal-shadow"
                          : "bg-card hover:bg-muted text-foreground"
                      }`}
                    >
                      <span>{snippet.name.split(" ")[0]}</span>
                      {snippet.badge && (
                        <span className="text-[9px] font-mono px-1 bg-background/50 text-foreground rounded">
                          {snippet.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Code display card */}
              <div className="bg-card brutal-border">
                <div className="p-4 border-b-2 border-border flex items-center justify-between gap-2 flex-wrap bg-muted/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-sm">
                        {CODE_SNIPPETS[activeTab].name}
                      </span>
                      <span className="font-mono text-xs bg-background px-2 py-0.5 brutal-border text-muted-foreground">
                        {CODE_SNIPPETS[activeTab].filename}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {CODE_SNIPPETS[activeTab].description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(CODE_SNIPPETS[activeTab].code, activeTab)}
                    className="brutal-btn bg-background hover:bg-muted text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
                  >
                    {copied === activeTab ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-zinc-950 text-zinc-100 overflow-x-auto font-mono text-xs leading-relaxed max-h-[500px]">
                  <pre className="select-all">
                    <code>{CODE_SNIPPETS[activeTab].code}</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* ── SECTION 4: API Endpoint Reference ─────────────────── */}
            <section id="endpoint-verify" className="space-y-6 pt-4 border-t-2 border-border">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-muted font-mono text-xs font-bold uppercase brutal-border">
                <Key size={12} /> REST Endpoints
              </div>
              <h2 className="font-heading font-black text-2xl tracking-tight">
                REST API Specification
              </h2>

              {/* Endpoint 1: Verify */}
              <div className="bg-card brutal-border p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-emerald-500 text-white font-mono text-xs font-black uppercase brutal-border">
                    POST
                  </span>
                  <code className="font-mono text-sm font-bold text-foreground">
                    http://localhost:3002/api/licenses/verify
                  </code>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Validates a customer serial key, checks revocation/refund status, and optionally registers + increments a device seat.
                </p>

                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Request JSON Body Parameters
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-border font-mono">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2.5 border-b border-border">Field</th>
                        <th className="p-2.5 border-b border-border">Type</th>
                        <th className="p-2.5 border-b border-border">Required</th>
                        <th className="p-2.5 border-b border-border">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-2.5 font-bold text-primary">licenseKey</td>
                        <td className="p-2.5 text-muted-foreground">string</td>
                        <td className="p-2.5 font-bold text-emerald-500">Yes</td>
                        <td className="p-2.5 font-sans">The serial key formatted as <code>DIGI-XXXX-XXXX-XXXX</code>.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-primary">incrementUses</td>
                        <td className="p-2.5 text-muted-foreground">boolean</td>
                        <td className="p-2.5 text-muted-foreground">Optional (default: true)</td>
                        <td className="p-2.5 font-sans">
                          Set to <code>true</code> during initial app activation to claim a seat. Set to <code>false</code> for silent background checks.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-primary">productId</td>
                        <td className="p-2.5 text-muted-foreground">string</td>
                        <td className="p-2.5 text-muted-foreground">Optional</td>
                        <td className="p-2.5 font-sans">Product ID or slug to ensure key was purchased specifically for this software.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-500 font-mono">HTTP 200 Success Response:</span>
                    <pre className="p-3 bg-zinc-950 text-zinc-100 font-mono text-[11px] brutal-border overflow-x-auto">
{`{
  "success": true,
  "valid": true,
  "uses": 1,
  "maxUses": 5,
  "key": "DIGI-34A9-4601-6945",
  "message": "License verified successfully (1/5 seats active)",
  "data": { ... }
}`}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-500 font-mono">HTTP 400 Seat Limit Exceeded:</span>
                    <pre className="p-3 bg-zinc-950 text-zinc-100 font-mono text-[11px] brutal-border overflow-x-auto">
{`{
  "success": false,
  "valid": false,
  "uses": 5,
  "maxUses": 5,
  "message": "Activation limit exceeded: 5 of 5 seats in use. Deactivate an existing device first."
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Endpoint 2: Decrement */}
              <div id="endpoint-decrement" className="bg-card brutal-border p-6 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-amber-500 text-white font-mono text-xs font-black uppercase brutal-border">
                    POST
                  </span>
                  <code className="font-mono text-sm font-bold text-foreground">
                    http://localhost:3002/api/licenses/decrement
                  </code>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Releases 1 device seat on the DigiStore server when a user clicks "Reset App", uninstalls your software, or transfers their license to a new PC.
                </p>

                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Request JSON Body
                </h4>
                <pre className="p-3 bg-zinc-950 text-zinc-100 font-mono text-xs brutal-border overflow-x-auto">
{`{
  "licenseKey": "DIGI-34A9-4601-6945"
}`}
                </pre>
              </div>
            </section>

            {/* ── SECTION 5: Status & Error Codes Reference ────────── */}
            <section id="error-codes" className="space-y-4 pt-4 border-t-2 border-border">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-muted font-mono text-xs font-bold uppercase brutal-border">
                <AlertTriangle size={12} /> Status Reference
              </div>
              <h2 className="font-heading font-black text-2xl tracking-tight">
                Response Code Matrix & Error Handling
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-border">
                  <thead className="bg-muted font-mono">
                    <tr>
                      <th className="p-3 border-b border-border">Status</th>
                      <th className="p-3 border-b border-border">valid</th>
                      <th className="p-3 border-b border-border">Trigger Condition</th>
                      <th className="p-3 border-b border-border">App Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-bold text-emerald-500">200 OK</td>
                      <td className="p-3 text-emerald-500 font-bold">true</td>
                      <td className="p-3 font-sans">Key is active, valid, and seat registered.</td>
                      <td className="p-3 font-sans text-emerald-500 font-semibold">Unlock full features & save local config.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-rose-500">400 Bad Request</td>
                      <td className="p-3 text-rose-500 font-bold">false</td>
                      <td className="p-3 font-sans"><code>uses &gt;= maxUses</code> (5 of 5 seats used).</td>
                      <td className="p-3 font-sans text-rose-500 font-semibold">Show "All keys used" modal. Prompt user to release another machine.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-500">400 Bad Request</td>
                      <td className="p-3 text-amber-500 font-bold">false</td>
                      <td className="p-3 font-sans">Key not found in database registry.</td>
                      <td className="p-3 font-sans">Show "Invalid license key. Check typing."</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-500">400 Bad Request</td>
                      <td className="p-3 text-amber-500 font-bold">false</td>
                      <td className="p-3 font-sans">Order was refunded or creator disabled key.</td>
                      <td className="p-3 font-sans">Lock features. Show "License revoked by creator."</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── SECTION 6: Interactive Live Simulator ────────────── */}
            <section id="simulator" className="space-y-4 pt-4 border-t-2 border-border">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/20 text-primary font-mono text-xs font-bold uppercase brutal-border">
                <Play size={12} /> Interactive Tool
              </div>
              <h2 className="font-heading font-black text-2xl tracking-tight">
                Live License Verification Playground
              </h2>
              <p className="text-sm text-muted-foreground">
                Test the live API endpoint right from this page. Enter any key from your database to see the exact HTTP response and seat increments in real time:
              </p>

              <div className="bg-card brutal-border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase text-muted-foreground">
                      License Key to Test
                    </label>
                    <input
                      type="text"
                      value={testKey}
                      onChange={(e) => setTestKey(e.target.value.toUpperCase())}
                      className="w-full bg-background brutal-border px-3 py-2 font-mono text-sm font-bold tracking-wider"
                      placeholder="DIGI-XXXX-XXXX-XXXX"
                    />
                    <div className="flex gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setTestKey("DIGI-34A9-4601-6945")}
                        className="text-[10px] font-mono font-bold bg-muted hover:bg-muted/80 px-2 py-0.5 brutal-border"
                      >
                        Sample Key 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestKey("DIGI-7494-E793-DC67")}
                        className="text-[10px] font-mono font-bold bg-muted hover:bg-muted/80 px-2 py-0.5 brutal-border"
                      >
                        Sample Key 2
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase text-muted-foreground">
                      incrementUses Mode
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="incrementOption"
                          checked={testIncrement === true}
                          onChange={() => setTestIncrement(true)}
                          className="accent-primary"
                        />
                        <span>true (Claim 1 Seat)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="incrementOption"
                          checked={testIncrement === false}
                          onChange={() => setTestIncrement(false)}
                          className="accent-primary"
                        />
                        <span>false (Silent Check)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={runPlaygroundVerify}
                    disabled={playgroundLoading}
                    className="brutal-btn bg-primary text-primary-foreground text-xs font-bold px-4 py-2 flex items-center gap-2 disabled:opacity-60"
                  >
                    <Play size={14} /> Send /verify Request
                  </button>
                  <button
                    onClick={runPlaygroundDecrement}
                    disabled={playgroundLoading}
                    className="brutal-btn bg-background hover:bg-muted text-xs font-bold px-4 py-2 flex items-center gap-2 disabled:opacity-60"
                  >
                    <RotateCcw size={14} /> Send /decrement (-1 Seat)
                  </button>
                </div>

                {playgroundResponse && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-muted-foreground">Server Response:</span>
                      <span className={`px-2 py-0.5 font-black uppercase rounded ${
                        playgroundStatus === 200 ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                      }`}>
                        HTTP {playgroundStatus}
                      </span>
                    </div>
                    <pre className="p-4 bg-zinc-950 text-zinc-100 font-mono text-xs brutal-border overflow-x-auto max-h-60">
                      <code>{JSON.stringify(playgroundResponse, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            </section>

            {/* ── SECTION 7: Sample Calculator App ─────────────────── */}
            <section id="sample-apps" className="space-y-4 pt-4 border-t-2 border-border">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-muted font-mono text-xs font-bold uppercase brutal-border">
                <Box size={12} /> Reference Implementation
              </div>
              <h2 className="font-heading font-black text-2xl tracking-tight">
                Complete Tkinter Calculator App
              </h2>
              <p className="text-sm text-muted-foreground">
                A complete desktop application demonstrating the entire license lifecycle is included directly in your repository at <code className="font-bold text-foreground">sample app/calculator.py</code>.
              </p>

              <div className="bg-card brutal-border p-6 space-y-4">
                <h4 className="font-heading font-bold text-sm">Features Demonstrated in Sample App:</h4>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc list-inside">
                  <li><strong>Single File Architecture:</strong> Complete Tkinter GUI calculator with embedded SDK class.</li>
                  <li><strong>Device Persistence:</strong> Saves activation token in <code className="text-foreground">license_config.json</code>. Subsequent boots open instantly without asking for key.</li>
                  <li><strong>Seat Limit (5/5):</strong> Explicitly blocks activation and outputs <em>"All keys used (5/5 activations reached)"</em>.</li>
                  <li><strong>Reset & Transfer:</strong> Includes a "Reset App ↺" modal with both <em>"Simulate New Device"</em> (testing seats 2-5) and <em>"Release Seat on Server"</em>.</li>
                </ul>

                <div className="pt-2 flex items-center gap-3">
                  <div className="bg-muted px-3 py-2 brutal-border font-mono text-xs flex-1 truncate">
                    python "sample app/calculator.py"
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
