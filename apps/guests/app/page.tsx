import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { HeroSection } from '../components/sections/HeroSection'
import { ExperienceGridSection } from '../components/sections/ExperienceGridSection'
import { AboutSection } from '../components/sections/AboutSection'
import { SocialProofSection } from '../components/sections/SocialProofSection'
import { FinalCTASection } from '../components/sections/FinalCTASection'

export default function Home() {
  return (
    <>
      <Header />

      <main id="main-content" className="bg-navy">
        {/* Hero Section - Full viewport height with email capture */}
        <HeroSection />

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
