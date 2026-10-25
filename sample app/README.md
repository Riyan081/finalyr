# DigiStore Sample Application — License Protected Calculator

A standalone Python Tkinter desktop calculator application built to test and demonstrate the **DigiStore Software Licensing API**, device seat activations, seat limit enforcement (5/5 seats), local activation caching, and seat deactivation.

---

## 🚀 Yes! Gumroad-Style Drop-In Licensing in DigiStore

Just like Gumroad, developers **only need to copy and paste a single SDK snippet** into their Python application (desktop app, script, bot, CLI, or Blender add-on). 

In [`calculator.py`](file:///c:/Coding/CLG/FY/finalyr/sample%20app/calculator.py), this drop-in code is prominently highlighted between banner blocks:
- Starts at: `# 🚀 DIGISTORE LICENSE SDK SNIPPET — COPY & PASTE THIS INTO YOUR OWN APPLICATION`
- Ends at: `# 🛑 END OF DIGISTORE LICENSE SDK SNIPPET`

### 📋 The Copy-Paste Snippet (How to Protect Any App in 3 Lines):

```python
from calculator import DigiStoreLicense  # Or paste the DigiStoreLicense class directly

# 1. Initialize the client
license_client = DigiStoreLicense(api_url="http://localhost:3002")

# 2. Check if already activated (persisted across app restarts)
if license_client.is_activated():
    print(f"✓ Software unlocked for: {license_client.get_product_name()}")
else:
    # 3. Prompt user for key and activate
    result = license_client.activate("DIGI-XXXX-XXXX-XXXX")
    if result["valid"]:
        print("✓ Unlocked!")
    elif result["all_keys_used"]:
        print("❌ All keys used (5/5 seats reached)!")
    else:
        print(f"❌ Error: {result['message']}")

# 4. Optional: Reset / Deactivate seat on uninstall
# license_client.deactivate()
```

---

## 📋 Features

- **Single Python File**: Self-contained in `calculator.py` using Python's built-in `tkinter` (no external GUI frameworks required).
- **First Launch Activation**: Automatically asks for a valid DigiStore license key (`DIGI-XXXX-XXXX-XXXX`) on initial launch.
- **Persistent Licensing**: Once activated, stores activation data in `license_config.json`. When the user closes and reopens the app, **it does not ask for the key again**.
- **Seat Limit Enforcement**: If all seats (e.g. 5/5) have been consumed, the app blocks activation and displays:
  > **"All keys used (5/5 activations reached). Please deactivate an existing device first."**
- **In-App "Reset App"**: Clicking **Reset App ↺** sends a deactivation request to `POST /api/licenses/decrement` on the DigiStore server, frees up the device's seat, clears the local cache, and returns to the license entry screen.

---

## 🚀 How to Run

1. Ensure the DigiStore backend is running on `http://localhost:3002`:
   ```bash
   bun run dev
   ```
2. Run the calculator:
   ```bash
   cd "sample app"
   python calculator.py
   ```

---

## 🔑 Ready-to-Test License Keys

You can test with any of the following active license keys from your database:

| License Key | Product Name | Current Seats |
| :--- | :--- | :--- |
| `DIGI-34A9-4601-6945` | Python Test App | 1 / 5 Active |
| `DIGI-7494-E793-DC67` | Python Test App | 2 / 5 Active |
| `DIGI-8D96-ABBA-74AF` | Bento Grid Marketing Layouts | 0 / 5 Active |

---

## 🧪 Testing Scenarios

### 1. First-Time Activation
1. Launch `python calculator.py`.
2. Enter `DIGI-34A9-4601-6945` and click **Activate & Launch Software →**.
3. A confirmation dialog shows the product name and current seats. The calculator opens.

### 2. Close & Re-open (Persistence Check)
1. Close the calculator window.
2. Run `python calculator.py` again.
3. The calculator opens immediately without asking for the key.

### 3. Testing the 5/5 Seat Limit ("All Keys Used")
To test all 5 seats filling up on a single computer:
1. Activate the key (Seat 1 claimed: `1 of 5 keys used`).
2. Click **Reset App ↺** &rarr; select **🧪 Simulate New Device (Test Next Seat)**.
3. The server seat stays claimed, but your local app resets. Enter the key again:
   - Attempt 2: `2 of 5 keys used`
   - Repeat &rarr; Attempt 3: `3 of 5 keys used`
   - Repeat &rarr; Attempt 4: `4 of 5 keys used`
   - Repeat &rarr; Attempt 5: `5 of 5 keys used`
4. On the 6th activation attempt, the app blocks activation and displays:
   ```
   All keys used (5/5 activations reached).
   Please deactivate an existing device first.
   ```

### 4. Releasing Seats & Live Sync
1. Click **Reset App ↺** &rarr; select **🔓 Release Seat on Server & Reset**.
2. The app calls `POST /api/licenses/decrement` on DigiStore, freeing up 1 seat on the server and clearing local cache.
3. Whenever the calculator app starts up, it silently queries the server with `incrementUses=false` to ensure the top-bar key counter is always synced live with the database.

---

## 📄 PDF Documentation

A formatted PDF version of this guide is located at:
- [`sample app/README.pdf`](file:///c:/Coding/CLG/FY/finalyr/sample%20app/README.pdf)
