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
