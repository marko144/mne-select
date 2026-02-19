'use client'

import React from 'react'

export interface CarouselDotsProps {
  /** Total number of dots (e.g. number of pages or items) */
  count: number
  /** Index of the currently active dot (0-based) */
  activeIndex: number
  /** Additional class for the container */
  className?: string
}

/**
 * Dot navigation for horizontal carousels.
 * Indicates scrollability and current scroll position.
 * Uses design system colors (cream/gold on navy).
 */
export function CarouselDots({
  count,
  activeIndex,
  className = '',
}: CarouselDotsProps) {
  if (count <= 1) return null

  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-2 py-4 ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={`block rounded-full transition-all duration-base ${
            i === activeIndex
              ? 'w-2.5 h-2.5 bg-gold'
              : 'w-2 h-2 bg-cream/40 hover:bg-cream/60'
          }`}
        />
      ))}
    </div>
  )
}
