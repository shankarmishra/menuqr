import os
from PIL import Image, ImageDraw, ImageFont

p_dir = 'frontend/public/uploads/mannat/pages'
out_dirs = [
    'frontend/public/uploads/mannat/textures',
    'frontend/dist/uploads/mannat/textures',
    'backend/uploads/mannat/textures'
]

def save_banner(img, name):
    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        img.save(os.path.join(d, f'{name}.png'), 'PNG')
        img.save(os.path.join(d, f'{name}.webp'), 'WEBP', quality=95)
    print(f'Saved {name}: {img.size}')

font_title = None
font_sub = None
font_badge = None
try:
    font_title = ImageFont.truetype('arialbd.ttf', 46)
    font_sub = ImageFont.truetype('arial.ttf', 22)
    font_badge = ImageFont.truetype('arialbd.ttf', 18)
except Exception:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_badge = ImageFont.load_default()

# 1. Tandoori Snacks:
p4 = Image.open(f'{p_dir}/page_04.png')
food4 = p4.crop((840, 0, 1240, 255))
b1 = Image.new('RGB', (1200, 320), '#C4122F')
draw1 = ImageDraw.Draw(b1)
draw1.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w1 = int(food4.width * 320 / food4.height)
b1.paste(food4.resize((w1, 320)), (1200 - w1, 0))
draw1.text((50, 60), 'MTJ TANDOORI SNACKS', fill='#FFFFFF', font=font_title)
draw1.text((52, 135), 'Chaap and Paneer Feast • Multigrain & Pure Soya', fill='#FAB700', font=font_sub)
draw1.rectangle([(50, 185), (320, 225)], fill='#9E0D24', outline='#FAB700', width=2)
draw1.text((70, 193), 'AUTHENTIC TANDOOR', fill='#FFFFFF', font=font_badge)
save_banner(b1, 'banner_tandoori_snacks')
save_banner(b1, 'banner_chaap')

# 2. Kebabs & Platters:
p5 = Image.open(f'{p_dir}/page_05.png')
food5 = p5.crop((0, 360, 560, 1200))
b2 = Image.new('RGB', (1200, 320), '#A30D22')
draw2 = ImageDraw.Draw(b2)
draw2.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w2 = int(food5.width * 320 / food5.height)
b2.paste(food5.resize((w2, 320)), (1200 - w2, 0))
draw2.text((50, 60), 'VEG KEBABS & PLATTERS', fill='#FFFFFF', font=font_title)
draw2.text((52, 135), 'Dahi Ke Sholay • Signature Platters • Chaap Rolls', fill='#FAB700', font=font_sub)
draw2.rectangle([(50, 185), (320, 225)], fill='#800A1A', outline='#FAB700', width=2)
draw2.text((70, 193), 'CHEF SPECIAL ROLLS', fill='#FFFFFF', font=font_badge)
save_banner(b2, 'banner_signature_platters')
save_banner(b2, 'banner_paneer_feast')

# 3. Crunch House & Soups:
p6 = Image.open(f'{p_dir}/page_06.png')
food6 = p6.crop((640, 180, 1240, 800))
b3 = Image.new('RGB', (1200, 320), '#D97706')
draw3 = ImageDraw.Draw(b3)
draw3.rectangle([(0, 0), (1199, 319)], outline='#FFFDF9', width=4)
w3 = int(food6.width * 320 / food6.height)
b3.paste(food6.resize((w3, 320)), (1200 - w3, 0))
draw3.text((50, 60), 'MTJ CRUNCH HOUSE & SOUPS', fill='#FFFFFF', font=font_title)
draw3.text((52, 135), 'Crispy Soya Bites • Hot Soup Station • Fresh Salads', fill='#FEF3C7', font=font_sub)
draw3.rectangle([(50, 185), (320, 225)], fill='#B45309', outline='#FEF3C7', width=2)
draw3.text((70, 193), '100% PURE VEG CRISP', fill='#FFFFFF', font=font_badge)
save_banner(b3, 'banner_street_specials')

