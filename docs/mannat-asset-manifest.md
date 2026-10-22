# Mannat Tandoori Junction — High-Resolution Asset Manifest (Phase 3 Native Extraction)

> **Source:** `Art Board 3.pdf` (Pages 1–16; Page 17 Strictly Excluded)  
> **Native Source Page Dimensions:** `2315 x 3275 px` per page  
> **Asset Storage:** `frontend/public/uploads/mannat/assets/`, `backend/uploads/mannat/assets/`, `frontend/dist/uploads/mannat/assets/`  
> **Texture & Banner Storage:** `frontend/public/uploads/mannat/textures/`, `backend/uploads/mannat/textures/`  
> **Verified Contact Sheet:** [`docs/contact_sheets/phase8_extracted_assets.png`](file:///C:/Users/xshan/Desktop/menuqr/docs/contact_sheets/phase8_extracted_assets.png)

---

## 1. Brand Identity & Header Assets

| Asset Name (.png & .webp) | Source Page | Native Pixel Box `(L, T, R, B)` | Target Resolution | Intended UI Role | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `chef_mascot_circle` / `mannat_logo_chef` | Page 01 | `(700, 530, 1610, 1560)` | `910 x 1030` | App Header Mascot / Category Badges | Clean circular sticker crop of Chef Mascot winking with skewer platter; 0% text leakage |
| `mannat_logo` / `mannat_header_masthead` | Page 01 | `(270, 1590, 2045, 2220)` | `1775 x 630` | Top Sticky Header / Masthead Wordmark | Gold stylized `mannat` with uppercase `TANDOORI JUNCTION`; 0% neighboring line intrusion |
| `pure_veg_mark` | Page 02 | `(1940, 60, 2165, 215)` | `225 x 155` | Dietary Compliance Header Pill | Neon illuminated `PURE VEG` badge with authentic green dot in square |
| `veg_emblem` | Page 02 | `(2050, 95, 2158, 205)` | `108 x 110` | Menu Item Dietary Symbol | Pure green dot in square vegetarian emblem |
| `storefront_sign` / `masthead_main` / `masthead_clean_sign` | Page 02 | `(75, 45, 2190, 580)` | `2115 x 535` | Storefront Hero Banner / Masthead | Complete illuminated facade sign featuring mascot, wordmark, cuisine list & pure veg mark |

---

## 2. Chapter Header Banners (Synthesized with Native High-Res Crops)

All chapter banners are synthesized deterministically at `1200 x 320 px` pairing authentic page background hex colors, gold double border (`#FAB700`), typographic chapter titling, and genuine high-resolution food crops:

| Banner Name (.png & .webp) | PDF Source Page | Native Food Box `(L, T, R, B)` | Background Hex | Verification Check |
| :--- | :--- | :--- | :--- | :--- |
| `banner_tandoori_snacks` / `banner_chaap` | Page 04 | `(1560, 0, 2315, 480)` | `#C4122F` | Creamy malai chaap plate, 0% text leak |
| `banner_signature_platters` / `banner_paneer_feast` | Page 05 | `(0, 650, 1100, 2600)` | `#A30D22` | Hara bhara kebabs & seekh platter, 0% text leak |
| `banner_street_specials` | Page 06 | `(1140, 250, 2315, 1570)` | `#D97706` | Teal ceramic bowl of crunchy soya bites, 0% text leak |
| `banner_paneer_khazana` / `banner_desi_junction` | Page 07 | `(1720, 470, 2315, 1920)` | `#8E1424` | Shahi paneer velvet cashew gravy bowl, 0% text leak |
| `banner_soya_gravies` | Page 08 | `(970, 1950, 2315, 3230)` | `#B91C1C` | Wicker basket of blistered garlic naans & rotis, 0% text leak |
| `banner_momos` | Page 10 | `(0, 0, 2315, 580)` | `#1B3B2B` / `#CE182C` | Authentic Tibetan wave vector header from Page 10 |
| `banner_thalis_combos` | Page 09 | `(1380, 1560, 2315, 3100)` | `#1E293B` | Deluxe thali combo bowl with slow-simmered rajma rice, 0% text leak |
| `banner_chinese_wok` | Page 11 | `(0, 600, 1230, 1980)` | `#991B1B` | Wok-tossed Hakka noodles on black platter, 0% text leak |
| `banner_lebanese_fries` | Page 12 | `(1160, 220, 2315, 1870)` | `#78350F` | Mediterranean falafel & hummus bowl, 0% text leak |
| `banner_pizza_burger` | Page 13 | `(1340, 180, 2315, 1830)` | `#B91C1C` | 10-inch stone-baked thin crust pizza, 0% price digits |
| `banner_thick_shakes` / `banner_coffee` | Page 15 | `(0, 1400, 1270, 3250)` | `#451A03` | Caramel drip thick shake with whipped cream, 0% text leak |
| `banner_desserts` | Page 16 | `(260, 890, 2060, 2020)` | `#0F172A` | Sizzler brownie & gulab jamun dual display, 0% text leak |

---

## 3. Pure Food Photography Asset Inventory (Verified 2315x3275 Crops)

| Dish Key & Aliases | Source Page | Native Pixel Box `(L, T, R, B)` | Resolution | Intended UI Role | Visual Content & Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `dish_malai_chaap`<br>`malai_chaap`<br>`hero_chaap` | Page 04 | `(1560, 0, 2315, 480)` | `755 x 480` | Dish Card / Hero | Creamy soya chaap chunks in golden yellow oval dish garnished with fresh green herbs. 0% text leak. |
| `dish_paneer_tikka`<br>`paneer_tikka`<br>`dish_afghani_chaap`<br>`dish_tandoori_chaap`<br>`dish_malai_paneer_tikka`<br>`tandoori_chaap_sizzler`<br>`hero_paneer_tikka`<br>`hero_chaap_sizzler` | Page 04 | `(0, 1200, 1120, 2900)` | `1120 x 1700` | Dish Card / Hero | Grand Tandoori Platter: Charred paneer cubes on bamboo skewer with green capsicum, red onions, fresh lime wedge on black plate. 0% text leak. |
| `dish_dahi_ke_sholay` | Page 05 | `(520, 0, 1720, 540)` | `1200 x 540` | Dish Card / Hero | Crispy golden rolled bread fritters with spiced hung curd, chopped red onion & fresh cilantro. 0% text leak. |
| `dish_veg_seekh_kebab`<br>`veg_kebabs_platter`<br>`dish_chaap_roll`<br>`dish_paneer_roll`<br>`chaap_rolls_platter`<br>`hero_veg_kebabs_platter`<br>`hero_chaap_rolls` | Page 05 | `(0, 650, 1100, 2600)` | `1100 x 1950` | Dish Card / Hero | Spiced vegetable mince patties / Hara Bhara kebabs on white ceramic platter with mint chutney and sweet tomato dipping bowls. 0% text leak. |
| `dish_mint_chutney` | Page 05 | `(720, 2580, 1250, 3140)` | `530 x 560` | Dip / Card | Freshly blended green mint-coriander chutney in earthenware bowl with fresh mint leaf garnish. 0% text leak. |
| `dish_crunchy_soya`<br>`crunchy_chaap_popcorn`<br>`soya_crispy_drumsticks`<br>`hero_street_specials` | Page 06 | `(1140, 250, 2315, 1570)` | `1175 x 1320` | Dish Card / Hero | Teal ceramic triangular bowl filled with golden crumb-coated crispy crunchy soya bites and fresh coriander. 0% text leak. |
| `dish_greek_salad`<br>`crunchy_bites` | Page 06 | `(1310, 1750, 2315, 3140)` | `1005 x 1390` | Dish Card / Salad Hero | Fresh Mediterranean Greek salad bowl with feta cheese cubes, kalamata olives, crisp cucumbers, and cherry tomatoes. 0% text leak. |
| `dish_dal_makhani`<br>`hero_paneer_curries_handi` | Page 07 | `(0, 2010, 770, 3250)` | `770 x 1240` | Dish Card / Dal Hero | Slow-simmered black lentils in black handi with cream swirl and melting square slab of pure butter. 0% text leak. |
| `dish_shahi_paneer`<br>`dish_paneer_butter_masala`<br>`hero_biryani_gravies` | Page 07 | `(1720, 470, 2315, 1920)` | `595 x 1450` | Dish Card / Gravy Hero | Smooth tomato-cashew satin gravy with soft paneer cubes in white porcelain bowl. 0% text leak. |
| `dish_chaap_gravy` | Page 08 | `(0, 330, 640, 1660)` | `640 x 1330` | Dish Card / Hero | Rich spicy tawa chaap semi-dry gravy in glazed ceramic bowl garnished with fresh coriander. 0% text leak. |
| `dish_garlic_naan`<br>`dish_butter_roti` | Page 08 | `(970, 1950, 2315, 3230)` | `1345 x 1280` | Dish Card / Breads Hero | Wicker basket heaped with blistered golden garlic naan flatbread brushed with melted butter and fresh coriander. 0% text leak. |
| `dish_deluxe_thali`<br>`dish_special_thali`<br>`dish_veg_biryani`<br>`dish_chole_kulche`<br>`dish_pav_bhaji`<br>`hero_royal_thali` | Page 09 | `(1380, 1560, 2315, 3100)` | `935 x 1540` | Dish Card / Thali Hero | Deluxe Thali combo bowl with slow-cooked kidney bean rajma masala, steamed aromatic basmati rice, cilantro & red onions. 0% text leak. |
| `dish_steamed_momos` | Page 10 | `(300, 2150, 1600, 3275)` | `1300 x 1125` | Dish Card / Steamed Momo Hero | Hand-pinched steamed Tibetan dumplings on terracotta platter alongside authentic spicy red momo chutney bowl. 0% text leak. |
| `dish_fried_momos`<br>`momos` | Page 10 | `(950, 2150, 2150, 3275)` | `1200 x 1125` | Dish Card / Fried Momo Hero | Golden pan-fried crispy momos garnished with fresh herbs on terracotta platter. 0% text leak. |
| `hero_momos_platter` | Page 10 | `(220, 2160, 2100, 3275)` | `1880 x 1115` | Category Hero | Complete artisanal momo platter displaying steamed and fried momos with chutney dip bowl. 0% text leak. |
| `dish_hakka_noodles`<br>`dish_chili_paneer`<br>`dish_veg_manchurian`<br>`hero_chinese_wok` | Page 11 | `(0, 600, 1230, 1980)` | `1230 x 1380` | Dish Card / Chinese Hero | Wok-tossed Hakka noodles on matte black platter with julienned carrots, bell peppers, and fresh greens. 0% text leak. |
| `dish_falafel_wrap`<br>`falafel`<br>`dish_crispy_tacos`<br>`hero_lebanese_fries` | Page 12 | `(1160, 220, 2315, 1870)` | `1155 x 1650` | Dish Card / Lebanese Hero | Mediterranean Falafel bowl with crisp golden chickpea falafels, garlic-tahini cream, and crisp vegetable salad. 0% text leak. |
| `dish_peri_peri_fries`<br>`fries`<br>`dish_cheese_nachos` | Page 12 | `(1420, 1960, 2315, 3140)` | `895 x 1180` | Dish Card / Fries Hero | Artisan wicker basket filled with golden crisp French fries and glass dip bowl of rich tomato ketchup. 0% text leak. |
| `dish_margherita_pizza`<br>`pizza`<br>`dish_creamy_pasta`<br>`hero_tacos_pasta` | Page 13 | `(1340, 180, 2315, 1830)` | `975 x 1650` | Dish Card / Pizza Hero | Whole 10-inch stone-baked thin crust pizza with melted mozzarella, black olives, bell peppers, and mushrooms. Starts at x=1340, 0% price digits. |
| `dish_brioche_burger`<br>`burger`<br>`hero_pizza_burger` | Page 13 | `(90, 2160, 1130, 3140)` | `1040 x 980` | Dish Card / Burger Hero | Loaded gourmet Brioche Burger with crispy crumb-coated patty, melted cheddar cheese, tomato, red onion, lettuce, and garlic mayo. 0% text leak. |
| `dish_iced_latte`<br>`iced_coffee`<br>`dish_cappuccino` | Page 14 | `(0, 1400, 970, 2470)` | `970 x 1070` | Dish Card / Beverage Hero | Chilled faceted tall glass of iced latte with milk swirls, crystalline ice cubes, and condensation droplets. 0% text leak. |
| `dish_garlic_bread`<br>`garlic_bread` | Page 14 | `(35, 2390, 1270, 3230)` | `1235 x 840` | Dish Card / Bread Hero | Rustic woven basket of toasted artisan baguette slices brushed with garlic herb butter and melted mozzarella. 0% text leak. |
| `dish_oreo_shake`<br>`shake`<br>`dish_mint_mojito`<br>`hero_coffee_shakes` | Page 15 | `(0, 1400, 1270, 3250)` | `1270 x 1850` | Dish Card / Shake Hero | Tall sundae glass with cascading caramel drip, whipped cream swirl, and thick dessert shake. 0% text leak. |
| `dish_fudge_brownie` | Page 16 | `(260, 890, 1450, 2020)` | `1190 x 1130` | Dish Card / Sizzling Brownie Hero | Warm Belgian chocolate fudge brownie topped with a scoop of vanilla ice cream, chocolate drizzle, and nuts. 0% text leak. |
| `dish_gulab_jamun` | Page 16 | `(1080, 890, 2060, 2020)` | `980 x 1130` | Dish Card / Indian Dessert Hero | White ceramic bowl filled with golden syrup-soaked Gulab Jamuns garnished with pistachios and fresh mint. 0% text leak. |
| `hero_desserts_brownie`<br>`dessert` | Page 16 | `(260, 890, 2060, 2020)` | `1800 x 1130` | Category Hero / Dual Dessert Platter | Complete dual dessert display featuring hot brownie with ice cream and golden gulab jamuns. 0% text leak. |

---

## 4. Exclusion Verification

- **Page 17 (`page_17.png`):** Contains the Instagram QR code, `@mannat_tandoori_junction` handle, and promotional poster.
- **Verification Rule:** Strictly zero references to `page_17.png`, `page_17.webp`, `footer_mascot`, or Instagram follow-us banners exist in the frontend code or public asset manifests.
- **Permanent Dynamic Table QR Codes:** Generated via MENUQR's native SVG/PNG table-specific QR engine.

---

## 5. Contact Sheet & Audit Verification

- **Contact Sheet Location:** [`docs/contact_sheets/phase8_extracted_assets.png`](file:///C:/Users/xshan/Desktop/menuqr/docs/contact_sheets/phase8_extracted_assets.png)
- **Resolution:** `2250 x 4655 px`
- **Total Catalog Items:** 31 Primary Crops + 45 Linked WebP/PNG Aliases
- **Text Leakage Audit:** 0% Leaked Text / 0% Price Numbers / 0% Neighboring Column Leaks across all 31 assets.
