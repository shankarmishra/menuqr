# MenusQR Case Study Framework & Establishment Archetypes

**Standard Operating Procedure for Customer Evidence, Pilot Documentation & Impact Studies**
*Version 2.0 — Grounded in Real Indian Restaurant Operations*

---

## 1. Ground Rules & Verification Standards

To protect brand credibility and trust with food service operators, every MenusQR case study must adhere to these non-negotiable principles:
1. **Zero Fabricated Statistics:** Never invent vanity metrics (e.g., "boosted revenue by 342% in 48 hours" or "saved 9.4 hours per shift"). Use only verifiable pilot logs, table turnover timing, print invoice receipts, or clearly labelled illustrative projections.
2. **Clear Distinction Between Live Pilots & Illustrative Profiles:**
   - A *Live Pilot* requires written consent, verifiable tenant records, and signed measurement logs.
   - An *Illustrative Archetype* represents a synthesized operational model based on real menu audits, designed to demonstrate workflow fit without misleading buyers.
3. **Transparent Plan Alignment:** Always map the establishment's workflow directly to MenusQR's actual server-enforced tiers:
   - **Basic (₹199/mo, ₹1,999/yr):** Digital menu viewing, QR standee, up to 20 content edits.
   - **Intermediate (₹299/mo, ₹3,199/yr):** Unlimited edits, signature themes, half/full variants, analytics.
   - **Premium (₹899/mo, ₹6,799/yr):** Table ordering, live kitchen screen, reception panel, table tokens, 150 online orders/month included.

---

## 2. Standard Case Study Architecture

Every published study or sales collateral profile must follow this 5-part structure:

### Part 1: Operational Baseline & Environment
* **Establishment Profile:** Concept, seating capacity, table count, daily footfall, average ticket size (₹), service model (Dine-in / QSR / Takeaway).
* **Pre-MenusQR State:** Type of physical menus (laminated card, leather folder, photocopied sheet), reprint cycle frequency, cost per reprint, pain points around daily dish availability and pricing changes.

### Part 2: The Core Friction
* **Menu Degradation:** Physical wear-and-tear, oil/gravy staining, torn corners.
* **Price Volatility:** Market-driven ingredient price changes (e.g., dairy, poultry, seasonal vegetables) leading to untidy ballpoint pen scribbles or tape stickers over prices.
* **Service Bottlenecks:** Waiters trapped carrying menus, answering repetitive questions about portions ("Half plate mein kitne piece aate hain?"), or missing call-for-bill hand waves across crowded rooms.

### Part 3: MenusQR Implementation & Configuration
* **Selected Edition / Theme:** Specific art-directed design chosen from the 16 signature editions (e.g., *Maharaja Table*, *Rang-e-Punjab*, *Chalk House*, *Atelier Pastel*).
* **Plan Tier:** Explicit rationale for Basic, Intermediate, or Premium tier.
* **Indian Culinary Customization:** Configuration of Veg/Non-Veg icons, Jain tags, allergen disclosures, Half/Full portion pricing, and "Sold Out Today" toggle usage.

### Part 4: Verified Operational Impacts (4-Week Pilot Framework)
* **Cost Elimination:** Direct printing and lamination expenditure eliminated.
* **Speed to Update:** Menu price or item availability updates measured in seconds rather than days.
* **Customer Journey:** Instant browser opening via native camera scan (zero app install friction, zero login hurdle).
* **Order Flow (Premium only):** Table code accuracy, kitchen screen alert response, and cashier table-token consolidation.

### Part 5: Lessons Learned & Operational Advice
* Practical takeaways for other restaurateurs in the same operational category.

---

## 3. Illustrative Establishment Archetypes

### Archetype A: Highway Dhaba & Family Multi-Cuisine
* **Profile:** 24-table multi-cuisine dhaba on a major transport corridor (GT Road / NH-48 style).
* **Baseline Friction:** Heavy evening footfall, high physical wear on paper menus due to tandoori butter and curry spills, frequent seasonal adjustments in dairy and seasonal vegetable dishes. Waiters spend 40% of their table visits explaining portion sizes (Quarter vs Half vs Full Handi).
* **Recommended Tier:** **Intermediate Plan (₹299/mo | ₹3,199/yr)**.
* **Key Platform Features Used:**
  - *Rang-e-Punjab* or *Bombay Chowk* high-contrast visual theme.
  - Multi-portion variant pricing (Quarter / Half / Full).
  - Excel bulk upload for initial 140-item catalog import.
  - "Sold Out Today" operational toggle for daily specials (e.g., fresh Paneer Tikka or Mutton Rogan Josh running out during peak hours).
* **Impact Profile:**
  - Zero recurring menu reprint costs (previously ₹4,500 every quarter for 30 laminated booklets).
  - 10-second price corrections from owner's smartphone.
  - Customers browse photos while waiting, reducing order hesitation.

---

### Archetype B: Urban Fast-Casual & Specialty Café
* **Profile:** 14-table third-wave specialty café and bakery in an urban lifestyle hub (e.g., Hauz Khas / Indiranagar / Bandra).
* **Baseline Friction:** Compact tables cluttered by bulky acrylic menu stands. High proportion of customers with specific dietary requirements (Oat milk, gluten-free, eggless, keto). Daily rotational bakery specials that change every morning.
* **Recommended Tier:** **Intermediate Plan (₹299/mo | ₹3,199/yr)** (or **Premium** if counter pickup order tokens are used).
* **Key Platform Features Used:**
  - *Atelier Pastel* or *Presse Brut* minimalist editorial theme.
  - Dietary badges: Eggless, Dairy-Free, Gluten-Free, Jain.
  - High-resolution culinary photos with focal-point optimization.
  - Google Reviews add-on (₹499/yr) placed on the digital menu footer to capture positive diner sentiment at table.
* **Impact Profile:**
  - Uncluttered aesthetic on compact marble tables with single 24K gold brushed QR standees.
  - Baristas spend zero time answering allergen questions; customers filter directly on their phones.
  - Direct morning updates for fresh croissants and cruffins.

---

### Archetype C: Heritage Fine Dining & High-Volume Awadhi/Mughlai Dining
* **Profile:** 35-table fine dining establishment with private dining areas and high average guest party sizes (4-8 diners per table).
* **Baseline Friction:** Wait staff cannot maintain eye contact with all tables in corner alcoves; diners struggle to signal for secondary beverage rounds or the final bill. High friction at checkout when split rounds of roti and drinks are tallied manually.
* **Recommended Tier:** **Premium Plan (₹899/mo | ₹6,799/yr)**.
* **Key Platform Features Used:**
  - *Maharaja Table* or *Maison Noir* regal gold-and-black art direction.
  - Direct Table QR Ordering with hidden 3-character table security codes.
  - Live Kitchen Stream (`/api/app/orders/stream`) with audio chime alert.
  - "Call Waiter" and "Request Bill" service requests directly routed to Cashier Reception Dashboard.
  - Live Table Token Bridge (`tokenBridge.js`): multiple rounds of tandoori rotis and beverages automatically append to the single table bill for a consolidated GST thermal invoice.
* **Impact Profile:**
  - Elimination of delayed secondary orders; re-ordering drinks and breads is seamless.
  - Zero waiter order-taking errors on custom spice levels or table numbers.
  - Cashier prints consolidated thermal receipt with accurate CGST/SGST breakdown instantly upon diner request.
