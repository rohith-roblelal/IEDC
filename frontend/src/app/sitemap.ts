import { MetadataRoute } from 'next';

export const revalidate = 86400; // Cache sitemap for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
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
    const [eventsRes, startupsRes] = await Promise.all([
      fetch(`${baseUrl}/api/v1/events?is_published=true`),
      fetch(`${baseUrl}/api/v1/startups?is_published=true`)
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
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return routes;
}
