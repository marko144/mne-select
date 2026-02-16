'use client'

import React from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

export function WhyJoinSection() {
  const { t } = useLanguage()

  return (
    <Section spacing="md" id="why-join" className="bg-navy">
      <Container maxWidth="narrow">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream text-center mb-16 md:mb-24">
          {t('whyJoin.sectionTitle')}
        </h2>
        <div className="space-y-6 text-center">
          <p className="font-body text-xl md:text-2xl text-cream leading-relaxed">
            {t('whyJoin.p1')}
          </p>
          <p className="font-display text-2xl md:text-3xl font-semibold text-gold">
            {t('whyJoin.tagline')}
          </p>
        </div>
      </Container>
    </Section>
  )
}
