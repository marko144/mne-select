import { MetadataRoute } from 'next'
import { siteConfig } from '../config/seo.config'

/**
 * Web App Manifest
 * Defines how the app appears when installed on a user's device (PWA)
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'MNE Select',
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#1a2332', // Navy background
    theme_color: '#c9a55a', // Gold accent
    orientation: 'portrait-primary',
    categories: ['travel', 'lifestyle', 'tourism'],
    lang: 'en',
    dir: 'ltr',
    
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
