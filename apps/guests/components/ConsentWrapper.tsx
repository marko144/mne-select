/**
 * Consent Wrapper Component
 * 
 * Manages cookie consent and conditionally loads Google Analytics
 * Shows cookie banner when consent is not given
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CookieBanner } from '@mne-select/ui'
import { useCookieConsent } from '@mne-select/shared-utils'

export function ConsentWrapper() {
  const router = useRouter()
  const { consent, showBanner, acceptAll, rejectAll } = useCookieConsent({
    app: 'guests',
    onConsentChange: (newConsent) => {
      // When consent changes, reload GA if analytics was accepted
      if (newConsent.analytics) {
        // Force page reload to load Google Analytics
        window.location.reload()
      }
    },
  })

  const handleLearnMore = () => {
    // Open privacy policy in new tab
    window.open('/privacy', '_blank', 'noopener,noreferrer')
  }

  return (
    <CookieBanner
      show={showBanner}
      onAcceptAll={acceptAll}
      onRejectAll={rejectAll}
      onLearnMore={handleLearnMore}
    />
  )
}
