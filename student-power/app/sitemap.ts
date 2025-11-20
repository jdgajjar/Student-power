import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://student-power.vercel.app';

/**
 * Static sitemap for build time
 * This will be dynamically generated at runtime when accessed
 * Database-dependent pages will be discovered through crawling
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Static pages
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/universities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Note: Dynamic pages (universities, courses, etc.) will be discovered by search engines
    // through crawling from the universities listing page. Alternatively, you can generate
    // a dynamic sitemap at runtime using an API route that connects to the database.
  ];
}
