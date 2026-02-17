/**
 * Cookie Consent Banner Component
 * 
 * GDPR-compliant cookie consent banner
 * Follows Montenegro Select design system
 */

'use client'

import React from 'react'
import { Button } from './Button'

export interface CookieBannerProps {
  onAcceptAll: () => void
  onRejectAll: () => void
  onLearnMore?: () => void
  show: boolean
}

export function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onLearnMore,
  show,
}: CookieBannerProps) {
  if (!show) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-up"
      role="dialog"
      aria-label="Cookie consent banner"
      aria-live="polite"
    >
      {/* Backdrop for mobile */}
      <div className="bg-navy-darker/95 backdrop-blur-sm border-t border-gold/20">
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🍪</span>
                <h2 className="text-lg font-semibold text-cream md:text-xl">
                  We use cookies
                </h2>
              </div>
              <p className="text-sm text-cream-muted md:text-base max-w-2xl">
                We use cookies to enhance your experience and analyze site traffic. By clicking
                "Accept All", you consent to our use of analytics cookies.{' '}
                {onLearnMore && (
                  <>
                    <button
                      onClick={onLearnMore}
                      className="text-gold hover:text-gold/80 underline transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-darker rounded"
                      aria-label="Learn more about our cookie policy"
                    >
                      Learn more
                    </button>
                    .
                  </>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="md"
                onClick={onRejectAll}
                className="w-full sm:w-auto"
                aria-label="Reject all optional cookies"
              >
                Reject All
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onAcceptAll}
                className="w-full sm:w-auto"
                aria-label="Accept all cookies"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Slide-in-up animation keyframe (will be added to globals.css if not already there)
// This component uses: animate-slide-in-up from Tailwind config
