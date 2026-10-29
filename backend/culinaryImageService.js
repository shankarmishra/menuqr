// MENUQR Culinary Dish Photo Resolution Engine
// Deterministic keyword -> photograph matching for menus that have no photography of their own.
// No AI: every assignment is a lookup, reproducible, free, and explainable to the owner who gets it.
//
// Each entry carries `url` (the single photo used today, kept for back-compat) and an optional
// `urls` array of verified alternates. Where `urls` has more than one entry, `pickCandidate()`
// chooses deterministically per (tenantId, dishName), so two restaurants serving the same dish
// do not render byte-identical menus — a real complaint about clone menus today, since every
// entry currently has exactly one photo.
//
// `assetLicense` tracks provenance so a future migration to a self-hosted, commercially licensed
// pack is a data change here, not a renderer change. 'unsplash-hotlink' is every entry below:
// real photographs, hotlinked from Unsplash's CDN rather than self-hosted. That is a licensing
// and reliability risk for a paid product (see the MENUQR design-system plan, Phase 3 risks) and
// is flagged rather than silently accepted — swapping to 'self-hosted' entries later requires no
// code change, only populating `urls` with verified in-house asset paths.

// Curated studio photography database with optimized high-performance WebP/JPG assets
const CULINARY_LIBRARY = [
  // ── Indian Starters & Tandoori ──
  {
    keywords: ['paneer tikka', 'tandoori paneer', 'tikka paneer', 'malai paneer'],
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    title: 'Paneer Tikka',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['soya chaap', 'tandoori chaap', 'afghani chaap', 'malai chaap', 'chaap'],
    url: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80',
    title: 'Tandoori Soya Chaap',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['tandoori chicken', 'chicken tikka', 'murgh tikka', 'chicken kebab'],
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    title: 'Tandoori Chicken',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['seekh kebab', 'kebab', 'sheekh kabab', 'galouti kebab', 'shami kebab'],
    url: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80',
    title: 'Seekh Kebab',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['dahi ke sholay', 'dahi kebab', 'hara bhara kabab', 'veg kabab'],
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    title: 'Hara Bhara Kebab',
    assetLicense: 'unsplash-hotlink',
  },

  // ── Indian Main Course ──
  {
    keywords: ['dal makhani', 'dal makhni', 'makhani dal', 'black dal'],
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    title: 'Dal Makhani',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['dal tadka', 'yellow dal', 'dal fry', 'tadka dal'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    title: 'Yellow Dal Tadka',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['paneer butter masala', 'shahi paneer', 'paneer lababdar', 'kadhai paneer', 'paneer makhani', 'paneer'],
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    title: 'Paneer Butter Masala',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['butter chicken', 'murgh makhani', 'chicken curry', 'kadhai chicken'],
    url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    title: 'Butter Chicken',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['mutton rogan josh', 'rogan josh', 'mutton curry', 'laal maas'],
    url: 'https://images.unsplash.com/photo-1545247181-516773ca83f3?auto=format&fit=crop&w=600&q=80',
    title: 'Mutton Rogan Josh',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['biryani', 'dum biryani', 'hyderabadi biryani', 'veg biryani', 'chicken biryani', 'mutton biryani'],
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    title: 'Royal Dum Biryani',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['naan', 'butter naan', 'garlic naan', 'roti', 'tandoori roti', 'laccha paratha', 'paratha'],
    url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
    title: 'Tandoori Butter Naan',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['thali', 'royal thali', 'platter', 'combo meal'],
    url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
    title: 'Royal Indian Thali',
    assetLicense: 'unsplash-hotlink',
  },

  // ── South Indian ──
  {
    keywords: ['dosa', 'masala dosa', 'mysore dosa', 'plain dosa', 'ghee roast'],
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    title: 'Crispy Masala Dosa',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['idli', 'idli sambar', 'vada', 'medu vada'],
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    title: 'Steaming Idli Sambar',
    assetLicense: 'unsplash-hotlink',
  },

  // ── Chinese & Pan-Asian ──
  {
    keywords: ['momos', 'dim sum', 'dumplings', 'steamed momos', 'fried momos', 'tandoori momos'],
    url: 'https://images.unsplash.com/photo-1625242664557-53c1935c7546?auto=format&fit=crop&w=600&q=80',
    title: 'Steamed Momos',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['noodles', 'hakka noodles', 'chowmein', 'schezwan noodles'],
    url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    title: 'Wok Hakka Noodles',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['fried rice', 'schezwan rice', 'triple rice'],
    url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    title: 'Chinese Fried Rice',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['manchurian', 'chilli paneer', 'chili chicken', 'chilli potato', 'honey chilli potato', 'spring rolls'],
    url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80',
    title: 'Chilli Paneer Manchurian',
    assetLicense: 'unsplash-hotlink',
  },

  // ── Cafe, Fast Food & Continental ──
  {
    keywords: ['steak', 't-bone', 'ribeye', 'sirloin', 't bone', 'beef steak', 'salmon', 'grilled salmon', 'seafood platter'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    title: 'Sizzling T-Bone Steak with Herb Butter',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['fish chip', 'fish and chips', 'fish chips', 'kerupuk udang', 'prawn', 'crispy fish'],
    url: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=600&q=80',
    title: 'Crispy Golden Fish & Chips',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['chicken parmesan', 'parmigiana', 'chicken parm', 'chicken basil'],
    url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=600&q=80',
    title: 'Crispy Chicken Parmesan with Basil',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['cheese chips', 'loaded chips', 'potato wedge', 'wedge'],
    url: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
    title: 'Golden Potato Wedges with Cheese',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['manisan segar', 'fruit salad', 'compote', 'fresh sweets'],
    url: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?auto=format&fit=crop&w=600&q=80',
    title: 'Manisan Segar Tropical Dessert',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['pizza', 'margherita', 'farmhouse', 'pepperoni pizza', 'cheese burst', 'new york style', 'applewood', 'charred charlie', 'lazy baker'],
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    title: 'Artisanal Stone Oven Pizza',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['burger', 'crispy burger', 'cheese burger', 'veg burger', 'chicken burger'],
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    title: 'Gourmet Handcrafted Burger',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['fries', 'french fries', 'peri peri fries', 'cheesy fries', 'potato wedges'],
    url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    title: 'Golden Crispy Fries',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['pasta', 'alfredo', 'arrabbiata', 'white sauce pasta', 'red sauce pasta', 'spaghetti'],
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80',
    title: 'Italian Creamy Pasta',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['sandwich', 'grilled sandwich', 'club sandwich', 'cheese toast'],
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    title: 'Grilled Club Sandwich',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['garlic bread', 'cheese garlic bread', 'bruschetta'],
    url: 'https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=600&q=80',
    title: 'Cheesy Garlic Bread',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['nachos', 'tacos', 'quesadilla', 'burrito'],
    url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    title: 'Loaded Cheese Nachos',
    assetLicense: 'unsplash-hotlink',
  },

  // ── Coffee & Beverages ──
  {
    keywords: ['coffee', 'cappuccino', 'latte', 'espresso', 'flat white', 'hot coffee'],
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    title: 'Artisan Latte Coffee',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['cold coffee', 'iced coffee', 'frappe', 'ice blend'],
    url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    title: 'Chilled Iced Coffee',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['shake', 'milkshake', 'thick shake', 'oreo shake', 'chocolate shake', 'strawberry shake', 'oreo lover', 'oreo banana', 'choco rum', 'strawberry blow'],
    url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    title: 'Thick Gourmet Milkshake',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['mojito', 'virgin mojito', 'mocktail', 'blue lagoon', 'lemonade', 'cooler', 'lover soda', 'blue sunrising', 'happy lover', 'best water', 'sparkling soda'],
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    title: 'Sparkling Ocean Cooler & Artisan Soda',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['tea', 'masala chai', 'chai', 'kulhad chai', 'green tea'],
    url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    title: 'Masala Kulhad Chai',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['lassi', 'mango lassi', 'sweet lassi', 'chaas'],
    url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
    title: 'Authentic Sweet Lassi',
    assetLicense: 'unsplash-hotlink',
  },

  // ── Desserts & Bakery ──
  {
    keywords: ['gulab jamun', 'kala jamun', 'rasgulla', 'rasmalai', 'kheer', 'rabri'],
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    title: 'Royal Kesari Gulab Jamun',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['ice cream', 'sundae', 'gelato', 'kulfi', 'cassata'],
    url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
    title: 'Creamy Gelato Sundae',
    assetLicense: 'unsplash-hotlink',
  },
  {
    keywords: ['brownie', 'lava cake', 'pastry', 'chocolate cake', 'cheesecake', 'waffle'],
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    title: 'Warm Sizzling Brownie',
    assetLicense: 'unsplash-hotlink',
  },
];

/**
 * Normalizes dish name by removing portion sizes, special characters, and extraneous keywords
 */
function cleanDishName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\b(half|full|plate|pc|pcs|piece|pieces|small|medium|large|special|deluxe|pure)\b/gi, '')
    .replace(/[₹\d()\-–,/+&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * FNV-1a: a small, fast, stable string hash. Not cryptographic — it only needs to spread inputs
 * evenly across a short candidate list, deterministically, with no dependency.
 */
function stableHash(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Pick one photo for (tenantId, dishName) from an entry's candidates.
 *
 * Deterministic and stable: the same tenant asking for the same dish always gets the same photo
 * (so a menu never "flickers" between renders), while two different tenants serving the same
 * dish are likely to get different photos once an entry has more than one candidate — without
 * any AI, state, or per-request randomness.
 */
export function pickCandidate(entry, tenantId, dishName) {
  const candidates = Array.isArray(entry.urls) && entry.urls.length > 0 ? entry.urls : [entry.url];
  if (candidates.length === 1) return candidates[0];
  const index = stableHash(`${tenantId || 'anonymous'}::${dishName || ''}`) % candidates.length;
  return candidates[index];
}

/**
 * Resolves an appetizing food photograph for a dish.
 * 1. Checks extracted PDF dish photos.
 * 2. Matches against our rich curated studio culinary library.
 * 3. Falls back to a category-level appetizing culinary visual.
 *
 * @param {string} dishName
 * @param {string} [categoryName]
 * @param {Array<{url: string}>} [extractedPdfImages]
 * @param {number} [dishIndex]
 * @param {string} [tenantId] - Used only to pick deterministically among an entry's candidate
 *   photos when it has more than one; omitting it is safe and falls back to the first candidate.
 */
export function resolveDishImage(dishName, categoryName = '', extractedPdfImages = [], dishIndex = 0, tenantId = '') {
  const cleanedName = cleanDishName(dishName);
  const cleanedCategory = cleanDishName(categoryName);

  // 1. If PDF has extracted dish photos, distribute them sequentially to top dishes
  if (Array.isArray(extractedPdfImages) && extractedPdfImages.length > 0) {
    if (dishIndex < extractedPdfImages.length) {
      return extractedPdfImages[dishIndex].url;
    }
  }

  // 2. Direct keyword matching in culinary library
  for (const entry of CULINARY_LIBRARY) {
    for (const kw of entry.keywords) {
      if (cleanedName.includes(kw)) {
        return pickCandidate(entry, tenantId, dishName);
      }
    }
  }

  // 3. Category level matching
  for (const entry of CULINARY_LIBRARY) {
    for (const kw of entry.keywords) {
      if (cleanedCategory.includes(kw)) {
        return pickCandidate(entry, tenantId, dishName);
      }
    }
  }

  // 4. Fallback based on cuisine vibe
  if (/soup|salad|healthy/i.test(cleanedCategory)) {
    return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80';
  }
  if (/bread|roti|paratha|naan/i.test(cleanedCategory)) {
    return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80';
  }
  if (/dessert|sweet|ice cream/i.test(cleanedCategory)) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80';
  }
  if (/beverage|drink|mocktail|shake|juice|bar/i.test(cleanedCategory)) {
    return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80';
  }

  // General delicious gourmet dish visual
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
}
