'use client'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { PartnerHeroSection } from '../../components/sections/PartnerHeroSection'

/**
 * /partner — Become a Partner landing page.
 *
 * Opened via the "Become a partner" button in the main site header.
 * Uses the same layout (Header + Footer) as the main landing page.
 *
 * Currently ships the animated hero section.  Subsequent benefit,
 * how-it-works, and application-form sections will be added in the
 * next iteration.
 */
export default function PartnerPage() {
  return (
    <>
      <Header />

      <main id="main-content" className="bg-navy">
        {/* ── Animated hero — pin reveal + Bay of Kotor map ── */}
        <PartnerHeroSection />

        {/* ── Benefits stub ───────────────────────────────── */}
        <section
          id="benefits"
          className="bg-navy py-24 px-6"
          aria-labelledby="benefits-heading"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-gold text-sm uppercase tracking-widest font-body font-medium mb-4">
              Why partner with us
            </p>
            <h2
              id="benefits-heading"
              className="font-display text-cream font-medium leading-tight mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Reach guests who are ready to spend
            </h2>
            <p className="text-cream-muted text-lg leading-relaxed max-w-2xl mx-auto">
              Montenegro Select connects premium travellers with the best experiences
              on the Adriatic coast — and we&apos;re selective about who we work with.
              Partner content coming soon.
            </p>
          </div>
        </section>

        {/* ── How it works stub ───────────────────────────── */}
        <section
          id="how-it-works"
          className="py-24 px-6"
          style={{ background: '#0c2238' }}
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-gold text-sm uppercase tracking-widest font-body font-medium mb-4">
              Simple process
            </p>
            <h2
              id="how-heading"
              className="font-display text-cream font-medium leading-tight mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              How it works
            </h2>
            <p className="text-cream-muted text-lg leading-relaxed max-w-2xl mx-auto">
              A straightforward application, a brief quality review, and you&apos;re
              on the map. Full process details coming soon.
            </p>
          </div>
        </section>

        {/* ── Application form anchor / CTA stub ──────────── */}
        <section
          id="apply"
          className="bg-navy py-24 px-6"
          aria-labelledby="apply-heading"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-gold text-sm uppercase tracking-widest font-body font-medium mb-4">
              Ready to join?
            </p>
            <h2
              id="apply-heading"
              className="font-display text-cream font-medium leading-tight mb-6"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}
            >
              Apply to become a partner
            </h2>
            <p className="text-cream-muted text-lg leading-relaxed mb-10">
              The application form is being finalised.  In the meantime, reach out
              directly and we&apos;ll be in touch.
            </p>
            <a
              href="mailto:partners@montenegroselect.com"
              className="inline-block rounded-md bg-gold px-8 py-4 text-navy font-body font-semibold text-sm tracking-wide hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy transition-colors duration-200"
            >
              Get in touch
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
