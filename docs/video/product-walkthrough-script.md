# MenusQR Comprehensive Product Walkthrough Video Script

> **PRODUCTION STATUS BANNER:**
> **Status:** ✅ Scripts, Click Paths & OBS Capture Protocols Complete | ⏳ Screen Capture Video & Final Voiceover Pending Production Shoot
> **Target Run Time:** 2 Minutes 45 Seconds (165 Seconds)
> **Resolution & Format:** 1080p60 (1920 × 1080 Landscape — Primary YouTube/Desktop Demo) with Chapter Markers & 9:16 Vertical Cutdown Points
> **Target Audience:** F&B Operators, Restaurant Owners, General Managers, Cashiers, Kitchen Supervisors
> **Demo Environment Route URLs:**
> • Customer Mobile Experience: `https://menusqr.in/m/the-royal-feast?table=4`
> • Kitchen Order Display System (KDS): `https://menusqr.in/app/orders`
> • Cashier Counter & Floor Matrix: `https://menusqr.in/app/cashier`
> • Menu & Theme Design Studio: `https://menusqr.in/app/menu-studio`

---

## 1. Walkthrough Architecture & Module Flow

```
+----------------------------------------------------------------------------------------------------------+
|                                  PRODUCT DEMONSTRATION WORKFLOW (165s)                                   |
+----------------------------------------------------------------------------------------------------------+
| MODULE 1: THE ZERO-APP CUSTOMER ENTRY [00:00 - 00:25]                                                    |
| 1. iPhone 15 Pro points camera at 24K Gold Standee QR.                                                   |
| 2. Native Camera banner tap -> Instant Mobile Web Menu opens (No App Store / No login).                 |
| 3. High-fidelity brand cover, category navigation bar, and silky 60fps scrolling.                       |
|                                                                                                          |
| MODULE 2: SEARCH, DIETARY FILTERS & VARIANTS [00:25 - 00:55]                                             |
| 1. Instant Veg-only switch toggle (filters out all non-veg items with smooth CSS transition).            |
| 2. Live keyword search for "Biryani" / "Paneer" with instant indexing.                                  |
| 3. Dish detail sheet opens: selecting Half (₹220) vs Full (₹380) variant with spice level selection.     |
|                                                                                                          |
| MODULE 3: SEAMLESS DIRECT TABLE ORDERING [00:55 - 01:20]                                                 |
| 1. Cart tray expands showing items, subtotal, and pre-bound Table 4 verification badge.                  |
| 2. Customer adds special cooking instruction: "Extra crispy, less oil".                                  |
| 3. 1-Tap "Place Table Order" -> Immediate animated confirmation screen with live order status tracker.   |
|                                                                                                          |
| MODULE 4: KITCHEN ORDER DISPLAY & KOT THERMAL PRINT [01:20 - 01:50]                                      |
| 1. Dual-screen view: Customer phone on left, Kitchen Display System (/app/orders) on right.             |
| 2. Audio chime alerts kitchen staff; Table 4 order card flashes in amber "NEW" state.                   |
| 3. Chef taps "Accept & Start Prep" -> Timer begins; 1-click 80mm KOT thermal printer fires.              |
|                                                                                                          |
| MODULE 5: REAL-TIME CASHIER DESK & SETTLEMENT [01:50 - 02:25]                                            |
| 1. Switch to Cashier Command Panel (/app/cashier) with interactive Table Floor Matrix.                   |
| 2. Table 4 is illuminated in yellow "DINING / BILL PENDING".                                             |
| 3. Unpaid token drawer reveals consolidated items and tax breakdown.                                     |
| 4. Cashier selects 1-Click UPI / Cash payment -> Instant 80mm thermal receipt pop-up.                   |
| 5. Table 4 automatically clears to green "VACANT" for next guest.                                        |
|                                                                                                          |
| MODULE 6: ARCHITECTURE SUMMARY & FREE TRIAL CTA [02:25 - 02:45]                                          |
| 1. Quick flash of 16 signature themes and 1-second price edit capability.                                |
| 2. Final call to action: Start 14-Day Free Trial at menusqr.in.                                          |
+----------------------------------------------------------------------------------------------------------+
```

