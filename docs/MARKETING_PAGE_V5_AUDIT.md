# MENUQR MARKETING WEBSITE V5 — PAGE AUDIT & DEDUPLICATION MATRIX

## EXECUTIVE SUMMARY

A comprehensive page audit of the MenuQR marketing website was conducted across all 12 page sections. The audit identified section overlap between `PhysicalQrSection` and `BuiltForTableSection`, minor horizontal alignment variances across section containers, and opportunity to standardize CTA button labels and vertical spacing rhythm.

---

## 1. SECTION INVENTORY & DEDUPLICATION MATRIX

| Section | Primary Concept | Status | Action / Decision |
| :--- | :--- | :--- | :--- |
| **01. HeroSection** | Value Proposition: "Your menu changes. Your QR code doesn't." | **Keep** | Primary hero narrative. |
| **02. OneQrSection** | Real-time live menu price sync behind permanent QR | **Keep** | Interactive price toggle proof. |
| **03. PhysicalQrSection** | Physical acrylic/metal placards & table tokens | **Merged** | **DUPLICATE IDENTIFIED**. Merged into `BuiltForTableSection`. |
| **04. BuiltForTableSection** | Physical table placement & hardware durability | **Keep (Enhanced)** | Enhanced to include physical hardware specs + placement spots. |
| **05. TemplateGallerySection** | 15 distinct art-directed menu templates (V5) | **Keep** | Primary template showroom. |
| **06. DashboardDemoSection** | Real-time operator control panel & stock toggles | **Keep** | Primary dashboard management proof. |
| **07. SubscriptionSection** | QR preservation & subscription expiry timeline | **Keep** | Primary QR lifecycle & safety proof. |
| **08. HowItWorksSection** | 3-step setup workflow (Build -> Place -> Update) | **Keep** | Simple 3-step onboarding guide. |
| **09. CustomerExperienceSection** | Guest mobile scanning & live menu filtering | **Keep** | Guest scanning experience demo. |
| **10. PricingSection** | Subscription plans & feature comparison | **Keep** | Transparent pricing table. |
| **11. FaqSection** | Frequently asked questions & answers | **Keep** | Accordion FAQ. |
| **12. FinalCtaSection** | Bottom conversion section | **Keep** | Compact conversion CTA. |
| **Header & Footer** | Site navigation & legal links | **Keep** | Global navigation shell. |

---

## 2. NARRATIVE JOURNEY MAP

The page follows a streamlined 11-step story:

1. **WHAT IS MENUQR?** → HeroSection
2. **WHY IS THE QR SPECIAL?** → OneQrSection (Live price sync demo)
3. **WHERE & HOW DOES IT LIVE AT THE TABLE?** → BuiltForTableSection (Hardware & placement)
4. **WHAT CAN MY MENU LOOK LIKE?** → TemplateGallerySection (15 distinct designs)
5. **HOW DO I MANAGE & UPDATE IT?** → DashboardDemoSection (Operator control panel)
6. **WHAT HAPPENS TO MY QR UPON EXPIRY?** → SubscriptionSection (QR preservation proof)
7. **HOW EASY IS SETUP?** → HowItWorksSection (3-step workflow)
8. **WHAT WILL MY GUESTS SEE?** → CustomerExperienceSection (Guest mobile menu)
9. **HOW MUCH DOES IT COST?** → PricingSection (Plans)
10. **WHAT CONCERNS REMAIN?** → FaqSection (Answers)
11. **WHAT DO I DO NEXT?** → FinalCtaSection (Create Your Menu)

---

## 3. GLOBAL SPACING & CONTAINER ALIGNMENT RULES

- **Container Max Width:** `max-w-[1240px]` across all sections.
- **Horizontal Side Padding:** Desktop `px-6 md:px-8`, Tablet `px-6`, Mobile `px-4`.
- **Vertical Section Padding:** Desktop `py-20 md:py-28`, Mobile `py-14 md:py-18`.
- **CTA Button Labels:** Primary: `Create Your Menu` | Secondary: `See How It Works`.
