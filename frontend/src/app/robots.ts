import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://iedcsnmimt.com').replace(/\/$/, '');
  
  // Prevent indexing on preview or staging environments
  const isPreviewOrStaging = 
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview' || 
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ||
    baseUrl.includes('vercel.app');

  if (isPreviewOrStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/login', '/api/', '/403'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
