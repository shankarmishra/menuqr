# Mannat Tandoori Junction — Asset Manifest

> **Source:** `Art Board 3.pdf` (Pages 1–16; Page 17 excluded)  
> **Base Raster Dimensions:** `1240 x 1754 px` per page  
> **Target Storage:** `frontend/public/uploads/mannat/assets/` & `frontend/public/uploads/mannat/textures/`  
> **Contact Sheet Reference:** [`docs/contact_sheets/extracted_assets_contact_sheet.png`](file:///C:/Users/xshan/Desktop/menuqr/docs/contact_sheets/extracted_assets_contact_sheet.png)

---

## 1. Brand Identity & Header Assets

| Asset Name | Source Page | Pixel Coordinates `(L, T, R, B)` | Target Resolution | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `mannat_logo_chef.webp` | Page 01 | `(60, 40, 480, 460)` | `420 x 420` | Clean circular crop of Chef Mascot with garland |
| `mannat_header_masthead.webp` | Page 01 | `(0, 0, 1240, 520)` | `1200 x 360` | Full header banner with brand wordmark, phone & cuisine |
| `veg_emblem.webp` | Page 01 | `(1100, 40, 1220, 160)` | `120 x 120` | Authentic green pure-veg dot in square emblem |

---

## 2. Chapter Header Banners (Widescreen 1200 x 320 px)

All chapter banners are synthesized deterministically by pairing the authentic PDF chapter color background, gold double border (`#FAB700`), typographic chapter titling, and genuine food crops extracted with zero text leakage:

| Banner Name | PDF Source Page | Food Crop Box `(L, T, R, B)` | Background Hex | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| `banner_tandoori_snacks.webp` | Page 04 | `(840, 0, 1240, 255)` | `#C4122F` | Creamy malai chaap plate, 0% text leak |
| `banner_signature_platters.webp` | Page 05 | `(0, 360, 560, 1200)` | `#A30D22` | Hara bhara kebabs, 0% text leak |
| `banner_street_specials.webp` | Page 06 | `(600, 160, 1240, 780)` | `#8B1020` | Teal bowl of crunchy soya popcorn |
| `banner_paneer_khazana.webp` | Page 07 | `(840, 220, 1240, 960)` | `#B45309` | Shahi paneer cashew gravy bowl |
| `banner_soya_gravies.webp` | Page 08 | `(520, 1050, 1240, 1730)` | `#9A3412` | Wicker basket of tandoori rotis & naans |
| `banner_thalis_combos.webp` | Page 09 | `(740, 840, 1240, 1660)` | `#3A4035` | Stainless steel thali compartments |
| `banner_momos.webp` | Page 10 | `(0, 0, 1240, 310)` | `#1B3B2B` / `#CE182C` | Authentic Tibetan wave vector header |
| `banner_chinese_wok.webp` | Page 11 | `(0, 400, 660, 1140)` | `#881337` | Wok-tossed hakka noodles with chopsticks |
| `banner_lebanese_fries.webp` | Page 12 | `(620, 160, 1240, 1040)` | `#D97706` | Mediterranean falafel wrap in toasted pita |
| `banner_pizza_burger.webp` | Page 13 | `(720, 100, 1240, 980)` | `#B91C1C` | Thin crust pizza (starts x=720, 0% price digits) |
| `banner_thick_shakes.webp` | Page 15 | `(0, 760, 660, 1700)` | `#451A03` | Oreo cookie thick shake with cream |
| `banner_desserts.webp` | Page 16 | `(160, 500, 1100, 1060)` | `#0F172A` | Sizzler brownie & gulab jamun bowl |

---

## 3. Pure Food Photography Asset Inventory (35+ Dishes)

| Dish Key | Source Page | Exact Pixel Box `(L, T, R, B)` | Size (WxH) | Visual Content & Verification |
| :--- | :--- | :--- | :--- | :--- |
| `dish_malai_chaap.webp` | Page 04 | `(840, 0, 1240, 255)` | `400 x 255` | Creamy soya chaap chunks in yellow oval dish with green herbs. |
| `dish_paneer_tikka.webp` | Page 04 | `(0, 700, 620, 1550)` | `620 x 850` | Skewered paneer cubes on black plate with bell peppers, lemon & red background. |
| `dish_afghani_chaap.webp` | Page 04 | `(0, 700, 620, 1550)` | `620 x 850` | Charcoal charred chaap in spicy marinade. |
| `dish_tandoori_chaap.webp` | Page 04 | `(0, 700, 620, 1550)` | `620 x 850` | Fiery tandoori chaap skewer. |
| `dish_malai_paneer_tikka.webp` | Page 04 | `(0, 700, 620, 1550)` | `620 x 850` | Rich cream paneer tikka. |
| `dish_dahi_ke_sholay.webp` | Page 05 | `(280, 0, 920, 320)` | `640 x 320` | Crispy rolled bread fritters with spiced hung curd, sliced onions & mint. |
| `dish_veg_seekh_kebab.webp` | Page 05 | `(0, 360, 580, 1380)` | `580 x 1020` | Spiced vegetable mince skewers with mint chutney. |
| `dish_chaap_roll.webp` | Page 05 | `(0, 360, 580, 1380)` | `580 x 1020` | Fresh roomali roll with rich makhani gravy. |
| `dish_crunchy_soya.webp` | Page 06 | `(600, 160, 1240, 840)` | `640 x 680` | Teal bowl filled with bite-sized crunchy golden soya popcorn. |
| `dish_greek_salad.webp` | Page 06 | `(700, 940, 1240, 1680)` | `540 x 740` | Crisp cucumber cubes, kalamata olives, cherry tomatoes & feta cheese. |
| `dish_shahi_paneer.webp` | Page 07 | `(840, 220, 1240, 1020)` | `400 x 800` | Smooth tomato-cashew velvet gravy with soft paneer cubes. |
| `dish_paneer_butter_masala.webp`| Page 07 | `(840, 220, 1240, 1020)` | `400 x 800` | Rich butter masala gravy with paneer. |
| `dish_dal_makhani.webp` | Page 07 | `(0, 1080, 420, 1740)` | `420 x 660` | Slow-simmered black lentils in handi with slab of pure butter & cream. |
| `dish_chaap_gravy.webp` | Page 08 | `(0, 180, 380, 900)` | `380 x 720` | Rich spicy tawa chaap semi-dry gravy. |
| `dish_garlic_naan.webp` | Page 08 | `(520, 1050, 1240, 1730)` | `720 x 680` | Wicker basket with blistered garlic naan brushed with melted butter. |
| `dish_butter_roti.webp` | Page 08 | `(520, 1050, 1240, 1730)` | `720 x 680` | Tandoori flatbread brushed with butter. |
| `dish_deluxe_thali.webp` | Page 09 | `(740, 840, 1240, 1660)` | `500 x 820` | Stainless steel thali compartments with curries, rice, rotis & sweet. |
| `dish_chole_kulche.webp` | Page 09 | `(740, 840, 1240, 1660)` | `500 x 820` | Tangy chana with stuffed kulcha bread. |
| `dish_steamed_momos.webp` | Page 10 | `(120, 1160, 1120, 1754)` | `1000 x 594` | Clay platter featuring hand-pinched steamed & pan-fried momos with red chutney bowl. |
| `dish_fried_momos.webp` | Page 10 | `(120, 1160, 1120, 1754)` | `1000 x 594` | Crisp golden fried momos on earthen platter. |
| `dish_hakka_noodles.webp` | Page 11 | `(0, 400, 660, 1140)` | `660 x 740` | Black plate with wok-tossed hakka noodles and julienned vegetables. |
| `dish_chili_paneer.webp` | Page 11 | `(0, 400, 660, 1140)` | `660 x 740` | Spiced chilli paneer in soy-chilli glaze. |
| `dish_veg_manchurian.webp` | Page 11 | `(0, 400, 660, 1140)` | `660 x 740` | Golden fried vegetable spheres in dark garlic gravy. |
| `dish_falafel_wrap.webp` | Page 12 | `(620, 160, 1240, 1040)` | `620 x 880` | Rolled flatbread wrap sliced in half showing falafels and garlic sauce. |
| `dish_peri_peri_fries.webp` | Page 12 | `(760, 1120, 1240, 1750)` | `480 x 630` | Red bowl heaped with golden peri-peri dusted french fries. |
| `dish_cheese_nachos.webp` | Page 12 | `(760, 1120, 1240, 1750)` | `480 x 630` | Tortilla nachos with cheese sauce & jalapeños. |
| `dish_margherita_pizza.webp` | Page 13 | `(720, 100, 1240, 980)` | `520 x 880` | Whole 10-inch stone-baked thin crust pizza with mozzarella & fresh basil. |
| `dish_brioche_burger.webp` | Page 13 | `(50, 1160, 640, 1680)` | `590 x 520` | Toasted sesame brioche bun with crispy paneer patty, tomato & melted cheese. |
| `dish_garlic_bread.webp` | Page 14 | `(20, 1280, 680, 1730)` | `660 x 450` | Toasted artisan baguette slices topped with melted mozzarella in wicker basket. |
| `dish_creamy_pasta.webp` | Page 14 | `(720, 100, 1240, 980)` | `520 x 880` | Penne pasta in rich Alfredo cream sauce with black olives. |
| `dish_iced_latte.webp` | Page 15 | `(720, 0, 1240, 570)` | `520 x 570` | Chilled iced latte in tall faceted glass with milk swirls and ice cubes. |
| `dish_cappuccino.webp` | Page 15 | `(720, 0, 1240, 570)` | `520 x 570` | Freshly brewed espresso with steamed micro-foam. |
| `dish_oreo_shake.webp` | Page 15 | `(0, 760, 680, 1750)` | `680 x 990` | Tall sundae glass with chocolate fudge swirls, whipped cream & crushed Oreos. |
| `dish_mint_mojito.webp` | Page 15 | `(0, 760, 680, 1750)` | `680 x 990` | Sparkling soda with lime wheels and fresh muddled mint leaves. |
| `dish_fudge_brownie.webp` | Page 16 | `(140, 480, 1100, 1080)` | `960 x 600` | Sizzling cast-iron brownie with melted Belgian chocolate & vanilla ice cream. |

---

## 4. Exclusion Verification

- **Page 17 (`page_17.png`):** Contains the Instagram QR code, `@mannat_tandoori_junction` handle, and promotional text.
- **Verification Rule:** Strictly zero references to `page_17.png`, `page_17.webp`, `footer_mascot`, or Instagram follow-us banners exist in the frontend code or public asset manifests.
