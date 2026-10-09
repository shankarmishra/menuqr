const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('prerender.cjs error: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const DOMAIN = 'https://menusqr.in';

const routes = [
  {
    path: '/',
    title: 'MenusQR | Digital QR Menu for Restaurants',
    description: 'Create a professional digital QR menu for your restaurant. Update dishes, prices, and availability instantly without reprinting your table QR code stands.',
    h1: "Your menu changes. Your QR code doesn't.",
    content: `
      <main class="max-w-6xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19] tracking-tight">Your menu changes. Your QR code doesn't.</h1>
        <p class="text-lg text-[#53615a] mt-4 max-w-3xl leading-relaxed">Create a professional digital QR menu for your restaurant. Update dishes, prices, and item availability instantly without ever reprinting your table QR code stands.</p>
        <section class="mt-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <h2 class="text-2xl font-bold text-[#151C19]">Digital QR Menu Infrastructure for Food Businesses</h2>
          <p>MenusQR provides modern restaurants, cafés, bistros, bars, and dhabas with high-durability permanent table QR code stands backed by a live cloud menu dashboard. Change prices in real-time, launch daily specials, or hide out-of-stock items in seconds.</p>
          <div class="grid md:grid-cols-3 gap-6 my-8">
            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 class="font-bold text-xl text-[#151C19] mb-2">Permanent QR Code</h3>
              <p class="text-base text-[#53615a]">Print table QR stands once. The destination URL remains stable while your digital menu updates continuously.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 class="font-bold text-xl text-[#151C19] mb-2">Instant Cloud Updates</h3>
              <p class="text-base text-[#53615a]">Modify prices, dish descriptions, Veg/Non-Veg indicators, and category listings in real-time.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <h3 class="font-bold text-xl text-[#151C19] mb-2">Mobile-Optimized</h3>
              <p class="text-base text-[#53615a]">Lightning-fast browser load for guests on iOS and Android with zero app download required.</p>
            </div>
          </div>
          <div class="pt-6">
            <a href="/plans" class="inline-block bg-[#E8783C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#d66a30] transition-colors">View Pricing & Plans</a>
          </div>
        </section>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MenusQR",
        "url": DOMAIN,
        "logo": `${DOMAIN}/favicon.svg`,
        "email": "support@menusqr.in"
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "MenusQR",
        "url": DOMAIN
      }
    ]
  },
  {
    path: '/digital-qr-menu',
    title: 'Digital QR Menu for Restaurants | MenusQR',
    description: 'Transform your restaurant with a seamless digital QR menu. Update prices, categories, and items instantly while keeping your table QR codes unchanged.',
    h1: 'A Digital QR Menu Built for Restaurants',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">A Digital QR Menu Built for Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Bridge physical table dining with instant digital convenience. MenusQR empowers restaurant owners to publish interactive, mobile-optimized menus that load instantly.</p>
        <section class="mt-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-[#151C19]/80 text-lg leading-relaxed">
          <h2 class="text-2xl font-bold text-[#151C19]">What is a Digital QR Menu?</h2>
          <p>A digital QR menu is a touchless, digital version of your physical menu hosted online and accessible via table-mounted QR codes. When diners scan the QR code using their smartphone camera, your full menu opens in their web browser immediately.</p>
          <h2 class="text-2xl font-bold text-[#151C19] pt-4">Key Benefits for Restaurant Owners</h2>
          <ul class="list-disc pl-6 space-y-2 text-base text-[#151C19]">
            <li><strong>Instant Price & Dish Updates:</strong> Modify pricing or mark items out-of-stock in seconds.</li>
            <li><strong>Zero Reprinting Expenses:</strong> Physical table QR codes remain permanent while content updates live.</li>
            <li><strong>Rich Visual Presentation:</strong> Showcase high-resolution dish images, dietary tags (Veg/Non-Veg), and ingredient notes.</li>
            <li><strong>Faster Table Turnover:</strong> Diners browse the menu immediately upon seating without waiting for staff.</li>
          </ul>
          <div class="pt-6">
            <a href="/plans" class="inline-block bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold">Explore Plans & Pricing</a>
          </div>
        </section>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MenusQR",
        "url": DOMAIN
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Digital QR Menu", "item": `${DOMAIN}/digital-qr-menu` }
        ]
      }
    ]
  },
  {
    path: '/restaurant-qr-menu',
    title: 'Restaurant QR Menu | Permanent QR, Live Menu Updates | MenusQR',
    description: 'Upgrade your restaurant with a permanent QR menu. Showcase your food beautifully, update prices instantly, and offer table ordering with MenusQR Premium.',
    h1: 'A Restaurant QR Menu That Never Needs Reprinting',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">A Restaurant QR Menu That Never Needs Reprinting</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Say goodbye to costly menu reprinting. MenusQR gives your restaurant high-durability permanent table QR codes coupled with continuous real-time cloud menu management.</p>
        <section class="mt-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-[#151C19]/80 text-lg leading-relaxed">
          <h2 class="text-2xl font-bold text-[#151C19]">Permanent QR Code Stands Behind Dynamic Cloud Menus</h2>
          <p>MenusQR decouples your physical table QR code from static PDF files. Your QR code routes diners to a high-speed dynamic web page managed from your admin dashboard.</p>
          <div class="pt-6">
            <a href="/plans" class="inline-block bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold">See Pricing Options</a>
          </div>
        </section>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "MenusQR",
        "url": DOMAIN
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Restaurant QR Menu", "item": `${DOMAIN}/restaurant-qr-menu` }
        ]
      }
    ]
  },
  {
    path: '/digital-menu-for-restaurants',
    title: 'Digital Menu for Restaurants | MenusQR',
    description: 'Create an interactive digital menu for your restaurant, café, or dhaba. Fast loading, mobile-optimized, and hassle-free menu updates.',
    h1: 'The Ultimate Digital Menu for Modern Restaurants',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">The Ultimate Digital Menu for Modern Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Transform guest dining experiences with MenusQR. Create dynamic, visual digital menus that load instantly on any mobile device without requiring app downloads.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Digital Menu for Restaurants", "item": `${DOMAIN}/digital-menu-for-restaurants` }
        ]
      }
    ]
  },
  {
    path: '/qr-menu-for-restaurants',
    title: 'QR Menu for Restaurants | Fast Setup & Live Management | MenusQR',
    description: 'Set up a custom QR menu for your restaurant in minutes. Easy dish categorization, Veg/Non-Veg indicators, and beautiful template designs.',
    h1: 'Smart QR Menu Solutions for Every Restaurant',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Smart QR Menu Solutions for Every Restaurant</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Whether you operate a fine-dining establishment, a cozy café, or a multi-table dhaba, MenusQR provides a fast, dependable QR menu solution.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "QR Menu for Restaurants", "item": `${DOMAIN}/qr-menu-for-restaurants` }
        ]
      }
    ]
  },
  {
    path: '/restaurant-digital-menu',
    title: 'Restaurant Digital Menu Software | MenusQR',
    description: "Empower your food business with MenusQR's restaurant digital menu system. Manage multiple categories, pricing, and availability with ease.",
    h1: 'Complete Restaurant Digital Menu Management',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Complete Restaurant Digital Menu Management</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Modernize your restaurant operations with an enterprise-grade digital menu engine designed for ease of use, instant deployment, and zero maintenance overhead.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Restaurant Digital Menu", "item": `${DOMAIN}/restaurant-digital-menu` }
        ]
      }
    ]
  },
  {
    path: '/qr-ordering-for-restaurants',
    title: 'QR Ordering for Restaurants | Table Ordering System | MenusQR',
    description: 'Let guests order directly from their table using MenusQR Premium. Streamline kitchen reception, speed up service, and boost table turnover.',
    h1: 'Direct Table QR Ordering for Restaurants',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Direct Table QR Ordering for Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Turn your table QR codes into an interactive order placement engine with MenusQR Premium.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "QR Ordering for Restaurants", "item": `${DOMAIN}/qr-ordering-for-restaurants` }
        ]
      }
    ]
  },
  {
    path: '/plans',
    title: 'MenusQR Pricing | Digital Menu Plans for Restaurants',
    description: 'View MenusQR pricing plans. Basic ₹999/year, Intermediate ₹1499/year, and Premium ₹2999/year. Create your digital restaurant QR menu today.',
    h1: 'Simple Digital Menu Plans for Restaurants',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Simple Digital Menu Plans for Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">One permanent table QR code. Unlimited menu updates. Transparent yearly pricing for every food business.</p>
        <div class="grid md:grid-cols-3 gap-6 mt-10">
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 class="text-2xl font-bold text-[#151C19]">Basic Plan</h3>
            <p class="text-3xl font-extrabold text-[#E8783C] my-4">₹999 <span class="text-sm text-gray-500 font-normal">/year</span></p>
            <p class="text-gray-600 mb-6">Essential digital QR menu for single location restaurants.</p>
            <a href="/onboarding" class="block text-center bg-[#151C19] text-white py-3 rounded-full font-bold">Get Started</a>
          </div>
          <div class="bg-white p-8 rounded-3xl border-2 border-[#E8783C] shadow-md relative">
            <span class="absolute -top-3 right-6 bg-[#E8783C] text-white text-xs px-3 py-1 rounded-full font-bold uppercase">Popular</span>
            <h3 class="text-2xl font-bold text-[#151C19]">Intermediate Plan</h3>
            <p class="text-3xl font-extrabold text-[#E8783C] my-4">₹1,499 <span class="text-sm text-gray-500 font-normal">/year</span></p>
            <p class="text-gray-600 mb-6">Advanced menu management with photo galleries and custom branding.</p>
            <a href="/onboarding" class="block text-center bg-[#E8783C] text-white py-3 rounded-full font-bold">Get Started</a>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 class="text-2xl font-bold text-[#151C19]">Premium Plan</h3>
            <p class="text-3xl font-extrabold text-[#E8783C] my-4">₹2,999 <span class="text-sm text-gray-500 font-normal">/year</span></p>
            <p class="text-gray-600 mb-6">Complete digital menu + direct table QR ordering system.</p>
            <a href="/onboarding" class="block text-center bg-[#151C19] text-white py-3 rounded-full font-bold">Get Started</a>
          </div>
        </div>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Plans & Pricing", "item": `${DOMAIN}/plans` }
        ]
      }
    ]
  },
  {
    path: '/how-it-works',
    title: 'How MenusQR Works | Permanent QR Restaurant Menu',
    description: 'Learn how MenusQR connects permanent physical QR code stands with real-time digital menu management for your restaurant in 3 easy steps.',
    h1: 'How MenusQR Works for Your Restaurant',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">How MenusQR Works for Your Restaurant</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Create your menu, download permanent table QR code stands, and update pricing or dish availability live anytime.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "How It Works", "item": `${DOMAIN}/how-it-works` }
        ]
      }
    ]
  },
  {
    path: '/templates',
    title: 'Restaurant Menu Templates | MenusQR',
    description: 'Explore mobile-first digital menu templates designed for fine dining, casual cafés, retro diners, and vibrant dhabas.',
    h1: 'Digital Menu Templates Designed for Food Businesses',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Digital Menu Templates Designed for Food Businesses</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Choose a visual personality that matches your restaurant atmosphere. All MenusQR templates are fully responsive and mobile-first.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Templates", "item": `${DOMAIN}/templates` }
        ]
      }
    ]
  },
  {
    path: '/about',
    title: 'About MenusQR | Digital Menu Infrastructure for Restaurants',
    description: 'MenusQR provides permanent table QR codes and real-time digital menu management for modern restaurants, cafés, and food businesses.',
    h1: 'About MenusQR',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">About MenusQR</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">MenusQR is building the modern digital menu infrastructure for food businesses across India.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "About", "item": `${DOMAIN}/about` }
        ]
      }
    ]
  },
  {
    path: '/contact',
    title: 'Contact MenusQR | Customer Support & Sales',
    description: 'Get in touch with the MenusQR team for onboarding assistance, restaurant support, or sales inquiries.',
    h1: 'Contact MenusQR Support & Sales',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Contact MenusQR Support & Sales</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Email support@menusqr.in for customer support and sales inquiries.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Contact", "item": `${DOMAIN}/contact` }
        ]
      }
    ]
  },
  {
    path: '/faq',
    title: 'MenusQR FAQ | Frequently Asked Questions',
    description: 'Find clear answers to common questions about MenusQR digital menus, permanent QR codes, instant price updates, and direct table ordering.',
    h1: 'Frequently Asked Questions About MenusQR',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl md:text-5xl font-extrabold text-[#151C19]">Frequently Asked Questions About MenusQR</h1>
        <p class="text-lg text-[#53615a] mt-4 leading-relaxed">Everything you need to know about MenusQR digital menus and table QR code stands.</p>
      </main>
    `,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "FAQ", "item": `${DOMAIN}/faq` }
        ]
      }
    ]
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | MenusQR',
    description: 'Read the official MenusQR privacy policy detailing how user and restaurant data is collected, stored, and protected.',
    h1: 'MenusQR Privacy Policy',
    content: `<main class="max-w-5xl mx-auto px-6 py-20"><h1 class="text-4xl font-extrabold text-[#151C19]">MenusQR Privacy Policy</h1></main>`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${DOMAIN}/privacy` }
        ]
      }
    ]
  },
  {
    path: '/terms',
    title: 'Terms of Service | MenusQR',
    description: 'Review the MenusQR terms of service for restaurant owners and platform users.',
    h1: 'MenusQR Terms of Service',
    content: `<main class="max-w-5xl mx-auto px-6 py-20"><h1 class="text-4xl font-extrabold text-[#151C19]">MenusQR Terms of Service</h1></main>`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Terms of Service", "item": `${DOMAIN}/terms` }
        ]
      }
    ]
  },
  {
    path: '/refund-cancellation',
    title: 'Refund & Cancellation Policy | MenusQR',
    description: 'Official refund and cancellation policy for MenusQR subscription plans.',
    h1: 'Refund & Cancellation Policy',
    content: `<main class="max-w-5xl mx-auto px-6 py-20"><h1 class="text-4xl font-extrabold text-[#151C19]">Refund & Cancellation Policy</h1></main>`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": `${DOMAIN}/` },
          { "@type": "ListItem", "position": 2, "name": "Refund Policy", "item": `${DOMAIN}/refund-cancellation` }
        ]
      }
    ]
  }
];

// Process public routes
routes.forEach((route) => {
  const canonicalUrl = `${DOMAIN}${route.path === '/' ? '' : route.path}`;
  let html = template;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/gi, `<title>${route.title}</title>`);

  // Replace Description
  html = html.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${route.description}" />`);

  // Inject Canonical Link & Open Graph Meta Tags & Schema into <head>
  const schemaScript = route.schema && route.schema.length > 0
    ? `<script type="application/ld+json">${JSON.stringify(route.schema.length === 1 ? route.schema[0] : route.schema)}</script>`
    : '';

  const headElements = `
    <link rel="canonical" href="${canonicalUrl}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:site_name" content="MenusQR" />
    <meta property="og:image" content="${DOMAIN}/og-image.webp" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${DOMAIN}/og-image.webp" />
    ${schemaScript}
  `;

  html = html.replace('</head>', `${headElements}\n</head>`);

  // Inject pre-rendered content into <div id="root"></div>
  if (route.content) {
    html = html.replace('<div id="root"></div>', `<div id="root">${route.content}</div>`);
  }

  if (route.path === '/') {
    fs.writeFileSync(TEMPLATE_PATH, html, 'utf-8');
  } else {
    const targetDir = path.join(DIST_DIR, route.path.slice(1));
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
  }
});

// Also create 404.html with noindex for Vercel
let html404 = template;
html404 = html404.replace(/<title>.*?<\/title>/gi, `<title>404 - Page Not Found | MenusQR</title>`);
html404 = html404.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="The page you requested could not be found." />`);
html404 = html404.replace('</head>', `<meta name="robots" content="noindex, nofollow" />\n</head>`);
html404 = html404.replace('<div id="root"></div>', `<div id="root"><main class="max-w-4xl mx-auto px-6 py-20 text-center"><h1 class="text-4xl font-bold text-[#151C19]">404 - Page Not Found</h1><p class="mt-4 text-gray-600">The requested page does not exist on MenusQR.</p><a href="/" class="mt-6 inline-block bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold">Go to Homepage</a></main></div>`);
fs.writeFileSync(path.join(DIST_DIR, '404.html'), html404, 'utf-8');

console.log(`Prerender complete: Generated static HTML for ${routes.length} routes + 404.html`);
