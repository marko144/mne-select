/**
 * Google Analytics Wrapper
 * 
 * Client component that conditionally loads Google Analytics
 * based on user's cookie consent
 */

'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import { hasConsent } from '@mne-select/shared-utils'

export function GoogleAnalyticsWrapper() {
  const [analyticsConsent, setAnalyticsConsent] = useState(false)
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  useEffect(() => {
    // Check consent on mount and when localStorage changes
    const checkConsent = () => {
      const consent = hasConsent('guests', 'analytics')
      setAnalyticsConsent(consent)
    }

    checkConsent()

    // Listen for storage events (consent changes in other tabs)
    window.addEventListener('storage', checkConsent)
    
    return () => {
      window.removeEventListener('storage', checkConsent)
    }
  }, [])

  // Only render GA if consent is given and we have an ID
  if (!analyticsConsent || !gaId) {
    return null
  }

  return <GoogleAnalytics gaId={gaId} />
}
