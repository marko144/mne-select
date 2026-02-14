'use client'

import React from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'
import { CategoryTile } from '../CategoryTile'

const categories = [
  'yachts',
  'beachClubs',
  'fineDining',
  'privateTours',
  'mountainEscapes',
  'culturalEvenings',
] as const

export function ExperienceGridSection() {
  const { t } = useLanguage()

  return (
    <Section spacing="md" id="experiences">
      <Container maxWidth="full">
        {/* Optional Section Header */}
        <h2 className="text-center font-display text-3xl md:text-4xl font-bold text-cream mb-12">
          {t('categories.sectionTitle')}
        </h2>

        {/* Horizontal Scroll Container */}
        <div
          className="relative"
          role="region"
          aria-label="Experience categories"
        >
          {/* Left Fade Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />

          {/* Scrollable Container */}
          <div className="overflow-x-auto hide-scrollbar snap-x snap-mandatory">
            <div className="flex gap-6 px-6 md:px-12 lg:px-16 py-4">
              {categories.map((categoryKey) => (
                <CategoryTile
                  key={categoryKey}
                  category={t(`categories.${categoryKey}`)}
                  onClick={() => {
                    console.log(`Navigate to ${categoryKey}`)
                    // TODO: Add navigation when category pages are built
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Fade Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />
        </div>
      </Container>
    </Section>
  )
}
