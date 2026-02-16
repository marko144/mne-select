'use client'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import HeroSectionAnimated from '../components/sections/HeroSectionAnimated'
import { WhyJoinSection } from '../components/sections/WhyJoinSection'
import { ExperienceGridSection } from '../components/sections/ExperienceGridSection'
import { AboutSection } from '../components/sections/AboutSection'
import { FAQSection } from '../components/sections/FAQSection'

export default function Home() {
  return (
    <>
      <Header />

      <main id="main-content" className="bg-navy">
        <HeroSectionAnimated />

        {/* Why Join Montenegro Select */}
        <WhyJoinSection />

        {/* Experience Grid - Horizontal scrolling category tiles */}
        <ExperienceGridSection />

        {/* About Section - The Montenegro Select Standard */}
        <AboutSection />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      <Footer />
    </>
  )
}
