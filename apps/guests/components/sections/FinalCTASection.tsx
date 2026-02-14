'use client'

import React from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'
import { EmailCaptureForm } from '../EmailCaptureForm'

export function FinalCTASection() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" id="final-cta">
      <Container maxWidth="narrow">
        <div className="text-center space-y-8">
          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gold tracking-tight">
            {t('finalCta.headline')}
          </h2>

          {/* Subtext */}
          <p className="text-lg text-cream-muted">
            {t('finalCta.subtext')}
          </p>

          {/* CTA Form */}
          <div className="pt-4">
            <EmailCaptureForm />
          </div>
        </div>
      </Container>
    </Section>
  )
}
