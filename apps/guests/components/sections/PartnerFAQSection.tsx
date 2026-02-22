'use client'

import React from 'react'
import { Accordion, Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

const PARTNER_FAQ_KEYS = [
  'howToJoin',
  'criteria',
  'businessTypes',
  'commission',
  'payments',
  'control',
  'offers',
  'responsibilities',
  'termination',
  'exclusivity',
] as const

export function PartnerFAQSection() {
  const { t } = useLanguage()

  const items = PARTNER_FAQ_KEYS.map(key => ({
    id:       `partner-faq-${key}`,
    question: t(`partnerFaq.${key}.question`),
    children: <p>{t(`partnerFaq.${key}.answer`)}</p>,
  }))

  return (
    <Section spacing="lg" id="partner-faq" className="bg-navy">
      <Container maxWidth="narrow">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream text-center mb-16 md:mb-24">
          {t('partnerFaq.sectionTitle')}
        </h2>
        <Accordion items={items} />
      </Container>
    </Section>
  )
}
