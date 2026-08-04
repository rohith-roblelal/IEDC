import { MetadataRoute } from 'next';

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://iedcsnmimt.com';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/startups`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // Fetch dynamic content
    // Use an absolute URL that hits our backend, not the Next.js API route if this is SSR.
    // If NEXT_PUBLIC_API_URL is configured, use it. Otherwise fallback to localhost.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

    const [eventsRes, startupsRes, announcementsRes] = await Promise.all([
      fetch(`${apiUrl}/events?is_published=true`),
      fetch(`${apiUrl}/startups`), // public startup endpoint handles published logic
      fetch(`${apiUrl}/announcements`)
    ]);

    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      const events = eventsData.items || (Array.isArray(eventsData) ? eventsData : []);
      events.forEach((event: any) => {
        routes.push({
          url: `${baseUrl}/events/${event.slug || event.id}`,
          lastModified: new Date(event.updated_at || event.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    if (startupsRes.ok) {
      const startupsData = await startupsRes.json();
      const startups = startupsData.items || (Array.isArray(startupsData) ? startupsData : []);
      startups.forEach((startup: any) => {
        routes.push({
          url: `${baseUrl}/startups/${startup.slug || startup.id}`,
          lastModified: new Date(startup.updated_at || startup.created_at || Date.now()),
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      });
    }

    if (announcementsRes.ok) {
      const announcementsData = await announcementsRes.json();
      const announcements = announcementsData.items || (Array.isArray(announcementsData) ? announcementsData : []);
      announcements.forEach((ann: any) => {
        routes.push({
          url: `${baseUrl}/announcements/${ann.slug || ann.id}`,
          lastModified: new Date(ann.updated_at || ann.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return routes;
}
