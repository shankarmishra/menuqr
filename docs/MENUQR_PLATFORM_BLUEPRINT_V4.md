> **Document status (snapshot 2026-10-31).** This file is the **approved v4 plan**, copied unchanged from the planning
> session (original location: `C:\Users\xshan\.claude\plans\steady-seeking-newell.md`). It describes the **target**, not what is built.
> What actually exists is recorded in `docs/MENUQR_MASTER_CONTEXT.md` (sections "CURRENT_STATE" and "Implementation status").
>
> **Known drift since this plan was written (do not trust the plan on these points):**
> 1. Migrations were implemented by another AI session as `018_phase0_review_flags`, `019_restaurant_profiles`, `020_brand_and_media`,
>    `021_marketing_and_ordering`, `022_setup_design_slugs`. The numbers and names in section 8 of this plan
>    (`018_restaurant_profiles` ... `021_setup_design_slugs`) are superseded. A separate `018_phone_public.sql` written in the
>    uncommitted Phase 0 worktree collides with the real 018 and must be dropped.
> 2. Section 5.10 says INTERMEDIATE has unlimited content changes. The code (`backend/authorization.js`, `getPlanContentLimit`)
>    gives BASIC 20, INTERMEDIATE 100, PREMIUM unlimited per billing period. Unresolved: the owner must decide which is right.
> 3. Not implemented at all (verified by searching origin/main): the Atelier composition engine, the six Design Languages as
>    specified, the logo pipeline, the photo pipeline, the design-document API, the media API, the menu-slug API, the `/setup`
>    wizard route, the one-call QR endpoint, preview tokens and the link-click beacon.
> 4. The preview in the new Restaurant console page is an inline 390 px div, not the same-origin iframe this plan requires
>    (plan sections 5.0 and 12).

---

# MENUQR Platform Blueprint v4: restaurant information system, client console and Atelier design engine

## 0. Context and decisions
The Atelier design direction (6 Design Languages, Brand DNA, composition engine) is the approved foundation. This version adds the product around it:
- what we collect from restaurants, and why;
- exactly where each piece of information appears (and where it never appears);
- the full client console, screen by screen, on desktop and phone;
- what a diner experiences after scanning;
- data model, APIs, validation, privacy, phases and tests.

**Decisions you already made (locked):**
- No per-restaurant custom work: one universal collection that adapts automatically.
- The logo is optional; every design is name-first.
- Quality comes from the system, not manual touch-ups.
- No paid AI or paid services.
- No direct customer-to-restaurant payments.
- No staff roles.
- Existing customer data, permanent QR URLs and subscriptions are preserved.

**Decisions this plan makes. Items marked ★ change today's behaviour, so they are the ones to check before approving:**

| # | Decision | Why |
|---|---|---|
| ★1 | Profile edits (phone, hours, social links…) never use up BASIC's 20 content changes. Only menu content does. | Today fixing a phone typo burns a change (`app.js:1107, 1141`). |
| ★2 | The phone number from sign-up is no longer published silently. The owner explicitly chooses which numbers guests see. Existing tenants keep their number visible after a one-time "keep / edit / hide" prompt. | `purchase.js:402-415` copies the verified owner phone into the public `clients.phone`. |
| ★3 | "AI Table Voice Greeting" is retired: no new greetings are generated. Greetings already generated keep playing. | It runs on Gemini TTS (`welcomeVoice.js:1-6, 43-67`), against the no-AI and no-cost rule. |
| ★4 | Takeaway becomes its own order type. Dine-in, takeaway and delivery become separate owner switches, plus an "accepting orders" switch. | Today there is one fixed "Delivery / Takeaway" tab that asks for a delivery address, shown to every PREMIUM menu, and the owner can't turn anything off (`MenuPage.tsx:1107-1124`; `public.js:457-459`). |
| ★5 | The menu link name can change once every 30 days. Old links redirect. QR codes are unaffected. | `PATCH /api/app/settings` currently changes the slug with only a uniqueness check. |
| ★6 | The purchase form stops asking for a full address. A structured address (with PIN code) is collected in setup. | Fewer fields at the moment of payment. |
| ★7 | Reservations are a call/WhatsApp/link button only. No in-app booking system. | No backend exists; building one is a separate program. |
| ★8 | Custom links need INTERMEDIATE or higher. Gallery and offers have per-plan limits (§5.10). | Spam and storage control. |

Planning only. No code changes and no package installs.

## 1. Audit: what exists and what is wrong

### 1.1 Already works (reuse)
- **Auth and plans:** email + password + OTP login, DB sessions, CSRF (`csrf.js`), tenant taken from the session, entitlement engine (`authorization.js`), BASIC content-change counter, renewal reminders.
- **Menu model and import:** menus, categories, items, variants, add-on groups, Excel/PDF/Smart import, category time schedules (migration 015), item metadata (tags, `translations.hi`, focal point).
- **Design draft/publish/history/rollback** (migration 011) and public-cache invalidation.
- **Ordering stack:** dine-in and delivery orders, sessions and rounds, live reception feed (SSE), ETA, rejection reasons (006-008), call-waiter requests (017), private guest feedback (013), hourly analytics (012), Google Reviews add-on (₹499/yr, 005).
- **QR:** permanent `qr_codes.qr_id` with `/qr/:id`, client-side table QR generator, sticker request flow and admin tools.
- **Infra:** S3 storage driver, image optimiser, email outbox, Oracle backend, Cloudflare.

### 1.2 Broken or missing (evidence)

| # | Finding | Evidence | Impact |
|---|---|---|---|
| 1 | Profile is thin and unstructured: one phone, free-text address, hours and cuisine (255 chars), no PIN, maps link, founding year, story, FSSAI, payments or amenities. | `schema.sql:4-19, 536-542, 618-623` | Designs have almost nothing real to show. |
| 2 | No validation on profile saves. Social links are stored raw. | `app.js:1106-1150`; two normalisers disagree (`MenuPage.tsx:785` vs `DhabaMasterpieceCover.tsx:311-318`) | "@https://…" and "instagram.com/instagram.com/x" appear. |
| 3 | Five different code paths write the `clients` table. | `app.js:267, 669, 940, 1142`; `admin.js:482` | Data drifts and the sources disagree. |
| 4 | The owner's signup phone is published as the restaurant phone, and it is the WhatsApp fallback. | `purchase.js:402-415`; `public.js:215`; `menuFeatures.js` (resolveMenuFeatures) | Private mobile numbers go public without consent. |
| 5 | The public payload also exposes `plan` and the raw `accentConfiguration`. | `public.js:226, 230` | Internal data leaks. |
| 6 | Any profile edit burns a BASIC content change. | `app.js:1107, 1141` | Owners are punished for fixing facts. |
| 7 | Onboarding collects only name, tagline, phone, city, address, logo, design, menu. Nothing is saved until the final button (local draft only). | `OnboardingWizard.tsx:104-114`; `app.js:~640-700` | No Instagram, hours, cuisine or story; a failure loses everything. |
| 8 | Settings is one 1,252-line page of 7 unrelated cards, with no preview and no "where this appears". | `Settings.tsx` | Owners can't see what a field changes. |
| 9 | Social links appear in 0 of 15 pickable designs; contact blocks show phone, location and hours only. | `EditionContact` (`shared.tsx`) | Instagram and Facebook never show. |
| 10 | No media library: images are scattered across `logo_url`, `appearance_settings.logo/cover_image`, `theme.brand.logoUrl` and `menu_items.image_url`. | schema, `MenuDesignStudio.tsx:1221` | Wrong or missing logos; no gallery. |
| 11 | Hours are free text: no open-now, no holidays, no overnight shifts. Category schedules have no date range, so festival menus are impossible. | `schema.sql:618`; `015_category_schedule.sql` | Late-night restaurants can't express their hours. |
| 12 | The only announcement is inside the design (`theme.announcement`). There are no offers. | `theme.types.ts` | No promotion tools. |
| 13 | Ordering has no owner controls: no mode switches, minimum order, fee, area or accepting switch. Takeaway is not a separate type; the one non-dine-in tab is "Delivery / Takeaway" and asks for a delivery address. | `MenuPage.tsx:1107-1124`; `public.js:457-459` (only DINE_IN or DELIVERY) | A dine-in-only restaurant still shows the delivery tab, and a pickup customer must give an address. |
| 14 | Table QR labels aren't saved. Owners retype count and label each time. | `TableQrGenerator.tsx:19-26` | Friction. |
| 15 | Shared menu links show the generic MenusQR card on WhatsApp, not the restaurant. | Verified live: crawler sees `og:title` "MenusQR \| Digital QR Menu for Restaurants" | Lost branding on the most common sharing channel. |
| 16 | Images: 7 files per upload (primary + 3 webp + 3 avif) into a 1 GB free bucket. | `imageOptimizer.js:14, 87-99` | The bucket fills after roughly 1,500-2,500 uploads across all tenants. |
| 17 | Uploads travel as base64 JSON (+33%) through the 1 GB VM. | `uploadImage(base64Data…)` callers | Memory spikes and slow uploads on phones. |

### 1.3 Architectural conflicts (resolved in §12)
Two sources of truth for contact data; private vs public phone; live facts vs draft design; BASIC quota semantics; cache invalidation vs instant facts; onboarding wizard mixing design and data; admin edits bypassing any shared validation; storage budget; AI voice vs no-AI rule.

## 2. Product principles
1. **Truthful:** only owner-supplied data, or facts computed from it. Never invented. CI enforces it.
2. **Progressive:** a live menu in about 10 minutes. Everything else comes after, with visible benefits.
3. **Explainable:** every field says where it appears, and the preview highlights the spot.
4. **One source of truth** per fact. Every surface reads it.
5. **Name first, logo optional.**
6. **Private by default,** public by explicit choice. The owner's own phone is never public implicitly.
7. **Facts go live instantly and can be undone. Designs go draft → publish. Nothing is silent.**
8. **Phone-first console.** Most owners work from phones.
9. **Every control works.** A control manifest and tests prove it.
10. **Free to run:** no paid APIs; heavy work happens in the browser; safe on the 1 GB VM.

## 3. Information system: what we collect

### 3.1 Legend
- **Tier:** **R** required to publish; **Rec** recommended (nudged, never blocks); **O** optional; **C** conditional (required only when the condition holds).
- **Privacy:** **PUB** public once saved; **OPT** public only after the owner switches it on; **PRV** private (dashboard only).
- Every owner-written text can have an optional Hindi counterpart, stored in an `i18n.hi` object.

### 3.2 Field catalogue