# 4. Signature Gravies:
p7 = Image.open(f'{p_dir}/page_07.png')
food7 = p7.crop((860, 240, 1240, 1000))
b4 = Image.new('RGB', (1200, 320), '#8E1424')
draw4 = ImageDraw.Draw(b4)
draw4.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w4 = int(food7.width * 320 / food7.height)
b4.paste(food7.resize((w4, 320)), (1200 - w4, 0))
draw4.text((50, 60), 'MTJ SIGNATURE GRAVIES', fill='#FFFFFF', font=font_title)
draw4.text((52, 135), 'Paneer Ka Khazana • Dal Specialities • Desi Junction', fill='#FAB700', font=font_sub)
draw4.rectangle([(50, 185), (320, 225)], fill='#6D0F1B', outline='#FAB700', width=2)
draw4.text((70, 193), 'NORTH INDIAN CLASSICS', fill='#FFFFFF', font=font_badge)
save_banner(b4, 'banner_paneer_khazana')
save_banner(b4, 'banner_desi_junction')

# 5. Pure Soya Gravies & Breads:
p8 = Image.open(f'{p_dir}/page_08.png')
food8 = p8.crop((560, 1080, 1240, 1720))
b5 = Image.new('RGB', (1200, 320), '#B91C1C')
draw5 = ImageDraw.Draw(b5)
draw5.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w5 = int(food8.width * 320 / food8.height)
b5.paste(food8.resize((w5, 320)), (1200 - w5, 0))
draw5.text((50, 60), 'PURE SOYA GRAVIES & BREADS', fill='#FFFFFF', font=font_title)
draw5.text((52, 135), 'Plant-Based Soya • Hand-Tossed Tandoori Naan & Roti', fill='#FAB700', font=font_sub)
draw5.rectangle([(50, 185), (320, 225)], fill='#991B1B', outline='#FAB700', width=2)
draw5.text((70, 193), '100% PURE SOYA RECIPES', fill='#FFFFFF', font=font_badge)
save_banner(b5, 'banner_soya_gravies')

# 6. Momo Junction:
p10 = Image.open(f'{p_dir}/page_10.png')
head10 = p10.crop((0, 0, 1240, 310))
save_banner(head10, 'banner_momos')

# 7. Thalis & Combos:
p9 = Image.open(f'{p_dir}/page_09.png')
b7 = Image.new('RGB', (1200, 320), '#1E293B')
draw7 = ImageDraw.Draw(b7)
draw7.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
food9 = p9.crop((760, 860, 1240, 1660))
w7 = int(food9.width * 320 / food9.height)
b7.paste(food9.resize((w7, 320)), (1200 - w7, 0))
draw7.text((50, 60), 'MTJ THALIS & MEAL COMBOS', fill='#FFFFFF', font=font_title)
draw7.text((52, 135), 'Dawat Thali • Royal Dawat Thali • Street Combos', fill='#FAB700', font=font_sub)
draw7.rectangle([(50, 185), (320, 225)], fill='#0F172A', outline='#FAB700', width=2)
draw7.text((70, 193), 'ROYAL FEAST EXPERIENCES', fill='#FFFFFF', font=font_badge)
save_banner(b7, 'banner_thalis_combos')

# 8. Chinese Wok:
p11 = Image.open(f'{p_dir}/page_11.png')
food11 = p11.crop((0, 340, 640, 1040))
b8 = Image.new('RGB', (1200, 320), '#991B1B')
draw8 = ImageDraw.Draw(b8)
draw8.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w8 = int(food11.width * 320 / food11.height)
b8.paste(food11.resize((w8, 320)), (1200 - w8, 0))
draw8.text((50, 60), 'MTJ CHINESE WOK', fill='#FFFFFF', font=font_title)
draw8.text((52, 135), 'Noodles Bowls • Wok Gravies • Fried Rice • Manchurian', fill='#FAB700', font=font_sub)
draw8.rectangle([(50, 185), (320, 225)], fill='#7F1D1D', outline='#FAB700', width=2)
draw8.text((70, 193), 'INDO-CHINESE MASTER RECIPES', fill='#FFFFFF', font=font_badge)
save_banner(b8, 'banner_chinese_wok')

