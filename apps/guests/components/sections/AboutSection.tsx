'use client'

import React from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

const SUBSECTIONS = [
  'oneSeamless',
  'bookWithConfidence',
  'memberPrivileges',
  'curatedGuides',
] as const

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <Section spacing="lg" id="about" className="pb-2 md:pb-12">
      <Container maxWidth="wide">
        {/* Section title */}
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream text-center mb-16 md:mb-24">
          {t('about.sectionTitle')}
        </h2>

        {/* Subsections - 2-column grid on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 lg:gap-x-20 lg:gap-y-24">
          {SUBSECTIONS.map((key) => (
            <article key={key} className="space-y-5">
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-gold">
                {t(`about.${key}.heading`)}
              </h3>
              <div className="font-body space-y-4 text-xl md:text-2xl text-cream leading-relaxed">
                <p>{t(`about.${key}.p1`)}</p>
                <p>{t(`about.${key}.p2`)}</p>
                <p>{t(`about.${key}.p3`)}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  )
}
