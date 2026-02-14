'use client'

import React from 'react'
import { Logo } from '@mne-select/ui'
import { useLanguage } from '../contexts/LanguageContext'

export function Footer() {
  const { t } = useLanguage()

  const links = [
    { label: t('footer.privacyPolicy'), href: '#privacy' },
    { label: t('footer.termsOfService'), href: '#terms' },
    { label: t('footer.contact'), href: `mailto:${t('footer.contact')}` },
  ]

  return (
    <footer className="bg-navy-darker">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
        {/* Content Container */}
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <Logo variant="cream" size="sm" />

          {/* Links */}
          <nav
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-1"
            aria-label="Footer navigation"
          >
            {links.map((link, index) => (
              <React.Fragment key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-cream-muted hover:text-cream underline-gold transition-colors duration-base focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-darker rounded px-2 py-1"
                >
                  {link.label}
                </a>
                {index < links.length - 1 && (
                  <span
                    className="hidden sm:inline text-cream-subtle mx-2"
                    aria-hidden="true"
                  >
                    •
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-cream-subtle">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
