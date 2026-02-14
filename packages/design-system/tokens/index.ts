/**
 * Montenegro Select Design Tokens
 * Luxury brand design system - curated, exclusive, premium
 */

// BRAND COLORS - Use these exact values for brand consistency
export const colors = {
  // Gold - Primary brand color (logo, accents, CTAs)
  gold: {
    50: '#faf8f3',
    100: '#f5f0e3',
    200: '#ebe2c7',
    300: '#dccfa0',
    400: '#c2a24d', // PRIMARY - Logo, buttons, large headlines
    500: '#a88a3d',
    600: '#8b7232',
    700: '#6d5a28',
    800: '#4f411d',
    900: '#322912',
    DEFAULT: '#c2a24d',
    light: '#d4b366', // ACCESSIBLE variant for small text on navy (WCAG AA)
  },

  // Navy - Primary background color
  navy: {
    50: '#e8edf3',
    100: '#d1dbe7',
    200: '#a3b7cf',
    300: '#7593b7',
    400: '#476f9f',
    500: '#0f2a44', // PRIMARY - Main background
    600: '#0c2238',
    700: '#091a2c',
    800: '#061220',
    900: '#030914',
    DEFAULT: '#0f2a44',
    darker: '#071728', // For layering/depth
    glow: 'rgba(15, 42, 68, 0.6)', // For subtle backgrounds
  },

  // Cream - Primary text color
  cream: {
    50: '#fefefe',
    100: '#fcfcfb',
    200: '#f5f4f1',
    300: '#eeedea',
    400: '#e8e6e1', // PRIMARY - ALL body text
    500: '#d4d2cd',
    600: '#b8b6b1',
    700: '#9c9a95',
    800: '#7e7c79',
    900: '#5f5e5c',
    DEFAULT: '#e8e6e1',
    muted: 'rgba(232, 230, 225, 0.7)', // Secondary text
    subtle: 'rgba(232, 230, 225, 0.5)', // Disabled/hints
  },

  // Semantic colors
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
}

// TYPOGRAPHY SYSTEM - 1.25 modular scale for premium hierarchy
export const typography = {
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }], // 12px - Labels, microcopy
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px - Small UI, captions
    base: ['1rem', { lineHeight: '1.5rem' }], // 16px - Body text (PRIMARY)
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px - Large body
    xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px - Small headlines
    '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px - Section titles
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Page titles
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - Hero subheads
    '5xl': ['3rem', { lineHeight: '1' }], // 48px - Hero headlines
    '6xl': ['3.75rem', { lineHeight: '1' }], // 60px - Large hero (desktop)
    '7xl': ['4.5rem', { lineHeight: '1' }], // 72px - Statement text
  },
  fontWeight: {
    normal: 400, // Regular text
    medium: 500, // Emphasized text
    semibold: 600, // Subheadings
    bold: 700, // Headlines
  },
  letterSpacing: {
    tighter: '-0.025em', // Tight headlines
    tight: '-0.015em', // Display text
    normal: '0', // Body text (default)
    wide: '0.025em', // Uppercase UI
    wider: '0.05em', // Spaced headlines
    widest: '0.1em', // "MONTENEGRO" emphasis
  },
  fontFamily: {
    display: ['Cormorant Garamond', 'Georgia', 'serif'], // Headlines, hero text
    body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], // Body, UI elements
    brand: ['Futura', 'Inter', 'sans-serif'], // Logo, special brand moments
  },
}

// SPACING & LAYOUT
export const spacing = {
  // Component spacing
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
  '3xl': '6rem', // 96px
  '4xl': '8rem', // 128px

  // Section spacing (vertical rhythm)
  section: {
    mobile: '4rem', // 64px
    tablet: '6rem', // 96px
    desktop: '8rem', // 128px
  },
}

// CONTAINER SYSTEM
export const container = {
  padding: {
    mobile: '1.5rem', // 24px side padding
    tablet: '3rem', // 48px
    desktop: '4rem', // 64px
  },
  maxWidth: '1440px', // Max content width for large screens
}

// ANIMATION SYSTEM
export const animation = {
  duration: {
    fast: '150ms', // Quick micro-interactions
    base: '300ms', // Standard transitions (DEFAULT)
    slow: '500ms', // Deliberate animations
    slower: '700ms', // Hero/impactful moments
  },
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default (use for most)
    premium: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Luxury feel (slower start/end)
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful (rare)
    sharp: 'cubic-bezier(0.4, 0, 1, 1)', // Quick exit
  },
}

// COMPONENT DESIGN TOKENS
export const components = {
  button: {
    borderRadius: '0.375rem', // 6px
    padding: {
      sm: '0.5rem 1rem', // 8px 16px
      md: '0.75rem 1.5rem', // 12px 24px
      lg: '1rem 2rem', // 16px 32px
    },
  },
  input: {
    borderRadius: '0.375rem', // 6px
    padding: '0.875rem 1rem', // 14px 16px
    borderWidth: '1px',
    focusRing: '3px',
  },
  card: {
    borderRadius: '0.5rem', // 8px
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
  },
  overlay: {
    default: 'rgba(15, 42, 68, 0.4)', // Navy 40%
    hover: 'rgba(15, 42, 68, 0.6)', // Navy 60% (desktop only)
    gradient: 'linear-gradient(180deg, transparent 0%, rgba(15, 42, 68, 0.8) 100%)',
  },
}

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '4xl': '2rem',
  full: '9999px',
}
