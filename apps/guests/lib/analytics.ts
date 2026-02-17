/**
 * Google Analytics Event Tracking Utilities
 * 
 * Use these functions to track custom events in Google Analytics 4.
 * Events will help you understand user behavior and measure conversions.
 */

// Type definitions for GA events
type GAEventParams = {
  action: string
  category: string
  label?: string
  value?: number
}

/**
 * Track a custom event in Google Analytics
 * 
 * @example
 * trackEvent({
 *   action: 'waitlist_signup',
 *   category: 'engagement',
 *   label: 'hero_form',
 *   value: 1
 * })
 */
export function trackEvent({ action, category, label, value }: GAEventParams) {
  // Check if gtag is available (it's loaded by @next/third-parties)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

/**
 * Track waitlist signup events
 * Call this when a user successfully joins the waitlist
 * 
 * @param location - Where the signup happened (e.g., 'hero', 'footer', 'cta')
 */
export function trackWaitlistSignup(location: string) {
  trackEvent({
    action: 'waitlist_signup',
    category: 'engagement',
    label: location,
    value: 1,
  })
}

/**
 * Track email capture events
 * Call this when a user enters their email
 * 
 * @param location - Where the email was captured
 */
export function trackEmailCapture(location: string) {
  trackEvent({
    action: 'email_captured',
    category: 'lead',
    label: location,
    value: 1,
  })
}

/**
 * Track experience category views
 * Call this when a user clicks on an experience category
 * 
 * @param category - The category name (e.g., 'boat_tours', 'wine_tasting')
 */
export function trackExperienceView(category: string) {
  trackEvent({
    action: 'experience_view',
    category: 'engagement',
    label: category,
  })
}

/**
 * Track language changes
 * Call this when a user switches language
 * 
 * @param language - The language code (e.g., 'en', 'me')
 */
export function trackLanguageChange(language: string) {
  trackEvent({
    action: 'language_change',
    category: 'user_preference',
    label: language,
  })
}

/**
 * Track outbound link clicks
 * Call this when a user clicks an external link
 * 
 * @param url - The URL being clicked
 * @param label - Optional label for the link
 */
export function trackOutboundLink(url: string, label?: string) {
  trackEvent({
    action: 'outbound_click',
    category: 'engagement',
    label: label || url,
  })
}

/**
 * Track social media clicks
 * Call this when a user clicks a social media link
 * 
 * @param platform - The social media platform (e.g., 'instagram', 'facebook')
 */
export function trackSocialClick(platform: string) {
  trackEvent({
    action: 'social_click',
    category: 'engagement',
    label: platform,
  })
}

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
  }
}