**A. Account and owner (collected at purchase; edited in Account)**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| owner.name | R | 2-60 chars, letters and spaces | Rajesh Kumar | PRV |
| owner.email | R | verified by OTP; change needs OTP to the new address | owner@gmail.com | PRV |
| owner.phone | R | verified by OTP; Indian mobile `^[6-9]\d{9}$`; **never shown publicly** | 98XXXXXXXX | PRV |
| owner.password | R | 8+ chars; not in a common-password list; not equal to email | | PRV |
| business.legalName | R | 2-100 chars | Mannat Foods Pvt Ltd | PRV (invoices) |
| business.type | R | choose 1-2 from list (Restaurant, Dhaba, Café, Bakery, Sweet shop, Cloud kitchen, Street food, Bar, Fine dining, Hotel restaurant) | Dhaba | PRV (drives defaults) |
| business.outlets | R | 1-50 | 1 | PRV |
| billing.gstin | O | 15-char GSTIN pattern plus checksum | 07AAACM1234A1Z5 | PRV |
| billing.address | O | up to 200 chars | | PRV |

**B. Identity (setup step S2, then Restaurant → Identity)**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| identity.displayName | R | 2-60; letters (Latin, Devanagari), digits, space and `& . , ' - ( ) !`; no URLs, no emoji | Mannat Tandoori Junction | PUB |
| identity.nameHi | O | up to 60, Devanagari | मन्नत तंदूरी जंक्शन | PUB |
| identity.tagline | O | up to 60 | Authentic Taste Since 2015 | PUB |
| identity.cuisineTags | Rec | 1-5 chips from suggestions, plus custom (up to 24 chars) | North Indian, Indo-Chinese | PUB |
| identity.dietDeclaration | Rec | PURE_VEG, VEG_AND_NON_VEG or not set. Pure Veg is blocked while any dish is non-veg or egg. | Pure Vegetarian | PUB |
| identity.establishedYear | O | 1900 to the current year | 2015 | PUB |
| identity.story | O | up to 600 chars, plain text, line breaks allowed | | PUB |
| identity.highlights | O | pick from a fixed list (AC, Family seating, Outdoor seating, Rooftop, Parking, Valet, Live music, Wi-Fi, Pet-friendly, Wheelchair accessible, Kids-friendly, Party hall, Bar, Late night, 24×7, Buffet); at most 12 | AC, Parking | PUB |
| identity.paymentsAccepted | O | Cash, UPI, Cards, Meal vouchers | UPI, Cards | PUB |
| identity.priceNote | O | presets: "Prices include all taxes", "GST extra as applicable", "Prices exclusive of taxes" | | PUB |
| identity.serviceChargeNote | O | up to 80 chars | 5% service charge applicable | PUB |
| identity.fssai | O | 14 digits, not all the same | 12345678901234 | PUB |

**C. Brand**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| brand.logo | O | PNG, JPG, WebP, SVG, HEIC; up to 8 MB; at least 300 px of content | | PUB |
| brand.logoIncludesName | C (if a logo exists) | yes/no, pre-guessed from aspect ratio | | PUB (drives layout) |
| brand.colourMood | O | one of 8 chips, "from my logo", or a custom hex | Chilli Red | PUB |
| brand.coverPhoto | O | at least 1080 px wide | | PUB |

**D. Location and hours**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| location.addressLine | Rec | 5-120 chars | E-36, Patel Nagar 2nd | PUB |
| location.area | O | up to 80 | Patel Nagar | PUB |
| location.city | R | 2-60 | Ghaziabad | PUB |
| location.state | R | dropdown of the 36 states and UTs | Uttar Pradesh | PUB |
| location.pincode | C (if addressLine) | `^[1-9][0-9]{5}$` | 201001 | PUB |
| location.landmark | O | up to 80 | Opp. City Mall | PUB |
| location.mapsUrl | Rec | host allowlist (google.com/maps, maps.app.goo.gl, goo.gl/maps), up to 2,048 chars. Latitude/longitude are parsed from the URL when present. | | PUB |
| hours.weekly | Rec | per day: closed, or up to 3 shifts "HH:mm"; shifts may run past midnight (18:00 to 02:00); no overlaps | | PUB |
| hours.exceptions | O | date plus closed or special hours; up to 30 upcoming | 12 Nov: closed (Diwali) | PUB |
| hours.lastOrderMinutes | O | 0-120 | 30 | PUB |

**E. Contact**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| contacts[] | Rec | up to 4 public numbers; kinds mobile, landline, toll-free; stored in E.164; unique; exactly one primary | +91 95480 89761 | OPT (each has a "show on menu" switch) |
| contacts[].label | O | up to 24 | Reservations | PUB if shown |
| contacts[].whatsapp | O | mobile numbers only | yes | PUB if shown |
| contacts[].whatsappMessage | O | up to 120; neutral default | Hi, I'd like to know more about your menu. | PUB |
| reservations.mode | O | none, call, whatsapp or link | whatsapp | PUB |
| reservations.url | C (mode = link) | https, up to 2,048 chars | | PUB |

**F. Links**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| links.instagram | Rec | handle `^[A-Za-z0-9._]{1,30}$`; accepts "@name", "name", or any instagram.com URL | @mannat.tandoori.junction | PUB (placements per link) |
| links.facebook | O | facebook.com, fb.com or fb.me page URL, or a username | | PUB |
| links.youtube | O | channel URL (@handle, /channel/…, /c/…) | | PUB |
| links.website | O | https only; no IPs, no localhost | mannat.in | PUB |
| links.zomato / links.swiggy | O | host must be zomato.com or swiggy.com | | PUB |
| links.custom[] | O (INTERMEDIATE and up) | up to 2; label up to 24; https only | Catering enquiries | PUB |

Every link has three placement switches (cover, about, print) and a "pause" switch (stored but hidden). At most 8 links in total.

**G. Media**

| Field | Tier | Rules and limits | Example | Privacy |
|---|---|---|---|---|
| gallery[] | O | up to 6 / 15 / 30 photos (BASIC / INTERMEDIATE / PREMIUM); JPG, PNG, WebP, HEIC up to 8 MB; caption up to 80; tag: interior, exterior, food, team or event | | PUB |
| media.rightsConfirmed | R (first upload) | checkbox "I own or have permission to use these photos"; recorded | | PRV (audit) |
| items[].photo | O | same limits | | PUB |
| chefPicks | O | up to 6 starred dishes | | PUB |

**H. Menu content (existing model, refined)**

| Field | Tier | Rules and limits | Privacy |
|---|---|---|---|
| category.name | R | 1-40 | PUB |
| category.description | O | up to 120 | PUB |
| category.schedule | O | days and times (existing) plus a new optional date range for festival menus (IST) | PUB |
| item.name | R | 1-80 | PUB |
| item.description | O | up to 200 (warning above 120) | PUB |
| item.price | R | ₹0 to ₹99,999.99; blank only when variants exist; "half ≥ full" warns | PUB |
| item.variants | O | up to 8; names up to 24 (Half/Full, 2 Pcs/4 Pcs, Regular/Large) | PUB |
| item.diet | R | veg, non-veg, egg or vegan, **no default** (today unknown becomes veg) | PUB |
| item.spice, tags, allergens | O | spice 0-3; tags: Jain, eggless, chef, bestseller, new | PUB |
| item.addOns | O | existing add-on groups | PUB |
| item.availability | O | sold out or hidden | PUB |
| item/category Hindi names and descriptions | O | `i18n.hi` | PUB |

**I. Announcements and offers**

| Field | Tier | Rules and limits | Privacy |
|---|---|---|---|
| announcement | O | text up to 120; optional link (a category, a URL or WhatsApp); start/end (IST); one active banner | PUB while active |
| offers[] | O | title up to 40; details up to 160; price text up to 30 ("₹299", "Flat 20% off"); schedule (days, times, dates); up to 6 linked dishes; optional image; limits 1 / 5 / 10 active by plan | PUB while active |

Offers are display-only in this program. No automatic discounts in the cart.

**J. Ordering and service (PREMIUM, conditional)**

| Field | Tier | Rules and limits | Privacy |
|---|---|---|---|
| ordering.modes | C | switches: dine-in, takeaway, delivery | PUB |
| ordering.accepting | C | master switch; optional "follow my opening hours" | PUB |
| ordering.delivery.minOrder | C (delivery on) | ₹0-5,000 | PUB |
| ordering.delivery.fee | C (delivery on) | ₹0-500 or free text | PUB |
| ordering.delivery.areaNote | C (delivery on) | up to 120 | PUB |
| ordering.payNote | C | pay at counter, cash on delivery, UPI on delivery, card machine. Informational. We never collect payment. | PUB |
| tables[] | C (table ordering) | 1-200 labels; saved for table QR and order validation | PRV (only the scanned label shows) |
| serviceRequests | O | existing call-waiter switches | PUB |

**K. Notifications and privacy (Account)**

| Field | Rules |
|---|---|
| New-order email alert | on/off, default on for PREMIUM |
| Weekly summary email | on/off |
| Renewal reminders | always on |
| Data export and deletion requests | form to support, tracked |

### 3.3 Added beyond your list (important for Indian restaurants)
FSSAI licence number; PIN code and landmark; price and tax note and service-charge note; payments accepted; multi-shift, overnight and holiday hours plus last order; "accepting orders" switch; takeaway; Hindi names and text everywhere; festival date-range menus; Zomato and Swiggy links; reservation button; amenities; owner-approved story and founding year; WhatsApp preset message; saved table labels; per-restaurant WhatsApp/Instagram link previews; link-tap insights; slug history; image-rights confirmation; privacy retention for customer data; image alt text.

### 3.4 Deliberately not collected
A public email (spam, low demand); owner photo, Aadhaar or PAN; bank or UPI IDs (we collect no payments); "cost for two"; staff accounts; diner accounts (diners stay anonymous; name and phone only when ordering); GPS tracking; multiple outlets (single location per account in this program; `outlet_count` is kept for a later program).

### 3.5 Normalisation and validation rules

