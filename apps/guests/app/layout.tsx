import type { Metadata, Viewport } from 'next'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ConsentWrapper } from '../components/ConsentWrapper'
import { GoogleAnalyticsWrapper } from '../components/GoogleAnalyticsWrapper'
import { siteConfig, generatePageMetadata } from '../config/seo.config'
import './globals.css'

// Enhanced metadata with comprehensive SEO optimization
export const metadata: Metadata = {
  ...generatePageMetadata({
    title: undefined, // Uses default title from config
    description: undefined, // Uses default description from config
  }),
  metadataBase: new URL(siteConfig.url),
  
  // Additional metadata
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  category: 'travel',
  
  // Verification tags (add when you have these)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
  
  // App-specific metadata
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  
  // Other metadata
  other: {
    'application-name': siteConfig.name,
  },
}

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a2332' },
    { media: '(prefers-color-scheme: dark)', color: '#1a2332' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        
        {/* Cookie Consent Banner */}
        <ConsentWrapper />
        
        {/* Google Analytics - Conditionally loaded based on consent */}
        <GoogleAnalyticsWrapper />
      </body>
    </html>
  )
}
