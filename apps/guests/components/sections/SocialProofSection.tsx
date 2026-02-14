'use client'

import React from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

export function SocialProofSection() {
  const { t } = useLanguage()

  // Extract location names to highlight in gold
  const primaryText = t('social.primary') as string
  const locations = ['Kotor', 'Budva', 'Porto Montenegro']

  // Split text and wrap locations in gold spans
  const renderPrimaryText = () => {
    let result = primaryText
    locations.forEach((location) => {
      result = result.replace(
        location,
        `<span class="text-gold">${location}</span>`
      )
    })
    return result
  }

  return (
    <Section spacing="md" id="social-proof">
      <Container maxWidth="narrow">
        <div className="text-center space-y-4">
          {/* Primary Statement */}
          <h2
            className="font-display text-2xl md:text-3xl font-semibold text-cream leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderPrimaryText() }}
          />

          {/* Secondary Statement */}
          <p className="text-lg text-cream-muted">
            {t('social.secondary')}
          </p>
        </div>
      </Container>
    </Section>
  )
}