| Input | Accepted examples | Stored as | Rejected |
|---|---|---|---|
| Instagram | `@mannat.tandoori.junction`, `mannat…`, `instagram.com/mannat…/`, `https://www.instagram.com/mannat…/?hl=en` | handle only | `/p/…`, `/reel/…`, `/explore`, `/accounts` paths, more than 30 chars, other hosts |
| Facebook | `facebook.com/mannat`, `fb.me/mannat`, `mannat` | `https://www.facebook.com/<path>` | `profile.php` without id, other hosts |
| YouTube | `youtube.com/@mannat`, `/channel/UC…`, `/c/mannat` | canonical URL | video links, other hosts |
| Website | `mannat.in`, `https://mannat.in/menu` | `https://…` | `javascript:`, `data:`, IPs, localhost, credentials in the URL, mixed-script hostnames |
| Maps link | `maps.app.goo.gl/…`, `google.com/maps/place/…` | URL, plus latitude/longitude when found | other hosts |
| Phone | `9548089761`, `+91 95480 89761`, `09548089761`, `011-23456789`, `1800 123 4567` | `+919548089761` (landline `+911123456789`) | fewer or more digits; mobile not starting 6-9; duplicates |
| Hours | "10:00 AM", "22:30", `18:00 to 02:00` | `HH:mm` plus an overnight flag | overlaps; over 3 shifts; over 24 h |
| Any text | | trimmed, Unicode NFC, zero-width characters removed, plain text only, always rendered as text (never HTML) | HTML tags are stripped, URLs in names are rejected |

The server is the authority. The dashboard shows a live preview of the normalised value ("→ @mannat.tandoori.junction") from a shared fixture file that both sides are tested against (§14).

### 3.6 Publish gates and profile completeness
- **Blocks publishing:** no restaurant name; no category with at least one priced item; an item without a diet; Pure Veg declared while non-veg dishes exist; an invalid price.
- **Warnings (never block):** no contact, address, hours or Instagram; very long names; items without prices; low-quality photos.
- **Profile completeness (0-100), shown on Home:** contact 15, address plus maps 15, hours 15, Instagram or other link 10, cuisine plus diet 10, three or more dish photos 10, story or year 5, payments or amenities 5, FSSAI 5, announcement or offer 0 (not scored), **logo 0 (never scored)**. The remaining 10 points come from "menu has descriptions for 50% of dishes".

## 4. Information architecture: what appears where

### 4.1 Surfaces
**Cover**; **Guest bar** (sticky top bar with the Info button); **Info sheet** (bottom sheet from the Info button); **Announcement and offers**; **Inner pages**; **About & Visit** (new block B16, near the end, same content as the Info sheet but longer); **Back cover** (and the print footer); **Print menu** (A4/A5); **Table tent and stickers**; **Share image** (WhatsApp/Instagram link preview); **Checkout**; **Public API**; **Dashboard only**.

### 4.2 The matrix (this table is an executable spec: tests and the console's "Appears on" chips are generated from it)
● = shown by default; ○ = owner can switch it on/off; — = never.

| Field | Cover | Guest bar / Info sheet | Inner pages | About & Visit | Back cover and print | Table tent | Share image | Checkout |
|---|---|---|---|---|---|---|---|---|
| Name | ● | ● | ○ print header | ● | ● | ● | ● | ● |
| Logo | ● (logo version) | ● small | — | ○ | ● | ● | ● | — |
| Tagline | ● | — | — | ● | ○ | ○ | ○ | — |
| Cuisine tags | ● pill (first 3) | — | — | ● | — | — | — | — |
| Diet declaration | ● badge | ● | ● legend | ● | ● | ○ | — | — |
| Since year | ○ (on by default) | — | — | ● | ○ | — | — | — |
| Story | — | — | — | ● | — | — | — | — |
| Highlights | — | — | — | ● | — | — | — | — |
| Payments accepted | — | — | — | ● | ○ | — | — | ● |
| Price and service-charge note | — | — | ● page footer | — | ● | — | — | ● |
| FSSAI | — | — | — | ● small | ● | — | — | — |
| Address text | — | ● | — | ● | ● | ○ short | — | — |
| Maps (Directions) | ○ icon | ● | — | ● | ○ QR | — | — | — |
| Hours | ○ "Open now" pill | ● | — | ● table | ● one-line summary | — | — | ● orders disabled when closed |
| Phones | ○ call icon | ● | — | ● | ● primary | ○ | — | — |
| WhatsApp | ○ icon | ● | — | ● | ○ | ○ | — | — |
| Instagram | ● icon (default on) | ● | — | ● | ● handle plus QR | ○ QR | — | — |
| Facebook, YouTube, website | ○ | ● | — | ● | ○ | — | — | — |
| Zomato, Swiggy | — | ○ | — | ● | ○ | — | — | — |
| Gallery | ○ collage (some covers) | — | ○ interludes | ● | ○ | — | ○ | — |
| Announcement | ● banner | ● | — | — | — | — | — | — |
| Offers | ○ strip | — | ● B14 | ● | — | — | — | — |
| Ordering settings | — | ● cart | — | — | — | — | — | ● |
| Table label | — | ● "Table 7" chip | — | — | — | ● | — | ● |

Cover icon row: Instagram, WhatsApp, Directions and Call, at most 4. Each is an owner switch (per link placements).

### 4.3 Rules per surface
- **Cover:** at most 6 elements: name or logo, tagline, cuisine pill, diet badge, since-year or open-now pill, and the icon row. Never phone or address text, FSSAI, the hours table or the story. Cleaner covers sell better.
- **Guest bar:** name or logo (small), Info (ⓘ), search, veg filter, language switch (only when Hindi data exists), A+ text size, cart (PREMIUM, ordering on). "Powered by MenusQR" sits in the footer only.
- **Info sheet:** open-now status and today's hours, address with Get directions, phone and WhatsApp buttons, Instagram, other links, Share this menu.
- **Inner pages:** no contact information. Only the section content, the price note footnote, the veg/non-veg legend, and (in print) a running header and page numbers.
- **About & Visit (B16):** story, highlights, full week hours with today highlighted, address, map button, every enabled contact and link, payments, price note, FSSAI, Google review button (if the add-on is active), Share.
- **Back cover and print footer:** logo or name lockup, address line, primary phone, hours summary, Instagram handle with an auto-generated QR, website, FSSAI, price note, and a small "Powered by MenusQR".
- **Table tent and stickers:** the menu QR first. The back can carry the Instagram or Google-review QR.
- **Share image:** cover mini at 1200×630, rendered at publish. No phone numbers.
- **Checkout:** the pay-note ("Pay at the counter"), the delivery minimum and fee, and the restaurant's primary phone for order help.

### 4.4 Dashboard only, never public
Owner name, email and phone; legal name; outlets; GSTIN and billing details; plan and subscription dates; all customer order data and customer phone numbers and addresses; feedback comments and contact details; analytics; photo quality scores; "needs review" flags; draft designs and version history; audit logs; setup progress; table list (only the scanned label appears); upload rights confirmations.

### 4.5 Link presentation spec

| Type | Icon button / row | Behaviour on tap | Fallback |
|---|---|---|---|
| Call | phone glyph | `tel:+91…` | On desktop, copies the number ("Number copied") |
| WhatsApp | chat glyph | `https://wa.me/<number>?text=<message>` | Opens WhatsApp Web on desktop |
| Directions | pin glyph | opens the saved Maps link; otherwise `google.com/maps/search/?api=1&query=<name + address + PIN>` | Hidden if there is no address and no link |
| Instagram | camera glyph; text "@handle" | `https://www.instagram.com/<handle>/`, new tab | |
| Facebook, YouTube, website | glyph; the host shown ("mannat.in") | opens the stored URL | |
| Zomato, Swiggy | text chips "Also on Zomato" | opens the stored URL | |
| Custom | label plus host below it | opens the stored URL | |
| Share | share glyph | `navigator.share({title, url})` | Copies the link |

- All external links: `target="_blank" rel="noopener noreferrer"`. No embedded maps and no third-party iframes (privacy, speed, CSP).
- **Sizes:** cover icon buttons 44×44 px, 8 px gap; About rows 56 px tall; chips 36 px tall.
- **Colours:** monochrome glyphs tinted by the active design's palette so all 6 languages stay coherent.
- **Visibility:** each link has Cover / About / Print switches and a "Paused" switch. A paused or empty link is never rendered. No `href="#"`, no placeholders, no "example.com" (a lint check scans the built output for these).
- **Instagram QR** for back cover and tent is generated in the browser from the handle, so the owner does nothing.
- **Tap counting:** a privacy-safe beacon (`type` only, daily counter, no personal data) feeds Insights ("34 guests tapped Instagram this week").
- **We never fetch third-party URLs server-side** (no SSRF and no rate-limit risk). The owner verifies with a "Test link ↗" button.

## 5. Client console: screen by screen

### 5.0 Shell
- **Navigation (8 sections):** Home, Menu, Design, Restaurant, QR & Print, Orders (PREMIUM), Insights, Account.
  - This replaces today's nine items (Overview, Menu, Appearance, QR Code, Analytics, Guest Feedback, Orders, Subscription, Settings).
- **Desktop (1100 px and up):** 240 px sidebar; editors use a two-pane layout, the form on the left and a sticky live preview (390 px device) on the right.
- **Tablet (768-1099 px):** icon-only sidebar; preview opens as a drawer.
- **Phone (under 768 px):** bottom tab bar (Home, Menu, Design, Restaurant, More). Cards stack full-width, a sticky Save bar sits above the tabs, and Preview opens as a full-screen sheet with "Back to editing". Inputs are 16 px (no iOS zoom), with numeric keyboards for phone and price fields and camera capture for photos.
- **Offline:** a banner "You're offline, changes are not saved yet". No silent loss: the draft stays on screen.
- **Save model:**
  - **Restaurant facts** (name, contacts, hours, links): explicit "Save changes" per page. They go live immediately, with a 30-second Undo and an audit entry.
  - **Design:** autosaved draft, then Publish.
  - **Menu content:** instant on paid plans. BASIC collects edits and applies them as one change on "Publish menu changes".
  - A status pill always says Live, Draft, or Pending.
- **"Appears on" chips and preview highlight:** every field shows small chips ("Cover · Info · Print"). Focusing a field scrolls the preview to the place it appears and pulses it. This uses a `data-field` attribute on rendered elements.

### 5.1 Journey A: purchase → first live menu
1. **`/plans`** → **`/purchase/details`** (owner name, email with OTP, phone with OTP, restaurant name, business type, outlets, city, state, password; ★6 address removed) → review → Cashfree.
2. **`/purchase/success`:** "Payment received." Primary button **"Set up my menu (about 10 minutes)"** signs in with a single-use order-bound token valid for 15 minutes. Secondary: "I'll do it later" (a sign-in link is emailed).
3. **`/setup`** (full screen, no sidebar). Progress is saved on the server after every step. A rail shows Menu → Restaurant → Look → Go live, with the time left. Quit and the next login resumes at the same step, on any device.

**S0 Welcome:** "Namaste Rajesh! Let's build Mannat's menu." Start, or watch a 30-second demo.

