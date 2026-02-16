'use client'

import React from 'react'
import { Accordion, Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

const FAQ_KEYS = [
  'launch',
  'cost',
  'experiences',
  'partners',
  'benefits',
  'travelAgency',
  'commit',
] as const

export function FAQSection() {
  const { t } = useLanguage()

  const items = FAQ_KEYS.map((key) => {
    const question = t(`faq.${key}.question`)
    const id = `faq-${key}`

    if (key === 'travelAgency') {
      return {
        id,
        question,
        children: (
          <>
            <p>{t('faq.travelAgency.answer1')}</p>
            <p className="mt-4">{t('faq.travelAgency.answer2')}</p>
          </>
        ),
      }
    }

    return {
      id,
      question,
      children: <p>{t(`faq.${key}.answer`)}</p>,
    }
  })

  return (
    <Section spacing="lg" id="faq" className="bg-navy">
      <Container maxWidth="narrow">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream text-center mb-16 md:mb-24">
          {t('faq.sectionTitle')}
        </h2>
        <Accordion items={items} />
      </Container>
    </Section>
  )
}
