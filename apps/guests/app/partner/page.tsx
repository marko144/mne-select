'use client'

import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { PartnerHeroSection } from '../../components/sections/PartnerHeroSection'
import { BeSeenSection } from '../../components/sections/BeSeenSection'
import { BookingsSection } from '../../components/sections/BookingsSection'
import { OffersSection } from '../../components/sections/OffersSection'
import { CommissionSection } from '../../components/sections/CommissionSection'
import { PartnerFAQSection } from '../../components/sections/PartnerFAQSection'
import { PartnerApplyModal } from '../../components/PartnerApplyModal'

export default function PartnerPage() {
  const { t }                     = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Header />

      <main id="main-content" className="bg-navy">
        {/* ── Animated hero — pin reveal + Bay of Kotor map ── */}
        <PartnerHeroSection />

        {/* ── Be Seen Above the Rest ───────────────────────── */}
        <BeSeenSection />

        {/* ── More Confirmed Bookings ──────────────────────── */}
        <BookingsSection />

        {/* ── Send Special Offers ──────────────────────────── */}
        <OffersSection />

        {/* ── Grow Your Profit (Commission) ────────────────── */}
        <CommissionSection />

        {/* ── Bottom CTA ───────────────────────────────────── */}
        <section
          id="apply"
          className="bg-navy py-24 px-6"
          aria-labelledby="apply-heading"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-gold text-sm uppercase tracking-widest font-body font-medium mb-4">
              {t('partner.bottomCta.preheadline')}
            </p>
            <h2
              id="apply-heading"
              className="font-display text-cream font-medium leading-tight mb-10"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              {t('partner.bottomCta.heading')}
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-block rounded-md bg-gold px-8 py-4 text-navy font-body font-semibold text-sm tracking-wide hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy transition-colors duration-200"
            >
              {t('partner.hero.cta')}
            </button>
          </div>
        </section>

        {/* ── Partner FAQ ──────────────────────────────────── */}
        <PartnerFAQSection />
      </main>

      <Footer />

      <PartnerApplyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