---

## 2. Step-by-Step Technical Screenplay

### Module 1: The Zero-App Customer Entry (`00:00 - 00:25`)
* **Screen Layout:** Picture-in-Picture. Left: Over-the-shoulder video shot of an iPhone scanning a gold table standee. Right: 1080 × 1920 mobile viewport capture running Safari.
* **UI Route:** `https://menusqr.in/m/the-royal-feast?table=4`
* **On-Screen Action & Cursor Directives:**
  1. `00:00 - 00:06`: Camera lens aims at QR code. Native yellow pop-up banner `menusqr.in` appears. Thumb taps the banner.
  2. `00:06 - 00:15`: Mobile browser opens instantaneously. Page paints the royal *Maharaja's Table* hero cover photo, restaurant logo, and Table 4 indicator badge at top right.
  3. `00:15 - 00:25`: Thumb smoothly scrolls down through horizontal category chips: `Starters`, `Tandoor & Kebab`, `Main Course`, `Artisanal Breads`, `Desserts`.
* **Voiceover (Hinglish/English Demo Tone):**
  *"MenusQR ka customer experience shuru hota hai zero friction ke saath. Customer ko koi third-party app download nahi karni padti. Unhe bas apne phone ka regular camera kholkar table standee scan karna hai — aur 400 milliseconds ke andar aapka customized, luxury digital menu browser mein open ho jata hai."*
* **Callout Graphic:** `[Pill Badge] 0 App Downloads • Native iOS & Android Camera • 60 FPS Smooth Scroll`
* **Audio / SFX:** Crisp camera scan chime (`ding!`), gentle digital glide swoosh.

---

### Module 2: Search, Dietary Filters & Variant Customization (`00:25 - 00:55`)
* **Screen Layout:** Centered Mobile UI capture (scale 120%) with clean dark-mode blurred backdrop.
* **UI Route:** `https://menusqr.in/m/the-royal-feast?table=4`
* **On-Screen Action & Cursor Directives:**
  1. `00:25 - 00:33`: Mouse/thumb taps the glowing **"Pure Veg"** toggle switch on the top filter bar. In 100ms, non-veg dishes animate out, leaving only emerald green veg badge items.
  2. `00:33 - 00:42`: Thumb taps the live search bar, types `"Paneer"`. Instant filtering displays `Paneer Tikka Angaare` and `Paneer Butter Masala`.
  3. `00:42 - 00:55`: Thumb taps `Paneer Butter Masala`. A smooth modal bottom-sheet slides up from the bottom showing high-resolution imagery, detailed culinary description, and portion variants. Thumb clicks **Half (₹220)**, toggles to **Full (₹380)**, checks `"Medium Spicy"`, and taps the golden button **"Add to Cart (₹380)"**.
* **Voiceover (Hinglish/English Demo Tone):**
  *"Yahan par Indian dining ke specific needs ka poora dhyan rakha gaya hai. Ek single tap se customer Pure Veg filter toggle kar sakta hai, ya instant search se apni favorite dish dhoondh sakta hai. Aur sabse important: hamara native Portion Sizing system! Customer Half aur Full plates ke beech choose kar sakta hai, customize kar sakta hai spice levels, aur add-ons select kar sakta hai — exactly jaise wo ek waiter ko batate hain."*
* **Callout Graphic:** `[Feature Highlight] Instant Veg/Non-Veg Filter • Half & Full Portion Sizing • Custom Spice Levels`
* **Audio / SFX:** Soft UI toggle click, keyboard type clatter, tactile button pop.

---

