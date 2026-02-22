/**
 * Shared icon components.
 * Each icon accepts standard SVG props so consumers can set size, color, className, etc.
 * Icons are purely decorative by default (aria-hidden="true"); pass aria-label to make them accessible.
 */

import React from 'react'

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

/**
 * Calendar icon — used in booking flows and scheduling UIs.
 * Renders a calendar grid with a highlighted date cell in gold.
 * Stroke/dot colors default to currentColor so the icon inherits its parent's text color.
 */
export function CalendarIcon({ size = 54, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 54 54"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* Body */}
      <rect x="5"  y="11" width="44" height="38" rx="5"
        stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.6" />
      {/* Header band */}
      <rect x="5"  y="11" width="44" height="14" rx="5"
        fill="currentColor"  fillOpacity="0.05" />
      {/* Binding posts */}
      <line x1="18" y1="6"  x2="18" y2="17"
        stroke="currentColor" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="6"  x2="36" y2="17"
        stroke="currentColor" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
      {/* Day dots row 1 */}
      <circle cx="15" cy="32" r="1.6" fill="currentColor" fillOpacity="0.25" />
      <circle cx="27" cy="32" r="1.6" fill="currentColor" fillOpacity="0.25" />
      <circle cx="39" cy="32" r="1.6" fill="currentColor" fillOpacity="0.25" />
      {/* Day dots row 2 */}
      <circle cx="15" cy="42" r="1.6" fill="currentColor" fillOpacity="0.25" />
      {/* Highlighted date — always gold */}
      <rect x="22" y="37" width="10" height="10" rx="2.5" fill="#c2a24d" opacity="0.9" />
      <circle cx="39" cy="42" r="1.6" fill="currentColor" fillOpacity="0.25" />
    </svg>
  )
}

/**
 * Padlock icon — used in payment and security UIs.
 * Defaults to size 16; fill is currentColor so it inherits text color.
 */
export function LockIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="11" width="16" height="11" rx="3" fill="currentColor" />
      <path
        d="M7.5 11V8a4.5 4.5 0 019 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
