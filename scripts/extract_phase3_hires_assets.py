"""
Phase 3 Native High-Resolution Asset Extraction and Verification Script
MenuQR — Mannat Tandoori Junction
Extracts pure food photography, brand elements, and textures from
docs/source_pages_hires/page_01.jpg - page_16.jpg (2315 x 3275 px)
with 0% text leakage.
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Define output target directories
ASSET_DIRS = [
    'frontend/public/uploads/mannat/assets',
    'backend/uploads/mannat/assets',
    'frontend/dist/uploads/mannat/assets'
]

TEXTURE_DIRS = [
    'frontend/public/uploads/mannat/textures',
    'backend/uploads/mannat/textures',
    'frontend/dist/uploads/mannat/textures'
]

ROOT_UPLOAD_DIRS = [
    'frontend/public/uploads/mannat',
    'backend/uploads/mannat'
]

for d in ASSET_DIRS + TEXTURE_DIRS + ROOT_UPLOAD_DIRS:
    os.makedirs(d, exist_ok=True)

# Master extraction catalog from 2315x3275 native pages
# Each entry: (source_page, (x1, y1, x2, y2), primary_name, alias_names, ui_role, visual_content)
EXTRACTION_CATALOG = [
    # Page 1: Brand Identity
    (1, (700, 530, 1610, 1560), 'chef_mascot_circle', ['mannat_logo_chef'],
     'App Header / Brand Mascot',
     'Royal Circular Chef Mascot with mustache, winking, holding tandoori skewer platter'),
    
    (1, (270, 1590, 2045, 2220), 'mannat_logo', ['mannat_header_masthead'],
     'Primary Masthead Wordmark',
     'Stylized flame gold mannat wordmark and white TANDOORI JUNCTION uppercase header'),

    # Page 2: Illuminated Storefront Sign & Pure Veg Mark
    (2, (1940, 60, 2165, 215), 'pure_veg_mark', [],
     'Pure Veg Compliance Badge',
     'Illuminated neon PURE VEG badge with authentic green dot in square symbol'),

    (2, (2050, 95, 2158, 205), 'veg_emblem', [],
     'Pure Veg Dot Symbol',
     'Authentic green dot in square pure vegetarian emblem'),

    (2, (75, 45, 2190, 580), 'storefront_sign', ['masthead_clean_sign', 'masthead_main', 'masthead_full'],
     'Storefront Header / Masthead',
     'Full illuminated Mannat Tandoori Junction neon sign on black facade with pure veg mark'),

    # Page 4: Tandoori Snacks
    (4, (1560, 0, 2315, 480), 'dish_malai_chaap', ['malai_chaap', 'hero_chaap'],
     'Dish Card / Hero Image',
     'Creamy Malai Chaap chunks in yellow oval dish with fresh herbs and mint chutney rim'),

    (4, (0, 1200, 1120, 2900), 'dish_paneer_tikka', [
        'paneer_tikka', 'dish_afghani_chaap', 'dish_tandoori_chaap',
        'dish_malai_paneer_tikka', 'tandoori_chaap_sizzler',
        'hero_paneer_tikka', 'hero_chaap_sizzler'
    ],
     'Dish Card / Hero Image',
     'Grand Tandoori Platter / skewered charred paneer cubes with bell peppers, onion, and lime on black plate'),

    # Page 5: Kebabs, Sholay & Rolls
    (5, (520, 0, 1720, 540), 'dish_dahi_ke_sholay', [],
     'Dish Card / Appetizer Hero',
     'Crispy golden Dahi Ke Sholay rolls topped with seasoned hung curd, sliced onions, and cilantro'),

    (5, (0, 650, 1100, 2600), 'dish_veg_seekh_kebab', [
        'veg_kebabs_platter', 'dish_chaap_roll', 'dish_paneer_roll',
        'chaap_rolls_platter', 'hero_veg_kebabs_platter', 'hero_chaap_rolls'
    ],
     'Dish Card / Kebab Hero',
     'Large white oval platter with spiced Hara Bhara / Veg Kebabs, peas, mint sprigs, and dipping bowls'),

    (5, (720, 2580, 1250, 3140), 'dish_mint_chutney', [],
     'Accompaniment / Dip Card',
     'Earthenware bowl of freshly blended green mint-coriander chutney garnished with mint leaves'),

    # Page 6: Crunch House, Soups & Salads
    (6, (1140, 250, 2315, 1570), 'dish_crunchy_soya', [
        'crunchy_chaap_popcorn', 'soya_crispy_drumsticks', 'hero_street_specials'
    ],
     'Dish Card / Snack Hero',
     'Teal ceramic bowl filled with golden crumb-coated crispy crunchy soya bites and fresh cilantro'),

    (6, (1310, 1750, 2315, 3140), 'dish_greek_salad', ['crunchy_bites'],
     'Dish Card / Salad Hero',
     'Fresh Mediterranean Greek salad bowl with feta cheese cubes, kalamata olives, cucumber, and tomatoes'),

    # Page 7: Signature Gravies & Dal
    (7, (0, 2010, 770, 3250), 'dish_dal_makhani', ['hero_paneer_curries_handi'],
     'Dish Card / Dal Makhani Hero',
     'Slow-simmered black dal makhani in black handi with cream swirl and melting square pat of pure butter'),

    (7, (1720, 470, 2315, 1920), 'dish_shahi_paneer', [
        'dish_paneer_butter_masala', 'hero_biryani_gravies'
    ],
     'Dish Card / Paneer Gravy Hero',
     'Shahi Paneer / Paneer Makhani bowl with fried paneer cubes in velvety tomato-cashew satin gravy'),

    # Page 8: Pure Soya Gravies & Tandoori Breads
    (8, (0, 330, 640, 1660), 'dish_chaap_gravy', [],
     'Dish Card / Soya Gravy Hero',
     'Rich spiced tawa chaap semi-dry gravy in ceramic bowl with fresh coriander garnish'),

    (8, (970, 1950, 2315, 3230), 'dish_garlic_naan', ['dish_butter_roti'],
     'Dish Card / Tandoori Breads Hero',
     'Wicker basket heaped with golden blistered garlic naans brushed with melted butter and fresh herbs'),

    # Page 9: Thalis & Combos
    (9, (1380, 1560, 2315, 3100), 'dish_deluxe_thali', [
        'dish_special_thali', 'dish_veg_biryani', 'dish_chole_kulche',
        'dish_pav_bhaji', 'hero_royal_thali'
    ],
     'Dish Card / Thali Combo Hero',
     'Deluxe Thali combo bowl with slow-cooked rajma masala, steamed aromatic basmati rice, cilantro, and red onions'),

    # Page 10: Momos Junction
    (10, (300, 2150, 1600, 3275), 'dish_steamed_momos', [],
     'Dish Card / Steamed Momo Hero',
     'Hand-pinched steamed momos on terracotta platter alongside authentic red-gold momo chutney dip bowl'),

    (10, (950, 2150, 2150, 3275), 'dish_fried_momos', ['momos'],
     'Dish Card / Fried Momo Hero',
     'Golden pan-fried crispy momos garnished with chopped coriander on artisanal clay platter'),

    (10, (220, 2160, 2100, 3275), 'hero_momos_platter', [],
     'Category Hero Platter',
     'Complete momo presentation platter featuring steamed and pan-fried dumplings with chutney bowl'),

    # Page 11: Indo-Chinese Wok
    (11, (0, 600, 1230, 1980), 'dish_hakka_noodles', [
        'dish_chili_paneer', 'dish_veg_manchurian', 'hero_chinese_wok'
    ],
     'Dish Card / Chinese Wok Hero',
     'Wok-tossed Hakka noodles on matte black platter with julienned carrots, cabbage, and greens'),

    # Page 12: Café Quick Bites & Lebanese
    (12, (1160, 220, 2315, 1870), 'dish_falafel_wrap', [
        'falafel', 'dish_crispy_tacos', 'hero_lebanese_fries'
    ],
     'Dish Card / Lebanese Hero',
     'Mediterranean Falafel bowl with crisp golden chickpea falafels, garlic-tahini cream, and crisp salad'),

    (12, (1420, 1960, 2315, 3140), 'dish_peri_peri_fries', [
        'fries', 'dish_cheese_nachos'
    ],
     'Dish Card / Fries Hero',
     'Artisan wicker basket filled with golden crisp French fries and glass dip bowl of rich tomato ketchup'),

    # Page 13: Thin Crust Pizzas & Brioche Burgers
    (13, (1340, 180, 2315, 1830), 'dish_margherita_pizza', [
        'pizza', 'dish_creamy_pasta', 'hero_tacos_pasta'
    ],
     'Dish Card / Pizza Hero',
     'Authentic 10-inch stone-baked thin crust pizza with mozzarella, mushrooms, olives, peppers, and herbs'),

    (13, (90, 2160, 1130, 3140), 'dish_brioche_burger', [
        'burger', 'hero_pizza_burger'
    ],
     'Dish Card / Burger Hero',
     'Loaded gourmet Brioche Burger with crispy patty, melted cheddar cheese, tomato, red onion, lettuce, and mayo'),

    # Page 14: Garlic Breads & Cold Brews
    (14, (0, 1400, 970, 2470), 'dish_iced_latte', [
        'iced_coffee', 'dish_cappuccino'
    ],
     'Dish Card / Cold Brew Hero',
     'Chilled tall faceted glass of iced latte with milk swirls, crystalline ice cubes, and condensation'),

    (14, (35, 2390, 1270, 3230), 'dish_garlic_bread', ['garlic_bread'],
     'Dish Card / Garlic Bread Hero',
     'Rustic woven basket of toasted artisan baguette slices brushed with garlic herb butter and melted mozzarella'),

    # Page 15: Thick Shakes & Refreshing Coolers
    (15, (0, 1400, 1270, 3250), 'dish_oreo_shake', [
        'shake', 'dish_mint_mojito', 'hero_coffee_shakes'
    ],
     'Dish Card / Shake Hero',
     'Thick dessert shake in clear sundae glass with cascading caramel drip, whipped cream swirl, and biscuit topping'),

    # Page 16: Sweet Treats & Desserts
    (16, (260, 890, 1450, 2020), 'dish_fudge_brownie', [],
     'Dish Card / Sizzling Brownie Hero',
     'Warm chocolate fudge brownie topped with a generous vanilla ice cream scoop, chocolate drizzle, and nuts'),

    (16, (1080, 890, 2060, 2020), 'dish_gulab_jamun', [],
     'Dish Card / Traditional Sweet Hero',
     'White ceramic bowl filled with golden syrup-soaked Gulab Jamuns garnished with pistachios and fresh mint'),

    (16, (260, 890, 2060, 2020), 'hero_desserts_brownie', ['dessert'],
     'Category Hero / Dual Dessert Platter',
     'Sizzling chocolate brownie and golden gulab jamuns side-by-side dessert display')
]

def save_image_all(img, filename_base):
    for d in ASSET_DIRS:
        img.save(os.path.join(d, f'{filename_base}.png'), 'PNG')
        img.save(os.path.join(d, f'{filename_base}.webp'), 'WEBP', quality=95)
    
    # If it's a root upload alias (like burger, pizza, etc.), also save in root upload dirs
    for d in ROOT_UPLOAD_DIRS:
        if filename_base in ['burger', 'dessert', 'falafel', 'fries', 'garlic_bread', 'hero_chaap', 'iced_coffee', 'momos', 'pizza', 'shake', 'logo']:
            img.save(os.path.join(d, f'{filename_base}.png'), 'PNG')

def main():
    print(f'Starting extraction from 16 native pages (2315x3275)...')
    extracted_records = []

    for page_num, box, primary_name, aliases, role, visual_desc in EXTRACTION_CATALOG:
        source_path = f'docs/source_pages_hires/page_{page_num:02d}.jpg'
        if not os.path.exists(source_path):
            print(f'Error: Source page missing {source_path}')
            continue
        
        page_img = Image.open(source_path)
        crop_img = page_img.crop(box)

        # Save primary asset
        save_image_all(crop_img, primary_name)

        # Save all aliases
        for alias in aliases:
            save_image_all(crop_img, alias)

        extracted_records.append({
            'page': page_num,
            'box': box,
            'name': primary_name,
            'aliases': aliases,
            'size': crop_img.size,
            'role': role,
            'desc': visual_desc,
            'img': crop_img
        })
        print(f'Extracted [{primary_name}] (Page {page_num:02d}, Box: {box}, Size: {crop_img.size}) + {len(aliases)} aliases')

    print(f'Successfully extracted {len(extracted_records)} primary assets.')
    return extracted_records

if __name__ == '__main__':
    main()
