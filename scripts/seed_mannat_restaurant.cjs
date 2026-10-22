const { Client } = require('../backend/node_modules/pg');

async function seedMannat() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/menuqr'
  });

  await client.connect();
  console.log('Connected to PostgreSQL database');

  const tenants = [
    { tenantId: 'mannat-tandoori-junction-tenant-01', publicId: 'PUB-MANNAT-01', menuSlug: 'mannat-tandoori-junction' },
    { tenantId: 'shankar-dhaba-mannat-tenant', publicId: 'PUB-SHANKAR-01', menuSlug: 'shankar-dhaba' }
  ];

  try {
    await client.query('BEGIN');

    for (const t of tenants) {
      // 1. Client Record
      await client.query(`
        INSERT INTO clients (
          id, public_id, business_name, menu_slug, category, tagline, status, phone, city, address, business_type, cuisine
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
          business_name = EXCLUDED.business_name,
          menu_slug = EXCLUDED.menu_slug,
          tagline = EXCLUDED.tagline,
          status = EXCLUDED.status,
          phone = EXCLUDED.phone,
          city = EXCLUDED.city,
          address = EXCLUDED.address,
          cuisine = EXCLUDED.cuisine;
      `, [
        t.tenantId,
        t.publicId,
        'Mannat Tandoori Junction',
        t.menuSlug,
        'Restaurant',
        'Chaap Ka Asli Swad • 100% Pure Soya | Authentic Taste Since 2015',
        'active',
        '8591095483',
        'New Delhi',
        'Main Market Road, Near City Plaza, New Delhi',
        'Restaurant',
        'North Indian • Indo Chinese • Continental'
      ]);

      // 2. Active Subscription
      await client.query(`
        INSERT INTO subscriptions (
          id, tenant_id, plan_id, status, started_at, expires_at
        ) VALUES (
          $1, $2, 'premium', 'active', NOW(), NOW() + INTERVAL '10 years'
        )
        ON CONFLICT (tenant_id) DO UPDATE SET
          plan_id = 'premium',
          status = 'active',
          expires_at = NOW() + INTERVAL '10 years';
      `, [`sub-${t.menuSlug}`, t.tenantId]);

      // 3. Bespoke Design Spec in Appearance Settings
      const designSpec = {
        version: '1.0',
        themeId: 'pdf-bespoke-theme',
        composition: 'heritage-artboard',
        colors: {
          bg: '#FFFDF9',
          surface: '#FFFFFF',
          surfaceAlt: '#FFFBEB',
          text: '#1F2923',
          textMuted: '#556B5D',
          accent: '#CE182C',
          heading: '#9E0D24',
          border: 'rgba(250, 183, 0, 0.45)',
          badgeBg: '#CE182C',
          badgeText: '#FFFFFF',
        },
        typography: {
          headingFont: "'Playfair Display', serif",
          bodyFont: "'Plus Jakarta Sans', sans-serif",
          style: 'serif',
          headingWeight: 'bold',
        },
        header: {
          style: 'centered-crest',
          showLogo: true,
          decorativeElement: 'crest',
          crestType: 'none',
        },
        categories: {
          navStyle: 'pills',
          headerStyle: 'divider-line',
        },
        items: {
          cardStyle: 'photo-hero',
          imagePosition: 'right',
          priceStyle: 'pill-badge',
        },
        decorations: {
          texture: 'subtle-grain',
          borderRadius: 'xl',
          borderStyle: 'solid',
          shadow: 'subtle',
        },
      };

      await client.query(`
        INSERT INTO appearance_settings (
          id, tenant_id, template_id, restaurant_display_name, tagline, accent_configuration
        ) VALUES (
          $1, $2, 'royal-maharaja', $3, $4, $5
        )
        ON CONFLICT (tenant_id) DO UPDATE SET
          template_id = 'royal-maharaja',
          restaurant_display_name = EXCLUDED.restaurant_display_name,
          tagline = EXCLUDED.tagline,
          accent_configuration = EXCLUDED.accent_configuration;
      `, [
        `app-${t.menuSlug}`,
        t.tenantId,
        'Mannat Tandoori Junction',
        'Chaap Ka Asli Swad • 100% Pure Soya | Authentic Taste Since 2015',
        JSON.stringify(designSpec)
      ]);

      // 4. Create Master Menu
      const menuId = `menu-${t.menuSlug}`;
      await client.query(`
        INSERT INTO menus (id, tenant_id, name, status)
        VALUES ($1, $2, 'Master Heritage Menu', 'published')
        ON CONFLICT (id) DO NOTHING;
      `, [menuId, t.tenantId]);

      // 5. Clean existing items and categories for fresh sync
      await client.query('DELETE FROM menu_item_variants WHERE tenant_id = $1', [t.tenantId]);
      await client.query('DELETE FROM menu_items WHERE tenant_id = $1', [t.tenantId]);
      await client.query('DELETE FROM menu_categories WHERE tenant_id = $1', [t.tenantId]);

      // Categories
      const categories = [
        { id: `cat-chaap-${t.tenantId}`, name: 'Chaap Specialities', sort: 1 },
        { id: `cat-paneer-${t.tenantId}`, name: 'Paneer Feast', sort: 2 },
        { id: `cat-kebabs-${t.tenantId}`, name: 'Veg Kebabs & Tikka', sort: 3 },
        { id: `cat-platters-${t.tenantId}`, name: 'Signature Platters', sort: 4 },
        { id: `cat-rolls-${t.tenantId}`, name: 'Rolls With Gravy', sort: 5 },
        { id: `cat-crunch-${t.tenantId}`, name: 'Crunch House', sort: 6 },
        { id: `cat-salads-${t.tenantId}`, name: 'Soups & Salads', sort: 7 },
        { id: `cat-khazana-${t.tenantId}`, name: 'Paneer Khazana', sort: 8 },
        { id: `cat-dal-${t.tenantId}`, name: 'Desi Junction & Dal', sort: 9 },
        { id: `cat-rice-${t.tenantId}`, name: 'Rice & Biryani', sort: 10 },
        { id: `cat-soya-gravy-${t.tenantId}`, name: 'Soya Gravies', sort: 11 },
        { id: `cat-breads-${t.tenantId}`, name: 'Tandoori Breads', sort: 12 },
        { id: `cat-thalis-${t.tenantId}`, name: 'MTJ Special Thalis', sort: 13 },
        { id: `cat-street-${t.tenantId}`, name: 'MTJ Street Specials', sort: 14 },
        { id: `cat-momos-${t.tenantId}`, name: 'MTJ Momo Junction', sort: 15 },
        { id: `cat-noodles-${t.tenantId}`, name: 'Chinese Wok Noodles', sort: 16 },
        { id: `cat-chinese-${t.tenantId}`, name: 'Chinese Gravies & Rice', sort: 17 },
        { id: `cat-fries-${t.tenantId}`, name: 'French Fries Corner', sort: 18 },
        { id: `cat-lebanese-${t.tenantId}`, name: 'Lebanese & Falafel', sort: 19 },
        { id: `cat-mexican-${t.tenantId}`, name: 'Mexican Fiesta', sort: 20 },
        { id: `cat-pizzas-${t.tenantId}`, name: 'Stone Baked Pizzas', sort: 21 },
        { id: `cat-burgers-${t.tenantId}`, name: 'Burgers & Sandwiches', sort: 22 },
        { id: `cat-garlic-bread-${t.tenantId}`, name: 'Garlic Breads', sort: 23 },
        { id: `cat-cold-brew-${t.tenantId}`, name: 'Artisan Cold Brews', sort: 24 },
        { id: `cat-shakes-${t.tenantId}`, name: 'Thick Shakes', sort: 25 },
        { id: `cat-coolers-${t.tenantId}`, name: 'Refreshment Coolers', sort: 26 },
        { id: `cat-desserts-${t.tenantId}`, name: 'Sweet Endings', sort: 27 },
      ];

      for (const c of categories) {
        await client.query(`
          INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order, is_visible)
          VALUES ($1, $2, $3, $4, $5, true);
        `, [c.id, menuId, t.tenantId, c.name, c.sort]);
      }

      // Dishes Definition
      const dishes = [
        { id: `mn-1-${t.tenantId}`, name: 'Malai Chaap', cat: `cat-chaap-${t.tenantId}`, desc: 'Tender soya chaap marinated in rich cashew cream and butter', p: 239, hp: 149, fp: 239, pt: 'portion', best: true },
        { id: `mn-2-${t.tenantId}`, name: 'Afghani Chaap', cat: `cat-chaap-${t.tenantId}`, desc: 'Charcoal roasted chaap infused with black pepper and mild creamy spices', p: 239, hp: 149, fp: 239, pt: 'portion' },
        { id: `mn-3-${t.tenantId}`, name: 'Tandoori Chaap', cat: `cat-chaap-${t.tenantId}`, desc: 'Signature fiery red tandoori marinade with crushed kasoori methi', p: 229, hp: 139, fp: 229, pt: 'portion', best: true },
        { id: `mn-4-${t.tenantId}`, name: 'Achari Chaap', cat: `cat-chaap-${t.tenantId}`, desc: 'Tangy pickle spiced chaap roasted on tandoor skewers', p: 229, hp: 139, fp: 229, pt: 'portion' },
        { id: `mn-5-${t.tenantId}`, name: 'Paneer Tikka', cat: `cat-paneer-${t.tenantId}`, desc: 'Charcoal charred cottage cheese cubes with bell peppers and onions', p: 259, hp: 169, fp: 259, pt: 'portion', best: true },
        { id: `mn-6-${t.tenantId}`, name: 'Malai Paneer Tikka', cat: `cat-paneer-${t.tenantId}`, desc: 'Velvety cottage cheese in rich cream and cardamom marinade', p: 279, hp: 179, fp: 279, pt: 'portion' },
        { id: `mn-7-${t.tenantId}`, name: 'Dahi Ke Sholay', cat: `cat-kebabs-${t.tenantId}`, desc: 'Crispy fried bread rolls stuffed with spiced hung curd and herbs', p: 199, pt: 'single', best: true },
        { id: `mn-8-${t.tenantId}`, name: 'Veg Seekh Kebab', cat: `cat-kebabs-${t.tenantId}`, desc: 'Minced vegetable skewers grilled with aromatic tandoor spices', p: 219, pt: 'single' },
        { id: `mn-9-${t.tenantId}`, name: 'Mannat Special Platter', cat: `cat-platters-${t.tenantId}`, desc: 'Assorted tandoori chaaps, paneer tikka, dahi ke sholay & seekh kebabs', p: 449, pt: 'single', best: true },
        { id: `mn-10-${t.tenantId}`, name: 'Malai Chaap Roll With Gravy', cat: `cat-rolls-${t.tenantId}`, desc: 'Succulent malai chaap wrapped in roomali, served with rich makhani gravy', p: 299, pt: 'variants', variants: [{ name: '2 Pcs', p: 199 }, { name: '4 Pcs', p: 299 }] },
        { id: `mn-11-${t.tenantId}`, name: 'Crunchy Soya Popcorn', cat: `cat-crunch-${t.tenantId}`, desc: 'Bite-sized golden crispy soya nuggets with peri-peri dip', p: 189, pt: 'single', best: true },
        { id: `mn-12-${t.tenantId}`, name: 'Greek Salad', cat: `cat-salads-${t.tenantId}`, desc: 'Fresh crisp lettuce, cucumber, kalamata olives, cherry tomatoes and feta', p: 199, pt: 'single' },
        { id: `mn-13-${t.tenantId}`, name: 'Shahi Paneer', cat: `cat-khazana-${t.tenantId}`, desc: 'Soft cottage cheese simmered in smooth royal tomato-cashew velvet gravy', p: 289, hp: 179, fp: 289, pt: 'portion', best: true },
        { id: `mn-14-${t.tenantId}`, name: 'Dal Makhani', cat: `cat-dal-${t.tenantId}`, desc: 'Slow-simmered black lentils for 24 hours on tandoor embers with pure butter', p: 259, hp: 159, fp: 259, pt: 'portion', best: true },
        { id: `mn-15-${t.tenantId}`, name: 'Veg Hyderabadi Biryani', cat: `cat-rice-${t.tenantId}`, desc: 'Fragrant basmati rice layered with seasoned vegetables, saffron and kewra', p: 239, pt: 'single' },
        { id: `mn-16-${t.tenantId}`, name: 'Tawa Chaap Gravy', cat: `cat-soya-gravy-${t.tenantId}`, desc: '100% pure soya chaap cooked in robust semi-dry spiced onion gravy', p: 279, hp: 169, fp: 279, pt: 'portion', best: true },
        { id: `mn-17-${t.tenantId}`, name: 'Butter Naan', cat: `cat-breads-${t.tenantId}`, desc: 'Clay oven baked leavened bread brushed with melted butter', p: 55, pt: 'single' },
        { id: `mn-18-${t.tenantId}`, name: 'Garlic Naan', cat: `cat-breads-${t.tenantId}`, desc: 'Hand-stretched naan garnished with minced garlic, coriander and butter', p: 65, pt: 'single', best: true },
        { id: `mn-19-${t.tenantId}`, name: 'Deluxe Thali', cat: `cat-thalis-${t.tenantId}`, desc: 'Dal Makhani, Shahi Paneer, Rice, 2 Butter Roti, Raita, Salad & Gulab Jamun', p: 269, pt: 'single', best: true },
        { id: `mn-20-${t.tenantId}`, name: 'Amritsari Chole Kulche', cat: `cat-street-${t.tenantId}`, desc: 'Tangy pindi chana served with 2 stuffed tandoori kulchas and pickle', p: 169, pt: 'single' },
        // Momos
        { id: `mn-21-${t.tenantId}`, name: 'Steamed Momos', cat: `cat-momos-${t.tenantId}`, desc: 'Delicate hand-wrapped dumplings steamed with garden fresh filling', p: 149, pt: 'variants', variants: [{ name: 'Veg (6 Pcs)', p: 149 }, { name: 'Paneer (6 Pcs)', p: 169 }, { name: 'Corn N Cheese', p: 189 }] },
        { id: `mn-22-${t.tenantId}`, name: 'Golden Fry Momos', cat: `cat-momos-${t.tenantId}`, desc: 'Crispy deep-fried momos served with fiery red chutney and mayo', p: 159, pt: 'variants', variants: [{ name: 'Veg (6 Pcs)', p: 159 }, { name: 'Paneer (6 Pcs)', p: 179 }, { name: 'Corn N Cheese', p: 199 }] },
        { id: `mn-23-${t.tenantId}`, name: 'Kurkure Momos', cat: `cat-momos-${t.tenantId}`, desc: 'Crunchy battered momos crusted in crispy flakes', p: 179, pt: 'variants', best: true, variants: [{ name: 'Veg (6 Pcs)', p: 179 }, { name: 'Paneer (6 Pcs)', p: 199 }, { name: 'Corn N Cheese', p: 219 }] },
        { id: `mn-24-${t.tenantId}`, name: 'Tandoori Momos', cat: `cat-momos-${t.tenantId}`, desc: 'Clay oven charred momos tossed with butter and chaat masala', p: 189, pt: 'variants', best: true, variants: [{ name: 'Veg (6 Pcs)', p: 189 }, { name: 'Paneer (6 Pcs)', p: 209 }, { name: 'Corn N Cheese', p: 229 }] },
        { id: `mn-25-${t.tenantId}`, name: 'Afghani Momos', cat: `cat-momos-${t.tenantId}`, desc: 'Creamy grilled momos tossed in malai and black pepper dip', p: 199, pt: 'variants', variants: [{ name: 'Veg (6 Pcs)', p: 199 }, { name: 'Paneer (6 Pcs)', p: 219 }, { name: 'Corn N Cheese', p: 239 }] },
        // Chinese
        { id: `mn-26-${t.tenantId}`, name: 'Veg Hakka Noodles', cat: `cat-noodles-${t.tenantId}`, desc: 'Wok tossed noodles with crunchy julienned vegetables and soy glaze', p: 189, pt: 'single', best: true },
        { id: `mn-27-${t.tenantId}`, name: 'Veg Manchurian Gravy', cat: `cat-chinese-${t.tenantId}`, desc: 'Fried vegetable rounds in garlic-ginger dark soy gravy', p: 219, pt: 'single' },
        // Cafe
        { id: `mn-28-${t.tenantId}`, name: 'Peri Peri French Fries', cat: `cat-fries-${t.tenantId}`, desc: 'Crispy potato fries dusted with piquant peri-peri seasoning', p: 139, pt: 'single' },
        { id: `mn-29-${t.tenantId}`, name: 'Falafel Hummus Wrap', cat: `cat-lebanese-${t.tenantId}`, desc: 'Crispy chickpea falafel patties with creamy garlic hummus in pita wrap', p: 199, pt: 'single' },
        { id: `mn-30-${t.tenantId}`, name: 'Loaded Cheesy Nachos', cat: `cat-mexican-${t.tenantId}`, desc: 'Crispy corn tortilla chips topped with warm cheese sauce and jalapeños', p: 179, pt: 'single' },
        // Pizzas & Burgers
        { id: `mn-31-${t.tenantId}`, name: 'Margherita Pizza (10")', cat: `cat-pizzas-${t.tenantId}`, desc: 'Classic stone-baked thin crust pizza with San Marzano tomato sauce and mozzarella', p: 279, pt: 'single', best: true },
        { id: `mn-32-${t.tenantId}`, name: 'Brioche Paneer Burger', cat: `cat-burgers-${t.tenantId}`, desc: 'Spiced crispy paneer patty on toasted sesame brioche bun with creamy coleslaw', p: 169, pt: 'single' },
        { id: `mn-33-${t.tenantId}`, name: 'Cheesy Garlic Bread (4 Pcs)', cat: `cat-garlic-bread-${t.tenantId}`, desc: 'Toasted baguette slices with garlic herb butter and melted mozzarella', p: 149, pt: 'single' },
        // Brews & Shakes
        { id: `mn-34-${t.tenantId}`, name: 'Cold Brew Hazelnut Latte', cat: `cat-cold-brew-${t.tenantId}`, desc: 'Slow-steeped cold brew with velvety steamed milk and roasted hazelnut syrup', p: 169, pt: 'single', best: true },
        { id: `mn-35-${t.tenantId}`, name: 'Oreo Cookie Thick Shake', cat: `cat-shakes-${t.tenantId}`, desc: 'Rich chocolate and vanilla bean thick shake blended with crunchy Oreos', p: 189, pt: 'single' },
        { id: `mn-36-${t.tenantId}`, name: 'Fresh Mint Mojito', cat: `cat-coolers-${t.tenantId}`, desc: 'Muddled fresh mint leaves, lime wedges and sparkling soda with crushed ice', p: 139, pt: 'single' },
        // Desserts
        { id: `mn-37-${t.tenantId}`, name: 'Sizzling Hot Fudge Brownie', cat: `cat-desserts-${t.tenantId}`, desc: 'Warm Belgian chocolate walnut brownie served on a sizzler plate with vanilla ice cream', p: 199, pt: 'single', best: true },
      ];

      for (let idx = 0; idx < dishes.length; idx++) {
        const d = dishes[idx];
        await client.query(`
          INSERT INTO menu_items (
            id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, pricing_type, diet_type, is_available, sort_order
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'veg', true, $11
          );
        `, [
          d.id, menuId, t.tenantId, d.cat, d.name, d.desc, d.p, d.hp || null, d.fp || null, d.pt, idx + 1
        ]);

        if (d.variants && d.variants.length > 0) {
          for (let vIdx = 0; vIdx < d.variants.length; vIdx++) {
            const v = d.variants[vIdx];
            await client.query(`
              INSERT INTO menu_item_variants (
                id, menu_item_id, tenant_id, name, price, is_available, sort_order
              ) VALUES (
                $1, $2, $3, $4, $5, true, $6
              );
            `, [
              `var-${d.id}-${vIdx}`, d.id, t.tenantId, v.name, v.p, vIdx + 1
            ]);
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('Successfully seeded both mannat-tandoori-junction and shankar-dhaba with 37 authentic dishes & 12 chapters!');
    console.log('URLs:');
    console.log('1) http://localhost:5173/menu/shankar-dhaba');
    console.log('2) http://localhost:5173/menu/mannat-tandoori-junction');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
  } finally {
    await client.end();
  }
}

seedMannat();
