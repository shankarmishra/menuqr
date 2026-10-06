export const DOMAIN = import.meta.env.VITE_PUBLIC_SITE_URL || '';

export const getOrganizationSchema = () => {
  if (!DOMAIN) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MenusQR",
    "url": DOMAIN,
    "logo": `${DOMAIN}/favicon.svg`
  };
};

export const getWebSiteSchema = () => {
  if (!DOMAIN) return null;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MenusQR",
    "url": DOMAIN
  };
};
