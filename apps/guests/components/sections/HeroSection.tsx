'use client'

import React from 'react'
import { Logo } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'
import { EmailCaptureForm } from '../EmailCaptureForm'

export function HeroSection() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-navy overflow-hidden">
      {/* Optional: Subtle animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-darker opacity-50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[960px] mx-auto px-6 md:px-12 py-20 overflow-hidden">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="animate-fade-in">
            <Logo variant="gold" size="lg" />
          </div>

          {/* Three-line Headline */}
          <div className="space-y-2 md:space-y-4">
            {/* Line 1: "Your curated" */}
            <h1 className="animate-fade-in-up animate-delay-200 font-display font-semibold text-cream text-3xl md:text-4xl lg:text-5xl tracking-tight">
              {t('hero.headline.line1')}
            </h1>

            {/* Line 2: "MONTENEGRO" - Bold, Gold, Large - FIXED: Responsive sizing to prevent overflow */}
            <div className="animate-fade-in-up animate-delay-300 font-brand font-bold text-gold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-widest uppercase">
              <span className="inline-block drop-shadow-[0_0_20px_rgba(194,162,77,0.3)]">
                {t('hero.headline.line2')}
              </span>
            </div>

            {/* Line 3: "Experience" */}
            <h1 className="animate-fade-in-up animate-delay-400 font-display font-semibold text-cream text-3xl md:text-4xl lg:text-5xl tracking-tight">
              {t('hero.headline.line3')}
            </h1>
          </div>

          {/* Subheadline */}
          <p className="animate-fade-in-up animate-delay-600 max-w-[600px] text-lg text-cream-muted leading-relaxed">
            {t('hero.subheadline')}
          </p>

          {/* CTA Form */}
          <div className="animate-fade-in-up animate-delay-800 w-full">
            <EmailCaptureForm />
          </div>
        </div>
      </div>
    </section>
  )
}
