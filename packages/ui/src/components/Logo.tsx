import React from 'react'

export interface LogoProps {
  variant?: 'gold' | 'cream'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Override the height derived from `size`. Width is automatically proportional (4:1 ratio)
   *  unless `width` is also specified. Prefer this over CSS rescaling to keep SVG sharp. */
  height?: number
  /** Override the width derived from `size`. Requires `height` to also be set. */
  width?: number
  className?: string
  onClick?: () => void
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 42,
  '2xl': 72, // 3x sm - for footer
}

export function Logo({ variant = 'gold', size = 'md', height: heightProp, width: widthProp, className = '', onClick }: LogoProps) {
  const logoSrc =
    variant === 'gold'
      ? '/logos/full_logo_gold.svg'
      : '/logos/full_logo_cream.svg'

  const height = heightProp ?? sizeMap[size]
  // Assuming logo has roughly 4:1 aspect ratio (adjust based on actual logo)
  const width = widthProp ?? height * 4

  const handleClick = onClick
    ? onClick
    : () => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-opacity duration-base hover:opacity-80 focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy rounded ${className}`}
      aria-label="Montenegro Select - Home"
      type="button"
    >
      <img
        src={logoSrc}
        alt="Montenegro Select"
        width={width}
        height={height}
        className="block transition-transform duration-base"
      />
    </button>
  )
}
