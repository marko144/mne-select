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

          {/* CTA Form */}
          <div className="pt-2">
            <EmailCaptureForm showMicrocopy={false} />
          </div>

          {/* Partner nudge — below the email form */}
          <p className="font-body text-lg text-cream-muted leading-relaxed pt-2">
            {t('partnerNudge.question')}{' '}
            <Link
              href="/partner"
              className="text-gold hover:text-gold/80 underline underline-offset-4 decoration-gold/40 hover:decoration-gold/70 transition-colors duration-200 font-medium"
            >
              {t('partnerNudge.cta')} →
            </Link>
          </p>

        </div>
      </Container>
    </Section>
  )
}
