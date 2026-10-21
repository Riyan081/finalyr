"""
CineGrade Pro — DigiStore License Verification Demo Client
=========================================================
This is a standalone Python desktop application designed to demonstrate
real-time DigiStore (Gumroad-style) software license key verification.

Features demonstrated:
1. Contacting http://localhost:3002/api/licenses/verify
2. Real-time seat registration (e.g. 1/5 seats used)
3. Dynamic unlocking of Pro software features upon valid key check
4. Deactivation / Seat release (http://localhost:3002/api/licenses/decrement)
5. Zero dependencies — runs out of the box with standard Python 3 (tkinter).
"""

import tkinter as tk
from tkinter import ttk, messagebox
import urllib.request
import urllib.error
import json
import threading

DEFAULT_API_URL = "http://localhost:3002"

class CineGradeProApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("🎬 CineGrade Pro — Video Suite (DigiStore Demo)")
        self.geometry("680x760")
        self.minsize(620, 700)
        self.configure(bg="#0F172A") # Dark slate background

        self.license_data = None
        self.is_licensed = False

        self._setup_styles()
        self._build_ui()

    def _setup_styles(self):
        self.style = ttk.Style(self)
        try:
            self.style.theme_use("clam")
        except Exception:
            pass

    def _build_ui(self):
        # Header banner
        header_frame = tk.Frame(self, bg="#1E293B", padx=20, pady=16)
        header_frame.pack(fill=tk.X)

        title_lbl = tk.Label(
            header_frame,
            text="🎬 CineGrade Pro v3.4",
            font=("Segoe UI", 18, "bold"),
            fg="#F8FAFC",
            bg="#1E293B"
        )
        title_lbl.pack(anchor="w")

        subtitle_lbl = tk.Label(
            header_frame,
            text="Desktop Client with DigiStore Software License DRM Integration",
            font=("Segoe UI", 10),
            fg="#94A3B8",
            bg="#1E293B"
        )
        subtitle_lbl.pack(anchor="w", pady=(2, 0))

        # Main Scrollable / Padded Container
        container = tk.Frame(self, bg="#0F172A", padx=24, pady=16)
        container.pack(fill=tk.BOTH, expand=True)

        # License Status Badge Card
        self.status_card = tk.Frame(container, bg="#334155", bd=2, relief="solid", padx=16, pady=14)
        self.status_card.pack(fill=tk.X, pady=(0, 16))

        self.status_title = tk.Label(
            self.status_card,
            text="🔒 TRIAL / UNLICENSED MODE",
            font=("Segoe UI", 12, "bold"),
            fg="#F59E0B", # Amber
            bg="#334155"
        )
        self.status_title.pack(anchor="w")

        self.status_desc = tk.Label(
            self.status_card,
            text="Features are locked. 4K export and batch processing require an active DigiStore license.",
            font=("Segoe UI", 9),
            fg="#CBD5E1",
            bg="#334155",
            wraplength=600,
            justify="left"
        )
        self.status_desc.pack(anchor="w", pady=(4, 0))

        self.license_info_lbl = tk.Label(
            self.status_card,
            text="",
            font=("Consolas", 9),
            fg="#38BDF8",
            bg="#334155",
            justify="left"
        )
        self.license_info_lbl.pack(anchor="w", pady=(6, 0))

        # License Key Input Card
        input_card = tk.Frame(container, bg="#1E293B", bd=2, relief="solid", padx=16, pady=16)
        input_card.pack(fill=tk.X, pady=(0, 16))

        key_label = tk.Label(
            input_card,
            text="DigiStore License Key:",
            font=("Segoe UI", 10, "bold"),
            fg="#F8FAFC",
            bg="#1E293B"
        )
        key_label.pack(anchor="w")

        key_hint = tk.Label(
            input_card,
            text="Format: DIGI-XXXX-XXXX-XXXX (obtained after purchasing from the web store)",
            font=("Segoe UI", 8),
            fg="#64748B",
            bg="#1E293B"
        )
        key_hint.pack(anchor="w", pady=(1, 6))

        self.key_entry = tk.Entry(
            input_card,
            font=("Consolas", 12, "bold"),
            bg="#0F172A",
            fg="#F8FAFC",
            insertbackground="#38BDF8",
            relief="solid",
            bd=1
        )
        self.key_entry.pack(fill=tk.X, pady=(0, 10), ipady=5)
        self.key_entry.insert(0, "")

        # Options row (Server URL & Seat checkbox)
        opts_frame = tk.Frame(input_card, bg="#1E293B")
        opts_frame.pack(fill=tk.X, pady=(0, 12))

        url_label = tk.Label(opts_frame, text="API Host:", font=("Segoe UI", 8), fg="#94A3B8", bg="#1E293B")
        url_label.pack(side=tk.LEFT)

        self.url_entry = tk.Entry(opts_frame, font=("Segoe UI", 8), bg="#0F172A", fg="#CBD5E1", width=25, relief="solid", bd=1)
        self.url_entry.insert(0, DEFAULT_API_URL)
        self.url_entry.pack(side=tk.LEFT, padx=(5, 15))

        self.increment_var = tk.BooleanVar(value=True)
        self.seat_chk = tk.Checkbutton(
            opts_frame,
            text="Register device seat (+1 use)",
            variable=self.increment_var,
            font=("Segoe UI", 8),
            fg="#CBD5E1",
            bg="#1E293B",
            activebackground="#1E293B",
            activeforeground="#FFFFFF",
            selectcolor="#0F172A"
        )
        self.seat_chk.pack(side=tk.LEFT)

        # Buttons
        btn_frame = tk.Frame(input_card, bg="#1E293B")
        btn_frame.pack(fill=tk.X)

        self.activate_btn = tk.Button(
            btn_frame,
            text="⚡ Activate License",
            font=("Segoe UI", 10, "bold"),
            bg="#2563EB", # Blue
            fg="#FFFFFF",
            activebackground="#1D4ED8",
            activeforeground="#FFFFFF",
            relief="flat",
            padx=16,
            pady=6,
            cursor="hand2",
            command=self._handle_activate
        )
        self.activate_btn.pack(side=tk.LEFT, padx=(0, 8))

        self.deactivate_btn = tk.Button(
            btn_frame,
            text="🔓 Deactivate & Release Seat",
            font=("Segoe UI", 10),
            bg="#475569",
            fg="#F8FAFC",
            activebackground="#334155",
            activeforeground="#FFFFFF",
            relief="flat",
            padx=14,
            pady=6,
            cursor="hand2",
            state=tk.DISABLED,
            command=self._handle_deactivate
        )
        self.deactivate_btn.pack(side=tk.LEFT)

        sample_btn = tk.Button(
            btn_frame,
            text="📋 Paste Sample Key",
            font=("Segoe UI", 9),
            bg="#334155",
            fg="#CBD5E1",
            activebackground="#475569",
            activeforeground="#FFFFFF",
            relief="flat",
            padx=10,
            pady=6,
            cursor="hand2",
            command=lambda: (self.key_entry.delete(0, tk.END), self.key_entry.insert(0, "DIGI-F5C4-5BF6-F041"))
        )
        sample_btn.pack(side=tk.RIGHT)

        # Mock Software Pro Features Area
        features_card = tk.Frame(container, bg="#1E293B", bd=2, relief="solid", padx=16, pady=16)
        features_card.pack(fill=tk.BOTH, expand=True, pady=(0, 16))

        features_title = tk.Label(
            features_card,
            text="Software Capabilities & Controls",
            font=("Segoe UI", 11, "bold"),
            fg="#F8FAFC",
            bg="#1E293B"
        )
        features_title.pack(anchor="w", pady=(0, 10))

        self.feature_items = [
            ("🎬 4K / 8K ProRes Video Rendering", False),
            ("🚀 Hardware GPU Acceleration (NVENC / Metal)", False),
            ("🎨 Hollywood Color Grading LUT Pack (50+ Presets)", False),
            ("⚡ Multi-Threaded Batch Export Queue", False),
            ("☁️ DigiStore Cloud Sync & Project Backup", False),
        ]

        self.feature_labels = []
        for text, _ in self.feature_items:
            f_row = tk.Frame(features_card, bg="#1E293B")
            f_row.pack(fill=tk.X, pady=3)

            dot = tk.Label(f_row, text="🔒 [LOCKED]", font=("Segoe UI", 9, "bold"), fg="#EF4444", bg="#1E293B", width=14, anchor="w")
            dot.pack(side=tk.LEFT)

            lbl = tk.Label(f_row, text=text, font=("Segoe UI", 9), fg="#94A3B8", bg="#1E293B")
            lbl.pack(side=tk.LEFT)
            self.feature_labels.append((dot, lbl))

        # Bottom Instructions Card
        instr_card = tk.Frame(self, bg="#0F172A", padx=20, pady=8)
        instr_card.pack(fill=tk.X, side=tk.BOTTOM)

        tip_lbl = tk.Label(
            instr_card,
            text="💡 Evaluator / Professor Demo Instructions:\n"
                 "1. Open http://localhost:3000 -> Dashboard -> Products -> Create a Software product with License Keys turned ON.\n"
                 "2. Purchase the product from the Storefront or open the buyer's order page to view the issued key.\n"
                 "3. Paste the 'DIGI-XXXX-XXXX-XXXX' key above and click Activate. Notice the seats update in real time!",
            font=("Segoe UI", 8),
            fg="#64748B",
            bg="#0F172A",
            justify="left"
        )
        tip_lbl.pack(anchor="w")

    def _handle_activate(self):
        key = self.key_entry.get().strip()
        if not key:
            messagebox.showwarning("Empty Key", "Please enter a DigiStore License Key.")
            return

        api_url = self.url_entry.get().strip() or DEFAULT_API_URL
        increment = self.increment_var.get()

        self.activate_btn.config(state=tk.DISABLED, text="Verifying...")

        threading.Thread(target=self._verify_thread, args=(api_url, key, increment), daemon=True).start()

    def _verify_thread(self, api_url, key, increment):
        url = f"{api_url}/api/licenses/verify"
        payload = json.dumps({"licenseKey": key, "incrementUses": increment}).encode("utf-8")
        headers = {"Content-Type": "application/json"}

        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                self.after(0, self._on_verify_success, data)
        except urllib.error.HTTPError as e:
            try:
                err_data = json.loads(e.read().decode("utf-8"))
                msg = err_data.get("message", f"HTTP {e.code}")
            except Exception:
                msg = f"HTTP Error {e.code}: {e.reason}"
            self.after(0, self._on_verify_fail, msg)
        except Exception as e:
            self.after(0, self._on_verify_fail, f"Connection Failed: {str(e)}")

    def _on_verify_success(self, raw_resp):
        self.activate_btn.config(state=tk.NORMAL, text="⚡ Activate License")
        payload = raw_resp.get("data") if (isinstance(raw_resp, dict) and isinstance(raw_resp.get("data"), dict)) else raw_resp
        
        if payload.get("valid") or raw_resp.get("valid"):
            self.is_licensed = True
            self.license_data = payload

            # Update status card to Emerald Green
            self.status_card.configure(bg="#064E3B", highlightbackground="#10B981")
            self.status_title.configure(text="✅ LICENSED & ACTIVATED (PRO SUITE)", fg="#10B981", bg="#064E3B")

            order_info = payload.get("order") or raw_resp.get("order") or {}
            prod_info = payload.get("product") or raw_resp.get("product") or {}
            
            email = order_info.get("customerEmail", "Customer")
            prod_title = prod_info.get("name") or prod_info.get("title") or "Digital Software"
            uses = payload.get("uses", raw_resp.get("uses", 1))
            max_uses = payload.get("maxUses", raw_resp.get("maxUses", 5))
            key_str = payload.get("key") or raw_resp.get("key") or self.key_entry.get().strip()

            self.status_desc.configure(
                text=f"Product: {prod_title}\nLicensed to: {email}\nDevice Seats Registered: {uses} of {max_uses} seats",
                fg="#D1FAE5",
                bg="#064E3B"
            )

            self.license_info_lbl.configure(
                text=f"Key: {key_str} | Status: ACTIVE | Engine: DigiStore v2",
                fg="#6EE7B7",
                bg="#064E3B"
            )

            # Unlock all software features
            for dot, lbl in self.feature_labels:
                dot.configure(text="✨ [UNLOCKED]", fg="#10B981")
                lbl.configure(fg="#F8FAFC", font=("Segoe UI", 9, "bold"))

            self.deactivate_btn.config(state=tk.NORMAL)
            messagebox.showinfo(
                "License Activated!",
                f"License successfully validated by DigiStore Server!\n\n"
                f"• Customer: {email}\n"
                f"• Product: {prod_title}\n"
                f"• Active Seats: {uses}/{max_uses}\n\n"
                f"All Pro features are now unlocked."
            )
        else:
            msg = payload.get("message") or raw_resp.get("message") or "License is not valid."
            self._on_verify_fail(msg)

    def _on_verify_fail(self, error_message):
        self.activate_btn.config(state=tk.NORMAL, text="⚡ Activate License")
        self.status_card.configure(bg="#450A0A", highlightbackground="#EF4444")
        self.status_title.configure(text="❌ ACTIVATION REJECTED", fg="#EF4444", bg="#450A0A")
        self.status_desc.configure(text=f"Error: {error_message}", fg="#FECACA", bg="#450A0A")
        self.license_info_lbl.configure(text="Verification failed against DigiStore API", fg="#F87171", bg="#450A0A")

        messagebox.showerror("Activation Failed", f"DigiStore rejected the license key:\n\n{error_message}")

    def _handle_deactivate(self):
        key = self.key_entry.get().strip()
        if not key:
            return

        api_url = self.url_entry.get().strip() or DEFAULT_API_URL
        self.deactivate_btn.config(state=tk.DISABLED, text="Releasing seat...")

        threading.Thread(target=self._decrement_thread, args=(api_url, key), daemon=True).start()

    def _decrement_thread(self, api_url, key):
        url = f"{api_url}/api/licenses/decrement"
        payload = json.dumps({"licenseKey": key}).encode("utf-8")
        headers = {"Content-Type": "application/json"}

        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                self.after(0, self._on_deactivate_success, data)
        except Exception as e:
            self.after(0, self._on_deactivate_fail, str(e))

    def _on_deactivate_success(self, raw_resp):
        self.deactivate_btn.config(state=tk.DISABLED, text="🔓 Deactivate & Release Seat")
        payload = raw_resp.get("data") if (isinstance(raw_resp, dict) and isinstance(raw_resp.get("data"), dict)) else raw_resp
        
        self.status_card.configure(bg="#334155")
        self.status_title.configure(text="🔒 TRIAL / UNLICENSED MODE", fg="#F59E0B", bg="#334155")
        self.status_desc.configure(
            text="Seat released on DigiStore server. Software reverted to Trial mode.",
            fg="#CBD5E1",
            bg="#334155"
        )
        
        uses = payload.get("uses", raw_resp.get("uses", 0))
        max_uses = payload.get("maxUses", raw_resp.get("maxUses", 5))

        self.license_info_lbl.configure(
            text=f"Remaining Seats Used on Server: {uses}/{max_uses}",
            fg="#38BDF8",
            bg="#334155"
        )

        for dot, lbl in self.feature_labels:
            dot.configure(text="🔒 [LOCKED]", fg="#EF4444")
            lbl.configure(fg="#94A3B8", font=("Segoe UI", 9))

        messagebox.showinfo(
            "Seat Released",
            f"Device seat has been successfully released on the server.\n\n"
            f"Server now reports: {uses}/{max_uses} seats in use."
        )

    def _on_deactivate_fail(self, err_msg):
        self.deactivate_btn.config(state=tk.NORMAL, text="🔓 Deactivate & Release Seat")
        messagebox.showerror("Deactivation Failed", f"Could not release seat:\n{err_msg}")


if __name__ == "__main__":
    app = CineGradeProApp()
    app.mainloop()
