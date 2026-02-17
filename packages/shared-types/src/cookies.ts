/**
 * Cookie Consent Types
 * Shared types for cookie consent management across apps
 */

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences'

export interface CookieConsent {
  necessary: boolean // Always true, can't be disabled
  analytics: boolean // Google Analytics, tracking
  marketing: boolean // Advertising, remarketing (future)
  preferences: boolean // Language, theme, etc. (optional consent)
}

export interface StoredConsent {
  version: number
  timestamp: string // ISO 8601
  consent: CookieConsent
  expiresAt: string // ISO 8601
}

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true, // Always enabled
  analytics: false, // Requires explicit consent
  marketing: false, // Requires explicit consent
  preferences: true, // Auto-enabled (essential functionality)
}

export const CONSENT_VERSION = 1
export const CONSENT_EXPIRY_MONTHS = 12
