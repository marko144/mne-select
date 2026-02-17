# Cookie Consent & GDPR Implementation Plan

## 🎯 Executive Summary

**Current State:** Landing page with Google Analytics (tracking without consent ❌)  
**Goal:** GDPR-compliant cookie consent with conditional analytics tracking  
**Approach:** Minimal, user-friendly implementation focused on transparency

---

## 📊 GDPR Cookie Analysis

### **What Cookies Do You Currently Use?**

| Cookie Type | Purpose | GDPR Classification | Consent Required? |
|-------------|---------|---------------------|-------------------|
| **Google Analytics** | Track visitor behavior, traffic sources, conversions | **Analytics** | ✅ YES |
| **Language Preference** | Remember user's language choice (en/me) | **Functional/Preference** | ⚠️ Debatable* |
| **Cookie Consent** | Remember user's consent choices | **Strictly Necessary** | ❌ NO |

\* **Language Preference Decision:** Can be treated as "strictly necessary for functionality" if positioned as essential for site operation. **Recommendation:** Don't require consent (standard practice).

### **What You Can Track WITHOUT Consent:**

According to GDPR Article 6(1)(f) (Legitimate Interest):

✅ **Strictly Necessary Cookies:**
- Cookie consent preferences
- Session management (when you add auth)
- Security tokens
- Load balancing
- CSRF protection

✅ **Essential Functional Cookies:**
- Language preference (arguably)
- Site accessibility preferences
- Shopping cart (when you add e-commerce)

❌ **Requires Consent:**
- Google Analytics
- Marketing/advertising cookies
- Social media tracking pixels
- Third-party analytics
- A/B testing tools

---

## 🎨 Proposed Solution

### **Cookie Categories**

```typescript
interface CookieConsent {
  necessary: boolean    // Always true (can't be disabled)
  analytics: boolean    // Google Analytics (requires consent)
  marketing: boolean    // Future: Ad pixels, remarketing (requires consent)
  preferences: boolean  // Language, theme (optional consent)
}
```

### **Implementation Approach**

**Phase 1: Minimal Compliance (Launch)**
- ✅ Necessary cookies only (no consent needed)
- ✅ Analytics cookies (with explicit consent)
- ✅ Cookie banner with Accept/Reject
- ✅ Cookie preferences stored in localStorage

**Phase 2: Enhanced (Post-Launch)**
- ⏳ Cookie policy page
- ⏳ Preferences center (granular control)
- ⏳ Marketing cookies (when needed)

---

## 🏗️ Technical Implementation Plan

### **1. Shared Cookie Consent Component**

**Location:** `packages/ui/src/components/CookieConsent.tsx`

**Why Shared?**
- Both guests and portal apps will need cookie consent
- Consistent user experience across apps
- Single source of truth for consent logic
- Easier to maintain GDPR compliance

**Features:**
- ✅ Bottom banner (unobtrusive)
- ✅ Accept All / Reject All buttons
- ✅ "Customize" option (Phase 2)
- ✅ Animated entrance
- ✅ Accessible (WCAG AA)
- ✅ Mobile-responsive
- ✅ Follows Montenegro Select design system

### **2. Cookie Management Hook**

**Location:** `packages/shared-utils/src/cookies.ts`

```typescript
// Centralized cookie consent management
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  
  // Load consent from localStorage
  // Save consent to localStorage
  // Trigger analytics based on consent
  // Provide methods: acceptAll, rejectAll, customize
}
```

### **3. Google Analytics Integration**

**Current Problem:**
- GA loads immediately on page load
- Tracks users without consent ❌

**Solution:**
- Conditional GA loading based on consent
- Only load GA after user accepts analytics
- Respect user's choice across sessions

**Implementation:**
```typescript
// app/layout.tsx - Conditional GA loading
{consent?.analytics && gaId && <GoogleAnalytics gaId={gaId} />}
```

### **4. Cookie Policy Page**

**Location:** `apps/guests/app/cookies/page.tsx`

