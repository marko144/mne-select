/**
 * Cookie Consent Hook
 * 
 * React hook for managing cookie consent in apps.
 * Each app (guests, portal) maintains separate consent.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CookieConsent } from '@mne-select/shared-types'
import {
  getCookieConsent,
  setCookieConsent,
  clearCookieConsent,
  shouldShowBanner,
  DEFAULT_CONSENT,
} from '../cookies'

export interface UseCookieConsentOptions {
  app: 'guests' | 'portal'
  onConsentChange?: (consent: CookieConsent) => void
}

export interface UseCookieConsentReturn {
  consent: CookieConsent | null
  showBanner: boolean
  acceptAll: () => void
  rejectAll: () => void
  acceptCategory: (category: keyof CookieConsent) => void
  rejectCategory: (category: keyof CookieConsent) => void
  clearConsent: () => void
  isLoading: boolean
}

export function useCookieConsent({
  app,
  onConsentChange,
}: UseCookieConsentOptions): UseCookieConsentReturn {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load consent from localStorage on mount
  useEffect(() => {
    const stored = getCookieConsent(app)
    if (stored) {
      setConsent(stored.consent)
      setShowBanner(false)
    } else {
      setShowBanner(true)
    }
    setIsLoading(false)
  }, [app])

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    
    setCookieConsent(app, newConsent)
    setConsent(newConsent)
    setShowBanner(false)
    onConsentChange?.(newConsent)
  }, [app, onConsentChange])

  // Reject all optional cookies (keep only necessary)
  const rejectAll = useCallback(() => {
    const newConsent: CookieConsent = {
      necessary: true, // Always enabled
      analytics: false,
      marketing: false,
      preferences: true, // Keep preferences (language, etc.)
    }
    
    setCookieConsent(app, newConsent)
    setConsent(newConsent)
    setShowBanner(false)
    onConsentChange?.(newConsent)
  }, [app, onConsentChange])

  // Accept a specific category
  const acceptCategory = useCallback(
    (category: keyof CookieConsent) => {
      const currentConsent = consent || { ...DEFAULT_CONSENT }
      const newConsent: CookieConsent = {
        ...currentConsent,
        [category]: true,
      }
      
      setCookieConsent(app, newConsent)
      setConsent(newConsent)
      onConsentChange?.(newConsent)
    },
    [app, consent, onConsentChange]
  )

  // Reject a specific category (except necessary)
  const rejectCategory = useCallback(
    (category: keyof CookieConsent) => {
      if (category === 'necessary') {
        console.warn('Cannot reject necessary cookies')
        return
      }

      const currentConsent = consent || { ...DEFAULT_CONSENT }
      const newConsent: CookieConsent = {
        ...currentConsent,
        [category]: false,
      }
      
      setCookieConsent(app, newConsent)
      setConsent(newConsent)
      onConsentChange?.(newConsent)
    },
    [app, consent, onConsentChange]
  )

  // Clear all consent (for testing or user request)
  const clearConsent = useCallback(() => {
    clearCookieConsent(app)
    setConsent(null)
    setShowBanner(true)
    onConsentChange?.(DEFAULT_CONSENT)
  }, [app, onConsentChange])

  return {
    consent,
    showBanner,
    acceptAll,
    rejectAll,
    acceptCategory,
    rejectCategory,
    clearConsent,
    isLoading,
  }
}
