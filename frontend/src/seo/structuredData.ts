export const DOMAIN = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://menusqr.in';

export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MenusQR",
    "url": DOMAIN,
    "logo": `${DOMAIN}/assets/brand/menusqr-logo-white-bg.png`,
    "image": `${DOMAIN}/assets/brand/menusqr-logo-white-bg.png`,
    "description": "MenusQR lets restaurants create a digital QR menu and update dishes, prices and availability instantly without reprinting the QR code.",
    "email": "support@menusqr.in",
    "telephone": "+91 87965 30323",
    "contactPoint": [{
      "@type": "ContactPoint",
      "telephone": "+91 87965 30323",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    }],
    "sameAs": [
      "https://twitter.com/menusqr",
      "https://www.linkedin.com/company/menusqr",
      "https://www.instagram.com/menusqr"
    ]
  };
};

export const getWebSiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MenusQR",
    "url": DOMAIN,
    "description": "Digital QR menus for restaurants with instant updates and a permanent QR code.",
    "inLanguage": "en-IN"
  };
};

export const getFaqSchema = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a }
  }))
});

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export const getBreadcrumbSchema = (items: BreadcrumbItem[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${DOMAIN}${item.path}`
    }))
  };
};

export interface PlanOffer {
  name: string;
  price: number;
  description?: string;
}

// SoftwareApplication with one yearly Offer per plan (prices in INR).
export const getSoftwareApplicationSchema = (plans: PlanOffer[]) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MenusQR",
  "url": DOMAIN,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Digital QR menu software for restaurants: update dishes, prices and availability instantly while the printed table QR code never changes.",
  "offers": plans.map((plan) => ({
    "@type": "Offer",
    "name": plan.name,
    "price": plan.price,
    "priceCurrency": "INR",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": plan.price,
      "priceCurrency": "INR",
      "billingDuration": "P1Y",
      "unitText": "YEAR"
    },
    "availability": "https://schema.org/InStock",
    "url": `${DOMAIN}/plans`,
    ...(plan.description ? { "description": plan.description } : {})
  }))
});

export const getHowToSchema = (name: string, description: string, steps: { name: string; text: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": name,
  "description": description,
  "step": steps.map((step, i) => ({
    "@type": "HowToStep",
    "position": i + 1,
    "name": step.name,
    "text": step.text
  }))
});

// WebPage with speakable sections so voice assistants know which text to read out.
export const getWebPageSchema = (path: string, name: string, speakableSelectors: string[]) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": name,
  "url": `${DOMAIN}${path === '/' ? '' : path}`,
  "inLanguage": "en-IN",
  "isPartOf": { "@type": "WebSite", "name": "MenusQR", "url": DOMAIN },
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": speakableSelectors }
});
