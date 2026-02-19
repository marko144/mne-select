/**
 * SEO Configuration for Montenegro Select
 * Centralized configuration for all SEO-related metadata, structured data, and settings
 */

export const siteConfig = {
  // Base Configuration
  name: 'Montenegro Select',
  title: 'Montenegro Select - Curated Experiences in Montenegro',
  description:
    'Discover handpicked experiences across Montenegro. Private boat charters, wine tastings, transfers, car rentals, and exclusive recommendations from trusted local partners.',
  url: 'https://montenegroselect.me',
  stagingUrl: 'https://staging.montenegroselect.me',
  
  // Contact Information
  email: 'hello@montenegroselect.me',
  
  // Social Media (to be added when accounts are created)
  social: {
    instagram: '', // Add when ready
    facebook: '', // Add when ready
    twitter: '', // Add when ready
    linkedin: '', // Add when ready
  },
  
  // Business Information
  business: {
    type: 'TravelAgency', // Schema.org type (though you position as a connector, not agency)
    legalName: 'Velocci UK LTD',
    foundingDate: '2026',
    slogan: 'Your curated Montenegro experiences that reward you',
    priceRange: '€€€',
    areaServed: [
      'Kotor',
      'Tivat',
      'Perast',
      'Budva',
      'Bar',
      'Ulcinj',
      'Podgorica',
      'Žabljak',
      'Kolašin',
      'Montenegro',
    ],
  },
  
  // Service Categories (Priority Order)
  services: [
    {
      name: 'Boat Tours & Charters',
      description: 'Private boat charters and premium boat tours across Montenegro coastline',
      slug: 'boat-tours',
    },
    {
      name: 'Private Transfers',
      description: 'Reliable private transfer services across Montenegro',
      slug: 'transfers',
    },
    {
      name: 'Car Rental',
      description: 'Premium car rental services with trusted local partners',
      slug: 'car-rental',
    },
    {
      name: 'Wine Tasting',
      description: 'Curated wine tasting experiences at Montenegro vineyards',
      slug: 'wine-tasting',
    },
    {
      name: 'Local Experiences',
      description: 'Handpicked local experiences and hidden gems across Montenegro',
      slug: 'experiences',
    },
    {
      name: 'Beach Clubs',
      description: 'Access to exclusive beach clubs along the Adriatic coast',
      slug: 'beach-clubs',
    },
    {
      name: 'Dining',
      description: 'Exceptional dining experiences at carefully selected restaurants',
      slug: 'dining',
    },
  ],
  
  // Key Locations with proper Montenegrin spelling
  locations: {
    primary: ['Kotor', 'Tivat', 'Budva'],
    secondary: ['Perast', 'Bar', 'Ulcinj', 'Podgorica'],
    mountain: ['Žabljak', 'Kolašin'],
  },
  
  // Target Keywords (Long-tail, brand-focused)
  keywords: [
    'Montenegro Select',
    'curated Montenegro experiences',
    'Montenegro travel',
    'private boat charter Kotor',
    'Montenegro travel concierge',
    'exclusive Montenegro tours',
    'handpicked Montenegro experiences',
    'trusted Montenegro partners',
    'Montenegro wine tasting',
    'private transfers Montenegro',
    'Kotor Bay boat tours',
    'Montenegro travel experiences',
    'Montenegro local experiences',
  ],
  
  // Language Configuration
  languages: {
    default: 'en',
    supported: ['en', 'me'], // English and Montenegrin/Serbian (internal: 'me', hreflang: 'sr')
    // Note: Internally we use 'me', but for hreflang tags we use 'sr' (more SEO-friendly)
  },
  
  // Open Graph Configuration
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocales: ['sr_RS'],
    images: [
      {
        url: '/images/og-image.jpg', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'Montenegro Select - Curated Experiences',
      },
    ],
  },
  
  // Twitter Card Configuration
  twitter: {
    card: 'summary_large_image',
    site: '@montenegroselect', // Add when Twitter account is created
    creator: '@montenegroselect',
  },
  
  // Structured Data - Organization
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Montenegro Select',
    legalName: 'Velocci UK LTD',
    url: 'https://montenegroselect.me',
    logo: 'https://montenegroselect.me/logos/full_logo_gold.svg',
    description:
      'Montenegro Select connects visitors with carefully selected independent partners across Montenegro for exceptional travel experiences.',
    email: 'hello@montenegroselect.me',
    areaServed: {
      '@type': 'Country',
      name: 'Montenegro',
    },
    foundingDate: '2026',
    slogan: 'Your curated Montenegro experiences that reward you',
    identifier: {
      '@type': 'PropertyValue',
      name: 'UK Company Number',
      value: '16257088',
    },
  },
  
  // Robots Configuration
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
} as const

// Helper function to generate page-specific metadata
export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}) {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const pageDescription = description || siteConfig.description
  const pageUrl = `${siteConfig.url}${path}`
  const pageImage = image || siteConfig.openGraph.images[0].url

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords.join(', '),
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : siteConfig.robots,
    alternates: {
      canonical: pageUrl,
      languages: {
        en: `${siteConfig.url}/en${path}`,
        sr: `${siteConfig.url}/sr${path}`,
      },
    },
    openGraph: {
      type: siteConfig.openGraph.type,
      locale: siteConfig.openGraph.locale,
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: siteConfig.twitter.card,
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.twitter.creator,
    },
  }
}

// Structured Data Helpers
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.business.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logos/full_logo_gold.svg`,
    email: siteConfig.email,
    priceRange: siteConfig.business.priceRange,
    areaServed: siteConfig.business.areaServed.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    foundingDate: siteConfig.business.foundingDate,
    slogan: siteConfig.business.slogan,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Montenegro Select Services',
      itemListElement: siteConfig.services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
        },
      })),
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateServiceSchema(service: {
  name: string
  description: string
  areaServed?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: (service.areaServed || siteConfig.business.areaServed).map((area) => ({
      '@type': 'City',
      name: area,
    })),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: siteConfig.url,
    },
  }
}
