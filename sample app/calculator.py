#!/usr/bin/env python3
"""
DigiStore Sample App: License-Protected Calculator
===================================================
A standalone desktop application demonstrating how developers can protect
any software using DigiStore's Gumroad-compatible License API.
"""

import os
import sys
import json
import math
import tkinter as tk
from tkinter import messagebox
from typing import Optional, Dict, Any


# ====================================================================================================
# ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
# ║  🚀 DIGISTORE LICENSE SDK SNIPPET — COPY & PASTE THIS INTO YOUR OWN APPLICATION                  ║
# ║                                                                                                  ║
# ║  YES! Just like Gumroad's license verification, developers only need to copy the snippet below   ║
# ║  into ANY Python software (desktop app, CLI tool, AI script, automation, Blender add-on, etc.).  ║
# ║                                                                                                  ║
# ║  WHAT THIS SNIPPET PROVIDES:                                                                     ║
# ║  • 1-line Key Activation & Verification (POST /api/licenses/verify)                              ║
# ║  • Automatic Device Persistence (closes without asking for key again!)                           ║
# ║  • Seat Limit Enforcement (detects 5/5 seats used and flags 'all_keys_used')                     ║
# ║  • In-App Seat Release & Reset (POST /api/licenses/decrement)                                    ║
# ║  • ZERO External Dependencies (works out-of-the-box with urllib or requests)                     ║
# ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
# ====================================================================================================
#
# 📋 QUICK-START DEVELOPER USAGE EXAMPLE:
# ----------------------------------------------------------------------------------------------------
# from calculator import DigiStoreLicense   # Or copy the DigiStoreLicense class directly
#
# client = DigiStoreLicense(api_url="http://localhost:3002")
#
# # 1. Check if already activated on this machine (no re-prompt needed):
# if client.is_activated():
#     print(f"✓ Software unlocked for product: {client.get_product_name()}")
#     print(f"✓ Active Key: {client.get_masked_key()} (Seats: {client.get_seats_info()})")
# else:
#     # 2. First-time prompt: ask user for key and activate:
#     result = client.activate("DIGI-XXXX-XXXX-XXXX")
#     if result["valid"]:
#         print(f"✓ Activation successful! ({result['uses']}/{result['max_uses']} seats in use)")
#     elif result["all_keys_used"]:
#         print("❌ All keys used! Maximum 5/5 seats reached. Deactivate another device first.")
#     else:
#         print(f"❌ Activation failed: {result['message']}")
#
# # 3. When user clicks 'Reset App' or uninstalls:
# # client.deactivate()  # Releases 1 seat on DigiStore and clears local cache
# ====================================================================================================

# Try importing requests, fallback to standard library urllib (zero dependencies)
try:
    import requests
    _HAS_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.error
    _HAS_REQUESTS = False


