# Montenegro Select - Landing Page Design System & Implementation Guide

## Document Purpose

This document serves as the complete design specification and implementation guide for the Montenegro Select guest landing page. Follow this document systematically to build a high-quality, luxury-positioned landing page that converts visitors into early access members.

**Brand Positioning**: Montenegro Select is a curated access network, not a booking platform. The design must feel like a private membership club - premium, exclusive, refined, and aspirational.

---

## Table of Contents

1. [Asset Locations & Setup](#asset-locations--setup)
2. [Design System Foundation](#design-system-foundation)
3. [Component Specifications](#component-specifications)
4. [Landing Page Sections](#landing-page-sections)
5. [Bi-Lingual Implementation](#bi-lingual-implementation)
6. [Responsive Design Strategy](#responsive-design-strategy)
7. [Animation & Interaction Guidelines](#animation--interaction-guidelines)
8. [Accessibility Requirements](#accessibility-requirements)
9. [Implementation Sequence](#implementation-sequence)

---

## Asset Locations & Setup

### Font Assets (✅ Ready to Use)

All fonts are downloaded and located in the design system package:

```
/packages/design-system/assets/fonts/
  /inter/
    - inter-latin-wght-normal.woff2      (Body text - Latin alphabet)
    - inter-latin-wght-italic.woff2      (Body text italic)
    - inter-cyrillic-wght-normal.woff2   (Body text - Cyrillic/Montenegrin)
    - inter-cyrillic-wght-italic.woff2   (Body text italic - Cyrillic)
  
  /cormorant/
    - cormorant-garamond-latin-wght-normal.woff2    (Headlines - Latin)
    - cormorant-garamond-latin-wght-italic.woff2    (Headlines italic)
    - cormorant-garamond-cyrillic-wght-normal.woff2 (Headlines - Cyrillic)
    - cormorant-garamond-cyrillic-wght-italic.woff2 (Headlines italic - Cyrillic)
  
  /futura/
    (Reserved for Futura font files if needed for logo matching)
```

**Font Loading Strategy**: Use `font-display: swap` with close fallback fonts
- Inter → fallback: `system-ui, -apple-system, sans-serif`
- Cormorant Garamond → fallback: `Georgia, serif`
- Progressive enhancement: text appears immediately, fonts swap in smoothly when loaded
- No splash screen needed - prioritize fast content display

### Logo Assets (✅ Ready to Use)

```
/packages/design-system/assets/logos/
  - full_logo_gold.svg     (Primary logo - gold #c2a24d)
  - full_logo_cream.svg    (Alternate - cream #e8e6e1 for dark backgrounds)
```

### Illustration Assets (✅ Ready to Use)

```
/packages/design-system/assets/illustrations/
  - animation_outline.svg  (Montenegro coastline - 502KB)
```

### Photography Assets (📋 Use Placeholders)

```
/apps/guests/public/images/experiences/
  (Place 6 category images here - FOR NOW: Use placeholder images)
  
  Required placeholders (portrait 3:4 aspect ratio):
  - yachts.jpg               (placeholder 1080×1440px)
  - beach-clubs.jpg          (placeholder 1080×1440px)
  - fine-dining.jpg          (placeholder 1080×1440px)
  - private-tours.jpg        (placeholder 1080×1440px)
  - mountain-escapes.jpg     (placeholder 1080×1440px)
  - cultural-evenings.jpg    (placeholder 1080×1440px)
```

**Placeholder Implementation**:
- Use solid navy background (#0f2a44) with category name in gold
- Or use a subtle pattern/gradient
- Maintain 3:4 portrait aspect ratio
- Include proper alt text for accessibility

### Translation Files (📋 To Create)

```
/apps/guests/locales/
  - en.json    (English translations)
  - me.json    (Montenegrin/Cyrillic translations)
```

**Structure**: Organize by section/component
```json
{
  "header": { "languageToggle": "EN" },
  "hero": {
    "headline": {
      "line1": "Your curated",
      "line2": "MONTENEGRO",
      "line3": "Experience"
    },
    "subheadline": "Private yachts. Hidden beach clubs. Exceptional dining.",
    "cta": "Request Early Access",
    "microcopy": "Early members receive priority access."
  },
  "categories": {
    "yachts": "Yachts",
    "beachClubs": "Beach Clubs",
    "fineDining": "Fine Dining",
    "privateTours": "Private Tours",
    "mountainEscapes": "Mountain Escapes",
    "culturalEvenings": "Cultural Evenings"
  }
  // ... continue for all sections
}
```

---

## Design System Foundation

### 1. Color Palette

**Primary Brand Colors** (Use these exact values):

```typescript
// colors/index.ts or tailwind.config.ts theme extension

colors: {
  // Gold - Primary brand color (logo, accents, CTAs)
  gold: {
    DEFAULT: '#c2a24d',  // PRIMARY - Use for logo, buttons, large headlines
    50: '#faf8f3',
    100: '#f5f0e3',
    200: '#ebe2c7',
    300: '#dccfa0',
    400: '#c2a24d',      // PRIMARY
    500: '#a88a3d',
    600: '#8b7232',
    700: '#6d5a28',
    800: '#4f411d',
    900: '#322912',
    light: '#d4b366',    // ACCESSIBLE variant - use for small text on navy (WCAG AA)
  },
  
  // Navy - Primary background color
  navy: {
    DEFAULT: '#0f2a44',  // PRIMARY - Use for backgrounds
    50: '#e8edf3',
    100: '#d1dbe7',
    200: '#a3b7cf',
    300: '#7593b7',
    400: '#476f9f',
    500: '#0f2a44',      // PRIMARY
    600: '#0c2238',
    700: '#091a2c',
    800: '#061220',
    900: '#030914',
    darker: '#071728',   // For layering/depth
    glow: 'rgba(15, 42, 68, 0.6)', // For subtle backgrounds
  },
  
  // Cream - Primary text color
  cream: {
    DEFAULT: '#e8e6e1',  // PRIMARY - Use for ALL body text
    50: '#fefefe',
    100: '#fcfcfb',
    200: '#f5f4f1',
    300: '#eeedea',
    400: '#e8e6e1',      // PRIMARY
    500: '#d4d2cd',
    600: '#b8b6b1',
    700: '#9c9a95',
    800: '#7e7c79',
    900: '#5f5e5c',
    muted: 'rgba(232, 230, 225, 0.7)',    // Secondary text
    subtle: 'rgba(232, 230, 225, 0.5)',   // Disabled/hints
  },
}
```

**Color Usage Rules** (Critical for Brand Consistency):
- **90% of backgrounds**: Navy (#0f2a44)
- **ALL body text & small UI text**: Cream (#e8e6e1)
- **Gold usage** (use sparingly for luxury feel):
  - Logo
  - Primary buttons
  - Headlines larger than 24px
  - Accent decorations (underlines, dividers)
  - Hover effects
- **Small text accessibility**: If gold appears on text <24px, use `gold.light` (#d4b366) for WCAG AA compliance (4.5:1 contrast)

### 2. Typography System

**Font Families**:

```typescript
fontFamily: {
  display: ['Cormorant Garamond', 'Georgia', 'serif'],  // Headlines, hero text
  body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], // Body, UI elements
  brand: ['Futura', 'Inter', 'sans-serif'],  // Logo, special brand moments
}
```

**Type Scale** (1.25 modular scale for premium hierarchy):

```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px - Labels, microcopy
  sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px - Small UI, captions
  base: ['1rem', { lineHeight: '1.5rem' }],      // 16px - Body text (PRIMARY)
  lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px - Large body
  xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px - Small headlines
  '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px - Section titles
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Page titles
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px - Hero subheads
  '5xl': ['3rem', { lineHeight: '1' }],          // 48px - Hero headlines
  '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px - Large hero (desktop)
  '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px - Statement text
}

fontWeight: {
  normal: 400,    // Regular text
  medium: 500,    // Emphasized text
  semibold: 600,  // Subheadings
  bold: 700,      // Headlines
}

letterSpacing: {
  tighter: '-0.025em',  // Tight headlines
  tight: '-0.015em',    // Display text
  normal: '0',          // Body text (default)
  wide: '0.025em',      // Uppercase UI
  wider: '0.05em',      // Spaced headlines
  widest: '0.1em',      // "MONTENEGRO" emphasis
}
```

**Typography Usage Guidelines**:
- **Headlines**: Cormorant Garamond, semibold (600) or bold (700), gold color for emphasis
- **Body text**: Inter, regular (400) or medium (500), cream color
- **UI elements**: Inter, medium (500), cream color
- **Logo/Brand moments**: Futura if available, otherwise Inter bold
- **Bi-lingual support**: Both fonts include Latin + Cyrillic (Montenegrin Cyrillic)

### 3. Spacing & Layout

**Section Spacing** (vertical rhythm between major sections):

```typescript
section: {
  mobile: '4rem',     // 64px
  tablet: '6rem',     // 96px  
  desktop: '8rem',    // 128px
}
```

**Container System**:

```typescript
container: {
  padding: {
    mobile: '1.5rem',   // 24px side padding
    tablet: '3rem',     // 48px
    desktop: '4rem',    // 64px
  },
  maxWidth: '1440px',   // Max content width for large screens
}
```

**Component Spacing**:

```typescript
component: {
  xs: '0.5rem',    // 8px
  sm: '1rem',      // 16px
  md: '1.5rem',    // 24px
  lg: '2rem',      // 32px
  xl: '3rem',      // 48px
  '2xl': '4rem',   // 64px
}
```

**Responsive Breakpoints**:

```typescript
screens: {
  sm: '640px',     // Mobile landscape
  md: '768px',     // Tablet portrait
  lg: '1024px',    // Tablet landscape / Small desktop
  xl: '1280px',    // Desktop
  '2xl': '1440px', // Large desktop
}
```

### 4. Animation System

**Duration & Easing**:

```typescript
duration: {
  fast: '150ms',      // Quick micro-interactions
  base: '300ms',      // Standard transitions (DEFAULT)
  slow: '500ms',      // Deliberate animations
  slower: '700ms',    // Hero/impactful moments
}

easing: {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Default (use for most)
  premium: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Luxury feel (slower start/end)
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful (rare)
  sharp: 'cubic-bezier(0.4, 0, 1, 1)',         // Quick exit
}
```

**Animation Principles**:
- **Moderate approach**: Engaging but not distracting
- **Desktop**: Hover states, smooth transitions, subtle parallax
- **Touch devices**: No hover, always-visible states, tap feedback
- **Accessibility**: Always respect `prefers-reduced-motion`
- **Performance**: Use `transform` and `opacity` for GPU acceleration

**Haptic-Style Micro-Animations**:
```typescript
// Button press feedback
press: 'scale(0.98)'

// Card hover lift
lift: 'translateY(-4px)'

// Gold underline growth
underlineGrow: 'scaleX(1)' // from scaleX(0)

// Image zoom on hover
imageZoom: 'scale(1.05)'
```

### 5. Component Design Tokens

**Buttons**:
```typescript
button: {
  borderRadius: '0.375rem',  // 6px
  padding: {
    sm: '0.5rem 1rem',       // 8px 16px
    md: '0.75rem 1.5rem',    // 12px 24px
    lg: '1rem 2rem',         // 16px 32px
  },
  fontSize: {
    sm: 'sm',   // 14px
    md: 'base', // 16px
    lg: 'lg',   // 18px
  },
}
```

**Input Fields**:
```typescript
input: {
  borderRadius: '0.375rem',     // 6px
  padding: '0.875rem 1rem',     // 14px 16px
  fontSize: 'base',             // 16px
  borderWidth: '1px',
  focusRing: '3px',
}
```

**Card/Tile Components**:
```typescript
card: {
  borderRadius: '0.5rem',       // 8px
  padding: {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  },
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
    md: '0 4px 16px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
}
```

**Overlays** (for category tiles):
```typescript
overlay: {
  default: 'rgba(15, 42, 68, 0.4)',     // Navy 40%
  hover: 'rgba(15, 42, 68, 0.6)',       // Navy 60% (desktop only)
  gradient: 'linear-gradient(180deg, transparent 0%, rgba(15, 42, 68, 0.8) 100%)',
}
```

---

## Component Specifications

### Component 1: Logo Component

**Purpose**: Display Montenegro Select brand logo consistently across the site

**Props**:
```typescript
interface LogoProps {
  variant?: 'gold' | 'cream'  // Default: 'gold'
  size?: 'sm' | 'md' | 'lg'   // Default: 'md'
  className?: string
}
```

**Sizing**:
- sm: 24px height
- md: 32px height (DEFAULT)
- lg: 40px height

**Usage**:
- Header: Gold variant, md size
- Footer: Cream variant, sm size
- Hero: Gold variant, lg size

**Implementation**:
```typescript
// Load SVG from: /packages/design-system/assets/logos/
// full_logo_gold.svg or full_logo_cream.svg
```

### Component 2: Button Component

**Purpose**: Primary CTA button for email submission and actions

**Variants**:

**Primary (Gold)**:
```
Background: gold (#c2a24d)
Text: navy (#0f2a44)
Hover: Lighten 10%, subtle gold glow
Active: scale(0.98)
Font: Inter medium (500), base size
```

**Outline**:
```
Border: 2px gold (#c2a24d)
Background: transparent
Text: gold (#c2a24d)
Hover: Background gold, text navy
Active: scale(0.98)
```

**Text Link**:
```
Background: none
Text: cream (#e8e6e1)
Underline: gold, grows from center on hover
Hover: text color to gold
```

**Accessibility**:
- Minimum touch target: 44×44px
- Focus visible: 3px gold ring with 2px offset
- Keyboard accessible
- ARIA labels where needed

### Component 3: Input Component (Email)

**Purpose**: Email capture field for waitlist

**Design Specification**:
```
Width: 100% (max-width: 400px)
Height: 48px (comfortable touch target)
Background: rgba(232, 230, 225, 0.1) (subtle cream tint)
Border: 1px solid rgba(232, 230, 225, 0.3)
Border radius: 6px
Text color: cream (#e8e6e1)
Placeholder: cream.muted (70% opacity)
Font: Inter regular, 16px (prevents mobile zoom)

Focus state:
  Border: 2px solid gold (#c2a24d)
  Glow: 0 0 0 3px rgba(194, 162, 77, 0.2)
  
Error state:
  Border: 2px solid error color
  Helper text: error color below input
```

**Validation** (UI only):
- Required field indicator
- Email format validation (visual feedback only, no backend yet)
- Clear error messages

### Component 4: Language Toggle

**Purpose**: Switch between English and Montenegrin

**Design**:
```
Layout: Inline text toggle "EN | ME"
Active language: Gold (#c2a24d), semibold (600)
Inactive: Cream muted (70% opacity), regular (400)
Separator: Cream subtle (50% opacity)
Font: Inter, 14px, uppercase, wide letter-spacing (0.05em)
Hover: Inactive text brightens to full cream
Click: Instant language switch, no reload
```

**Position**: Top-right of header, aligned right

**Functionality**:
- Store language preference in localStorage
- Update all text content instantly via translation context
- No page reload

### Component 5: Category Tile (Experience Grid)

**Purpose**: Showcase experience categories with editorial imagery

**Structure**:
```
Container:
  Width: 360px (desktop), 320px (tablet), 280px (mobile)
  Height: 480px (desktop), 430px (tablet), 380px (mobile)
  Aspect ratio: 3:4 portrait
  Border radius: 8px
  Overflow: hidden
  Cursor: pointer
  
Background Image:
  Full cover, centered
  ⚠️ FOR NOW: Use placeholder (navy background with gold category name)
  
Overlay:
  Gradient: Bottom to top, transparent → navy 80%
  Height: Full height
  
Content:
  Category title: Gold, Cormorant Garamond, 2xl (24px), semibold (600)
  Position: Absolute bottom, centered, 24px from bottom
  Letter spacing: wide (0.025em)
```

**Interaction States**:

**Desktop (Hover)**:
```
Image: scale(1.05), duration 500ms premium easing
Overlay: Darken to navy 70% opacity
Category title: Gold underline grows from center (scaleX 0 → 1)
Transition: 500ms premium easing
```

**Touch Devices**:
```
Default state: Partial gold accent (thin top border or subtle glow)
No hover effects
Tap: Navigate (future functionality)
Visual feedback: Brief scale(0.98) on tap
```

**Accessibility**:
- Semantic HTML: `<article>` with `role="button"`
- Keyboard focusable
- Focus indicator: 3px gold ring
- Alt text on images (when real images added)
- ARIA label: "View {category} experiences"

### Component 6: Email Capture Form (CTA)

**Purpose**: Capture early access signups

**Layout**:
```
Container: Centered, max-width 480px
Flexbox: Row on desktop, column on mobile

Desktop (≥768px):
  Email input: flex-grow, 400px
  Button: fixed width, 180px
  Gap: 12px between
  
Mobile (<768px):
  Stack vertically
  Email input: full width
  Button: full width
  Gap: 16px between
```

**Microcopy**:
```
Below form: "Early members receive priority access."
Font: Inter, 14px, cream.muted (70% opacity)
Centered alignment
```

**Validation UI**:
```
Empty field on submit: 
  Border turns gold, shake animation
  Helper text: "Email is required"
  
Invalid email format:
  Border turns error color
  Helper text: "Please enter a valid email"
  
Success state (future):
  Show success message
  Form fades out
```

**Form Behavior** (UI Only - No Backend Yet):
```typescript
onSubmit = (e) => {
  e.preventDefault()
  // Validate email format
  // Show loading state on button
  // Log to console (no backend yet)
  // Show success message
}
```

---

## Landing Page Sections

### Section 1: Hero Section

**Purpose**: First impression, email capture, establish brand positioning

**Layout**:
```
Full viewport height (100vh)
Background: Navy (#0f2a44)
Optional: Subtle animated gold gradient lines (very subtle, slow movement)
Centered content, max-width 960px
Vertical padding: 10vh top/bottom minimum
```

**Content Structure** (Centered, vertical stack):

1. **Logo**
   - Montenegro Select logo (gold variant)
   - Size: lg (40px height)
   - Margin bottom: 3rem

2. **Headline** (Multi-line treatment)
   ```
   Line 1: "Your curated"
     Font: Cormorant Garamond, semibold (600)
     Size: 3xl mobile, 4xl tablet, 5xl desktop
     Color: Cream
     Letter spacing: tight
   
   Line 2: "MONTENEGRO"
     Font: Futura (or Inter bold if unavailable)
     Size: 5xl mobile, 6xl tablet, 7xl desktop
     Color: Gold (#c2a24d)
     Letter spacing: widest (0.1em)
     Text transform: uppercase
     Optional: Subtle gold glow effect
     Margin: 1rem top/bottom
   
   Line 3: "Experience"
     Font: Cormorant Garamond, semibold (600)
     Size: 3xl mobile, 4xl tablet, 5xl desktop
     Color: Cream
     Letter spacing: tight
   ```

3. **Subheadline**
   ```
   Text: "Private yachts. Hidden beach clubs. Exceptional dining.
          A curated network for tourists and expats seeking more."
   Font: Inter, regular (400)
   Size: lg (18px)
   Color: Cream muted (70% opacity)
   Max width: 600px
   Line height: 1.75
   Margin top: 2rem
   ```

4. **CTA Form**
   ```
   Email input + Primary button (gold)
   Margin top: 3rem
   ```

5. **Microcopy**
   ```
   Text: "Early members receive priority access."
   Font: Inter, 14px, cream subtle (50% opacity)
   Margin top: 1rem
   ```

**Animations** (Fade in on load):
```
Logo: opacity 0 → 1, duration 300ms, delay 0ms
Headline line 1: opacity 0 → 1, translateY(20px → 0), duration 500ms, delay 200ms
Headline line 2: opacity 0 → 1, translateY(20px → 0), duration 500ms, delay 300ms
Headline line 3: opacity 0 → 1, translateY(20px → 0), duration 500ms, delay 400ms
Subheadline: opacity 0 → 1, duration 500ms, delay 600ms
CTA Form: opacity 0 → 1, duration 500ms, delay 800ms
```

**Responsive Behavior**:
- Mobile (<768px): Stack tight, headline 3xl/5xl/3xl, padding 1.5rem sides
- Tablet (768-1023px): Moderate sizing, headline 4xl/6xl/4xl, padding 3rem sides
- Desktop (≥1024px): Full sizing, headline 5xl/7xl/5xl, padding 4rem sides

### Section 2: Experience Grid (Horizontal Scroll)

**Purpose**: Showcase 6 experience categories without cliché tourism imagery

**Container Structure**:
```
Full width, no max-width constraint
Background: Navy (#0f2a44)
Padding: section.mobile/tablet/desktop (responsive)
```

**Section Header**:
```
Optional headline: "Discover Your Experience"
Font: Cormorant Garamond, bold (700), 3xl
Color: Cream
Text align: center
Margin bottom: 3rem
```

**Scroll Container**:
```
Display: flex
Flex direction: row
Overflow-x: auto (but hide scrollbar)
Scroll snap type: x mandatory
Scroll behavior: smooth
Gap: 24px (1.5rem)
Padding: 0 container.padding (left/right)

CSS for hidden scrollbar:
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar { display: none; } /* Chrome, Safari */
```

**Scroll Indicators** (Visual cues for scrollability):
```
Left edge: Fade gradient overlay (transparent → navy)
  Position: Absolute left 0
  Width: 40px
  Height: 100%
  Pointer events: none
  Background: linear-gradient(90deg, navy → transparent)

Right edge: Fade gradient overlay (navy ← transparent)
  Position: Absolute right 0
  Width: 40px
  Height: 100%
  Pointer events: none
  Background: linear-gradient(270deg, navy → transparent)
```

**Categories** (6 tiles):
```
1. Yachts
2. Beach Clubs
3. Fine Dining
4. Private Tours
5. Mountain Escapes
6. Cultural Evenings
```

**Tile Specifications**: See Component 5 above

**Scroll Behavior** (Apple-inspired):

**Touch Devices (Mobile/Tablet)**:
- Momentum scrolling enabled
- Snap to tile boundaries (CSS scroll-snap-align: center)
- Tiles peek on edges to signal more content
- No arrows, no pagination dots
- Smooth natural feel

**Desktop**:
- Drag-to-scroll interaction
- Cursor changes to `grab` on hover, `grabbing` on drag
- Keyboard: Arrow keys scroll horizontally
- Wheel/trackpad: Horizontal scroll
- Snap to boundaries on release

**Implementation Notes**:
```typescript
// Use CSS scroll-snap for alignment
.scroll-container {
  scroll-snap-type: x mandatory;
}

.tile {
  scroll-snap-align: center;
  scroll-snap-stop: always;
}

// For desktop drag-to-scroll, use library like:
// - react-scroll-drag (recommended)
// - Or implement custom mouse drag handler
```

**Accessibility**:
- Container has `role="region"` and `aria-label="Experience categories"`
- Keyboard navigation: Tab through tiles, Enter to select
- Arrow keys for horizontal scrolling
- Screen reader announces: "Scrollable region with 6 items"

### Section 3: What is Montenegro Select?

**Purpose**: Explain brand positioning without being preachy

**Layout**:
```
Two-column on desktop (≥1024px), stack on mobile/tablet
Max-width: 1200px, centered
Background: Navy (#0f2a44)
Padding: section spacing (responsive)
Gap between columns: 4rem (desktop), 3rem (stack)
```

**Left Column - Text (50% width desktop, 100% mobile)**:

1. **Headline**:
   ```
   Text: "Not A Marketplace. A Network."
   Font: Cormorant Garamond, bold (700)
   Size: 3xl (30px) mobile, 4xl (36px) desktop
   Color: Cream, with "Network" emphasized in gold
   Margin bottom: 2rem
   ```

2. **Bullet Points** (4 items):
   ```
   Each item:
     Icon: Gold circle or custom gold icon (8px)
     Text: Inter regular (400), lg (18px), cream
     Spacing: 1.5rem between items
     Line height: 1.75
   
   Content:
     • Personally selected partners
     • Verified quality standards  
     • Exclusive benefits for members
     • Designed for refined travel
   ```

**Right Column - Illustration (50% width desktop, 100% mobile)**:

**Montenegro Coastline Animation**:
```
SVG: animation_outline.svg (502KB)
Max width: 500px
Max height: 400px
Color: Gold stroke (#c2a24d)
Stroke width: 2px
Fill: none (outline only)
```

**Animation Sequence**:
```
Trigger: When section enters viewport (scroll-based, IntersectionObserver)

Phase 1 - Draw In (2 seconds):
  SVG path draws from start to finish
  Duration: 2000ms
  Easing: premium easing
  Stroke dasharray/dashoffset animation
  
Phase 2 - Pulse Loop (ongoing, 3 second cycle):
  Opacity: 0.7 → 1 → 0.7
  Duration: 3000ms
  Easing: smooth easing
  Infinite loop
  Optional: Subtle glow filter
```

**Implementation**:
```typescript
// Use Framer Motion or CSS animation
// For SVG path drawing, calculate total path length
// Apply stroke-dasharray and animate stroke-dashoffset

const pathLength = pathRef.getTotalLength()
// Animate from pathLength to 0
```

**Responsive Behavior**:
- Desktop (≥1024px): Side-by-side, 50/50 split
- Tablet (768-1023px): Stack, text first, illustration below (centered, 400px width)
- Mobile (<768px): Stack, text first, illustration below (centered, 280px width)

### Section 4: Social Proof

**Purpose**: Build legitimacy without fake testimonials

**Layout**:
```
Full width container, centered text
Max-width: 800px
Background: Navy (#0f2a44)
Padding: section spacing (responsive)
Text align: center
```

**Content**:

1. **Primary Statement**:
   ```
   Text: "Launching Soon in Kotor, Budva & Porto Montenegro"
   Font: Cormorant Garamond, semibold (600)
   Size: 2xl (24px) mobile, 3xl (30px) desktop
   Color: Cream, with location names in gold
   Line height: 1.5
   ```

2. **Secondary Statement**:
   ```
   Text: "In collaboration with select partners across the Adriatic coast."
   Font: Inter, regular (400)
   Size: lg (18px)
   Color: Cream muted (70% opacity)
   Margin top: 1rem
   Line height: 1.75
   ```

**Animation**:
```
Fade in on scroll (IntersectionObserver)
Opacity 0 → 1, translateY(20px → 0)
Duration: 500ms, premium easing
```

### Section 5: Final CTA

**Purpose**: Last conversion opportunity before footer

**Layout**:
```
Full width, centered content
Max-width: 600px
Background: Navy (#0f2a44)
Padding: section spacing (responsive), extra padding top/bottom
Text align: center
```

**Content**:

1. **Headline**:
   ```
   Text: "Membership Opens Soon"
   Font: Cormorant Garamond, bold (700)
   Size: 4xl (36px) mobile, 5xl (48px) desktop
   Color: Gold (#c2a24d)
   Letter spacing: tight
   Margin bottom: 1rem
   ```

2. **Subtext**:
   ```
   Text: "Join the founding circle."
   Font: Inter, regular (400)
   Size: lg (18px)
   Color: Cream muted (70% opacity)
   Margin bottom: 3rem
   ```

3. **CTA Form**:
   ```
   Same as hero section
   Email input + Primary button
   Centered
   ```

**Animation**:
```
Fade in on scroll
Duration: 500ms, premium easing
```

### Section 6: Header (Fixed)

**Purpose**: Persistent branding and navigation

**Layout**:
```
Position: fixed, top 0, full width
Z-index: 1000
Display: flex, justify-content: space-between, align-items: center
Padding: 1rem (mobile), 1.5rem (tablet), 2rem (desktop) horizontal
Height: 80px (default), 64px (scrolled)
Transition: height 300ms smooth, backdrop-filter 300ms smooth
```

**Background** (Scroll-aware):
```
Default (top of page):
  Background: rgba(15, 42, 68, 0.8) (navy 80% opacity)
  Backdrop filter: none
  
Scrolled (after 100px scroll):
  Background: rgba(15, 42, 68, 0.95) (navy 95% opacity)
  Backdrop filter: blur(10px) saturate(180%)
  Height: 64px (shrink slightly)
```

**Content**:

**Left: Logo**
```
Montenegro Select logo (gold variant)
Size: md (32px height) default, sm (24px) when scrolled
Transition: 300ms smooth
Click: Scroll to top
```

**Right: Language Toggle**
```
EN | ME component
Font: Inter, 14px, uppercase
See Component 4 specs
```

**Accessibility**:
- Semantic `<header>` element
- Skip to main content link (visible on focus)
- Keyboard navigable

### Section 7: Footer

**Purpose**: Legal links, contact, copyright

**Layout**:
```
Full width
Background: Navy darker (#071728)
Padding: 3rem horizontal, 3rem vertical (mobile)
         4rem horizontal, 4rem vertical (desktop)
Text align: center
```

**Content Structure** (Centered, vertical stack):

1. **Logo**:
   ```
   Montenegro Select logo (cream variant)
   Size: sm (24px height)
   Margin bottom: 2rem
   ```

2. **Links** (Horizontal row, centered):
   ```
   Links: Privacy Policy  •  Terms of Service  •  Contact
   
   Each link:
     Font: Inter, regular (400), sm (14px)
     Color: Cream muted (70% opacity)
     Hover: Cream full opacity, gold underline grows from center
     Transition: 300ms smooth
     Separator: Cream subtle (50% opacity), margin 0 1rem
   
   Contact:
     Text: "hello@montenegroselect.com"
     Link: mailto:hello@montenegroselect.com
   ```

3. **Copyright**:
   ```
   Text: "© 2026 Montenegro Select"
   Font: Inter, regular (400), xs (12px)
   Color: Cream subtle (50% opacity)
   Margin top: 2rem
   ```

**Responsive Behavior**:
- Desktop: Links in horizontal row
- Mobile (<640px): Stack links vertically, remove separators, 0.75rem gap

---

## Bi-Lingual Implementation

### Translation System Setup

**File Structure**:
```
/apps/guests/locales/
  - en.json    (English translations)
  - me.json    (Montenegrin Cyrillic translations)
```

**Translation File Example** (`en.json`):
```json
{
  "header": {
    "logoAlt": "Montenegro Select",
    "languageToggle": {
      "en": "EN",
      "me": "ME"
    }
  },
  "hero": {
    "headline": {
      "line1": "Your curated",
      "line2": "MONTENEGRO",
      "line3": "Experience"
    },
    "subheadline": "Private yachts. Hidden beach clubs. Exceptional dining. A curated network for tourists and expats seeking more.",
    "emailPlaceholder": "Enter your email",
    "cta": "Request Early Access",
    "microcopy": "Early members receive priority access."
  },
  "categories": {
    "sectionTitle": "Discover Your Experience",
    "yachts": "Yachts",
    "beachClubs": "Beach Clubs",
    "fineDining": "Fine Dining",
    "privateTours": "Private Tours",
    "mountainEscapes": "Mountain Escapes",
    "culturalEvenings": "Cultural Evenings"
  },
  "about": {
    "headline": "Not A Marketplace. A",
    "headlineEmphasized": "Network",
    "headlineSuffix": ".",
    "bullets": [
      "Personally selected partners",
      "Verified quality standards",
      "Exclusive benefits for members",
      "Designed for refined travel"
    ]
  },
  "social": {
    "primary": "Launching Soon in Kotor, Budva & Porto Montenegro",
    "secondary": "In collaboration with select partners across the Adriatic coast."
  },
  "finalCta": {
    "headline": "Membership Opens Soon",
    "subtext": "Join the founding circle."
  },
  "footer": {
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service",
    "contact": "hello@montenegroselect.com",
    "copyright": "© 2026 Montenegro Select"
  }
}
```

**Montenegrin Translation** (`me.json`):
```json
{
  "hero": {
    "headline": {
      "line1": "Ваше курирано",
      "line2": "ЦРНА ГОРА",
      "line3": "искуство"
    },
    "subheadline": "Приватне јахте. Скривени beach clubovi. Изузетна кулинарска искуства. Курирана мрежа за туристе и експате који траже више.",
    ...
  },
  ...
}
```

### Implementation Strategy

**React Context Pattern** (Recommended):
```typescript
// contexts/LanguageContext.tsx
type Language = 'en' | 'me'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string  // Translation function
}

// Load translations
import enTranslations from '../locales/en.json'
import meTranslations from '../locales/me.json'

// Provider wraps app
// Store language preference in localStorage
// t() function uses dot notation: t('hero.headline.line1')
```

**Usage in Components**:
```typescript
const { language, t } = useLanguage()

// Simple text
<h1>{t('hero.headline.line1')}</h1>

// Complex rendering with emphasis
<h2>
  {t('about.headline')} 
  <span className="text-gold">{t('about.headlineEmphasized')}</span>
  {t('about.headlineSuffix')}
</h2>

// Arrays
{t('about.bullets').map((bullet, index) => (
  <li key={index}>{bullet}</li>
))}
```

**Language Persistence**:
```typescript
// Store in localStorage
localStorage.setItem('mne-select-language', language)

// Load on mount
const storedLanguage = localStorage.getItem('mne-select-language') || 'en'

// Update <html lang=""> attribute
document.documentElement.lang = language
```

---

## Responsive Design Strategy

### Mobile-First Approach

**Philosophy**: Build for mobile first, enhance for larger screens

**Breakpoint Strategy**:
```
Mobile (<768px):
  - Single column layouts
  - Larger tap targets (44×44px minimum)
  - Full-width components
  - Stacked navigation
  - Font sizes: 3xl-4xl headlines, base body

Tablet (768-1023px):
  - Two-column where logical
  - Medium spacing
  - Font sizes: 4xl-5xl headlines, lg body

Desktop (≥1024px):
  - Multi-column layouts
  - Hover states active
  - Larger spacing
  - Font sizes: 5xl-7xl headlines, lg body
  - Max-width constraints (1440px)

Large Desktop (≥1440px):
  - Max-width maintained
  - Extra horizontal padding
  - Content centered
```

### Critical Responsive Patterns

**Hero Section**:
- Mobile: min-height 100vh, vertical center, tight padding
- Tablet: min-height 100vh, moderate sizing
- Desktop: min-height 100vh, large sizing, max-width 960px

**Experience Grid**:
- Mobile: Scroll 1-2 tiles at a time, 280px tile width
- Tablet: Scroll 2-3 tiles at a time, 320px tile width
- Desktop: Scroll 3-4 tiles at a time, 360px tile width, drag interaction

**About Section**:
- Mobile: Stack text → illustration
- Tablet: Stack or 60/40 split (test both)
- Desktop: 50/50 side-by-side

**Forms**:
- Mobile: Stack vertically, full-width inputs and buttons
- Desktop: Row layout, input grows, button fixed width

### Touch Target Guidelines

**Minimum Sizes**:
- Buttons: 44×44px (WCAG AAA)
- Input fields: 48px height
- Interactive tiles: 280px × 380px minimum
- Language toggle: 44×44px tap area (even if text is smaller)

**Spacing**:
- Minimum 8px between interactive elements
- Recommended 16px for comfort

---

## Animation & Interaction Guidelines

### Animation Triggers

**On Page Load**:
- Hero section content (staggered fade-in)
- Logo appearance

**On Scroll (IntersectionObserver)**:
- Section fade-ins (each major section)
- Coastline SVG drawing animation
- Social proof section

**On Hover (Desktop Only)**:
- Category tile image zoom + overlay darken + gold underline
- Button hover states (glow, slight brightness increase)
- Link hover states (gold underline grows from center)

**On Click/Tap**:
- Button press feedback (scale 0.98)
- Tile tap feedback (brief scale 0.98 on touch devices)

### Performance Considerations

**GPU-Accelerated Properties** (Use these):
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (sparingly)

**Avoid Animating** (Causes layout reflow):
- `width`, `height`
- `margin`, `padding`
- `top`, `left`, `right`, `bottom` (use transform instead)

**Optimization Techniques**:
```css
/* Add to animated elements */
.animated {
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Remove will-change after animation completes */
```

### Reduced Motion Support

**Critical Accessibility Requirement**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Graceful Degradation**:
- Fade-ins become instant appearances
- Slide animations become instant positioning
- Infinite loops pause
- Essential functionality remains intact

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Cream on navy: 11.8:1 ✓ (AAA compliant)
- Gold on navy (large text >24px): 4.89:1 ✓ (AA compliant for large text)
- Gold light on navy (small text <24px): 4.5:1+ ✓ (AA compliant)

**Keyboard Navigation**:
- All interactive elements focusable
- Logical tab order
- Visible focus indicators (3px gold ring)
- Skip to main content link
- Arrow keys for horizontal scroll navigation

**Screen Reader Support**:
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<article>`)
- ARIA labels on interactive elements without text
- Alt text on all images (including logo)
- Language attribute on `<html>` tag (updates with language toggle)
- Landmark regions labeled

**Focus Management**:
```css
*:focus-visible {
  outline: 3px solid #c2a24d; /* Gold */
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Form Accessibility**:
- Labels associated with inputs (explicit or aria-label)
- Error messages announced by screen readers (aria-live)
- Required fields indicated (aria-required)
- Validation messages clear and specific

### Testing Checklist

- [ ] Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Test keyboard-only navigation
- [ ] Test with browser zoom 200%
- [ ] Test with high contrast mode
- [ ] Validate HTML (no errors)
- [ ] Run Lighthouse accessibility audit (score 100)

---

## Implementation Sequence

Follow this sequence for efficient, systematic development. Each phase builds on the previous.

### Phase 1: Foundation Setup (2-3 hours)

**1.1 Design System Configuration**

- [ ] Update `/packages/design-system/tokens/index.ts` with Montenegro Select colors
  - Replace blue primary colors with gold palette
  - Replace generic secondary with navy palette
  - Add cream palette
  - Export accessible variants (gold.light for small text)

- [ ] Create font loading CSS in `/packages/design-system/fonts.css`:
  ```css
  @font-face {
    font-family: 'Inter';
    src: url('./assets/fonts/inter/inter-latin-wght-normal.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }
  
  @font-face {
    font-family: 'Inter';
    src: url('./assets/fonts/inter/inter-cyrillic-wght-normal.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
    unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
  }
  
  /* Repeat for Cormorant Garamond */
  ```

- [ ] Update `/packages/design-system/tailwind.config.ts`:
  - Add Montenegro Select color palette
  - Add typography scale
  - Add custom spacing
  - Add custom animation values
  - Export as shared config

- [ ] Update `/apps/guests/tailwind.config.ts`:
  - Import and extend shared config
  - Add content paths for app-specific components

**1.2 Translation System**

- [ ] Create `/apps/guests/locales/` directory
- [ ] Create `en.json` with all English translations (see Bi-Lingual section)
- [ ] Create `me.json` with all Montenegrin translations
- [ ] Create `/apps/guests/contexts/LanguageContext.tsx`:
  - React Context for language state
  - Translation function with dot notation support
  - localStorage persistence
  - HTML lang attribute updating

**1.3 Global Styles**

- [ ] Update `/apps/guests/app/globals.css`:
  - Import design system fonts
  - Set root CSS variables
  - Apply base styles (body, html)
  - Add utility classes for animations
  - Add reduced motion media query

**1.4 Testing**

- [ ] Verify fonts load correctly (check Network tab)
- [ ] Test language switching (localStorage persistence)
- [ ] Verify Tailwind classes generate correctly
- [ ] Check color contrast in browser DevTools

---

### Phase 2: Core Components (3-4 hours)

**2.1 Logo Component**

- [ ] Create `/packages/ui/src/components/Logo.tsx`
- [ ] Implement variant switcher (gold/cream)
- [ ] Implement size options (sm/md/lg)
- [ ] Load SVG from design system assets
- [ ] Add proper alt text
- [ ] Export from `/packages/ui/src/index.ts`

**2.2 Button Component**

- [ ] Update `/packages/ui/src/components/Button.tsx`
- [ ] Implement variants: primary (gold), outline, text link
- [ ] Implement sizes: sm, md, lg
- [ ] Add hover states (gold glow for primary)
- [ ] Add active state (scale 0.98)
- [ ] Add focus-visible styles (3px gold ring)
- [ ] Add loading state (for future backend integration)
- [ ] Ensure 44×44px minimum touch target
- [ ] Test keyboard accessibility

**2.3 Input Component**

- [ ] Create `/packages/ui/src/components/Input.tsx`
- [ ] Implement email input variant
- [ ] Style with cream background tint on navy
- [ ] Add focus state (gold border + glow)
- [ ] Add error state (error border + helper text)
- [ ] Set 16px font size (prevents mobile zoom)
- [ ] Ensure 48px height
- [ ] Add accessible labels (aria-label or htmlFor)
- [ ] Test validation UI (no backend yet)

**2.4 Language Toggle Component**

- [ ] Create `/apps/guests/components/LanguageToggle.tsx`
- [ ] Connect to LanguageContext
- [ ] Style: "EN | ME" format
- [ ] Active state: gold, semibold
- [ ] Inactive state: cream muted
- [ ] Hover: brighten inactive
- [ ] Click: instant language switch
- [ ] Ensure 44×44px tap target (add padding if needed)

**2.5 Component Testing**

- [ ] Create Storybook stories or test page
- [ ] Test all variants and states
- [ ] Test responsive behavior
- [ ] Test keyboard navigation
- [ ] Test with screen reader

---

### Phase 3: Layout Components (2-3 hours)

**3.1 Container Component**

- [ ] Create `/packages/ui/src/components/Container.tsx`
- [ ] Implement max-width constraint (1440px)
- [ ] Implement responsive padding (1.5rem mobile, 3rem tablet, 4rem desktop)
- [ ] Center content
- [ ] Export and test

**3.2 Section Component**

- [ ] Create `/packages/ui/src/components/Section.tsx`
- [ ] Implement responsive vertical padding (4rem mobile, 6rem tablet, 8rem desktop)
- [ ] Support background color prop
- [ ] Support custom className
- [ ] Export and test

**3.3 Header Component**

- [ ] Create `/apps/guests/components/Header.tsx`
- [ ] Implement fixed positioning
- [ ] Add Logo component (left, gold variant)
- [ ] Add LanguageToggle component (right)
- [ ] Implement scroll detection (add class after 100px scroll)
- [ ] Animate height shrink on scroll (80px → 64px)
- [ ] Add backdrop blur on scroll
- [ ] Ensure z-index 1000
- [ ] Test sticky behavior on scroll
- [ ] Add skip-to-content link (hidden until focused)

**3.4 Footer Component**

- [ ] Create `/apps/guests/components/Footer.tsx`
- [ ] Add Logo component (cream variant, sm size)
- [ ] Add navigation links (Privacy, Terms, Contact)
- [ ] Style links with hover states (gold underline grows)
- [ ] Add copyright text
- [ ] Implement responsive layout (row → stack)
- [ ] Use navy.darker background
- [ ] Test keyboard navigation

**3.5 Layout Testing**

- [ ] Test header scroll behavior
- [ ] Test responsive breakpoints
- [ ] Test keyboard tab order
- [ ] Verify z-index stacking

---

### Phase 4: Landing Page Sections (5-6 hours)

**4.1 Hero Section**

- [ ] Create `/apps/guests/components/sections/HeroSection.tsx`
- [ ] Implement full viewport height layout
- [ ] Add Logo component (centered, top)
- [ ] Implement three-line headline:
  - Line 1: Cormorant, cream
  - Line 2: "MONTENEGRO" - Futura/Inter bold, gold, widest letter-spacing
  - Line 3: Cormorant, cream
- [ ] Add subtle gold glow to "MONTENEGRO" (optional: text-shadow or filter)
- [ ] Add subheadline (cream muted, max-width 600px)
- [ ] Add email capture form (input + button)
- [ ] Add microcopy below form
- [ ] Implement staggered fade-in animations (use Framer Motion or CSS)
- [ ] Connect to translation context (all text)
- [ ] Test responsive sizing (3xl/5xl/7xl breakpoints)

**4.2 Email Capture Form Component**

- [ ] Create `/apps/guests/components/EmailCaptureForm.tsx`
- [ ] Layout: Flex row (desktop), column (mobile)
- [ ] Add Input component (email type, placeholder)
- [ ] Add Button component (primary gold, "Request Early Access")
- [ ] Add microcopy below
- [ ] Implement validation (UI only):
  - Check for required field
  - Check for email format (regex)
  - Show error messages
  - Shake animation on error
- [ ] Add onSubmit handler (console.log for now, no backend)
- [ ] Add loading state to button
- [ ] Test accessibility (labels, ARIA)

**4.3 Experience Grid Section**

- [ ] Create `/apps/guests/components/sections/ExperienceGridSection.tsx`
- [ ] Add optional section headline ("Discover Your Experience")
- [ ] Implement horizontal scroll container:
  - Hide scrollbar (CSS)
  - Enable smooth scroll
  - Add scroll-snap-type: x mandatory
- [ ] Add fade gradient overlays (left/right edges)
- [ ] Map 6 categories to Category tiles
- [ ] Implement responsive tile sizing (280/320/360px widths)
- [ ] Add keyboard support (arrow keys scroll horizontally)
- [ ] Test touch scrolling (momentum, snap)
- [ ] Test desktop drag-to-scroll (use library or custom implementation)

**4.4 Category Tile Component**

- [ ] Create `/apps/guests/components/CategoryTile.tsx`
- [ ] Implement portrait container (3:4 aspect ratio)
- [ ] Add placeholder background:
  - Navy (#0f2a44) background
  - Category name in gold, centered
  - OR subtle pattern/gradient
- [ ] Add gradient overlay (bottom to top)
- [ ] Add category title (gold, Cormorant, 2xl, centered bottom)
- [ ] Style hover state (desktop only):
  - Image/background scale(1.05)
  - Overlay darkens
  - Gold underline grows from center under title
  - 500ms premium easing
- [ ] Style touch device default state:
  - Partial gold accent (thin top border or subtle glow)
  - No hover effects
- [ ] Add tap feedback (scale 0.98 briefly)
- [ ] Implement scroll-snap-align: center
- [ ] Add ARIA attributes (role="button", aria-label)
- [ ] Test keyboard focus state

**4.5 About Section (What is Montenegro Select?)**

- [ ] Create `/apps/guests/components/sections/AboutSection.tsx`
- [ ] Implement two-column layout (responsive)
- [ ] Left column (text):
  - Headline: "Not A Marketplace. A Network." (emphasize "Network" in gold)
  - 4 bullet points (gold bullets, cream text, lg size)
  - Spacing: 1.5rem between bullets
- [ ] Right column (illustration):
  - Load SVG from design system assets (animation_outline.svg)
  - Set max-width 500px, max-height 400px
  - Gold stroke, no fill
- [ ] Implement coastline animation:
  - Trigger on scroll (IntersectionObserver, threshold 0.5)
  - Phase 1: Draw path (2s, stroke-dasharray/dashoffset)
  - Phase 2: Pulse loop (opacity 0.7 ↔ 1, 3s infinite)
- [ ] Implement responsive stacking (desktop side-by-side, mobile stack)
- [ ] Connect to translations
- [ ] Test animation trigger timing

**4.6 Social Proof Section**

- [ ] Create `/apps/guests/components/sections/SocialProofSection.tsx`
- [ ] Center text content (max-width 800px)
- [ ] Add primary statement (Cormorant, 2xl/3xl, emphasize location names in gold)
- [ ] Add secondary statement (Inter, lg, cream muted)
- [ ] Implement fade-in on scroll animation
- [ ] Connect to translations

**4.7 Final CTA Section**

- [ ] Create `/apps/guests/components/sections/FinalCTASection.tsx`
- [ ] Center content (max-width 600px)
- [ ] Add headline (Cormorant, bold, 4xl/5xl, gold)
- [ ] Add subtext (Inter, lg, cream muted)
- [ ] Add EmailCaptureForm component (reuse from hero)
- [ ] Implement fade-in on scroll
- [ ] Connect to translations

**4.8 Page Assembly**

- [ ] Update `/apps/guests/app/page.tsx`:
  - Import all section components
  - Assemble in order: Hero → Grid → About → Social → Final CTA
  - Wrap in proper semantic HTML (`<main>`)
- [ ] Add Header and Footer to layout
- [ ] Test full page scroll flow
- [ ] Test section spacing

---

### Phase 5: Animations & Polish (2-3 hours)

**5.1 Scroll Animations**

- [ ] Install Framer Motion or use Intersection Observer
- [ ] Implement fade-in on scroll for:
  - About section
  - Social proof section
  - Final CTA section
- [ ] Set appropriate thresholds (0.3-0.5 for triggering)
- [ ] Add stagger delays where appropriate
- [ ] Test animation performance (should be 60fps)

**5.2 Coastline SVG Animation**

- [ ] Calculate SVG path length (`getTotalLength()`)
- [ ] Implement stroke-dasharray animation:
  ```css
  stroke-dasharray: [pathLength];
  stroke-dashoffset: [pathLength] → 0;
  ```
- [ ] Add pulse animation (opacity loop)
- [ ] Ensure animation triggers once when section visible
- [ ] Test on different screen sizes

**5.3 Hover Effects (Desktop)**

- [ ] Implement category tile hover:
  - Image zoom (scale 1.05)
  - Overlay darken (navy 40% → 60%)
  - Gold underline growth (scaleX 0 → 1 from center)
  - Smooth transition (500ms premium easing)
- [ ] Implement button hover:
  - Primary: subtle gold glow (box-shadow)
  - Outline: fill gold, text to navy
  - Text link: gold color, underline grows
- [ ] Implement link hover (footer, language toggle):
  - Gold underline grows from center
  - Color transition to gold
- [ ] Test hover performance (should not cause reflow)

**5.4 Haptic Feedback (All Devices)**

- [ ] Add button press feedback:
  - Active state: transform scale(0.98)
  - Duration: 150ms
- [ ] Add tile tap feedback (touch devices):
  - Brief scale(0.98) on touchstart
  - Return to normal on touchend
- [ ] Test on actual touch devices

**5.5 Micro-Animations**

- [ ] Add loading spinner to button (for future backend)
- [ ] Add input shake animation on validation error
- [ ] Add smooth color transitions (300ms) to all interactive elements
- [ ] Test animation frame rates (aim for 60fps)

**5.6 Reduced Motion Support**

- [ ] Add `@media (prefers-reduced-motion: reduce)` styles
- [ ] Disable all animations, keep instant transitions
- [ ] Test with system preference enabled
- [ ] Ensure functionality remains intact

---

### Phase 6: Accessibility & Testing (2-3 hours)

**6.1 Keyboard Navigation**

- [ ] Test tab order through entire page
- [ ] Verify all interactive elements are focusable
- [ ] Test focus indicators (3px gold ring visible)
- [ ] Test skip-to-content link (appears on tab focus)
- [ ] Test arrow key scrolling in experience grid
- [ ] Test Enter key on tiles, buttons, links
- [ ] Test Escape key to close modals (if any)

**6.2 Screen Reader Testing**

- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Verify page structure (headings, landmarks)
- [ ] Verify image alt text (logo, illustrations)
- [ ] Verify ARIA labels on interactive elements
- [ ] Verify form labels and error announcements
- [ ] Verify language attribute updates on toggle
- [ ] Test category tiles are announced correctly

**6.3 Color Contrast Validation**

- [ ] Check all text/background combinations
- [ ] Verify cream on navy: ✓ (11.8:1)
- [ ] Verify gold on navy (large text): ✓ (4.89:1)
- [ ] Verify gold.light on navy (small text): ✓ (4.5:1+)
- [ ] Use browser DevTools or WAVE tool
- [ ] Fix any contrast issues

**6.4 Responsive Testing**

- [ ] Test on actual devices:
  - iPhone (Safari)
  - Android phone (Chrome)
  - iPad (Safari)
  - Desktop (Chrome, Firefox, Safari)
- [ ] Test breakpoints: 320px, 375px, 768px, 1024px, 1440px, 1920px
- [ ] Test landscape and portrait orientations
- [ ] Test with browser zoom: 100%, 150%, 200%
- [ ] Fix any layout breaks

**6.5 Cross-Browser Testing**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Test font rendering
- [ ] Test backdrop-filter support (fallback for unsupported)
- [ ] Test CSS scroll-snap support
- [ ] Test SVG animation

**6.6 Performance Testing**

- [ ] Run Lighthouse audit:
  - Performance: target 90+
  - Accessibility: target 100
  - Best Practices: target 100
  - SEO: target 100
- [ ] Check font loading performance (should be <500ms)
- [ ] Check image optimization (placeholders should be tiny)
- [ ] Check bundle size (aim for <200KB JS)
- [ ] Test on slow 3G network throttling

**6.7 Final QA Checklist**

- [ ] All text is translatable (no hardcoded strings)
- [ ] Language toggle persists on refresh
- [ ] Email validation works (UI only)
- [ ] All animations trigger correctly
- [ ] All hover states work (desktop)
- [ ] All touch states work (mobile/tablet)
- [ ] Footer links have proper href (even if placeholder)
- [ ] Logo links to home (scroll to top)
- [ ] No console errors
- [ ] No broken images/assets
- [ ] Page is fully responsive
- [ ] Accessibility score 100

---

## Development Best Practices

### Code Organization

**Component Structure**:
```
/components/
  /sections/        (Page sections: HeroSection, AboutSection, etc.)
  /ui/              (Shared UI: Button, Input, Logo, etc.)
  /layout/          (Header, Footer, Container, etc.)
```

**Naming Conventions**:
- Components: PascalCase (`HeroSection.tsx`)
- Utilities: camelCase (`formatEmail.ts`)
- CSS classes: kebab-case (`text-gold`, `hover:scale-105`)
- Translation keys: camelCase with dots (`hero.headline.line1`)

**File Structure**:
```typescript
// Component file structure
import statements
type definitions
main component function
export statement

// Keep components focused (single responsibility)
// Extract complex logic to hooks or utilities
// Keep files under 300 lines
```

### Performance Optimization

**Lazy Loading**:
```typescript
// For sections below the fold
const AboutSection = lazy(() => import('./sections/AboutSection'))
const SocialProofSection = lazy(() => import('./sections/SocialProofSection'))
```

**Image Optimization** (when real images added):
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/images/experiences/yachts.jpg"
  alt="Luxury yacht experience"
  width={1080}
  height={1440}
  placeholder="blur"
  loading="lazy"
/>
```

**Animation Performance**:
```typescript
// Use transform and opacity only
// Add will-change sparingly
// Remove will-change after animation
// Use requestAnimationFrame for JS animations
```

### Testing During Development

**Browser DevTools**:
- Lighthouse (audit each phase)
- Accessibility tab (contrast, ARIA)
- Network tab (font loading, asset sizes)
- Performance tab (frame rate, reflows)

**Quick Tests**:
- Tab through page (keyboard navigation)
- Toggle language (persistence check)
- Scroll through page (animation triggers)
- Resize browser (responsive breakpoints)
- Enable reduced motion (fallback behavior)

---

## Post-Implementation Tasks

### Documentation

- [ ] Document component APIs (props, usage examples)
- [ ] Create style guide reference page
- [ ] Document animation trigger points
- [ ] Create translation contribution guide

### Future Enhancements (Not Now)

- Connect email capture to backend (Supabase)
- Add real photography to category tiles
- Implement actual navigation to category pages
- Add analytics tracking
- Add SEO meta tags
- Create 404 page
- Add cookie consent (if needed)

---

## Common Issues & Solutions

### Font Loading Issues

**Problem**: Fonts not loading
**Solution**: Check file paths in CSS `@font-face`, verify .woff2 files exist, check network tab

**Problem**: FOUT (Flash of Unstyled Text)
**Solution**: Using `font-display: swap` is intentional, ensure fallback fonts closely match

### Animation Issues

**Problem**: Animations janky/stuttering
**Solution**: Only animate transform/opacity, add `will-change`, check frame rate in DevTools

**Problem**: Coastline animation not triggering
**Solution**: Check IntersectionObserver threshold, verify SVG path has stroke (no fill)

### Responsive Issues

**Problem**: Horizontal scroll on mobile
**Solution**: Check for fixed widths, use `overflow-x: hidden` on body if needed

**Problem**: Experience grid not scrolling smoothly
**Solution**: Verify CSS scroll-snap properties, test with different scroll behaviors

### Accessibility Issues

**Problem**: Focus indicators not visible
**Solution**: Check z-index stacking, ensure `:focus-visible` styles have sufficient contrast

**Problem**: Screen reader not announcing sections
**Solution**: Add proper ARIA landmarks, verify heading hierarchy (h1 → h2 → h3)

---

## Final Notes

**Development Time Estimate**: 16-22 hours of focused development

**Priority Order**:
1. Foundation and core components (get basics working)
2. Hero section (most important for first impression)
3. Experience grid (most complex interaction)
4. Remaining sections (faster to implement)
5. Polish and accessibility (critical for launch)

**Testing Throughout**:
- Test each component as you build it
- Don't wait until the end to test responsive behavior
- Run Lighthouse after each phase
- Fix accessibility issues immediately

**Remember**:
- This is a luxury brand - quality over speed
- Attention to detail matters (spacing, alignment, animations)
- Performance is a feature (fast load, smooth animations)
- Accessibility is non-negotiable (WCAG AA minimum)

**When in Doubt**:
- Refer to this document
- Check design system tokens for correct values
- Test on actual devices, not just browser resize
- Consult WCAG guidelines for accessibility questions

---

## Document Version

**Version**: 1.0  
**Last Updated**: 2026-02-13  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 completion

---

**Ready to build?** Follow the implementation sequence systematically. Test each phase before moving to the next. Focus on quality and attention to detail. The result will be a premium, accessible, high-converting landing page that positions Montenegro Select as the curated luxury network it is.
