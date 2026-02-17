/**
 * Cookie Consent Utilities
 * 
 * Provides utilities for managing cookie consent across apps.
 * Each app (guests, portal) has its own consent storage key.
 */

import type {
  CookieConsent,
  StoredConsent,
  CONSENT_VERSION,
  CONSENT_EXPIRY_MONTHS,
} from '@mne-select/shared-types'

// Re-export types for convenience
export type { CookieConsent, StoredConsent }
export { DEFAULT_CONSENT, CONSENT_VERSION, CONSENT_EXPIRY_MONTHS } from '@mne-select/shared-types'

/**
 * Get the storage key for a specific app
 * This ensures guests and portal apps have separate consent
 */
export function getConsentStorageKey(app: 'guests' | 'portal'): string {
  return `mne-select-${app}-cookie-consent`
}

/**
 * Get stored cookie consent for a specific app
 */
export function getCookieConsent(app: 'guests' | 'portal'): StoredConsent | null {
  if (typeof window === 'undefined') return null

  try {
    const key = getConsentStorageKey(app)
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const consent: StoredConsent = JSON.parse(stored)

    // Check if consent has expired
    if (new Date(consent.expiresAt) < new Date()) {
      // Expired - clear and return null
      clearCookieConsent(app)
      return null
    }

    return consent
  } catch (error) {
    console.error('Error reading cookie consent:', error)
    return null
  }
}

/**
 * Save cookie consent for a specific app
 */
export function setCookieConsent(app: 'guests' | 'portal', consent: CookieConsent): void {
  if (typeof window === 'undefined') return

  try {
    const key = getConsentStorageKey(app)
    const now = new Date()
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 12) // 12 months expiry

    const stored: StoredConsent = {
      version: 1,
      timestamp: now.toISOString(),
      consent,
      expiresAt: expiresAt.toISOString(),
    }

    localStorage.setItem(key, JSON.stringify(stored))
  } catch (error) {
    console.error('Error saving cookie consent:', error)
  }
}

/**
 * Clear cookie consent for a specific app
 */
export function clearCookieConsent(app: 'guests' | 'portal'): void {
  if (typeof window === 'undefined') return

  try {
    const key = getConsentStorageKey(app)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing cookie consent:', error)
  }
}

/**
 * Check if user has given consent for a specific category
 */
export function hasConsent(
  app: 'guests' | 'portal',
  category: keyof CookieConsent
): boolean {
  const stored = getCookieConsent(app)
  if (!stored) return false
  return stored.consent[category]
}

/**
 * Check if consent banner should be shown
 * Returns true if no consent is stored or consent has expired
 */
export function shouldShowBanner(app: 'guests' | 'portal'): boolean {
  return getCookieConsent(app) === null
}