class DigiStoreLicense:
    """
    Drop-in DigiStore License Client (Gumroad v2 API compatible).
    Copy & paste this class into any Python script or desktop application.
    """
    def __init__(self, api_url: str = "http://localhost:3002", config_filename: str = "license_config.json"):
        self.api_url = api_url.rstrip("/")
        self.config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), config_filename)
        self.cached_data: Optional[Dict[str, Any]] = self._load_cache()

    # ── Local Persistence (Device Caching) ──────────────────────────────────────────

    def _load_cache(self) -> Optional[Dict[str, Any]]:
        if not os.path.exists(self.config_path):
            return None
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("license_key"):
                    return data
        except Exception:
            pass
        return None

    def _save_cache(self, data: Dict[str, Any]) -> None:
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            self.cached_data = data
        except Exception as e:
            print(f"[DigiStore] Warning: Failed to save license cache: {e}")

    def _clear_cache(self) -> None:
        if os.path.exists(self.config_path):
            try:
                os.remove(self.config_path)
            except Exception as e:
                print(f"[DigiStore] Warning: Failed to delete license cache: {e}")
        self.cached_data = None

    # ── Inspection Helpers ──────────────────────────────────────────────────────────

    def is_activated(self) -> bool:
        """Return True if this machine has a saved valid activation."""
        return bool(self.cached_data and self.cached_data.get("license_key"))

    def get_license_key(self) -> str:
        return self.cached_data.get("license_key", "") if self.cached_data else ""

    def get_masked_key(self) -> str:
        key = self.get_license_key()
        if len(key) >= 14:
            return f"{key[:9]}...{key[-4:]}"
        return key

    def get_product_name(self) -> str:
        return self.cached_data.get("product_name", "Licensed Software") if self.cached_data else ""

    def get_seats_info(self) -> str:
        if not self.cached_data:
            return ""
        uses = self.cached_data.get("uses", 1)
        max_uses = self.cached_data.get("max_uses", 5)
        return f"{uses}/{max_uses}"

    # ── Live Status Sync (Server Refresh) ─────────────────────────────────────────

    def refresh_status(self) -> Dict[str, Any]:
        """
        Query DigiStore server to get the live, updated seat count for the cached key,
        WITHOUT incrementing the seat count (incrementUses=False).
        Updates local cache with the latest server state so the UI never displays stale seats.
        """
        key = self.get_license_key()
        if not key:
            return {"valid": False, "message": "No key cached"}

        payload = {"licenseKey": key, "incrementUses": False}
        status_code, res = self._post_json("/api/licenses/verify", payload)
        data = res.get("data") if (isinstance(res.get("data"), dict) and res.get("success") is True) else res

        uses = res.get("uses") if res.get("uses") is not None else data.get("uses")
        max_uses = res.get("maxUses") or data.get("maxUses") or 5
        is_valid = res.get("valid") is True or data.get("valid") is True or (status_code in (200, 201) and res.get("success") is True)

        if is_valid and self.cached_data:
            if uses is not None:
                self.cached_data["uses"] = int(uses)
                self.cached_data["max_uses"] = int(max_uses)
                self._save_cache(self.cached_data)
            return {"valid": True, "uses": uses, "max_uses": max_uses}
        return {"valid": False, "message": res.get("message", "Validation failed")}

    # ── HTTP API Dispatcher ────────────────────────────────────────────────────────

    def _post_json(self, endpoint: str, payload: dict) -> tuple[int, dict]:
        url = f"{self.api_url}{endpoint}"
        if _HAS_REQUESTS:
            try:
                r = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=8)
                try:
                    return r.status_code, r.json()
                except Exception:
                    return r.status_code, {"message": r.text}
            except requests.exceptions.ConnectionError:
                return 0, {"message": f"Could not reach DigiStore server at {self.api_url}. Is the backend running?"}
            except Exception as e:
                return -1, {"message": str(e)}
        else:
            try:
                req_data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=req_data,
                    headers={"Content-Type": "application/json", "User-Agent": "DigiStore-Client/1.0"},
                    method="POST",
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    status_code = response.getcode()
                    raw = response.read().decode("utf-8")
                    try:
                        return status_code, json.loads(raw)
                    except Exception:
                        return status_code, {"message": raw}
            except urllib.error.HTTPError as he:
                raw = he.read().decode("utf-8")
                try:
                    return he.code, json.loads(raw)
                except Exception:
                    return he.code, {"message": raw}
            except urllib.error.URLError:
                return 0, {"message": f"Could not reach DigiStore server at {self.api_url}. Is the backend running?"}
            except Exception as e:
                return -1, {"message": str(e)}

    # ── Primary Actions (Activate & Deactivate) ────────────────────────────────────

    def activate(self, license_key: str, product_id_or_slug: Optional[str] = None) -> Dict[str, Any]:
        """
        Verify and activate a license key on the DigiStore server.
        - Increments the server seat count by 1.
        - Enforces 5/5 seat limit (reports 'all_keys_used': True).
        - Saves to local cache upon success.
        """
        clean_key = license_key.strip().upper()
        if not clean_key:
            return {"valid": False, "all_keys_used": False, "message": "License key cannot be empty."}

        payload: Dict[str, Any] = {"licenseKey": clean_key, "incrementUses": True}
        if product_id_or_slug:
            payload["productId"] = product_id_or_slug

        status_code, res = self._post_json("/api/licenses/verify", payload)

        # Handle both top-level and nested 'data' response payloads
        data = res.get("data") if (isinstance(res.get("data"), dict) and res.get("success") is True) else res
        is_valid = res.get("valid") is True or data.get("valid") is True or (status_code in (200, 201) and res.get("success") is True)

        uses = res.get("uses") if res.get("uses") is not None else data.get("uses", 1)
        max_uses = res.get("maxUses") or data.get("maxUses") or 5

        # Success (Key valid & seat claimed)
        if status_code in (200, 201) and is_valid:
            prod = data.get("product") or res.get("product", {})
            prod_name = prod.get("name", "DigiStore Software")

            cache_payload = {
                "license_key": clean_key,
                "product_name": prod_name,
                "product_id": prod.get("id", ""),
                "uses": int(uses),
                "max_uses": int(max_uses),
                "api_url": self.api_url,
                "activated_at": str(data.get("order", {}).get("createdAt", "")),
            }
            self._save_cache(cache_payload)

            return {
                "valid": True,
                "all_keys_used": False,
                "uses": int(uses),
                "max_uses": int(max_uses),
                "product_name": prod_name,
                "message": f"License verified successfully ({uses} of {max_uses} keys used)",
            }

        # Seat limit reached (5/5 keys used)
        raw_msg = f"{res.get('message', '')} {data.get('message', '')}"
        is_limit_reached = (
            (max_uses > 0 and int(uses) >= int(max_uses))
            or "Activation limit exceeded" in raw_msg
            or "seats in use" in raw_msg
            or "all keys used" in raw_msg.lower()
        )

        if is_limit_reached:
            return {
                "valid": False,
                "all_keys_used": True,
                "uses": int(uses) or 5,
                "max_uses": int(max_uses) or 5,
                "message": f"All keys used ({uses or 5}/{max_uses or 5} activations reached). Please deactivate an existing device first.",
            }

        # Invalid, revoked, or network error
        err_msg = res.get("message") or res.get("error") or data.get("message") or "License verification failed."
        return {
            "valid": False,
            "all_keys_used": False,
            "uses": uses,
            "max_uses": max_uses,
            "message": err_msg,
        }

    def reset_local_only(self) -> None:
        """
        Clears local machine cache WITHOUT decrementing the server seat count.
        Allows testing multiple device activations from a single test machine.
        """
        self._clear_cache()

    def deactivate(self) -> Dict[str, Any]:
        """
        Deactivate this machine on the DigiStore server and delete local cache.
        - Calls POST /api/licenses/decrement to release 1 seat.
        - Deletes license_config.json so the app prompts for key on next run.
        """
        key = self.get_license_key()
        server_message = "Local license cache removed."

        if key:
            status_code, res = self._post_json("/api/licenses/decrement", {"licenseKey": key})
            if status_code in (200, 201):
                server_message = (
                    res.get("message")
                    or res.get("data", {}).get("message")
                    or "Device seat deactivated on server."
                )

        self._clear_cache()
        return {"success": True, "message": server_message}


