'use client'

import React from 'react'
import Link from 'next/link'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'
import { EmailCaptureForm } from '../EmailCaptureForm'

export function FinalCTASection() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" id="final-cta">
      <Container maxWidth="narrow">
        <div className="text-center space-y-6">
          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gold tracking-tight">
            {t('finalCta.headline')}
          </h2>

          {/* Subtext */}
          <p className="text-lg text-cream-muted">
            {t('finalCta.subtext')}
          </p>

          {/* CTA Form */}
          <div className="pt-2">
            <EmailCaptureForm showMicrocopy={false} />
          </div>

          {/* Secondary partner CTA */}
          <div className="pt-4 border-t border-cream-subtle/20">
            <p className="text-cream-subtle text-sm mb-3">
              {t('finalCta.partnerCopy') || 'Are you a business in Montenegro?'}
            </p>
            <Link
              href="/partner"
              className="inline-block text-gold text-sm font-body font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded transition-colors duration-150"
            >
              {t('partner.becomePartner')} →
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  )
}