# 9. MTJ Cafe & Lebanese:
p12 = Image.open(f'{p_dir}/page_12.png')
food12 = p12.crop((640, 140, 1240, 980))
b9 = Image.new('RGB', (1200, 320), '#78350F')
draw9 = ImageDraw.Draw(b9)
draw9.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w9 = int(food12.width * 320 / food12.height)
b9.paste(food12.resize((w9, 320)), (1200 - w9, 0))
draw9.text((50, 60), 'MTJ CAFE & QUICK BITES', fill='#FFFFFF', font=font_title)
draw9.text((52, 135), 'Cheesy Bites • Loaded Nachos • Falafel & Hummus • Tacos', fill='#FDE68A', font=font_sub)
draw9.rectangle([(50, 185), (320, 225)], fill='#451A03', outline='#FDE68A', width=2)
draw9.text((70, 193), 'GLOBAL SNACK JUNCTION', fill='#FFFFFF', font=font_badge)
save_banner(b9, 'banner_lebanese_fries')

# 10. Pizzas & Burgers:
p13 = Image.open(f'{p_dir}/page_13.png')
# EXACT CROP OF PIZZA: Starts at x=720, completely excluding price numbers at x=530-680!
food13 = p13.crop((720, 100, 1240, 980))
b10 = Image.new('RGB', (1200, 320), '#B91C1C')
draw10 = ImageDraw.Draw(b10)
draw10.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w10 = int(food13.width * 320 / food13.height)
b10.paste(food13.resize((w10, 320)), (1200 - w10, 0))
draw10.text((50, 60), 'STONE BAKED PIZZAS & BURGERS', fill='#FFFFFF', font=font_title)
draw10.text((52, 135), '10 Inch Thin Crust Pizzas • Brioche Burgers • Italian Pastas', fill='#FAB700', font=font_sub)
draw10.rectangle([(50, 185), (320, 225)], fill='#991B1B', outline='#FAB700', width=2)
draw10.text((70, 193), 'AUTHENTIC STONE BAKED', fill='#FFFFFF', font=font_badge)
save_banner(b10, 'banner_pizza_burger')

# 11. Brews, Shakes & Coolers:
p15 = Image.open(f'{p_dir}/page_15.png')
food15 = p15.crop((0, 760, 660, 1700))
b11 = Image.new('RGB', (1200, 320), '#451A03')
draw11 = ImageDraw.Draw(b11)
draw11.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w11 = int(food15.width * 320 / food15.height)
b11.paste(food15.resize((w11, 320)), (1200 - w11, 0))
draw11.text((50, 60), 'BREWS, SHAKES & COOLERS', fill='#FFFFFF', font=font_title)
draw11.text((52, 135), 'Artisan Coffee • Thick Shakes • Boba • Refreshing Coolers', fill='#FDE68A', font=font_sub)
draw11.rectangle([(50, 185), (320, 225)], fill='#270E02', outline='#FDE68A', width=2)
draw11.text((70, 193), 'HANDCRAFTED BEVERAGES', fill='#FFFFFF', font=font_badge)
save_banner(b11, 'banner_thick_shakes')
save_banner(b11, 'banner_coffee_garlicbread')
save_banner(b11, 'banner_coffee')

# 12. Desserts:
p16 = Image.open(f'{p_dir}/page_16.png')
food16 = p16.crop((160, 500, 1100, 1060))
b12 = Image.new('RGB', (1200, 320), '#0F172A')
draw12 = ImageDraw.Draw(b12)
draw12.rectangle([(0, 0), (1199, 319)], outline='#FAB700', width=4)
w12 = int(food16.width * 320 / food16.height)
b12.paste(food16.resize((w12, 320)), (1200 - w12, 0))
draw12.text((50, 60), 'MTJ SWEET TREATS & DESSERTS', fill='#FFFFFF', font=font_title)
draw12.text((52, 135), 'Hot Sizzling Brownie • Gulab Jamun • Kesari Kheer', fill='#FAB700', font=font_sub)
draw12.rectangle([(50, 185), (320, 225)], fill='#020617', outline='#FAB700', width=2)
draw12.text((70, 193), 'AUTHENTIC DESSERTS', fill='#FFFFFF', font=font_badge)
save_banner(b12, 'banner_desserts')

print('All 12 authentic banners regenerated with 0% text leak!')
