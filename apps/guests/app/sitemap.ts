import { MetadataRoute } from 'next'
import { siteConfig } from '../config/seo.config'

/**
 * Dynamic Sitemap Generation for Montenegro Select
 * 
 * This generates a sitemap.xml file that helps search engines discover and index pages.
 * As you add more pages (e.g., service categories, blog posts), add them here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url
  const currentDate = new Date()

  // Main pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          sr: `${baseUrl}/sr`,
        },
      },
    },
  ]

  // Future: Add service category pages when they exist
  // const serviceRoutes = siteConfig.services.map((service) => ({
  //   url: `${baseUrl}/experiences/${service.slug}`,
  //   lastModified: currentDate,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  //   alternates: {
  //     languages: {
  //       en: `${baseUrl}/en/experiences/${service.slug}`,
  //       sr: `${baseUrl}/sr/experiences/${service.slug}`,
  //     },
  //   },
  // }))

  // Future: Add location-specific pages when they exist
  // const locationRoutes = [...siteConfig.locations.primary, ...siteConfig.locations.secondary].map(
  //   (location) => ({
  //     url: `${baseUrl}/locations/${location.toLowerCase()}`,
  //     lastModified: currentDate,
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.7,
  //   })
  // )

  return routes
  // return [...routes, ...serviceRoutes, ...locationRoutes]
}
