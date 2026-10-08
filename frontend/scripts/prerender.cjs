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
    description: 'Create a professional digital QR menu for your restaurant. Update dishes, prices and availability without reprinting your QR code.',
    h1: "Your menu changes. Your QR code doesn't.",
    content: `
      <main className="max-w-6xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">Your menu changes. Your QR code doesn't.</h1>
        <p class="text-lg text-[#53615a] mt-4">Create a professional digital QR menu for your restaurant. Update dishes, prices and availability without reprinting your QR code.</p>
        <section class="mt-8">
          <h2 class="text-2xl font-bold">Digital QR Menu Infrastructure for Restaurants</h2>
          <p>MenusQR helps restaurants, cafés, bistros, and dhabas build mobile-optimized digital menus accessible via permanent table QR code stands.</p>
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
        <h1 class="text-4xl font-extrabold text-[#151C19]">A Digital QR Menu Built for Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4">Bridge physical table dining with instant digital convenience. MenusQR empowers restaurant owners to publish interactive, mobile-optimized menus that load instantly.</p>
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
        <h1 class="text-4xl font-extrabold text-[#151C19]">A Restaurant QR Menu That Never Needs Reprinting</h1>
        <p class="text-lg text-[#53615a] mt-4">Say goodbye to costly menu reprinting. MenusQR gives your restaurant high-durability permanent table QR codes coupled with continuous real-time cloud menu management.</p>
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
        <h1 class="text-4xl font-extrabold text-[#151C19]">The Ultimate Digital Menu for Modern Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4">Transform guest dining experiences with MenusQR. Create dynamic, visual digital menus that load instantly on any mobile device without requiring app downloads.</p>
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
        <h1 class="text-4xl font-extrabold text-[#151C19]">Smart QR Menu Solutions for Every Restaurant</h1>
        <p class="text-lg text-[#53615a] mt-4">Whether you operate a fine-dining establishment, a cozy café, or a multi-table dhaba, MenusQR provides a fast, dependable QR menu solution.</p>
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
    title: 'Restaurant Digital Menu Platform | MenusQR',
    description: "Empower your food business with MenusQR's restaurant digital menu system. Manage multiple categories, pricing, and availability with ease.",
    h1: 'Complete Restaurant Digital Menu Management',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">Complete Restaurant Digital Menu Management</h1>
        <p class="text-lg text-[#53615a] mt-4">Modernize your restaurant operations with an enterprise-grade digital menu engine designed for ease of use, instant deployment, and zero maintenance overhead.</p>
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
    title: 'QR Ordering for Restaurants | MenusQR',
    description: 'Let guests order directly from their table using MenusQR Premium. Streamline kitchen reception, speed up service, and boost table turnover.',
    h1: 'Direct Table QR Ordering for Restaurants',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">Direct Table QR Ordering for Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4">Turn your table QR codes into an interactive order placement engine with MenusQR Premium.</p>
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
        <h1 class="text-4xl font-extrabold text-[#151C19]">Simple Digital Menu Plans for Restaurants</h1>
        <p class="text-lg text-[#53615a] mt-4">One permanent table QR code. Unlimited menu updates. Transparent yearly pricing for every food business.</p>
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
        <h1 class="text-4xl font-extrabold text-[#151C19]">How MenusQR Works for Your Restaurant</h1>
        <p class="text-lg text-[#53615a] mt-4">Create your menu, download permanent table QR code stands, and update pricing or dish availability live anytime.</p>
      </main>
    `,
    schema: []
  },
  {
    path: '/templates',
    title: 'Restaurant Menu Templates | MenusQR',
    description: 'Explore mobile-first digital menu templates designed for fine dining, casual cafés, retro diners, and vibrant dhabas.',
    h1: 'Digital Menu Templates Designed for Food Businesses',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">Digital Menu Templates Designed for Food Businesses</h1>
        <p class="text-lg text-[#53615a] mt-4">Choose a visual personality that matches your restaurant atmosphere. All MenusQR templates are fully responsive and mobile-first.</p>
      </main>
    `,
    schema: []
  },
  {
    path: '/about',
    title: 'About MenusQR | Digital Menu Infrastructure for Restaurants',
    description: 'MenusQR provides permanent table QR codes and real-time digital menu management for modern restaurants, cafés, and food businesses.',
    h1: 'About MenusQR',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">About MenusQR</h1>
        <p class="text-lg text-[#53615a] mt-4">MenusQR is building the modern digital menu infrastructure for food businesses.</p>
      </main>
    `,
    schema: []
  },
  {
    path: '/contact',
    title: 'Contact MenusQR | Customer Support & Sales',
    description: 'Get in touch with the MenusQR team for onboarding assistance, restaurant support, or sales inquiries.',
    h1: 'Contact MenusQR Support & Sales',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">Contact MenusQR Support & Sales</h1>
        <p class="text-lg text-[#53615a] mt-4">Email support@menusqr.in for customer support and assistance.</p>
      </main>
    `,
    schema: []
  },
  {
    path: '/faq',
    title: 'MenusQR FAQ | Frequently Asked Questions',
    description: 'Find clear answers to common questions about MenusQR digital menus, permanent QR codes, instant price updates, and direct table ordering.',
    h1: 'Frequently Asked Questions About MenusQR',
    content: `
      <main class="max-w-5xl mx-auto px-6 py-20">
        <h1 class="text-4xl font-extrabold text-[#151C19]">Frequently Asked Questions About MenusQR</h1>
        <p class="text-lg text-[#53615a] mt-4">Everything you need to know about MenusQR digital menus and table QR code stands.</p>
      </main>
    `,
    schema: []
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | MenusQR',
    description: 'Read the official MenusQR privacy policy detailing how user and restaurant data is collected, stored, and protected.',
    h1: 'MenusQR Privacy Policy',
    content: `<main class="max-w-5xl mx-auto px-6 py-20"><h1 class="text-4xl font-extrabold">MenusQR Privacy Policy</h1></main>`,
    schema: []
  },
  {
    path: '/terms',
    title: 'Terms of Service | MenusQR',
    description: 'Review the MenusQR terms of service for restaurant owners and platform users.',
    h1: 'MenusQR Terms of Service',
    content: `<main class="max-w-5xl mx-auto px-6 py-20"><h1 class="text-4xl font-extrabold">MenusQR Terms of Service</h1></main>`,
    schema: []
  },
  {
    path: '/refund-cancellation',
    title: 'Refund & Cancellation Policy | MenusQR',
    description: 'Official refund and cancellation policy for MenusQR subscription plans.',
    h1: 'Refund & Cancellation Policy',
    content: `<main class="max-w-5xl mx-auto px-6 py-20"><h1 class="text-4xl font-extrabold">Refund & Cancellation Policy</h1></main>`,
    schema: []
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
html404 = html404.replace('<div id="root"></div>', `<div id="root"><main class="max-w-4xl mx-auto px-6 py-20 text-center"><h1 class="text-4xl font-bold">404 - Page Not Found</h1><p class="mt-4 text-gray-600">The requested page does not exist on MenusQR.</p><a href="/" class="mt-6 inline-block bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold">Go to Homepage</a></main></div>`);
fs.writeFileSync(path.join(DIST_DIR, '404.html'), html404, 'utf-8');

console.log(`Prerender complete: Generated static HTML for ${routes.length} routes + 404.html`);
