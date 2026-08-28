import { MetadataRoute } from 'next';

export const revalidate = 86400; // Cache sitemap for 24 hours (ISR)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iedcsnmimt.com';
  // Safely normalize trailing slash
  const baseUrl = rawBaseUrl.replace(/\/$/, '');

  // Prevent exposing sitemap on preview or staging environments
  const isPreviewOrStaging = 
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'preview' || 
    process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ||
    baseUrl.includes('vercel.app');

  if (isPreviewOrStaging) {
    return [];
  }

  // Known public static routes (excluding private/admin routes)
  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}` },
    { url: `${baseUrl}/events` },
    { url: `${baseUrl}/startups` },
    { url: `${baseUrl}/team` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/gallery` },
    { url: `${baseUrl}/announcements` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/privacy-policy` },
    { url: `${baseUrl}/terms` },
  ];

  try {
    // Re-use existing backend fetch abstraction by hitting the configured backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    // Fetch published content in parallel to avoid N+1 queries.
    // Relying on backend filtering for publication status and valid data.
    const [eventsRes, startupsRes, announcementsRes] = await Promise.all([
      fetch(`${apiUrl}/events?is_published=true`),
      fetch(`${apiUrl}/startups?is_published=true`),
      fetch(`${apiUrl}/announcements?is_published=true`)
    ]);

    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      const events = eventsData.items || (Array.isArray(eventsData) ? eventsData : []);
      events.forEach((event: any) => {
        // Exclude records without a valid slug
        if (event.slug) {
          const route: any = { url: `${baseUrl}/events/${event.slug}` };
          if (event.updated_at || event.created_at) {
            route.lastModified = new Date(event.updated_at || event.created_at);
          }
          routes.push(route);
        }
      });
    }

    if (startupsRes.ok) {
      const startupsData = await startupsRes.json();
      const startups = startupsData.items || (Array.isArray(startupsData) ? startupsData : []);
      startups.forEach((startup: any) => {
        if (startup.slug) {
          const route: any = { url: `${baseUrl}/startups/${startup.slug}` };
          if (startup.updated_at || startup.created_at) {
            route.lastModified = new Date(startup.updated_at || startup.created_at);
          }
          routes.push(route);
        }
      });
    }

    if (announcementsRes.ok) {
      const announcementsData = await announcementsRes.json();
      const announcements = announcementsData.items || (Array.isArray(announcementsData) ? announcementsData : []);
      announcements.forEach((ann: any) => {
        if (ann.slug) {
          const route: any = { url: `${baseUrl}/announcements/${ann.slug}` };
          if (ann.updated_at || ann.created_at) {
            route.lastModified = new Date(ann.updated_at || ann.created_at);
          }
          routes.push(route);
        }
      });
    }
  } catch (error) {
    // Graceful degradation: Log error but return whatever static/dynamic routes we have so far
    console.error('Error generating dynamic sitemap:', error);
  }

  // Deduplicate URLs to prevent SEO penalties
  const uniqueRoutes = Array.from(new Map(routes.map(item => [item.url, item])).values());

  return uniqueRoutes;
}
