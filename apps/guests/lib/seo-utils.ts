/**
 * SEO Utilities for Montenegro Select
 * Helper functions for SEO-related functionality
 */

/**
 * Maps internal locale codes to proper hreflang codes
 * Internal: 'me' (Montenegrin/Serbian in app)
 * hreflang: 'sr' (Serbian - more widely recognized by search engines)
 * 
 * Note: While Montenegro has its own language (ISO 639-3: cnr),
 * using 'sr' (Serbian) is more practical for SEO as it's widely recognized
 * and the languages are mutually intelligible.
 */
export const localeToHreflang: Record<string, string> = {
  en: 'en',
  me: 'sr', // Map 'me' to 'sr' for hreflang
}

/**
 * Maps hreflang codes back to internal locale codes
 */
export const hreflangToLocale: Record<string, string> = {
  en: 'en',
  sr: 'me',
}

/**
 * Get hreflang code from internal locale
 */
export function getHreflangCode(locale: string): string {
  return localeToHreflang[locale] || locale
}

/**
 * Get internal locale from hreflang code
 */
export function getLocaleFromHreflang(hreflang: string): string {
  return hreflangToLocale[hreflang] || hreflang
}

/**
 * Generate alternate language links for the current page
 */
export function generateAlternateLinks(
  baseUrl: string,
  path: string = ''
): { hreflang: string; href: string }[] {
  return [
    {
      hreflang: 'en',
      href: `${baseUrl}${path}`,
    },
    {
      hreflang: 'sr',
      href: `${baseUrl}/sr${path}`,
    },
    {
      hreflang: 'x-default',
      href: `${baseUrl}${path}`, // Default to English
    },
  ]
}

/**
 * Generate language-specific meta description
 */
export function getLocalizedMetaDescription(locale: string): string {
  const descriptions: Record<string, string> = {
    en: 'Discover handpicked experiences across Montenegro. Private boat charters, wine tastings, transfers, car rentals, and exclusive recommendations from trusted local partners.',
    me: 'Otkrijte ručno odabrana iskustva širom Crne Gore. Privatni čarter brodova, degustacije vina, transferi, iznajmljivanje automobila i ekskluzivne preporuke od pouzdanih lokalnih partnera.',
  }

  return descriptions[locale] || descriptions.en
}

/**
 * Generate language-specific title
 */
export function getLocalizedTitle(locale: string): string {
  const titles: Record<string, string> = {
    en: 'Montenegro Select - Curated Experiences in Montenegro',
    me: 'Montenegro Select - Ručno odabrana iskustva u Crnoj Gori',
  }

  return titles[locale] || titles.en
}

/**
 * SEO-friendly URL slug generator
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

/**
 * Truncate text for meta descriptions (ideal length: 150-160 characters)
 */
export function truncateMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text

  // Truncate at word boundary
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`
}

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(baseUrl: string, path: string = ''): string {
  // Remove trailing slash unless it's the root
  const cleanPath = path === '/' ? '' : path.replace(/\/$/, '')
  return `${baseUrl}${cleanPath}`
}
