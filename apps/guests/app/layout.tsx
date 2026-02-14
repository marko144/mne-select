import type { Metadata } from 'next'
import { LanguageProvider } from '../contexts/LanguageContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Montenegro Select - Curated Luxury Experiences',
  description:
    'Private yachts. Hidden beach clubs. Exceptional dining. A curated network for tourists and expats seeking more in Montenegro.',
  keywords: ['Montenegro', 'luxury', 'experiences', 'yachts', 'dining', 'travel'],
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
      </body>
    </html>
  )
}
