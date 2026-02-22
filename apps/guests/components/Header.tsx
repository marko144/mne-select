'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@mne-select/ui'
import { LanguageToggle } from './LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { t } = useLanguage()
  const pathname = usePathname()
  const isPartnerPage = pathname === '/partner'

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100)
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Check initial scroll position
    handleScroll()

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      <header
        className={`
          fixed top-0 left-0 right-0 z-[1000]
          transition-all duration-base
          ${
            isScrolled
              ? 'h-16 glass shadow-lg'
              : 'h-20 bg-transparent'
          }
        `}
      >
        <div className="h-full px-6 md:px-12 lg:px-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo
              variant="gold"
              size="xl"
              className="transition-all duration-base"
            />
          </div>

          {/* Right: Become a Partner + Language Toggle */}
          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            {/* Hide the CTA on the partner page itself */}
            {!isPartnerPage && (
              <Link
                href="/partner"
                className="hidden sm:inline-block rounded-md border border-gold text-gold px-4 py-2 font-body font-medium text-sm tracking-wide hover:bg-gold hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 transition-colors duration-200"
                aria-label={t('partner.becomePartner')}
              >
                {t('partner.becomePartner')}
              </Link>
            )}
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-20" aria-hidden="true" />
    </>
  )
}