**S1 Menu**
- Four ways in: Excel (template to download), photos or PDF of the printed menu (browser OCR, English plus Hindi, with a review grid), type it in (fast keyboard table), or skip (looks show clearly marked SAMPLE content that can never be published).
- Review table: categories (drag to reorder) and items; it auto-detects half/full, pcs and size variants; the owner sets diet per dish (a keyword guess, always confirmed); problems show in red (missing price, duplicates, ₹0).
- Optional dish photos: bulk upload, auto-match, quality badges.
- BASIC note: "Setup is unlimited. After going live, Basic includes 20 menu changes per billing period."

**S2 Essentials, "Your restaurant" (about 3 minutes, every optional field skippable)**
- Name (pre-filled), cuisine chips, food type (Pure veg / Veg + non-veg).
- **Phone on your menu:** pre-filled from the owner phone with a clear checkbox "Show this number to guests (visible to everyone who scans your QR)". Plus a WhatsApp checkbox.
- Instagram (any format, normalised live, "Test link").
- Address (structured, PIN, optional Maps link) and hours (quick presets, or custom).
- Logo (optional): live processing preview, "Does it show your name?".
- A live mini-preview shows the cover and Info sheet, with the changed element highlighted.

**S3 Look, "Your menu, 6 ways"**
- Six designs rendered with the real name, dishes and colour mood. The recommended one is first.
- Full preview on tap (cover → contents → two sections → back cover) with Try another colour, Shuffle, Use this design. Every plan can choose any look.

**S4 Go live**
- Summary and Design Score with one-tap fixes, and the publish gates from §3.6.
- **Publish my menu**, then a success screen: the big QR ("Scan it with your phone right now"), download QR, print table tents, Share on WhatsApp, Go to Home.
- The permanent QR is created here, as today.
- Onboarding state moves to COMPLETED; `setup_progress` records the steps.

```
┌─────────────────────┐
│ ●●○○  Step 2 of 4   │
│ Your restaurant     │
│ ~3 min · skip any   │
│ Restaurant name     │
│ [Mannat Tandoori…]  │
│ Cuisine (up to 5)   │
│ (North Indian)(Indo-Chinese)(+)
│ Food type ◉ Pure veg ○ Veg + Non-veg
│ Phone on your menu  │
│ [+91 95480 89761]   │
│ ☑ Show this number to guests
│   Visible to everyone who scans your QR
│ Instagram (optional)│
│ [@ handle or link ✓]│
│  ▸ Address & hours  │
│  ▸ Logo (optional)  │
│ [ Preview ▸ ]       │
│ [ Back ]  [Continue]│
└─────────────────────┘
```

### 5.2 Home
- **"Your live menu" card:** a real render of the cover in a phone frame; a status pill (Live, or "Design changes waiting to publish"); buttons View live menu, Show QR, Share on WhatsApp, Edit design.
- **Complete your profile (score):** a checklist with the benefit of each item ("Add opening hours: +15%, shows an 'Open now' badge"). The logo is never listed.
- **Menu health:** dishes without a price (blocker), empty categories, very long names (warning), blurry photos (info). Each is one tap from the fix.
- **Quick actions:** mark sold out, change prices (% per category), add today's special, download the print menu.
- **This week:** scans, views, top sections, taps on Instagram, Call and Directions (all plans see scans; the rest need INTERMEDIATE).
- **Plan card:** plan, renewal date, BASIC changes left (14 of 20), a contextual upgrade.
- **PREMIUM:** a live orders strip.
- **One-time review prompt** for migrated tenants: "This phone number is visible on your menu: Keep / Edit / Hide."
- **First-run state:** the "Finish setup (step 2 of 4)" banner until published.

```
Namaste, Rajesh                                  [View live menu] [Show QR]
┌─ Your live menu ────────┐ ┌─ Complete your profile 72% ───────────────┐
│  [phone render, cover]  │ │ ☑ Menu (205 items)   ☑ Phone & WhatsApp   │
│  ● Live · 1,284 scans   │ │ ☐ Opening hours  +15% shows 'Open now'    │
│  Design: Rangeen        │ │ ☐ Instagram      +10% shows on the cover  │
│  [Edit design] [Share]  │ │ ☐ 3 dish photos +10%                      │
└─────────────────────────┘ └──────────────────────────────────────────┘
┌─ Quick actions ─────────────────────────────────────────────────────┐
│ Mark sold out · Change prices · Today's special · Print menu         │
└──────────────────────────────────────────────────────────────────────┘
┌─ This week ───────┐ ┌─ Menu health 86 ───────┐ ┌─ Plan: BASIC ──────┐
│ Scans · Taps · Top│ │ 3 dishes w/o price ›    │ │ 14/20 changes left │
└───────────────────┘ └─────────────────────────┘ └────────────────────┘
```

### 5.3 Restaurant (new; replaces most of Settings)
Six tabs. All use the two-pane layout and "Appears on" chips.

1. **Identity:** name, Hindi name, tagline, cuisine tags, food type, since year, story, restaurant type. Name-lockup preview in the active design.
2. **Brand & Logo:**
   - upload a logo, then a processing result with before/after on light, dark and brand tiles; a "remove background" toggle with a threshold slider; crop and rotate; "Does it show your name?"; reset to original; remove logo;
   - brand colour mood chips or "from my logo";
   - the no-logo state says "Your name is your logo", with no warning.
3. **Location & Hours:** structured address with PIN, Maps link field with "Test link", and the hours editor (below). Preview shows the Info sheet.
4. **Contact & Social:** phone rows (label, number, show switch, WhatsApp switch, primary radio, up to 4), WhatsApp message, reservation button mode, then link cards (Instagram, Facebook, YouTube, website, Zomato, Swiggy, custom) each with normalised preview, placement switches (Cover / About / Print), a Pause switch and Test link. Preview shows the cover icon row and the Info sheet.
5. **Photos & Story:** gallery grid (drag to reorder; caption, tag; "use in: story / storefront / back cover"), cover photo picker, chef's picks, plus a usage meter ("12 of 15 photos, 38 of 150 MB"). First upload asks for the rights confirmation.
6. **Highlights & Legal:** amenities, payments accepted, price note, service-charge note, FSSAI number.

```
┌────────────┬───────────────────────────────────────────┬───────────────────┐
│ ▣ MenusQR  │ Restaurant › Contact & Social             │ LIVE PREVIEW   ⟲  │
│ Home       │ Phone numbers         shown on: Info·Back │ ┌───────────────┐ │
│ Menu       │ ┌──────────────────────────────────────┐  │ │   [ cover ]   │ │
│ Design     │ │ +91 │ 95480 89761 │ Reservations ▾ │  │ │               │ │
│▶Restaurant │ │ ☑ Show on menu ☑ WhatsApp ◉ Primary  │  │ │  (◎)(◎)(◎)    │ │
│ QR & Print │ └──────────────────────────────────────┘  │ │  icon row     │ │
│ Orders     │ [+ Add number]  (2 of 4)                  │ └───────────────┘ │
│ Insights   │ Social & links        shown on: Cover·Info│  ▸ Cover  ▸ Info  │
│ Account    │ ┌ Instagram ───────────────────────────┐  │ Preview with      │
│            │ │ [@ mannat.tandoori.junction        ✓]│  │ unsaved changes   │
│            │ │ → instagram.com/mannat.tandoori…     │  │                   │
│            │ │ ☑ Cover ☑ About ☑ Print  ⏸ Pause [Test ↗]│                   │
│            │ └──────────────────────────────────────┘  │                   │
│            │ [+ Add link ▾ Facebook YouTube Website …] │                   │
├────────────┴───────────────────────────────────────────┴───────────────────┤
│ ● 2 unsaved changes            [ Discard ]  [ Save changes · goes live ]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Hours editor**
```
Opening hours                                         ( ) Always open
Quick fill: [Daily 10-11] [Lunch + Dinner] [Copy Monday to all]
 Mon ◉ Open  [10:00 AM] – [11:00 PM]               [+ shift]
 Tue ◉ Open  [10:00 AM] – [11:00 PM]               [+ shift]
 Sat ◉ Open  [12:00 PM]–[3:30 PM]  [7:00 PM]–[2:00 AM +1 day]
 Sun ○ Closed
