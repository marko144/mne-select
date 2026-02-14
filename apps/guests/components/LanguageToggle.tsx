'use client'

import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  const handleToggle = (lang: 'en' | 'me') => {
    setLanguage(lang)
  }

  return (
    <div
      className="flex items-center gap-2 text-sm uppercase tracking-wide font-medium"
      role="group"
      aria-label="Language selection"
    >
      <button
        onClick={() => handleToggle('en')}
        className={`
          px-2 py-1 transition-all duration-base
          min-h-[44px] min-w-[44px] flex items-center justify-center
          focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy rounded
          ${
            language === 'en'
              ? 'text-gold font-semibold'
              : 'text-cream-muted hover:text-cream'
          }
        `}
        aria-pressed={language === 'en'}
        aria-label="Switch to English"
      >
        {t('header.languageToggle.en')}
      </button>

      <span className="text-cream-subtle" aria-hidden="true">
        |
      </span>

      <button
        onClick={() => handleToggle('me')}
        className={`
          px-2 py-1 transition-all duration-base
          min-h-[44px] min-w-[44px] flex items-center justify-center
          focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy rounded
          ${
            language === 'me'
              ? 'text-gold font-semibold'
              : 'text-cream-muted hover:text-cream'
          }
        `}
        aria-pressed={language === 'me'}
        aria-label="Switch to Montenegrin"
      >
        {t('header.languageToggle.me')}
      </button>
    </div>
  )
}
