/**
 * Structured Data Component
 * 
 * Renders JSON-LD structured data for better search engine understanding.
 * This helps Google and other search engines understand your business, services, and content.
 */

import { siteConfig, generateLocalBusinessSchema } from '../config/seo.config'

interface StructuredDataProps {
  type?: 'organization' | 'localBusiness' | 'website' | 'all'
}

export function StructuredData({ type = 'all' }: StructuredDataProps) {
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.business.legalName,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logos/full_logo_gold.svg`,
      width: 300,
      height: 60,
    },
    description: siteConfig.description,
    email: siteConfig.email,
    foundingDate: siteConfig.business.foundingDate,
    slogan: siteConfig.business.slogan,
    areaServed: siteConfig.business.areaServed.map((area) => ({
      '@type': 'City',
      name: area,
      addressCountry: 'ME', // Montenegro
    })),
    // Add social media when available
    // sameAs: [
    //   siteConfig.social.instagram,
    //   siteConfig.social.facebook,
    //   siteConfig.social.twitter,
    // ].filter(Boolean),
  }

  // Local Business Schema (more specific than Organization)
  const localBusinessSchema = generateLocalBusinessSchema()

  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      '@id': `${siteConfig.url}/#organization`,
    },
    inLanguage: ['en', 'sr'],
  }

  // Breadcrumb Schema (for homepage)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
    ],
  }

  // Service Schema for main offerings
  const servicesSchema = siteConfig.services.slice(0, 5).map((service, index) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteConfig.url}/#service-${service.slug}`,
    name: service.name,
    description: service.description,
    provider: {
      '@id': `${siteConfig.url}/#organization`,
    },
    areaServed: siteConfig.business.areaServed.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    serviceType: service.name,
  }))

  // Combine schemas based on type prop
  let schemas: any[] = []
  
  if (type === 'all') {
    schemas = [
      organizationSchema,
      localBusinessSchema,
      websiteSchema,
      breadcrumbSchema,
      ...servicesSchema,
    ]
  } else if (type === 'organization') {
    schemas = [organizationSchema]
  } else if (type === 'localBusiness') {
    schemas = [localBusinessSchema]
  } else if (type === 'website') {
    schemas = [websiteSchema]
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0),
          }}
        />
      ))}
    </>
  )
}

/**
 * Article Schema Component (for future blog posts)
 */
interface ArticleSchemaProps {
  title: string
  description: string
  publishDate: string
  modifiedDate?: string
  authorName?: string
  imageUrl?: string
  url: string
}

export function ArticleSchema({
  title,
  description,
  publishDate,
  modifiedDate,
  authorName = siteConfig.name,
  imageUrl,
  url,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl || siteConfig.openGraph.images[0].url,
    datePublished: publishDate,
    dateModified: modifiedDate || publishDate,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logos/full_logo_gold.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  )
}

/**
 * FAQ Schema Component (for FAQ section)
 */
interface FAQItem {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQItem[]
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  )
}