Last order: [30] minutes before closing
Holidays and special days: [+ Add date]   12 Nov (Diwali): Closed
Preview: "Open now · closes 11:00 PM"
```

### 5.4 Menu
Tabs: **Items · Categories · Offers & Announcements · Guest features · Import/Export**.
- **Layout:** categories on the left (count, drag to reorder, add, hide, schedule with `CategorySchedulePicker` plus a new date range for festival menus such as Navratri); items in the centre; a live preview of the selected category on the right.
- **Item editor:** name, Hindi name, description, price type (single / half-full / sizes / pieces / custom variants), diet (required, no default), tags, spice, allergens, photo (upload, library, none; plate frame and focal point), availability, add-ons, chef's pick.
- **Bulk tools:** Excel import (merge or replace) and export; % price change per category; sold-out with an automatic midnight reset.
- **Validation:** duplicates, missing or ₹0 prices, half ≥ full, name length.
- **Offers & Announcements:** one announcement banner (text, link, dates) and offers with a schedule and linked dishes. "Today's special" is a one-day offer that expires itself. Both show a preview and "Appears on".
- **Guest features:** the existing toggles (allergen filter, spice filter, trending, A+ accessibility), the language switch (English / Hindi / Both, shown once Hindi names exist), the legacy call-waiter switch moves to Orders.
- **How edits go live:** paid plans are instant ("Live ✓"); BASIC shows a "Pending changes" bar and "Publish menu changes" counts as **one** change. Sold-out toggles are free and instant. Two-device conflicts return 409: "This menu changed on another device. Reload."

### 5.5 Design (Studio)
As specified in the approved Atelier plan, with these integration points:
- The preview is the real customer view in a same-origin iframe at 390×844 (and 360/412/tablet), fed by `postMessage`, so the editor equals the phone.
- The Studio reads the profile live. It stores only design choices. Phone, hours and links are never copied into the design.
- **Cover controls:** archetype (name-led or logo version), element toggles (tagline, cuisine pill, since-year, open-now pill), the icon row (placements come from Restaurant → Contact & Social), hero photo, "Cover line" (a short script line owned by the design).
- **Pages:** per-block variants, order, move/merge sections, and signature moments (Contents, Story, Storefront, Thali frame, Matrix, Chef's pick, Offers, About & Visit).
- **Draft → Publish**, with history and rollback. "Preview on my phone" opens a signed 15-minute draft link.
- **BASIC** can choose looks and colour moods. Deeper controls are tried in the draft and need an upgrade to publish; nothing is published silently or partly.

### 5.6 QR & Print
- **Menu QR (permanent):** preview, test scan, download PNG, SVG or PDF. The QR never changes, even if the menu link name does.
- **Share:** copy link, Share on WhatsApp, and a "link preview" card showing how the link looks on WhatsApp.
- **Print kit** (generated from the current design, all browser-side; nothing heavy runs on the VM):
  - A6 two-sided table tent (front: cover mini and QR; back: Instagram, WhatsApp and Google-review QRs);
  - square and round stickers;
  - A4 counter standee;
  - full menu as A4 or A5 PDF (Paged.js pagination, 3 mm bleed, crop marks).
- **Social kit:** Instagram post (1080×1350), story (1080×1920), WhatsApp image.
- **Table QRs (PREMIUM):** saved table labels with print sheets.
- **"Order printed stickers"** uses the existing request flow.
- **Plans:** BASIC gets QR, sticker and tent; paid plans get the print menu and social kit.

### 5.7 Orders (PREMIUM)
Tabs: **Live · History · Ordering settings · Tables · Service requests.**
- **Ordering settings:** mode switches (dine-in, takeaway, delivery), accepting orders (with "follow my opening hours"), delivery minimum, fee and area note, the pay note, new-order email and sound alerts, call-waiter and request types.
- **Tables:** saved labels (1-200, bulk add "T1 to T20") for table QRs. If tables are defined, scanned labels are validated.
- **Live and History:** existing screens. A takeaway badge is added; dish photos use menu assets.
- **Closed state:** when "follow hours" is on and the restaurant is closed, diners see the closed message and the server rejects new orders.

### 5.8 Insights (INTERMEDIATE and up; BASIC sees scans plus a locked preview)
Tabs: **Overview** (scans, views, peak hours), **Menu** (popular sections and dishes, searches with no result, missing photos), **Links** (taps on Instagram, WhatsApp, Call, Directions, Share), **Guest feedback** (existing). A weekly email summarises them.

### 5.9 Account
Tabs: **Plan & billing** (plan, renewal, invoices, GSTIN and billing address, upgrade or downgrade, usage meters for photos and storage), **Security** (password, owner email and phone changes with OTP, active sessions, sign out everywhere), **Notifications**, **Data & privacy** (what we store, retention, export and deletion requests), **Help.**

### 5.10 Plan matrix (enforced on the server; the UI always explains)

| | BASIC | INTERMEDIATE | PREMIUM |
|---|---|---|---|
| Setup, any look and colour mood, live QR menu | ✓ | ✓ | ✓ |
| Profile, contacts, hours, standard social links | ✓ unlimited, never counted | ✓ | ✓ |
| Menu content after go-live | 20 per period (batch = 1); sold-out free | unlimited, instant | unlimited, instant |
| Gallery photos / storage | 6 / 50 MB | 15 / 150 MB | 30 / 300 MB |
| Custom links, offers | – / 1 active | ✓ / 5 active | ✓ / 10 active |
| Announcement banner | ✓ | ✓ | ✓ |
| Studio deep customisation | try in draft | ✓ | ✓ |
| Print menu, social kit, Hindi display, Insights | – | ✓ | ✓ |
| Ordering, tables, reception | – | – | ✓ |

Downgrade keeps the published design live. Controls above the new plan lock, with "Revert to plan defaults". Expiry makes the panel read-only with a renewal banner (existing WARNING/EXPIRING states and reminders).

## 6. Diner experience after scanning
1. **Scan** → `/qr/:id`. One API call returns the whole public menu (no extra round trip), then the address becomes `/menu/<slug>?qr=…` (and `&table=T7`). Shared `/menu/<slug>` links show the restaurant's own name and cover on WhatsApp and Instagram (§9, Edge middleware).
2. **Cover within about 2 s on 4G:** name or logo, tagline, cuisine pill, "Pure Veg" badge, "Since 2015", "● Open · closes 11 PM", and the icon row. A banner appears first if an announcement is active.
3. **Guest bar** stays at the top: Info (ⓘ), search, veg filter, language (English / हिंदी / Both), A+, and the cart (PREMIUM).
4. **Scroll:** contents (6+ categories), sections, offers, the story and the storefront block if the owner supplied them.
5. **Tap a dish:** a sheet with photo (if any), description, variants and add-ons.
6. **Info (ⓘ):** the Info sheet (see wireframe), with "Get directions", tap-to-call, WhatsApp, Instagram, other links, hours, Share.
7. **Ordering (PREMIUM):** only the modes the owner enabled. Takeaway asks for a name and phone; delivery adds the address and enforces the minimum order; dine-in uses the table label. The pay note shows ("Pay at the counter"). We never collect payment. After the order: status tracking (existing) and a feedback prompt (private). If the Google Reviews add-on is active, a review button appears.
8. **Closed:** if "follow my hours" is on, "We're closed now. Orders open at 10:00 AM." Browsing stays open.
9. **Expired subscription:** "Temporarily unavailable" (existing).
10. **Old slug:** redirects to the new one.
11. **Hindi:** English / हिंदी / Both, using Devanagari fonts in every design.
12. **Accessibility and weak phones:** A+ opens the reflowable list, minimum contrast AA, lazy images, a small first load.

```
┌──────────────────────┐   ┌──────────────────────┐
│ Mannat   🔍 ✓veg ⓘ ≡ │   │ ───                  │
│ ⚑ Diwali: 10% off    │   │ Mannat Tandoori Jn.  │
│                      │   │ ● Open · closes 11 PM│
│   MANNAT             │   │ ─────────────────────│
│   TANDOORI           │   │ 📍 E-36, Patel Nagar…│
│   JUNCTION           │   │   [Get directions]   │
│ Since 2015 · Pure Veg│   │ 📞 +91 95480 89761   │
│ North Indian · Indo-Ch│   │   [Call] [WhatsApp]  │
│   ◎  ◎  ◎            │   │ ◎ @mannat.tandoori…  │
│  [ View menu ▾ ]     │   │ 🕑 Today 10 AM–11 PM │
│                      │   │   ▸ Full week        │
└──────────────────────┘   │ Also on: Zomato Swiggy│
   (cover)                 │ FSSAI 12345678901234 │
                           │ [Share this menu]    │
                           └──────────────────────┘
                                (Info sheet)
