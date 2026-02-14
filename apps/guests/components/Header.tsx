'use client'

import React, { useState, useEffect } from 'react'
import { Logo } from '@mne-select/ui'
import { LanguageToggle } from './LanguageToggle'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100)
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Check initial scroll position
    handleScroll()

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      <header
        className={`
          fixed top-0 left-0 right-0 z-[1000]
          transition-all duration-base
          ${
            isScrolled
              ? 'h-16 glass shadow-lg'
              : 'h-20 bg-transparent'
          }
        `}
      >
        <div className="h-full px-6 md:px-12 lg:px-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Logo
              variant="gold"
              size="xl"
              className="transition-all duration-base"
            />
          </div>

          {/* Right: Language Toggle */}
          <div className="flex-shrink-0">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from being hidden under fixed header */}
      <div className="h-20" aria-hidden="true" />
    </>
  )
}