**Content:**
- What cookies we use
- Why we use them
- How long they're stored
- How to manage preferences
- Third-party cookies (Google)
- User rights under GDPR

### **5. Privacy Policy Update**

**Location:** `apps/guests/app/privacy/page.tsx`

**Add Section:**
- Cookie usage disclosure
- Link to cookie policy
- How to withdraw consent
- Data retention periods

---

## 🎨 Design Mockup

### **Cookie Banner (Bottom)**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ 🍪 We use cookies                                      │
│                                                         │
│ We use cookies to enhance your experience and analyze  │
│ site traffic. By clicking "Accept", you consent to our │
│ use of analytics cookies.                              │
│                                                         │
│ [Learn More] [Reject All] [Accept All] ←Gold buttons  │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Colors:**
- Background: `navy-darker` (#071728) with subtle glow
- Text: `cream` (#e8e6e1)
- Buttons: Gold primary + outline variants
- Border: `gold/20` subtle top border

**Animation:**
- Slide up from bottom
- Fade in (500ms premium easing)
- Persists until user interacts

---

## 📋 Implementation Checklist

### **Phase 1: Core Implementation** (2-3 hours)

**1. Create Shared Components**
- [ ] `CookieConsent.tsx` - Banner component
- [ ] `useCookieConsent.ts` - React hook
- [ ] `cookies.ts` - Utility functions
- [ ] TypeScript types

**2. Update Google Analytics**
- [ ] Make GA conditional on consent
- [ ] Add consent check before loading
- [ ] Update analytics.ts helper
- [ ] Test tracking with/without consent

**3. UI Integration**
- [ ] Add banner to root layout
- [ ] Style according to design system
- [ ] Add animations
- [ ] Test mobile responsiveness
- [ ] Accessibility audit (keyboard nav, screen readers)

**4. Cookie Policy Page**
- [ ] Create `/cookies` route
- [ ] Write policy content
- [ ] Link from banner
- [ ] Link from footer

**5. Testing**
- [ ] Test consent acceptance flow
- [ ] Test consent rejection flow
- [ ] Verify GA loads only after consent
- [ ] Test localStorage persistence
- [ ] Test across browsers
- [ ] Test on mobile devices

### **Phase 2: Enhanced Features** (Future)

- [ ] Granular cookie preferences
- [ ] Preference center (manage after consent)
- [ ] Cookie scanner audit
- [ ] Marketing cookie support
- [ ] Banner A/B testing
- [ ] Analytics on consent rates

---

## 🔧 Technical Specifications

### **localStorage Structure**

```typescript
// Key: 'mne-select-cookie-consent'
{
  version: 1,
  timestamp: '2026-02-17T10:00:00Z',
  consent: {
    necessary: true,      // Always true
    analytics: true,      // User choice
    marketing: false,     // User choice (future)
    preferences: true     // Auto-accepted (non-critical)
  },
  expiresAt: '2027-02-17T10:00:00Z' // 12 months
}
```

### **Consent Expiry**

- **Duration:** 12 months (GDPR recommendation)
- **Re-prompt:** After 12 months, show banner again
- **Update Trigger:** If cookie policy changes materially

### **Default Behavior**

**No consent stored:**
- ❌ Don't load Google Analytics
- ✅ Show cookie banner
- ✅ Allow essential cookies only
- ✅ Store language preference (essential)

**Consent accepted:**
- ✅ Load Google Analytics
- ✅ Hide banner
- ✅ Store consent choice
- ✅ Track user behavior

**Consent rejected:**
- ❌ Don't load Google Analytics
- ✅ Hide banner
- ✅ Store rejection choice
- ✅ Allow essential cookies only

---

## 🌍 GDPR Compliance Requirements

### **Must-Haves:**

✅ **1. Prior Consent**
- Must get consent BEFORE setting analytics cookies
- Cannot use pre-ticked boxes
- Must be explicit opt-in

✅ **2. Granular Control**
- Must allow users to accept/reject specific categories
- At minimum: Essential vs Non-Essential
- Phase 2: Detailed categories

✅ **3. Easy to Understand**
- Clear, plain language
- No legal jargon in banner
- Explain what each cookie does

✅ **4. Easy to Withdraw**
- Must provide easy way to change mind
- Link in footer to manage preferences
- No barriers to withdrawal

✅ **5. Documentation**
- Cookie policy page
- Privacy policy updated
- List all cookies used
- Explain purpose and duration

✅ **6. Proof of Consent**
- Store consent timestamp
- Record what user consented to
- Keep audit trail (for legal defense)

### **Best Practices:**

✅ **Legitimate Interest Assessment**
- Analytics: Not legitimate interest (need consent)
- Security: Legitimate interest (no consent needed)
- Essential functionality: No consent needed

✅ **Consent Refresh**
- Re-prompt after 12 months
- Re-prompt if policy changes
- Allow user to change anytime

✅ **Third-Party Cookies**
- Disclose Google Analytics clearly
- Link to Google's privacy policy
- Explain data sharing

---

## 📊 User Experience Flow

### **First Visit**

```
1. User lands on site
2. Cookie banner appears (bottom)
3. Google Analytics NOT loaded yet
4. User sees: "Accept All" | "Reject All" | "Learn More"
   
   → Accept All:
     - Store consent (analytics: true)
     - Load Google Analytics
     - Hide banner
     - Start tracking
   
   → Reject All:
     - Store rejection (analytics: false)
     - Don't load Google Analytics
     - Hide banner
     - Essential cookies only
   
   → Learn More:
     - Navigate to /cookies page
     - Read detailed policy
     - Return to accept/reject
```

### **Returning Visit (Consent Stored)**

```
1. User lands on site
2. Check localStorage for consent
3. If consent exists and not expired:
   - Don't show banner
   - Apply stored preferences
   - Load GA if consented
4. If consent expired (>12 months):
   - Show banner again
   - Request fresh consent
```

### **Managing Preferences (Phase 2)**

```
1. User clicks "Cookie Settings" in footer
2. Modal/page opens with granular controls:
   ✓ Necessary (locked - always on)
   ☐ Analytics (toggle)
   ☐ Marketing (toggle)
3. Save preferences
4. Apply immediately
5. Store in localStorage
```

---

## 🎯 Success Metrics

### **Compliance Metrics**

- ✅ 100% of users see banner on first visit
- ✅ 0% of analytics cookies set before consent
- ✅ Consent stored and respected across sessions
- ✅ Easy withdrawal mechanism available

### **User Experience Metrics**

- 📊 Consent acceptance rate (target: 60-80%)
- 📊 Time to consent decision (target: <5 seconds)
- 📊 Banner dismissal rate
- 📊 Cookie policy page views

### **Technical Metrics**

- ⚡ Banner load time (<100ms)
- ⚡ No layout shift (CLS)
- ⚡ Accessible (100% keyboard navigation)
- ⚡ Works without JavaScript (graceful degradation)

---

## 🚀 Implementation Priority

### **Priority 1: Must Have (Before Production Launch)**

1. ✅ Cookie consent banner
2. ✅ Conditional Google Analytics
3. ✅ Accept/Reject functionality
4. ✅ localStorage persistence
5. ✅ Cookie policy page

### **Priority 2: Should Have (Launch Week)**

1. ⏳ Privacy policy update
2. ⏳ Footer links (Cookie Settings)
3. ⏳ Banner animations
4. ⏳ Mobile optimization
5. ⏳ Accessibility audit

### **Priority 3: Nice to Have (Post-Launch)**

1. ⏳ Granular preferences center
2. ⏳ Cookie scanner/audit tool
3. ⏳ Consent analytics dashboard
4. ⏳ A/B test banner variations
5. ⏳ Multi-language cookie policy

---

## 📚 Legal Considerations

### **GDPR Compliance**

✅ **Applies to you if:**
- You have visitors from EU/EEA
- You process personal data of EU residents
- You track behavior with cookies

✅ **Your obligations:**
- Get explicit consent for non-essential cookies
- Provide clear information
- Allow easy withdrawal
- Keep records of consent
- Respond to data subject requests

### **Penalties for Non-Compliance**

- Up to €20 million OR 4% of global turnover
- Reputation damage
- User trust erosion

### **Safe Harbor: What You Can Do**

✅ Essential cookies without consent:
- Session management
- Security features
- Load balancing
- Authentication tokens
- Shopping cart

❌ Requires consent:
- Analytics (Google Analytics)
- Advertising
- Social media plugins
- A/B testing
- Heatmaps

---

## 🎨 Component Reusability Plan

### **Shared Package Structure**

```
packages/ui/src/components/
├── Button.tsx ✅ (already exists)
├── Card.tsx ✅ (already exists)
├── Input.tsx ✅ (already exists)
├── CookieConsent/ (NEW)
│   ├── CookieConsent.tsx
│   ├── CookieBanner.tsx
│   ├── CookiePreferences.tsx (Phase 2)
│   └── index.ts

packages/shared-utils/src/
├── cookies.ts (NEW)
│   ├── getCookieConsent()
│   ├── setCookieConsent()
│   ├── hasConsent()
│   ├── clearConsent()
│
└── hooks/ (NEW)
    └── useCookieConsent.ts
```

### **Usage in Both Apps**

**Guests App:**
```typescript
import { CookieConsent } from '@mne-select/ui'
import { useCookieConsent } from '@mne-select/shared-utils'

// In layout.tsx
<CookieConsent />
```

**Portal App (Future):**
```typescript
// Same import, same component
// Consistent UX across both apps
<CookieConsent />
```

---

## 🔄 Migration Path

### **Current State**
```typescript
// GA loads immediately (non-compliant)
<GoogleAnalytics gaId="G-E6F44V4B7Q" />
```

### **Compliant State**
```typescript
// GA loads conditionally
{consent?.analytics && <GoogleAnalytics gaId={gaId} />}
```

### **Migration Steps**

1. **Add cookie consent hook** to layout
2. **Wrap GA component** in conditional
3. **Add cookie banner** to layout
4. **Test** that GA doesn't load without consent
5. **Deploy** to production

---

## ✅ Acceptance Criteria

**Definition of Done:**

- [ ] Cookie banner displays on first visit
- [ ] Banner does not display if consent is stored
- [ ] "Accept All" enables Google Analytics
- [ ] "Reject All" prevents Google Analytics
- [ ] Consent persists across page reloads
- [ ] Consent expires after 12 months
- [ ] Banner is mobile-responsive
- [ ] Banner is keyboard-accessible
- [ ] Cookie policy page exists and is linked
- [ ] Privacy policy mentions cookies
- [ ] Footer has "Cookie Settings" link
- [ ] No console errors
- [ ] No layout shift (CLS)
- [ ] Loads in <100ms
- [ ] Works without JavaScript (degrades gracefully)

---

## 📖 Next Steps

1. **Review this plan** - Confirm approach
2. **Create components** - Build cookie consent system
3. **Update Google Analytics** - Make conditional
4. **Write cookie policy** - Legal content
5. **Test thoroughly** - All scenarios
6. **Deploy** - Production launch

---

**Estimated Implementation Time:** 2-3 hours (Phase 1)  
**Complexity:** Low-Medium  
**Risk:** Low (well-established pattern)  
**ROI:** High (legal compliance + user trust)

---

**Questions to Resolve:**

1. Do you want granular controls (Phase 1) or just Accept/Reject? **Recommendation: Accept/Reject for MVP**
2. Should language preference require consent? **Recommendation: No, treat as essential**
3. Do you want cookie banner analytics (irony)? **Recommendation: Yes, track consent rates**

---

**Ready to implement?** This plan provides GDPR compliance while maintaining a smooth user experience aligned with your brand.
