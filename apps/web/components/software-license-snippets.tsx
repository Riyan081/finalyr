"use client";

import { useState } from "react";
import { Terminal, Copy, Check, Code, ShieldCheck, Cpu } from "lucide-react";
import { toast } from "sonner";

interface SoftwareLicenseSnippetsProps {
  apiBaseUrl?: string;
}

type TabKey = "python" | "javascript" | "extendscript" | "csharp" | "curl";

export default function SoftwareLicenseSnippets({ apiBaseUrl = "http://localhost:3002" }: SoftwareLicenseSnippetsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("python");
  const [copied, setCopied] = useState(false);

  const snippets: Record<TabKey, { title: string; language: string; filename: string; code: string; notes: string }> = {
    python: {
      title: "Python (Blender, PyQt, CLI)",
      language: "python",
      filename: "verify_license.py",
      notes: "Works in Blender Addons, PyQt/Tkinter desktop applications, and Python scripts.",
      code: `import urllib.request
import json

def verify_digistore_license(license_key, increment_seat=True):
    """
    Verifies a DigiStore software license key.
    Returns (is_valid, data_or_error_message).
    """
    url = "${apiBaseUrl}/api/licenses/verify"
    payload = {
        "licenseKey": license_key.strip(),
        "product_permalink": "your-product-slug", # optional: ensure key belongs to this software
        "incrementUses": increment_seat
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if res_data.get("success") and res_data.get("valid"):
                # License is valid and seat is registered!
                email = res_data.get("order", {}).get("customerEmail")
                seats = f"{res_data.get('uses')}/{res_data.get('maxUses')}"
                return True, f"Active for {email} ({seats} seats)"
            return False, res_data.get("message", "Invalid license key")
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode("utf-8"))
        return False, err_body.get("message", "License rejected")
    except Exception as e:
        return False, f"Network error: {str(e)}"

# Example Usage:
# valid, msg = verify_digistore_license("DIGI-XXXX-XXXX-XXXX")
# if valid:
#     unlock_pro_features()`,
    },
    javascript: {
      title: "JavaScript / TypeScript (Electron, VS Code)",
      language: "typescript",
      filename: "licenseChecker.ts",
      notes: "Ideal for Electron desktop apps, VS Code extensions, Raycast tools, and Web applications.",
      code: `interface LicenseVerifyResult {
  success: boolean;
  valid: boolean;
  uses: number;
  maxUses: number;
  message: string;
  order?: {
    customerEmail: string;
    customerName?: string;
  };
}

export async function verifyLicense(licenseKey: string): Promise<LicenseVerifyResult> {
  const response = await fetch("${apiBaseUrl}/api/licenses/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      licenseKey: licenseKey.trim(),
      incrementUses: true, // locks 1 device seat
    }),
  });

  const data = await response.json();
  if (data.valid) {
    // Save license status in local encrypted store
    localStorage.setItem("app_license_key", licenseKey);
    localStorage.setItem("app_licensed_user", data.order?.customerEmail || "");
  }
  return data;
}

export async function deactivateLicense(licenseKey: string) {
  // Call when user uninstalls app or clicks 'Deactivate License'
  return fetch("${apiBaseUrl}/api/licenses/decrement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenseKey }),
  }).then(r => r.json());
}`,
    },
    extendscript: {
      title: "Adobe ExtendScript (After Effects, Photoshop)",
      language: "javascript",
      filename: "DigiStoreActivation.jsx",
      notes: "For Adobe After Effects scripts, CEP panels, and Photoshop Actions/ScriptUI tools.",
      code: `// Inside your After Effects / Photoshop ScriptUI Panel
function checkDigiStoreLicense() {
  var savedKey = app.settings.haveSetting("MyAdobePlugin", "LicenseKey") 
    ? app.settings.getSetting("MyAdobePlugin", "LicenseKey") 
    : null;

  if (savedKey) {
    launchPluginFeatures(); // Already activated on this machine!
    return;
  }

  var key = prompt("Please enter your DigiStore License Key to activate:", "DIGI-");
  if (!key) return;

  // Perform background HTTP POST via system curl
  var endpoint = "${apiBaseUrl}/api/licenses/verify";
  var curlCmd = 'curl -s -X POST ' + endpoint + 
                ' -H "Content-Type: application/json"' +
                ' -d "{\\"licenseKey\\":\\"' + key.replace(/\\s+/g, '') + '\\",\\"incrementUses\\":true}"';

  var res = system.callSystem(curlCmd);

  if (res.indexOf('"valid":true') !== -1) {
    app.settings.saveSetting("MyAdobePlugin", "LicenseKey", key);
    alert("Activation successful! Plugin unlocked.");
    launchPluginFeatures();
  } else {
    alert("Activation failed! Invalid key, refunded, or seat limit exceeded.");
  }
}

function launchPluginFeatures() {
  // Your main animation, render, or photo grading tool runs here!
}

checkDigiStoreLicense();`,
    },
    csharp: {
      title: "C# / .NET (Windows Desktop, Unity)",
      language: "csharp",
      filename: "LicenseValidator.cs",
      notes: "For Windows desktop applications (WPF/WinForms/MAUI) and Unity game engine assets.",
      code: `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class DigiStoreLicense
{
    private static readonly HttpClient client = new HttpClient();

    public static async Task<bool> VerifyAsync(string licenseKey)
    {
        string endpoint = "${apiBaseUrl}/api/licenses/verify";
        var payload = new { licenseKey = licenseKey.Trim(), incrementUses = true };
        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync(endpoint, content);
            string responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);
            
            bool isValid = doc.RootElement.GetProperty("valid").GetBoolean();
            if (isValid)
            {
                // Access granted! Save license token locally
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"License check error: {ex.Message}");
        }
        return false;
    }
}`,
    },
    curl: {
      title: "cURL (REST API)",
      language: "bash",
      filename: "terminal_verify.sh",
      notes: "Standard HTTP endpoints compatible with any HTTP client or webhook.",
      code: `# 1. Verify and activate a seat on a new machine:
curl -X POST ${apiBaseUrl}/api/licenses/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "licenseKey": "DIGI-XXXX-XXXX-XXXX",
    "incrementUses": true
  }'

# 2. Deactivate / release a seat upon software uninstallation:
curl -X POST ${apiBaseUrl}/api/licenses/decrement \\
  -H "Content-Type: application/json" \\
  -d '{
    "licenseKey": "DIGI-XXXX-XXXX-XXXX"
  }'`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab].code);
    setCopied(true);
    toast.success("Code snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="brutal-card p-5 bg-card space-y-4 brutal-border">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-black text-base flex items-center gap-2">
              <Code size={18} className="text-primary" />
              Software License Verification Integration
            </h3>
            <span className="text-[10px] font-mono uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded font-black">
              Gumroad v2 API
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Copy and paste this snippet into your application or plugin to verify customer license keys at runtime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="brutal-btn bg-background hover:bg-muted text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Language Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b-2 border-border pb-2">
        {(Object.keys(snippets) as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`text-xs px-3 py-1.5 font-bold transition-all ${
              activeTab === key
                ? "bg-primary text-primary-foreground brutal-border"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            {snippets[key].title}
          </button>
        ))}
      </div>

      {/* Snippet Header & Notes */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
          <Terminal size={12} className="text-primary" />
          {snippets[activeTab].filename}
        </span>
        <span className="text-[11px] italic">{snippets[activeTab].notes}</span>
      </div>

      {/* Code Block */}
      <div className="relative bg-zinc-950 text-zinc-100 p-4 brutal-border font-mono text-xs overflow-x-auto max-h-72 leading-relaxed selection:bg-primary selection:text-primary-foreground">
        <pre>{snippets[activeTab].code}</pre>
      </div>

      {/* Info Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-2.5 bg-muted/40 brutal-border text-xs flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
          <span>
            <strong>Automatic Revocation:</strong> Refunded orders and disabled keys automatically fail verification.
          </span>
        </div>
        <div className="p-2.5 bg-muted/40 brutal-border text-xs flex items-center gap-2">
          <Cpu size={16} className="text-primary shrink-0" />
          <span>
            <strong>Seat Enforcement:</strong> Each key supports up to <strong>5 device seats</strong> by default.
          </span>
        </div>
      </div>
    </div>
  );
}