```

## 7. Atelier foundation (approved), and how profile data feeds it

### 7.1 Design Languages (6, mood-based, cuisine-independent)
Each has 3 cover archetypes (a name-led version as primary, and a logo version), 16 block types with 2-3 variants each, 5 colour stories plus one derived from the logo (when there is one), three ornament densities, 2-3 type voices and 3-6 photo treatments. That is about 90 base looks, unique per restaurant after adaptation.

| Language | Mood | Colour stories | Type | Signature art | Covers |
|---|---|---|---|---|---|
| **Rangeen** | festive, bold, food-forward | Lal Mirch, Hara Masala, Kesar Indigo, Gulabi, Haldi | Anton or Bebas Neue, Poppins, Kaushan Script, Baloo 2/Mukta | doodles, starbursts, waves, blobs, watermark type, cut-outs bleeding off the page | Name Poster, Food Burst, Split Poster |
| **Shahi** | royal heritage | Maroon and Gold, Peacock, Emerald Court, Indigo Night, Rose Palace | Cinzel or Cormorant, Great Vibes, Tiro Devanagari | cusped arches, jaali, mandala, foil gradients | Jharokha, Medallion, Darbar Plaque |
| **Raat** | cinematic dark | Charcoal Saffron, Midnight Gold, Ember, Smoke and Brass, Wine | Sacramento or Great Vibes, Montserrat Black or Oswald | brush strokes, smoke, spotlight, brass lines | Spotlight, Brush Diamond, Neon Sign |
| **Mitti** | earthy, handmade | Terracotta, Neem, Indigo Dabu, Haldi, Kulhad | Rozha One or Yatra One, Kalam, Hind | block-print repeats, torn paper, stamps, flat ingredients | Block Print Label, Kulhad Still Life, Chalk and Kraft |
| **Bazaar** | street poster pop | Truck Art, Bollywood, Chowk, Neon Galli, Rickshaw | Bungee or Rubik Mono One, Yatra One, Poppins | truck-art borders, halftone, comic bursts, die-cut stickers | Film Poster, Truck Back, Sticker Bomb |
| **Sukoon** | calm, editorial | Ivory Sage, Blush Cocoa, Sky Linen, Matcha, Monochrome Luxe | Playfair or Cormorant, Outfit or Inter, Tiro Devanagari | botanical line art, hairlines, whitespace | Editorial, Initials, Grid |

Release order: Rangeen, then Raat and Shahi, then Mitti, Bazaar and Sukoon. Festival overlays (Diwali, Holi, Navratri, Eid, Christmas, national days, monsoon) come last, scheduled by the owner.

### 7.2 Blocks (shared by all languages)
B1 Cover · B2 Story · B3 Storefront/Gallery · B4 Contents · B5 Section opener · B6 List · B7 List + side art · B8 Photo grid · B9 Variant matrix · B10 Feature frame (thali, combo) · B11 Chef's pick · B12 Interlude band · B13 Cover line/slogan · B14 Offers · B15 Back cover · **B16 About & Visit.**

**Row grammar (B6):** name…price; name…half and full; name…2 pcs and 4 pcs; a matrix when 3 or more items share 2 or more variants; an optional Hindi line; a one-line description; inline quantity and tags; add-on rows and notes; icons (veg / non-veg / egg, chef, spice 1-3, bestseller, Jain) with an automatic legend; a missing price is hidden (never ₹0); an unknown diet shows no mark (and cannot exist, since diet is required).

### 7.3 Never-empty and truth rules
- **Image slots fall back** in this order: the owner's photo in the design's treatment; a weak photo with a stylising treatment (duotone, halftone, sticker outline, plate frame); a licensed library photo matched to the category, labelled "pictures are for illustration"; a derived illustration; the block's no-image variant (ornament and large type). Never an empty frame or a placeholder word. Library images are never attached to a specific dish row.
- **Identity fallback:** logo → name lockup. Both are first-class and judged by the same rubric.
- **Truth rule:** printed text comes only from owner data (the profile in §3), owner-written texts, computed facts ("Pure Veg" only when declared and consistent with every dish), and a small allowlist of neutral labels (Menu, Contents, Half, Full, Add-on, "Pictures are for illustration", "Open now"). A CI lint renders every language with minimal data and fails on any other string or any number that is not from data.

### 7.4 How profile data feeds the blocks
- **B1 Cover:** name or logo, tagline, cuisine tags, diet declaration, since year, open-now, and the icon row (link placements).
- **B2 Story:** story text plus the owner's gallery photos. **B3:** gallery photos tagged interior or exterior.
- **B4 Contents:** categories (names and page or anchor positions). **B5-B13:** the menu content and photos.
- **B14 Offers** and the announcement banner: offers and announcements.
- **B15 Back cover:** logo or name lockup, address, primary phone, hours summary, Instagram with QR, website, FSSAI, price note.
- **B16 About & Visit:** everything in the Info sheet plus story, highlights, payments, full hours.
- **Guest bar:** hours (open-now, computed in IST), ordering flags, Hindi availability.

### 7.5 Logo pipeline (optional input, handled perfectly when present)
Accepts PNG, JPEG, WebP, HEIC (converted in the browser), SVG (sanitised, rasterised by sharp), and PDF or AI (first page rendered by pdf.js). The original is always kept. The server (sharp, one job at a time, with `limitInputPixels`) is authoritative; the same algorithm runs in the browser for the live preview.
1. Orient, convert to sRGB.
2. Skip background removal if the image is already transparent.
3. Detect a flat background: one tight OKLab cluster covering at least 85% of the outer 3% ring.
4. Remove it by flood fill from the border (adaptive ΔE), feather 1 px, decontaminate edge colours (no halos). Enclosed areas (white aprons, black badge interiors) are kept unless the owner opts in.
5. Trim and add 4% padding.
6. Classify aspect (wide, landscape, square, tall), round badge or not, light or dark.
7. Extract colours (k-means).
8. Generate variants: full, mono-light, mono-dark, foil, plate, share image, icons.
9. Warn on low resolution (under 300 px of content) or a photo background.
10. Ask once: "Does the logo already show your name?"

**Placement:** each slot lists allowed presentations (plain, plate, mono, foil). The engine picks the first that reaches 3:1 contrast. Always `contain`. A circle is only a plate sized so the logo's bounding box fits inside (scale = d / √(w² + h²)). Never `object-fit: cover`. No logo means the name lockup, with no warning.

**Fixtures (the real files from Downloads):** the stock chef "Menu" logo (white JPEG; its apron stays; "Menu" is not the restaurant name, so the name prints), the Midnight Masala gold badge (black JPEG; treated as a badge, never nested in another circle), and the Midnight Masala wordmark (a 3:1 strip floating in a black square; trimmed and treated as wide; it already contains the name).

### 7.6 Photos and asset library
- **Owner photos:** HEIC conversion, EXIF orientation and resizing in the browser; upload as `multipart/form-data` (no base64). The server scores quality A, B or C (resolution, sharpness, exposure, colour cast), crops per slot using the focal point, and bakes grade variants per design. Treatments (duotone, halftone, sticker outline) are SVG filters at render time. A "plate frame" (the owner drags a circle over the plate) gives a cut-out look with no ML. Bulk upload with auto-match and a photo-booth capture overlay.
- **Variants diet (storage):** dish and gallery images keep webp at 640 and 1440 only. AVIF is made only for covers and hero images. Orphaned files are deleted on replace or delete. Content hashes dedupe.
- **Library (offline production in `tools/assets/`; self-hosted; never hotlinked):** 180 dishes cut out from Pexels, Pixabay and Unsplash downloads (rembg offline, hand QA, graded, shadow layer) plus 120 ingredient assets, with line, flat and halftone illustrations derived from the same photos, and an ornament and pattern set generated as SVG by code. A licence ledger (`LICENSES.csv`) covers every asset. No AI-generated food photos.
- **Library hosting:** library files are served as static assets from the frontend deployment (Vercel CDN), not from the 1 GB bucket.

### 7.7 Rendering architecture
- **Screens:** blocks stack on a 400-unit canvas and scale uniformly with `transform: scale(width / 400)`. No media queries or viewport units inside the canvas; `text-size-adjust: 100%`; fonts loaded before reveal. The same rendering everywhere by construction: editor, phone, desktop and QR menu.
- **Print:** the same blocks with per-format layouts, paginated by Paged.js (MIT) and exported through browser print with `@page` and 3 mm bleed. Text stays vector; no server Chromium.
- **Single canvases** (A6 tent, social images, share image): the same component, exported with html-to-image.
- **Text is real HTML** (accessible, translatable, zoomable); art is an inline SVG sprite recoloured by tokens.
- **Content and design stay separate:** prices, names and contacts are live data and reflow on every edit. Published designs pin a `languageVersion` so updates never silently change a live menu.
- **Budgets:** initial JS 180 KB gzip or less; each design pack 120 KB gzip or less (lazy); LCP 2.0 s or less on 4G mid-range Android; CLS 0.02 or less.

## 8. Data model and migrations (all additive; nothing dropped)
Existing migrations end at `017_service_requests.sql`. New ones start at 018.

```sql
-- 018_restaurant_profiles.sql
CREATE TABLE restaurant_profiles (
  tenant_id        VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  display_name     VARCHAR(80) NOT NULL,
  tagline          VARCHAR(80),
  story            TEXT,
  established_year SMALLINT CHECK (established_year BETWEEN 1900 AND 2100),
  restaurant_types TEXT[] NOT NULL DEFAULT '{}',
  cuisine_tags     TEXT[] NOT NULL DEFAULT '{}',
  diet_declaration VARCHAR(20) CHECK (diet_declaration IN ('PURE_VEG','VEG_AND_NON_VEG')),
  highlights       TEXT[] NOT NULL DEFAULT '{}',
  payments         TEXT[] NOT NULL DEFAULT '{}',
  price_note       VARCHAR(20),
  service_charge_note VARCHAR(80),
  fssai            CHAR(14),
  address          JSONB,        -- {line, area, city, state, pincode, landmark}
  maps             JSONB,        -- {url, lat, lng}
  hours            JSONB,        -- {weekly, exceptions, lastOrderMinutes, note}
  contacts         JSONB NOT NULL DEFAULT '[]',  -- [{id,label,kind,number,public,whatsapp,whatsappMessage,primary}]
  links            JSONB NOT NULL DEFAULT '[]',  -- [{type,value,placements:{cover,about,print},paused}]
  reservations     JSONB,
  i18n             JSONB NOT NULL DEFAULT '{}',  -- {hi:{name,tagline,story}}
  review_flags     JSONB NOT NULL DEFAULT '{}',  -- set by backfill: {phone:true,...}
  version          INTEGER NOT NULL DEFAULT 1,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by       VARCHAR(255)
);

