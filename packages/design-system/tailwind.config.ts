import type { Config } from 'tailwindcss'
import { colors, typography, spacing, animation, borderRadius } from './tokens'

const config: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      // Montenegro Select Brand Colors
      colors: {
        gold: colors.gold,
        navy: colors.navy,
        cream: colors.cream,
        // Keep semantic colors
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
      },

      // Typography System
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize as any,
      fontWeight: typography.fontWeight as any,
      letterSpacing: typography.letterSpacing,

      // Spacing & Layout
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        '2xl': spacing['2xl'],
        '3xl': spacing['3xl'],
        '4xl': spacing['4xl'],
        '128': '32rem',
        '144': '36rem',
      },

      // Border Radius
      borderRadius: {
        ...borderRadius,
      },

      // Animation
      transitionDuration: animation.duration,
      transitionTimingFunction: animation.easing,

      // Container
      container: {
        center: true,
        padding: {
          DEFAULT: '1.5rem', // mobile
          sm: '1.5rem',
          md: '3rem', // tablet
          lg: '4rem', // desktop
          xl: '4rem',
          '2xl': '4rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1440px',
        },
      },

      // Responsive Breakpoints
      screens: {
        sm: '640px', // Mobile landscape
        md: '768px', // Tablet portrait
        lg: '1024px', // Tablet landscape / Small desktop
        xl: '1280px', // Desktop
        '2xl': '1440px', // Large desktop
      },

      // Box Shadows (for components)
      boxShadow: {
        'card-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card-md': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'card-lg': '0 8px 32px rgba(0, 0, 0, 0.2)',
        gold: '0 0 20px rgba(194, 162, 77, 0.3)',
        'gold-lg': '0 0 40px rgba(194, 162, 77, 0.4)',
      },

      // Background Images (for overlays)
      backgroundImage: {
        'overlay-gradient':
          'linear-gradient(180deg, transparent 0%, rgba(15, 42, 68, 0.8) 100%)',
      },

      // Keyframes for animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'underline-grow': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in-up': 'fade-in-up 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-in-right': 'slide-in-right 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'scale-in': 'scale-in 500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        pulse: 'pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'underline-grow': 'underline-grow 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
}

export default config
