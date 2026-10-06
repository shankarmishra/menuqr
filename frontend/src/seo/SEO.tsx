import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'softwareApp';
  index?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
  image?: string;
}

const DOMAIN = import.meta.env.VITE_PUBLIC_SITE_URL || '';
const DEFAULT_IMAGE = DOMAIN ? `${DOMAIN}/og-image.webp` : '/og-image.webp';

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  canonicalUrl, 
  type = 'website', 
  index = true, 
  schema,
  image = DEFAULT_IMAGE
}) => {
  const url = canonicalUrl ? `${DOMAIN}${canonicalUrl}` : DOMAIN;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      <meta name="robots" content={index ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, nofollow'} />
      <meta name="googlebot" content={index ? 'index, follow' : 'noindex, nofollow'} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type === 'softwareApp' ? 'website' : type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MenusQR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
    </Helmet>
  );
};