-- 019_brand_and_media.sql
CREATE TABLE brand_kits (
  tenant_id       VARCHAR(255) PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  logo            JSONB,   -- {mediaId, includesName, aspect, isBadge, background, bbox, variants{}, luminance, warnings[]}
  palette         JSONB,   -- {primary, secondary, neutral, source}
  colour_mood     VARCHAR(30),
  cover_media_id  VARCHAR(255),
  share_image_key TEXT,
  version         INTEGER NOT NULL DEFAULT 1,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE menu_media (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL,     -- logo_original|logo|cover|gallery|dish
  storage_key TEXT NOT NULL, variants JSONB, width INT, height INT, bytes INT, mime VARCHAR(40),
  content_hash CHAR(64), quality_grade CHAR(1), quality_flags JSONB,
  focal JSONB, crops JSONB, caption VARCHAR(80), alt_text VARCHAR(160), tag VARCHAR(20),
  linked_item_id VARCHAR(255), sort_order INT DEFAULT 0, rights_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deleted_at TIMESTAMP
);
CREATE INDEX idx_menu_media_tenant ON menu_media (tenant_id, kind) WHERE deleted_at IS NULL;

-- 020_marketing_and_ordering.sql
CREATE TABLE restaurant_announcements (...);   -- text, link, i18n, starts_at, ends_at, active
CREATE TABLE restaurant_offers (...);          -- title, details, price_text, schedule, item_ids, media_id, active, i18n
CREATE TABLE ordering_settings (...);          -- modes, accepting, auto_by_hours, delivery{}, pay_note[], version
CREATE TABLE dining_tables (...);              -- tenant_id, label, sort_order, active
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS i18n JSONB;  -- {hi:{name,description}}

-- 021_setup_design_slugs.sql
CREATE TABLE setup_progress (tenant_id PK, steps JSONB, current_step VARCHAR(20), completed_at TIMESTAMP, updated_at TIMESTAMP);
CREATE TABLE design_documents (tenant_id PK, draft JSONB, published JSONB, language_id VARCHAR(30), language_version VARCHAR(20), draft_version INT, published_version INT, updated_at TIMESTAMP);
CREATE TABLE design_history (...);             -- version snapshots for rollback
CREATE TABLE menu_slug_history (tenant_id, slug UNIQUE, changed_at);
CREATE TABLE link_clicks_daily (tenant_id, day DATE, kind VARCHAR(20), count INT, PRIMARY KEY (tenant_id, day, kind));
```
Profile changes use the existing `audit_logs` table.

### 8.1 Back-compat map (dual-write for two releases; the legacy columns are never dropped)

| Legacy | New home | Migration rule |
|---|---|---|
| `clients.business_name` | stays the legal name | `display_name` ← `appearance_settings.restaurant_display_name` or `business_name` |
| `clients.tagline` / `appearance_settings.tagline` | `profile.tagline` | prefer the appearance value |
| `clients.phone` | `contacts[0]` (public) | split comma-separated numbers; normalise; flag `review_flags.phone` (keeps today's behaviour, adds the one-time prompt) |
| `clients.address, city, state` | `address` | the free text goes into `line`; no guessing of area or PIN; flag for review |
| `clients.opening_hours` | `hours.note` | `weekly` stays empty until the owner converts; no auto-publish of parsed hours |
| `clients.cuisine` | `cuisine_tags` | split on commas, trimmed |
| `clients.instagram, facebook, website` | `links` | normalised; unparseable values kept raw with a review flag and **not** rendered |
| `clients.logo_url`, `appearance_settings.logo`, `theme.brand.logoUrl` | `brand_kits.logo` | newest wins; the others recorded as `legacy` |
| `clients.description` | not published | offered as "Use this as your story?" |
| `menuFeatures.whatsappChat` | `contacts[].whatsapp` | read both while dual-writing |
| `theme.announcement` | `restaurant_announcements` | copied; legacy renderers keep their copy |
| `appearance_settings.cover_image` | `brand_kits.cover_media_id` | if set |

**Backfill procedure:** idempotent; fills only NULLs; dry-run mode writes a per-tenant diff report; rehearsed on a database snapshot; no deletes. Writers that touch `clients` (`app.js:267, 669, 940, 1142`; `admin.js:482`) all call one `profileService`, which writes the new tables and the legacy columns together. A nightly job compares both sides and must report zero differences.

### 8.2 Cache and versions
`contentVersion` = hash of profile, design, menu, ordering and announcement versions. It is the ETag of the public payload. Every write goes through one `publishChange(tenantId, kind)` that invalidates the in-memory (and optional Redis) cache.

### 8.3 Storage budget
Per-tenant quotas (§5.10) are tracked in `menu_media.bytes`. The free 1 GB bucket holds roughly 25-60 active tenants. Phase 1 adds usage accounting and an alert at 70% full. The scale path is S3-compatible object storage on the existing Oracle account (Always Free object storage, to be verified), which needs only configuration because the S3 driver exists.

## 9. API specification

**Error format (all endpoints):** `{ "error": "Please fix the highlighted fields.", "code": "VALIDATION", "fields": { "contacts.0.number": "Enter a 10-digit mobile number starting with 6-9." } }`. Concurrency uses a `version` field (409 on mismatch).

### 9.1 Owner API (session cookie, CSRF, tenant from session)

| Method and path | Purpose | Notes |
|---|---|---|
| `GET /api/app/profile` | full profile, completeness, review flags | |
| `PATCH /api/app/profile/:section` | `identity`, `location`, `hours`, `contacts`, `links`, `highlights`, `legal`, `reservations` | validated, normalised, audited, versioned; returns the normalised object and warnings; **does not count against BASIC changes** |
| `POST /api/app/profile/normalize` | pure normalisation preview (no DB) | feeds the live "→ @handle" hints |
| `GET/PUT /api/app/brand`, `POST/DELETE /api/app/brand/logo`, `POST /api/app/brand/logo/reprocess` | brand kit and logo pipeline | |
| `POST /api/app/media` (multipart), `GET /api/app/media?kind=`, `PATCH/DELETE /api/app/media/:id`, `POST /api/app/media/bulk-assign` | media library | size, type and pixel limits; soft delete; warns if the image is in use |
| `GET/POST/PATCH/DELETE /api/app/announcements`, `/api/app/offers` | marketing | plan limits enforced |
| `GET/PATCH /api/app/ordering`, `GET/PUT /api/app/tables` | PREMIUM | `autoByHours` enforced on order creation |
| `GET /api/app/setup`, `PATCH /api/app/setup/steps/:step`, `POST /api/app/setup/complete` | server-side setup progress and publish gates | replaces the one-shot onboarding save |
| `GET/PUT /api/app/design`, `POST /api/app/design/publish`, `GET /api/app/design/history`, `POST /api/app/design/rollback` | design draft and publish | draft carries a version |
| `POST /api/app/design/preview-token` | 15-minute signed draft link | |
| `GET /api/app/menu-slug/check`, `PATCH /api/app/menu-slug` | slug rules | 3-40 chars, lowercase letters, digits and hyphens; reserved words blocked; 30-day cooldown; history kept |
| `GET /api/app/insights?range=` | scans, menu, links | existing analytics plus link taps |
| Account: owner email and phone change with OTP, sessions list, data export and deletion requests | | |

### 9.2 Public API

| Method and path | Purpose |
|---|---|
| `GET /api/public/menus/:slug` | the public menu (versioned payload below). ETag; `Cache-Control: public, max-age=30, stale-while-revalidate=300` |
| `GET /api/public/qr/:qrId/menu` | the same payload, resolved from the QR id in one call (saves a round trip) |
| `GET /api/public/menus/:slug/meta` | tiny payload for link previews (name, tagline, share-image URL, city) |
| `POST /api/public/menu/:slug/link-click` | beacon `{type}`; rate limited; counter only |
| `GET /api/public/preview/:token` | draft payload (no-store, noindex, ordering disabled) |

**Public payload v2 (whitelist, built by one function; never `SELECT *`):**
```json
{
  "v": 2, "contentVersion": "p12.d7.m340", "serverNow": "2026-10-31T09:41:07+05:30",
  "restaurant": {
    "name": "…", "nameHi": "…", "tagline": "…", "since": 2015,
    "cuisine": ["North Indian"], "diet": "PURE_VEG", "story": "…",
    "highlights": ["ac","parking"], "payments": ["cash","upi"],
    "priceNote": "INCLUSIVE", "serviceChargeNote": null, "fssai": "12345678901234",
    "address": {"line":"…","area":"…","city":"…","state":"…","pincode":"201001","landmark":"…"},
    "maps": {"url":"…","directionsUrl":"…"},
    "hours": {"weekly":{}, "exceptions":[], "lastOrderMinutes":30},
    "contacts": [{"label":"Reservations","display":"+91 95480 89761","number":"+919548089761","whatsapp":true,"primary":true,"waLink":"https://wa.me/919548089761?text=…"}],
    "links": [{"type":"instagram","handle":"…","url":"https://www.instagram.com/…/","placements":{"cover":true,"about":true,"print":true}}],
    "logo": {"url":"…","aspect":"wide","isBadge":false,"includesName":false,"variants":{}},
    "gallery": [{"url":"…","w":1440,"h":960,"caption":"…","alt":"…","tag":"interior"}]
  },
  "announcement": null, "offers": [],
  "ordering": {"enabled":true,"accepting":true,"modes":["DINE_IN","TAKEAWAY"],"delivery":{},"payNote":["PAY_AT_COUNTER"]},
  "features": {}, "design": {}, "googleReview": null, "categories": [], "items": []
}
```
**Never in the public payload:** owner details, GSTIN, billing, plan id or subscription dates, review flags, quality grades, the table list, draft data, the raw `accentConfiguration`. For 30 days after the new frontend ships, the legacy fields (`restaurant.phone/instagram/facebook/website/logo`, `plan`, `templateId`, `theme`, `accentConfiguration`) stay so cached older clients keep working. A sunset date is then recorded and they are removed.

**Per-restaurant link previews:** a Vercel Edge Middleware (free) answers WhatsApp, Facebook, Telegram, X, LinkedIn, Slack and Discord crawlers for `/menu/:slug` with a small HTML page whose `og:title`, `og:description` and `og:image` come from `/meta` (the share image rendered at publish). Humans pass through to the SPA. The pages stay `noindex`. (Vercel limits to be verified.)

## 10. Validation, privacy and permissions

### 10.1 Validation architecture
- The server is the authority. The dashboard repeats the rules only for instant feedback. Both are tested against one shared fixture file (`profile-fixtures.json`, 250+ cases: Instagram 40, phone 60, URLs 50, hours 40, address 20, other 40), so they cannot drift.
- Phone parsing uses libphonenumber-js in the dashboard and server only. The public payload carries pre-normalised numbers, so the diner bundle needs no library.
- All text is stored as plain text and rendered as text nodes. HTML is stripped.
- URL safety: scheme allowlist (https only, plus `tel:` generated by us), per-platform host allowlists, no credentials in URLs, length up to 2,048, mixed-script (homograph) hostnames rejected, `rel` attributes forced.

### 10.2 Privacy
- Classes: public, public after consent (phones and links with a visible switch), and private (§4.4). Switching a number or link on shows "Visible to everyone who scans your QR."
- The public payload comes from a whitelist builder. A **canary test** puts unique sentinel strings into every private field and asserts they never appear in any public response, preview HTML or share image.
- Customer data (name, phone, address from orders) is shown only to that restaurant. **DPDP Act 2023 alignment:** a notice at checkout ("We share your name, phone and address with {Restaurant} to fulfil this order"); retention of 90 days, after which order PII is anonymised while totals stay; export and deletion on request.
- Analytics hold no personal identifiers. Logs carry no phone numbers or addresses.
- Owner phone and email changes need an OTP to the new value. The owner is emailed on every change.

### 10.3 Permissions and abuse
- Single owner role. Every query filters on `tenant_id` from the session. **Cross-tenant tests (IDOR)** run against every owner endpoint.
- Admin edits (admin panel) go through the same `profileService`, and every field change is audited with the actor.
- Plan entitlements are enforced on the server for each endpoint in §9.1 with clear errors the UI always shows.
- Uploads: MIME sniffing, size cap 8 MB, pixel limit, SVG sanitising, EXIF stripped, rate limit per tenant, one image job at a time.
- Public link-click and order endpoints are rate limited per IP and per tenant (existing patterns).
- Custom links: INTERMEDIATE or higher, host shown beside the label, and a "Report this link" path to the admin.
- Expired subscriptions: the panel goes read-only; the public menu follows today's rule.

## 11. Visual and component specifications

### 11.1 Console design system ("Console v2")
- **Look:** keeps the current dark-green identity (surface `#151c19`, card `#1d2723`, border `#2a3832`, accent `#e8783c`) behind a token layer (CSS variables), so a light theme can follow without rework.
- **Type:** Plus Jakarta Sans for the UI; Mukta for Devanagari hints; sizes 12/14/16/20/28; line height 1.5.
- **Space and shape:** 4 px scale; radius 12 for fields and 16 for cards; elevation by border and soft shadow.
- **Interaction:** 150-200 ms motion that respects reduced-motion; 2 px accent focus ring; 44 px minimum targets; AA contrast.
- **Tone:** simple English with Hindi hints on key fields ("Restaurant ka naam"). Friendly empty states drawn from the ornament packs; skeleton loaders; no spinners over 1 s without text.

### 11.2 Components
`Field` (label, helper, example, error, "Appears on" chips) · `SaveBar` (unsaved count, Discard, Save, Undo toast) · `SectionCard` · `StatusPill` (Live, Draft, Pending) · `CompletenessRing` · `ChecklistRow` · `LinkField` (normalised preview, placements, Pause, Test) · `PhoneField` (+91 prefix, mask, numeric keyboard) · `HoursEditor` · `AddressFields` · `MapsLinkField` · `ImageDropzone` (progress, quality badge, rights checkbox) · `LogoStudio` (before/after tiles, threshold, crop) · `PhotoGrid` (drag reorder, caption, tag) · `MenuTable` · `PreviewFrame` (same-origin iframe, `postMessage` model, highlight) · `UpgradePrompt` · `Toast` · `EmptyState`.

### 11.3 Public components (sizes in the 400-unit canvas)
`ContactIconButton` (44 px, tinted glyph, `aria-label` "Open our Instagram") · `InfoSheet` · `OpenNowPill` (computed from IST hours and `serverNow`, so a wrong phone clock cannot show the wrong status) · `HoursTable` (today highlighted) · `LinkChip` · `Announcement` · `OfferCard` · `PaymentChips` · `AmenityChips` · `ShareButton` · `LanguageSwitch` (English / हिंदी / Both) · `ClosedBanner`.

### 11.3a Field microcopy examples
| Field | Helper | Example | Error |
|---|---|---|---|
| Instagram | "Paste your page link or just your @name." | @mannat.tandoori.junction | "That looks like a post link. Open your profile and copy that link." |
| Phone | "Guests will see and tap this number." | 98765 43210 | "Enter a 10-digit mobile number starting with 6, 7, 8 or 9." |
| PIN code | "6 digits, from your address." | 201001 | "A PIN code has 6 digits." |
| Maps link | "Open Google Maps, tap Share, Copy link." | https://maps.app.goo.gl/… | "Please paste a Google Maps link." |
| FSSAI | "14-digit licence number, shown at the bottom of your menu." | 12345678901234 | "An FSSAI number has 14 digits." |
| Tagline | "A short line under your name (optional)." | Authentic Taste Since 2015 | "Keep it under 60 characters." |

## 12. Architectural conflicts and resolutions

| Conflict | Decision | Why |
|---|---|---|
| Two sources of truth for contact data (`clients.*`, appearance, theme brand, `menuFeatures`) | One `restaurant_profiles` plus `brand_kits`, behind one `profileService`; dual-write for two releases; nightly parity check | Stops drift. Rollback stays safe because the legacy columns stay current. |
| Owner phone vs public phone | `users.phone` stays private; public numbers live in `contacts[]` with an explicit switch | ★2. Privacy by default. |
| Facts vs designs: instant or draft? | Facts instant with Undo and audit; designs draft then publish; menu content instant (paid) or batched (BASIC) | Accuracy matters more than staging for facts. |
| BASIC quota counts profile edits | Only menu content counts | ★1. Fixing a typo is not a menu change. |
| Instant facts vs the 60 s public cache | Every write calls `publishChange`, which invalidates the cache; the ETag changes | Facts show up immediately. |
| One 2,272-line wizard mixing design and data, with a local-only draft | A new `/setup` with server-side progress and four steps; the old route stays for in-flight users, then redirects | Resume on any device; a failure no longer loses work. |
| Admin edits bypass validation | Admin uses `profileService` too | One rule set, one audit trail. |
| Free 1 GB bucket | Quotas, a variants diet, usage accounting; Oracle object storage as the scale path | Avoids a surprise outage. |
| Gemini voice greeting vs no-AI and no-cost | ★3: stop generating; keep playing existing audio | Respects your constraint without breaking live menus. |
| Preview is a narrow div while media queries see the desktop | A same-origin iframe at real phone width with `postMessage` | Editor equals phone. |
| QR flow loads the SPA, then resolves the slug, then loads the menu | One `GET /api/public/qr/:qrId/menu` | Saves a round trip. |
| Link previews show the generic MenusQR card | Edge middleware for crawlers | The restaurant's brand on WhatsApp. |
| Reservations have no backend | ★7: a button only | Out of scope for this program. |
| Multiple outlets | Out of scope: single location per account for now | Keeps this program deliverable. |
| `order_type` only knows DINE_IN or DELIVERY (`public.js:458-459`) | Add TAKEAWAY, update reception and analytics | ★4. |

## 13. Implementation phases (three tracks; flags: `profile_v2`, `console_v2`, `atelier`)

**Phase 0: Safety and privacy hotfix (week 1)**
- Remove fabricated and placeholder text from legacy designs; restore the `heritage-arch` cover from `51945ee^`.
- Server-side normalisation and validation on the existing settings endpoint (`app.js:1106-1150`); one shared `normalizeSocial`.
- ★1: stop counting profile edits against BASIC.
- Stop copying the signup phone silently into the public phone for new tenants (★2); add the review prompt for existing ones.
- Hide AI voice generation (★3).
- Replace the 13 fake dishes on empty menus with "Menu coming soon" (`public.js:184-207`).
- Fix ₹0, the default veg mark and the stray "0".
- Exit: the truth lint passes on all legacy presets; Shankar Dhaba and Shobharam's are clean at 390 px.

**Phase 1: Data foundation (weeks 2-4, Track P)**
- Migrations 018-021; `profileService`, the resolver and dual-write; backfill with dry-run report; shared fixtures and validators; public payload v2 with canary test; profile, brand, media, setup and slug APIs; admin through `profileService`; media pipeline v1 (logo and photo); storage accounting; Edge middleware for link previews; the one-call QR endpoint.
- Exit: 250+ validator cases pass on both sides; the canary test passes; nightly parity shows 0 diffs; the backfill report is reviewed; IDOR tests pass.

**Phase 2: Atelier engine and Rangeen (weeks 3-8, Track D, overlaps Phase 1)**
- Engine, Template Lab, truth lint, parity tests; Rangeen complete (3 covers in name-led and logo versions, 16 blocks); the block set reads the profile model; library v1 (60 dishes, illustrations, Rangeen ornaments).
- Exit: the quality criteria (§14) pass on all fixtures, with and without a logo and photos.

**Phase 3: Console v2 (weeks 5-11, Track C)**
- Shell, Setup S0-S4, Home, Restaurant (6 tabs), Menu v2, Design Studio v1 with the preview iframe, QR & Print basics, plan rules, emails.
- Pilot (week 9): three consenting tenants (Shankar Dhaba, Shobharam's and one more). New signups use it from week 11.
- Exit: 5 new owners go from payment to a live menu in 15 minutes or less without help; at least 4 of 5 say they would proudly show it; parity and ordering regressions pass; the matrix and control tests pass.

**Phase 4: Ordering, offers, insights, account, exports (weeks 10-15)**
- Ordering settings, takeaway, tables, offers and announcements, Insights with link taps, Account (billing, security, data and privacy), full print kit and social kit.
- Exit: the order flow passes for each mode; print proofs of 3 sample menus are checked on paper.

**Phase 5: Collection and growth (weeks 12-20)**
- Raat and Shahi, then Mitti, Bazaar and Sukoon; the library grown to 180 dishes and 120 ingredients; festival overlays; Brand Twin (the owner's own PDF as artwork pages, with OCR assist); an opt-in "new look" upgrade for existing tenants (old designs stay in history); the marketing gallery built from real renders; legacy Editions retired from the picker and dead code removed.
- Existing tenants move only when they choose to. Nobody's published menu changes without owner action (after the Phase 0 accuracy fixes).

**Rollback:** every migration is additive with a down script; flags off returns to the legacy path; dual-write keeps the legacy columns current.

## 14. Testing and quality criteria

**Executable specs**
- **Field matrix test:** the matrix in §4.2 is a JSON file. For every field, a test sets a sentinel value, publishes, and asserts it appears on exactly the mapped surfaces and nowhere else; toggling a placement removes it. The same file generates the "Appears on" chips.
- **Persistence round trip:** for every field: set it in the UI, reload, check the value; publish; check the public API and the rendered menu.
- **Control manifest:** every console control is registered (id, screen, API, test id). CI fails if a control lacks a test or a manifest entry has no element. A Playwright crawl clicks every control with seeded data and fails on dead buttons or console errors.
- **No dead fields:** every stored field must have at least one consumer or be marked private (static check).
- **No placeholders:** a scan of built output for `href="#"`, `javascript:`, "example.com", "yourwebsite", "lorem", "@ApnaDhaba".
- **Canary privacy test** (§10.2) and **IDOR tests** on every owner endpoint.
- **Validator fixtures** (250+) run on both server and dashboard.

**Quality bars (measurable)**

| Area | Criterion |
|---|---|
| Design | Every language averages 4.0 or more out of 5 on the rubric (hierarchy, balance, food appeal, legibility, finish) from the product owner and 3 restaurant owners; name-led covers score no lower than logo covers |
| Contrast and size | Body text 4.5:1 or more and large text 3:1 or more on every text node; effective text 12.5 px or more at 360 px width; tap targets 44 px or more |
| Logos | Zero cropped pixels; 3:1 or more against the background; the 3 real logo files pass; clean removal on at least 90% of a 30-logo set |
| Images | Zero empty slots; each photo at 1.5 times its display size or treated or replaced |
| Truth | Zero fabricated strings or numbers |
| Parity (editor vs phone) | 0.2% pixel difference or less in Chromium; 1% or less in WebKit |
| Print | 3 mm bleed; photos at 250 dpi effective or a warning |
| Performance | LCP 2.0 s or less on 4G mid-range Android; CLS 0.02 or less; JS within budget; public endpoint holds 50 requests per second on the VM (autocannon) |
| Accessibility | axe reports no serious issues; dish and price are read by screen readers; Hindi renders in Devanagari fonts with no letter-spacing |
| Hours | Open-now correct across overnight shifts, holidays and a wrong device clock |
| Migration | Backfill dry-run loses no logo, number or link; the rollback rehearsal restores the legacy path |
| Product | Sign-up to a live menu in 15 minutes median; setup completion 80% or more; profile completeness 70% or more within 7 days; design-related support tickets down 80% |

## 15. Risks, assumptions and what is not verified
- **Size of the program:** about 20 weeks. Mitigated by phases, pilots and flags. The first visible fixes land in week 1.
- **Assets set the quality ceiling.** Free photos and code-made art go far. Hand-drawn mascots and lettering (as in Mannat's menu) come from the restaurant. A freelance illustrator for ornament packs would be the biggest quality jump, but it costs money, so it stays optional.
- **Owner photo quality varies:** treatments and the photo-booth guide raise the floor but cannot hide everything.
- **Hindi in display and script styles** has no direct equivalent. Each design defines a Devanagari pairing, tested on bilingual fixtures.
- **Print colour:** printers convert RGB to CMYK, so we give a proof checklist, not exact-colour promises.
- **Storage and egress** on the free tier are the first scaling limit (§8.3).
- **Third-party limits to verify:** Vercel Edge Middleware on the free plan; Oracle Always Free object storage compatibility.
- **Another AI session editing the same files:** the new modules get one owner; the truth lint, visual regression and parity tests become required checks on `main`.
- **Not verified:**
  - The Studio, onboarding and Settings were read from code and not used while logged in (I can't sign in to production).
  - No production database queries were run, so tenant counts per issue are unknown.
  - The "Mannat" menu was used only as a design reference; none of its content is reused.
  - Your message mentioned a cover reference image, but none arrived separately, so the Mannat cover and the earlier three images served as references.
