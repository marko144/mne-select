'use client'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import HeroSectionAnimated from '../components/sections/HeroSectionAnimated'
import { ExperienceGridSection } from '../components/sections/ExperienceGridSection'
import { AboutSection } from '../components/sections/AboutSection'
import { SocialProofSection } from '../components/sections/SocialProofSection'
import { FinalCTASection } from '../components/sections/FinalCTASection'

export default function Home() {
  return (
    <>
      <Header />

      <main id="main-content" className="bg-navy">
        <HeroSectionAnimated />

        {/* Experience Grid - Horizontal scrolling category tiles */}
        <ExperienceGridSection />

        {/* About Section - What is Montenegro Select */}
        <AboutSection />

        {/* Social Proof - Location launch info */}
        <SocialProofSection />

        {/* Final CTA - Last conversion opportunity */}
        <FinalCTASection />
      </main>

      <Footer />
    </>
  )
}