# ====================================================================================================
# ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
# ║  🛑 END OF DIGISTORE LICENSE SDK SNIPPET                                                         ║
# ║  Everything above this box is the reusable licensing client that you can copy to any app.        ║
# ║  The code below is the Sample Tkinter Calculator that CONSUMES this SDK client.                  ║
# ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
# ====================================================================================================


class DigiStoreCalculatorApp(tk.Tk):
    """
    Tkinter Calculator App using the highlighted DigiStoreLicense SDK above.
    """
    def __init__(self):
        super().__init__()
        self.title("DigiStore Calculator — License Protected")
        self.geometry("420x620")
        self.minsize(380, 560)
        self.configure(bg="#121212")

        # ── Initialize the DigiStore License Client ──
        self.license_client = DigiStoreLicense(api_url="http://localhost:3002")

        self.center_window()

        # Check if license is already cached (persisted) on this machine
        if self.license_client.is_activated():
            # Refresh live status from server silently so seat counts are always live
            try:
                self.license_client.refresh_status()
            except Exception:
                pass
            # Does NOT ask for key again! Goes straight to calculator
            self.show_calculator_view()
        else:
            # First launch: asks for license key
            self.show_activation_view()

    def center_window(self):
        self.update_idletasks()
        w = 420
        h = 620
        x = (self.winfo_screenwidth() // 2) - (w // 2)
        y = (self.winfo_screenheight() // 2) - (h // 2)
        self.geometry(f"{w}x{h}+{x}+{y}")

    def clear_view(self):
        for widget in self.winfo_children():
            widget.destroy()

    # ─── License Activation Screen ──────────────────────────────────────────────

    def show_activation_view(self, initial_error: str = ""):
        self.clear_view()
        self.title("DigiStore License Verification")

        main_frame = tk.Frame(self, bg="#121212", padx=28, pady=24)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Header Badge
        badge_frame = tk.Frame(main_frame, bg="#1E1E1E", highlightthickness=1, highlightbackground="#333333", padx=10, pady=4)
        badge_frame.pack(pady=(0, 16))
        tk.Label(
            badge_frame,
            text="🔒 SOFTWARE LICENSE REQUIRED",
            font=("Segoe UI", 8, "bold"),
            fg="#F43F5E",
            bg="#1E1E1E",
        ).pack()

        # App Title
        tk.Label(
            main_frame,
            text="DigiStore Calculator",
            font=("Segoe UI", 20, "bold"),
            fg="#FFFFFF",
            bg="#121212",
        ).pack(pady=(0, 4))

        tk.Label(
            main_frame,
            text="Please activate your license key to unlock this software.",
            font=("Segoe UI", 9),
            fg="#9CA3AF",
            bg="#121212",
            wraplength=340,
            justify=tk.CENTER,
        ).pack(pady=(0, 20))

        # Input Card
        card = tk.Frame(main_frame, bg="#1E1E1E", highlightthickness=1, highlightbackground="#2A2A2A", padx=20, pady=18)
        card.pack(fill=tk.X, pady=(0, 12))

        # License Key Label
        tk.Label(
            card,
            text="LICENSE KEY",
            font=("Segoe UI", 8, "bold"),
            fg="#9CA3AF",
            bg="#1E1E1E",
            anchor="w",
        ).pack(fill=tk.X, pady=(0, 6))

        # Key Input Entry
        self.key_var = tk.StringVar()
        self.key_entry = tk.Entry(
            card,
            textvariable=self.key_var,
            font=("Consolas", 12, "bold"),
            bg="#121212",
            fg="#FFFFFF",
            insertbackground="#F43F5E",
            relief=tk.FLAT,
            highlightthickness=1,
            highlightbackground="#404040",
            highlightcolor="#F43F5E",
            justify=tk.CENTER,
        )
        self.key_entry.pack(fill=tk.X, ipady=8, pady=(0, 10))
        self.key_entry.focus_set()

        # Auto uppercase input
        def on_key_change(*args):
            raw = self.key_var.get().upper()
            cleaned = "".join(c for c in raw if c.isalnum() or c == "-")
            if cleaned != raw:
                self.key_var.set(cleaned)
        self.key_var.trace_add("write", on_key_change)

        # API Server URL
        tk.Label(
            card,
            text="DIGISTORE API SERVER",
            font=("Segoe UI", 7, "bold"),
            fg="#6B7280",
            bg="#1E1E1E",
            anchor="w",
        ).pack(fill=tk.X, pady=(4, 3))

        self.url_var = tk.StringVar(value=self.license_client.api_url)
        url_entry = tk.Entry(
            card,
            textvariable=self.url_var,
            font=("Consolas", 9),
            bg="#121212",
            fg="#9CA3AF",
            relief=tk.FLAT,
            highlightthickness=1,
            highlightbackground="#2A2A2A",
            highlightcolor="#404040",
        )
        url_entry.pack(fill=tk.X, ipady=4, pady=(0, 4))

        # Status / Error Label Area
        self.status_label = tk.Label(
            main_frame,
            text=initial_error,
            font=("Segoe UI", 9, "bold"),
            fg="#EF4444",
            bg="#121212",
            wraplength=340,
            justify=tk.CENTER,
        )
        self.status_label.pack(pady=8)

        # Activate Button
        self.activate_btn = tk.Button(
            main_frame,
            text="Activate & Launch Software →",
            font=("Segoe UI", 10, "bold"),
            bg="#F43F5E",
            fg="#FFFFFF",
            activebackground="#E11D48",
            activeforeground="#FFFFFF",
            relief=tk.FLAT,
            cursor="hand2",
            command=self.handle_activation,
        )
        self.activate_btn.pack(fill=tk.X, ipady=10, pady=(4, 16))

        self.bind("<Return>", lambda e: self.handle_activation())

        # Help / Instructions Card
        help_card = tk.Frame(main_frame, bg="#171717", highlightthickness=1, highlightbackground="#262626", padx=14, pady=10)
        help_card.pack(fill=tk.X)

        tk.Label(
            help_card,
            text="ℹ️ Developer Drop-in Verification",
            font=("Segoe UI", 8, "bold"),
            fg="#D1D5DB",
            bg="#171717",
            anchor="w",
        ).pack(fill=tk.X)

        help_text = (
            "• Built using the highlighted DigiStoreLicense class above.\n"
            "• Keys support up to 5 activations (5/5 seats).\n"
            "• After activation, closes without asking for key again.\n"
            "• Click 'Reset App' inside to deactivate and free up a seat."
        )
        tk.Label(
            help_card,
            text=help_text,
            font=("Segoe UI", 8),
            fg="#6B7280",
            bg="#171717",
            justify=tk.LEFT,
            anchor="w",
        ).pack(fill=tk.X, pady=(4, 0))

    def handle_activation(self):
        """Invoke DigiStoreLicense.activate() to claim seat on server."""
        key = self.key_var.get().strip().upper()
        api_url = self.url_var.get().strip().rstrip("/")
        self.license_client.api_url = api_url

        if not key:
            self.status_label.config(text="Please enter a license key.", fg="#EF4444")
            return

        self.status_label.config(text="Contacting DigiStore License Server...", fg="#FBBF24")
        self.activate_btn.config(state=tk.DISABLED, text="Validating...")
        self.update_idletasks()

        # ── Call SDK Activate Method ──
        res = self.license_client.activate(key)

        self.activate_btn.config(state=tk.NORMAL, text="Activate & Launch Software →")

        # ── Case 1: Valid Activation ──
        if res.get("valid"):
            uses = res.get("uses", 1)
            max_uses = res.get("max_uses", 5)
            messagebox.showinfo(
                "License Activated",
                f"License verified successfully!\n\n"
                f"Product: {res.get('product_name')}\n"
                f"Seats in use: {uses} of {max_uses} keys used\n\n"
                f"The application is now unlocked."
            )
            self.show_calculator_view()
            return

        # ── Case 2: 5/5 Seat Limit ("All keys used") ──
        if res.get("all_keys_used"):
            self.status_label.config(text=res["message"], fg="#EF4444")
            messagebox.showerror(
                "All Keys Used",
                f"Activation failed: all keys used!\n\n"
                f"This license has reached its maximum seat limit ({res.get('uses')}/{res.get('max_uses')} in use).\n"
                f"Please deactivate an existing installation or click 'Reset App' on another device."
            )
            return

        # ── Case 3: Invalid / Revoked / Network ──
        self.status_label.config(text=f"❌ {res.get('message')}", fg="#EF4444")

    # ─── Calculator Screen ──────────────────────────────────────────────────────

    def show_calculator_view(self):
        self.clear_view()
        self.title("DigiStore Calculator")
        self.unbind("<Return>")

        self.calc_expression = ""
        self.new_number_flag = True

        main_frame = tk.Frame(self, bg="#121212", padx=16, pady=12)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # ── Top License Header Bar ──
        license_bar = tk.Frame(main_frame, bg="#1E1E1E", highlightthickness=1, highlightbackground="#2A2A2A", padx=12, pady=8)
        license_bar.pack(fill=tk.X, pady=(0, 12))

        # Left: License Status pill
        info_subframe = tk.Frame(license_bar, bg="#1E1E1E")
        info_subframe.pack(side=tk.LEFT, fill=tk.Y)

        masked_key = self.license_client.get_masked_key()
        prod_name = self.license_client.get_product_name()
        seats_info = self.license_client.get_seats_info()

        tk.Label(
            info_subframe,
            text=f"● {masked_key}",
            font=("Segoe UI", 9, "bold"),
            fg="#10B981",  # Emerald active indicator
            bg="#1E1E1E",
        ).pack(anchor="w")

        self.seats_label = tk.Label(
            info_subframe,
            text=f"{prod_name[:24]} ({seats_info} keys used)",
            font=("Segoe UI", 7),
            fg="#9CA3AF",
            bg="#1E1E1E",
        )
        self.seats_label.pack(anchor="w")

        # Right: Reset App Button
        reset_btn = tk.Button(
            license_bar,
            text="Reset App ↺",
            font=("Segoe UI", 8, "bold"),
            bg="#27272A",
            fg="#EF4444",
            activebackground="#EF4444",
            activeforeground="#FFFFFF",
            relief=tk.FLAT,
            cursor="hand2",
            padx=8,
            pady=3,
            command=self.handle_reset_app,
        )
        reset_btn.pack(side=tk.RIGHT)

        # ── Calculator Display Area ──
        display_frame = tk.Frame(main_frame, bg="#1E1E1E", highlightthickness=1, highlightbackground="#2A2A2A", padx=16, pady=12)
        display_frame.pack(fill=tk.X, pady=(0, 12))

        self.history_label = tk.Label(
            display_frame,
            text="",
            font=("Segoe UI", 10),
            fg="#6B7280",
            bg="#1E1E1E",
            anchor="e",
        )
        self.history_label.pack(fill=tk.X)

        self.display_var = tk.StringVar(value="0")
        self.display_label = tk.Label(
            display_frame,
            textvariable=self.display_var,
            font=("Consolas", 28, "bold"),
            fg="#FFFFFF",
            bg="#1E1E1E",
            anchor="e",
        )
        self.display_label.pack(fill=tk.X)

        # ── Keypad Grid ──
        keypad = tk.Frame(main_frame, bg="#121212")
        keypad.pack(fill=tk.BOTH, expand=True)

        for i in range(5):
            keypad.rowconfigure(i, weight=1, uniform="row")
        for j in range(4):
            keypad.columnconfigure(j, weight=1, uniform="col")

        buttons = [
            ("C",  0, 0, "special"),
            ("CE", 0, 1, "special"),
            ("⌫",  0, 2, "special"),
            ("÷",  0, 3, "operator"),

            ("7",  1, 0, "number"),
            ("8",  1, 1, "number"),
            ("9",  1, 2, "number"),
            ("×",  1, 3, "operator"),

            ("4",  2, 0, "number"),
            ("5",  2, 1, "number"),
            ("6",  2, 2, "number"),
            ("−",  2, 3, "operator"),

            ("1",  3, 0, "number"),
            ("2",  3, 1, "number"),
            ("3",  3, 2, "number"),
            ("+",  3, 3, "operator"),

            ("±",  4, 0, "number"),
            ("0",  4, 1, "number"),
            (".",  4, 2, "number"),
            ("=",  4, 3, "equals"),
        ]

        styles = {
            "number": {"bg": "#262626", "fg": "#FFFFFF", "activebackground": "#333333", "activeforeground": "#FFFFFF", "font": ("Segoe UI", 13, "bold")},
            "operator": {"bg": "#1E1E1E", "fg": "#F43F5E", "activebackground": "#2E1065", "activeforeground": "#F43F5E", "font": ("Segoe UI", 14, "bold")},
            "special": {"bg": "#1E1E1E", "fg": "#FBBF24", "activebackground": "#374151", "activeforeground": "#FBBF24", "font": ("Segoe UI", 11, "bold")},
            "equals": {"bg": "#F43F5E", "fg": "#FFFFFF", "activebackground": "#BE123C", "activeforeground": "#FFFFFF", "font": ("Segoe UI", 15, "bold")},
        }

        for label, r, c, stype in buttons:
            cfg = styles[stype]
            btn = tk.Button(
                keypad,
                text=label,
                font=cfg["font"],
                bg=cfg["bg"],
                fg=cfg["fg"],
                activebackground=cfg["activebackground"],
                activeforeground=cfg["activeforeground"],
                relief=tk.FLAT,
                cursor="hand2",
                command=lambda lbl=label: self.on_calc_button_click(lbl),
            )
            btn.grid(row=r, column=c, padx=3, pady=3, sticky="nsew")

        self.bind("<Key>", self.on_key_press)

    # ─── Calculator Logic ───────────────────────────────────────────────────────

    def on_calc_button_click(self, label: str):
        current = self.display_var.get()

        if label in "0123456789":
            if self.new_number_flag or current == "0":
                self.display_var.set(label)
                self.new_number_flag = False
            else:
                self.display_var.set(current + label)

        elif label == ".":
            if self.new_number_flag:
                self.display_var.set("0.")
                self.new_number_flag = False
            elif "." not in current:
                self.display_var.set(current + ".")

        elif label == "±":
            if current != "0":
                if current.startswith("-"):
                    self.display_var.set(current[1:])
                else:
                    self.display_var.set("-" + current)

        elif label == "⌫":
            if not self.new_number_flag and len(current) > 1:
                self.display_var.set(current[:-1])
            else:
                self.display_var.set("0")
                self.new_number_flag = True

        elif label == "CE":
            self.display_var.set("0")
            self.new_number_flag = True

        elif label == "C":
            self.display_var.set("0")
            self.history_label.config(text="")
            self.calc_expression = ""
            self.new_number_flag = True

        elif label in ("+", "−", "×", "÷"):
            op_symbol = label
            py_op = {"+": "+", "−": "-", "×": "*", "÷": "/"}[label]
            self.calc_expression = f"{current} {py_op} "
            self.history_label.config(text=f"{current} {op_symbol}")
            self.new_number_flag = True

        elif label == "=":
            if not self.calc_expression:
                return

            full_expr = self.calc_expression + current
            try:
                safe_expr = full_expr.replace(" ", "")
                for char in safe_expr:
                    if char not in "0123456789+-*/.()":
                        raise ValueError("Invalid character")

                result = eval(safe_expr, {"__builtins__": None}, {})
                if isinstance(result, float) and result.is_integer():
                    result = int(result)

                res_str = str(result)
                if len(res_str) > 14 and "." in res_str:
                    res_str = f"{result:.8f}".rstrip("0").rstrip(".")

                self.history_label.config(text=full_expr.replace("*", "×").replace("/", "÷") + " =")
                self.display_var.set(res_str)
                self.calc_expression = ""
                self.new_number_flag = True
            except ZeroDivisionError:
                self.display_var.set("Cannot divide by 0")
                self.new_number_flag = True
            except Exception:
                self.display_var.set("Error")
                self.new_number_flag = True

    def on_key_press(self, event):
        key = event.char
        if key in "0123456789.":
            self.on_calc_button_click(key)
        elif key == "+":
            self.on_calc_button_click("+")
        elif key == "-":
            self.on_calc_button_click("−")
        elif key == "*":
            self.on_calc_button_click("×")
        elif key == "/":
            self.on_calc_button_click("÷")
        elif key in ("\r", "="):
            self.on_calc_button_click("=")
        elif event.keysym == "BackSpace":
            self.on_calc_button_click("⌫")
        elif event.keysym == "Escape":
            self.on_calc_button_click("C")

    # ─── Reset App (License Deactivation) ───────────────────────────────────────

    def handle_reset_app(self):
        """
        Handle 'Reset App' button click.
        Presents two options:
        1. Free Seat & Deactivate (frees 1 seat on the DigiStore server).
        2. Simulate New Device (clears local cache ONLY so you can test seats 2/5, 3/5, 4/5, 5/5 and 'All keys used'!).
        """
        dialog = tk.Toplevel(self)
        dialog.title("Reset Application & License")
        dialog.geometry("380x300")
        dialog.minsize(360, 280)
        dialog.configure(bg="#1A1A1A")
        dialog.transient(self)
        dialog.grab_set()

        # Center dialog relative to main window
        self.update_idletasks()
        dx = self.winfo_x() + (self.winfo_width() // 2) - 190
        dy = self.winfo_y() + (self.winfo_height() // 2) - 150
        dialog.geometry(f"+{max(0, dx)}+{max(0, dy)}")

        tk.Label(
            dialog,
            text="Application & License Reset",
            font=("Segoe UI", 12, "bold"),
            fg="#FFFFFF",
            bg="#1A1A1A",
        ).pack(pady=(16, 6))

        tk.Label(
            dialog,
            text=(
                "Choose how you want to reset this application:\n\n"
                "• Simulate New Device: Clears local cache only (keeps seat claimed), "
                "allowing you to test seats 2/5, 3/5, 4/5, 5/5 and 'All keys used'!\n\n"
                "• Release Seat on Server: Calls /decrement to free up 1 seat."
            ),
            font=("Segoe UI", 8),
            fg="#9CA3AF",
            bg="#1A1A1A",
            wraplength=340,
            justify=tk.LEFT,
        ).pack(padx=20, pady=(0, 14))

        btn_frame = tk.Frame(dialog, bg="#1A1A1A")
        btn_frame.pack(fill=tk.X, padx=20, pady=(0, 12))

        def do_simulate_new_device():
            dialog.destroy()
            self.license_client.reset_local_only()
            messagebox.showinfo(
                "Local App Reset (Simulate New Device)",
                "Local cache cleared without freeing server seats.\n\n"
                "The server seat remains claimed. When you activate again with the same key, "
                "it will claim the NEXT seat (e.g. 2/5, 3/5, etc.) so you can test reaching the 5/5 limit!"
            )
            self.show_activation_view(initial_error="Simulating new device. Activate key to claim next seat.")

        def do_deactivate():
            dialog.destroy()
            deact_res = self.license_client.deactivate()
            messagebox.showinfo(
                "Seat Released & App Reset",
                f"Your device seat has been released on DigiStore.\n\n"
                f"Server: {deact_res.get('message')}\n\n"
                f"The app will now prompt for a license key."
            )
            self.show_activation_view(initial_error="Application reset and seat released.")

        # Button 1: Simulate New Device (Hero action for testing 5/5 seats!)
        sim_btn = tk.Button(
            btn_frame,
            text="🧪 Simulate New Device (Test Next Seat: 2/5, 3/5... 5/5)",
            font=("Segoe UI", 9, "bold"),
            bg="#2563EB",
            fg="#FFFFFF",
            activebackground="#1D4ED8",
            activeforeground="#FFFFFF",
            relief=tk.FLAT,
            cursor="hand2",
            pady=8,
            command=do_simulate_new_device,
        )
        sim_btn.pack(fill=tk.X, pady=(0, 8))

        # Button 2: Free Seat & Deactivate
        deact_btn = tk.Button(
            btn_frame,
            text="🔓 Release Seat on Server & Reset (-1 Seat)",
            font=("Segoe UI", 8, "bold"),
            bg="#27272A",
            fg="#EF4444",
            activebackground="#EF4444",
            activeforeground="#FFFFFF",
            relief=tk.FLAT,
            cursor="hand2",
            pady=6,
            command=do_deactivate,
        )
        deact_btn.pack(fill=tk.X, pady=(0, 8))

        # Button 3: Cancel
        cancel_btn = tk.Button(
            btn_frame,
            text="Cancel",
            font=("Segoe UI", 8),
            bg="#1A1A1A",
            fg="#9CA3AF",
            relief=tk.FLAT,
            cursor="hand2",
            command=dialog.destroy,
        )
        cancel_btn.pack(fill=tk.X)


# ─── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = DigiStoreCalculatorApp()
    app.mainloop()