### Module 3: Seamless Direct Table Ordering (`00:55 - 01:20`)
* **Screen Layout:** Centered Mobile UI capture.
* **UI Route:** `https://menusqr.in/m/the-royal-feast?table=4`
* **On-Screen Action & Cursor Directives:**
  1. `00:55 - 01:05`: Bottom sticky cart bar animates upward with a bounce indicator: `1 Item | ₹380`. Thumb taps "View Cart".
  2. `01:05 - 01:12`: Cart drawer expands. Screen highlights `Table Number: Table 4 (Verified via QR)`. Thumb taps "Special Instructions" text box, typing: *"Please keep it extra hot with less oil"*.
  3. `01:12 - 01:20`: Thumb taps the vibrant gradient button **"Place Order Now"**. A subtle micro-haptic vibration triggers, followed by a celebratory checkmark screen displaying `Order #TK-104 Placed Successfully! Sent to Kitchen`.
* **Voiceover (Hinglish/English Demo Tone):**
  *"Cart review karte waqt table number automatically verified hota hai table standee se, jisse order mix-up ka zero chance rehta hai. Customer special cooking instructions add kar sakta hai, aur 'Place Order' tap karte hi order directly kitchen display mein transmit ho jata hai — bina kisi waiter ka wait kiye!"*
* **Callout Graphic:** `[Security & Flow] Auto-Bound Table Verification • Zero Waiter Delays • Live KOT Transmission`
* **Audio / SFX:** Clean haptic press click, uplifting confirmation ding.

---

