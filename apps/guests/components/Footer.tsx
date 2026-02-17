'use client'

import React from 'react'
import { Logo } from '@mne-select/ui'
import { useLanguage } from '../contexts/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  const links = [
    { 
      label: t('footer.privacyPolicy'), 
      href: '/privacy',
      external: true 
    },
    { 
      label: t('footer.termsOfService'), 
      href: '#terms',
      external: false 
    },
    { 
      label: t('footer.contact'), 
      href: `mailto:${t('footer.contact')}`,
      external: false 
    },
  ]

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof links[0]) => {
    if (link.external && !link.href.startsWith('mailto:')) {
      e.preventDefault()
      window.open(link.href, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <footer className="relative flex-shrink-0 bg-navy-darker">
      {/* Gradient blend - minimal on mobile to reduce perceived gap */}
      <div
        className="pointer-events-none absolute bottom-full left-0 right-0 h-2 md:h-16 lg:h-24"
        style={{
          background: 'linear-gradient(to bottom, #0f2a44 0%, #071728 100%)',
        }}
        aria-hidden
      />
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-3 md:py-5">
        <div className="flex flex-col items-center justify-center gap-1 md:gap-4 text-center">
          <Logo variant="cream" size="xl" className="p-0 md:hidden" />
          <Logo variant="cream" size="2xl" className="p-0 hidden md:block" />

          <nav
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-x-2 sm:gap-y-0"
            aria-label="Footer navigation"
          >
            {links.map((link, index) => (
              <React.Fragment key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  className="text-sm text-cream-muted hover:text-cream underline-gold transition-colors duration-base focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-darker rounded px-2 py-0.5"
                  target={link.external && !link.href.startsWith('mailto:') ? '_blank' : undefined}
                  rel={link.external && !link.href.startsWith('mailto:') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                  {link.external && !link.href.startsWith('mailto:') && (
                    <span className="ml-1 text-xs" aria-label="Opens in new tab">↗</span>
                  )}
                </a>
                {index < links.length - 1 && (
                  <span className="hidden sm:inline text-cream-subtle" aria-hidden="true">
                    •
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          <p className="text-xs text-cream-subtle leading-tight">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