### Module 4: Kitchen Order Display & 80mm KOT Thermal Printing (`01:20 - 01:50`)
* **Screen Layout:** Split Screen 50/50. Left: Customer phone showing "Order in Kitchen". Right: Desktop Kitchen Display System running at 1920 × 1080.
* **UI Route:** `https://menusqr.in/app/orders`
* **On-Screen Action & Cursor Directives:**
  1. `01:20 - 01:28`: The moment customer hits submit, the KDS monitor flashes with a pulsing golden card labeled **Table 4 (Token #TK-104)**. An audible kitchen bell rings.
  2. `01:28 - 01:38`: Cursor hovers over the order ticket showing:
     * `1x Paneer Butter Masala (Full) — ₹380`
     * `Note: Please keep it extra hot with less oil`
     * `Timestamp: 2s ago`
  3. `01:38 - 01:50`: Kitchen manager clicks **"Accept Order"** (status turns cyan "Preparing"). Simultaneously, an automated thermal receipt preview triggers with 1-click ESC/POS print command for standard 80mm thermal kitchen printers.
* **Voiceover (Hinglish/English Demo Tone):**
  *"Ab dekhte hain kitchen mein kya hota hai. Jaise hi order place hota hai, MenusQR Kitchen Display screen par loud audio alert ke sath instant ticket popup hota hai. Chef ko milta hai clear portion details, table number aur customer notes. 1-click par status 'Preparing' ho jata hai aur standard 80mm KOT thermal printer instantly ticket print kar deta hai. Waiter ki daud-bhaag khatam!"*
* **Callout Graphic:** `[KDS Engine] Real-Time Kitchen Display • Audible Buzzers • 80mm ESC/POS Auto KOT`
* **Audio / SFX:** Kitchen dual-tone bell chime (`Ding-Ding!`), thermal paper whirr and mechanical cut sound.

---

### Module 5: Real-Time Cashier Desk & 1-Click Settlement (`01:50 - 02:25`)
* **Screen Layout:** Full-screen 1080p Desktop capture of the Cashier Counter interface.
* **UI Route:** `https://menusqr.in/app/cashier`
* **On-Screen Action & Cursor Directives:**
  1. `01:50 - 02:00`: Cashier panel displays the visual **Table Floor Matrix**. Table 4 is pulsing in amber with badge `1 Active Token | ₹380`.
  2. `02:00 - 02:10`: Cashier clicks on Table 4. The right-hand settlement drawer slides open displaying the itemized bill, GST calculation, and token history.
  3. `02:10 - 02:18`: Cashier clicks the green **"Settle & Free Table"** button. A modal offers instant payment modes: `CASH`, `UPI QR`, `CARD`. Cashier selects **UPI QR**.
  4. `02:18 - 02:25`: Status switches to `SETTLED`. Table 4 immediately reverts to calm emerald green `VACANT`. The settled order is archived into the daily collection ledger with a single click.
* **Voiceover (Hinglish/English Demo Tone):**
  *"Service complete hone par cashier counter handle karta hai settlement. Visual Floor Grid par Table 4 clearly bill-ready dikhta hai. Cashier single click se token inspect karta hai, Cash, Card ya UPI QR choose karke bill settle karta hai, aur table automatically free ho jata hai next guest ke liye. Pura table lifecycle — scan se lekar settlement tak — 100% synchronized!"*
* **Callout Graphic:** `[Cashier Panel] Interactive Table Grid • 1-Click UPI/Cash Settle • Auto Table Freeing`
* **Audio / SFX:** Quick mouse clicks, cash register ding, positive confirmation tone.

---

### Module 6: Enterprise Flexibility & Free Trial CTA (`02:25 - 02:45`)
* **Screen Layout:** High-speed dynamic carousel displaying the Menu Design Studio and 16 signature themes, transitioning into the official MenusQR brand sign-off.
* **UI Route:** `https://menusqr.in/app/menu-studio` -> Brand Outro
* **On-Screen Action & Cursor Directives:**
  1. `02:25 - 02:35`: Fast 10-second showcase of switching from *Maharaja's Table* to *Rang-e-Punjab* and *Atelier Pastel* with zero code changes. Drag-and-drop Excel menu import demonstrated in 2 seconds.
  2. `02:35 - 02:45`: Full brand lockup with clear pricing tier pills (`Basic ₹199`, `Intermediate ₹299`, `Premium ₹899`) and animated glowing button: **"Start Your 14-Day Free Trial Today at menusqr.in"**.
* **Voiceover (Hinglish/English Demo Tone):**
  *"Chahe aapka dhaba ho, café ho ya fine dining palace — MenusQR aapke restaurant ko deta hai unmatched elegance aur 100% operational speed. Aaj hi upgrade karein apne restaurant ko. Visit karein menusqr.in aur shuru karein apna 14-day risk-free trial!"*
* **Callout Graphic:** `[Brand CTA] 16 Luxury Editions • Starting at ₹199/mo • 👉 Start 14-Day Free Trial at menusqr.in`
* **Audio / SFX:** Triumphant upbeat outro music swell, crisp 3-note MenusQR sonic logo.

---

## 3. Video Editing & Screen-Recording Directives

| Module | Timeline | Viewport Dimensions | Zoom / Pan Crop | UI Callout Style | Mouse / Cursor FX |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Mod 1** | `00:00 - 00:25` | 390 × 844 (iPhone 15 Pro) embedded in 1920 × 1080 | Macro zoom 115% on QR camera detection; smooth vertical pan down | Yellow floating banner for scan detection; gold border around phone frame | Soft blue circular click ring (40px, 0.2s fade) |
| **Mod 2** | `00:25 - 00:55` | 390 × 844 centered | Punch zoom 130% into Veg toggle and Half/Full selector buttons | Emerald highlight around Veg badge; gold glow on variant buttons | Yellow touch contact circle indicating finger press |
| **Mod 3** | `00:55 - 01:20` | 390 × 844 centered | Slow steady push-in towards the "Place Order Now" button | Green verified badge around Table 4 token indicator | Haptic pulse wave expanding from the order button |
| **Mod 4** | `01:20 - 01:50` | 1920 × 1080 desktop browser | 50/50 split crop; zoom 120% into Table 4 KDS ticket card | Amber alert border pulsing at 1.5 Hz; thermal print icon pop | Precision arrow cursor with 200% scaling for readability |
| **Mod 5** | `01:50 - 02:25` | 1920 × 1080 desktop browser | Pan across Floor Grid; zoom 125% into settlement modal | Color status legend (Amber = Dining, Green = Vacant) | Smooth cursor bezier motion between table and payment button |
| **Mod 6** | `02:25 - 02:45` | 1920 × 1080 full frame | 3D angled perspective glide across theme cards | Floating price badges with subtle drop shadows | None (Pure typographic & brand animation) |
