'use client'

/**
 * PartnerMapPin — branded gold map-pin SVG component.
 *
 * Renders a teardrop silhouette with a circular ring cutout,
 * "Montenegro / SELECT" text arcing along the top, and a service-specific
 * icon inside the window.
 *
 * IMPORTANT: Pass a unique `uid` whenever multiple instances are rendered
 * simultaneously — each instance uses `uid` as a prefix for its SVG defs
 * (gradients, clipPaths) to prevent ID collisions across instances.
 *
 * ViewBox: 0 0 260 340  (width × height in SVG units)
 * Pin tip is at the bottom-centre: (130, 330)
 * Window circle: centre (130, 130), r = 63
 */

import React from 'react'
import type { ServiceType } from '../lib/bay-of-kotor-map'

interface PartnerMapPinProps {
  /**
   * Unique string appended to all SVG def IDs to prevent conflicts when
   * multiple pins are mounted at the same time.  E.g. 'm0', 'm1', …
   */
  uid: string
  /** Which service icon to show inside the pin window */
  serviceType?: ServiceType
  /** Forwarded to the root <svg> element for animation / sizing */
  style?: React.CSSProperties
  className?: string
  /** aria-label; defaults to 'Montenegro Select location pin' */
  label?: string
}

// ---------------------------------------------------------------------------
// Service icons
// All icons are designed for the window circle: centre (130, 130), r = 63.
// They use the shared clipPath id passed in via the `clip` prop.
// ---------------------------------------------------------------------------

function MarinaIcon({ clip }: { clip: string }) {
  /**
   * NPS public-domain speedboat silhouette.
   * Source: https://commons.wikimedia.org/wiki/File:Speedboat_symbol.svg
   * (National Park Service, United States, 1982 — public domain)
   *
   * Original viewBox: 0 0 99.988 49.124
   * Transform: translate(178, 110) scale(-0.9, 0.9)
   *   • negative x-scale flips the boat so the bow faces right
   *   • maps original coords to window space (88–178 × 110–146)
   */
  return (
    <g clipPath={`url(#${clip})`}>
      <g transform="translate(178, 110) scale(-0.9, 0.9)">
        <path
          d="M10.529,32.846c0.719-0.208,1.415-0.486,2.064-0.788
             c1.809-0.835,3.803-1.322,5.913-1.322c2.11,0,4.104,0.487,5.913,1.322
             c1.739,0.788,3.664,1.252,5.705,1.252s3.988-0.464,5.75-1.252
             c1.785-0.835,3.78-1.322,5.89-1.322c2.109,0,4.127,0.487,5.912,1.322
             c1.739,0.788,3.688,1.252,5.729,1.252c2.04,0,3.988-0.464,5.75-1.252
             c1.785-0.835,3.803-1.322,5.89-1.322c2.11,0,4.128,0.487,5.913,1.322
             c1.738,0.788,3.71,1.252,5.728,1.252c2.04,0,3.988-0.464,5.751-1.252
             c1.785-0.835,3.803-1.322,5.912-1.322c2.088,0,4.104,0.487,5.891,1.322
             c1.738,0.788,3.687,1.252,5.727,1.252
             l-1.901-15.339l-70.375-5.89l10.62-10.713l-4.661-0.417
             L23.05,11.687L0.001,9.786
             C-0.138,17.646,8.627,30.713,10.529,32.846Z"
          fill="#c2a24d"
          opacity="0.95"
        />
        <path
          d="M76.568,13.194l16.928,1.321l-1.275-8.649
             l-12.43-0.881c-3.361-0.162-2.875,3.2-2.875,3.2Z"
          fill="#d4b366"
          opacity="0.9"
        />
        <path
          d="M45.172,11.223c3.107,0,5.611-2.504,5.611-5.611
             S48.279,0,45.172,0s-5.611,2.505-5.611,5.612
             S42.064,11.223,45.172,11.223Z"
          fill="#061a2e"
          opacity="0.88"
        />
        <path
          d="M0.001,9.786L23.05,11.687l4.661,0.417
             c-3.54,3.575-7.08,7.138-10.62,10.713l0.8,0.067Z"
          fill="#f5e08a"
          opacity="0.4"
        />
      </g>
    </g>
  )
}

function CarIcon({ clip }: { clip: string }) {
  /**
   * Side-profile luxury car silhouette.
   * Bounding box ≈ 96 × 50 px, centred at (130, 126) inside the r=63 window.
   *
   *  Body (chassis): wide rounded rect at bottom
   *  Cabin:          arched trapezoidal roofline above the body
   *  Windows:        dark rect and raked rear window
   *  Wheels:         two gold rings with dark hubs
   */
  return (
    <g clipPath={`url(#${clip})`}>
      {/* Chassis — flat bed of the car */}
      <rect x="82" y="133" width="96" height="16" rx="4" fill="#c2a24d" opacity="0.95" />

      {/* Cabin — arched roofline */}
      <path
        d="M 100 133 L 106 110 C 112 103, 154 103, 160 110 L 162 133 Z"
        fill="#c2a24d"
        opacity="0.95"
      />

      {/* Main side window (dark) */}
      <rect x="108" y="107" width="42" height="25" rx="2" fill="#061a2e" opacity="0.88" />

      {/* Raked rear window */}
      <path
        d="M 157 132 L 158 108 C 160 104, 162 107, 162 113 L 162 132 Z"
        fill="#061a2e"
        opacity="0.75"
      />

      {/* Windscreen pillar highlight */}
      <rect x="106" y="107" width="3" height="26" rx="1" fill="#d4b366" opacity="0.5" />

      {/* Left wheel — gold ring + dark hub */}
      <circle cx="104" cy="149" r="13" fill="#c2a24d" opacity="0.95" />
      <circle cx="104" cy="149" r="6"  fill="#061a2e" />
      <circle cx="104" cy="149" r="3"  fill="#a88a3d" opacity="0.6" />

      {/* Right wheel */}
      <circle cx="156" cy="149" r="13" fill="#c2a24d" opacity="0.95" />
      <circle cx="156" cy="149" r="6"  fill="#061a2e" />
      <circle cx="156" cy="149" r="3"  fill="#a88a3d" opacity="0.6" />

      {/* Roofline highlight */}
      <path
        d="M 108 110 C 118 104, 148 104, 158 110 L 156 112 C 146 106, 120 106, 110 112 Z"
        fill="#f5e08a"
        opacity="0.3"
      />
    </g>
  )
}

function BeachClubIcon({ clip }: { clip: string }) {
  /**
   * Classic beach umbrella silhouette.
   *
   *  Canopy:  wide arc from (83, 118) to (177, 118), peak at (130, 95)
   *  Pole:    thin rect from the canopy apex down to (130, 162)
   *  Accent:  a lighter sector on the right half of the canopy
   *  Tip:     small circle at the canopy apex
   */
  return (
    <g clipPath={`url(#${clip})`}>
      {/* Canopy — main arc (half-ellipse, open at bottom) */}
      <path
        d="M 83 118 C 83 94, 177 94, 177 118 Z"
        fill="#c2a24d"
        opacity="0.95"
      />

      {/* Accent sector — lighter stripe (rightward third of canopy) */}
      <path
        d="M 130 118 L 130 94 C 148 93, 168 103, 170 118 Z"
        fill="#f0d878"
        opacity="0.45"
      />

      {/* Second accent stripe */}
      <path
        d="M 130 118 L 130 94 C 113 93, 93 103, 90 118 Z"
        fill="#d4b366"
        opacity="0.3"
      />

      {/* Canopy tip circle */}
      <circle cx="130" cy="94" r="4" fill="#f5e08a" opacity="0.9" />

      {/* Pole */}
      <rect x="128.5" y="118" width="3" height="45" rx="1.5" fill="#c2a24d" opacity="0.95" />

      {/* Pole base stake */}
      <rect x="126" y="163" width="8" height="5" rx="2" fill="#a88a3d" opacity="0.7" />
    </g>
  )
}

function RestaurantIcon({ clip }: { clip: string }) {
  /**
   * Classic fork-and-knife dining icon.
   *
   *  Fork (left,  x≈112):  3 tines + handle
   *  Knife (right, x≈148): tapered blade + handle
   *  Both point upward, centred in the window.
   */
  return (
    <g clipPath={`url(#${clip})`} fill="#c2a24d" opacity="0.95">
      {/* ── Fork ─────────────────────────────────────────────── */}
      {/* Tine 1 */}
      <rect x="106.5" y="103" width="2.5" height="28" rx="1.25" />
      {/* Tine 2 */}
      <rect x="111"   y="103" width="2.5" height="28" rx="1.25" />
      {/* Tine 3 */}
      <rect x="115.5" y="103" width="2.5" height="28" rx="1.25" />
      {/* Neck — connects tines to handle */}
      <rect x="106.5" y="129" width="11.5" height="5" rx="1" />
      {/* Handle */}
      <rect x="108.5" y="132" width="7" height="26" rx="3.5" />

      {/* ── Knife ────────────────────────────────────────────── */}
      {/* Blade — slightly tapered */}
      <path d="M 145 131 L 146 103 L 152 105 L 152 131 Z" />
      {/* Bolster (guard) */}
      <rect x="144" y="129" width="9" height="5" rx="1" fill="#d4b366" />
      {/* Handle */}
      <rect x="145.5" y="132" width="7" height="26" rx="3.5" />
    </g>
  )
}

function TourGuideIcon({ clip }: { clip: string }) {
  /**
   * Binoculars silhouette — two circular lenses connected by a bridge.
   *
   *  Left lens:  cx=108, cy=128, r=20 (gold ring) + r=13 (dark window)
   *  Right lens: cx=152, cy=128, r=20 (gold ring) + r=13 (dark window)
   *  Bridge:     rect x=121–139, y=120–130
   *  Focus dial: small circle at the centre of the bridge
   */
  return (
    <g clipPath={`url(#${clip})`}>
      {/* Left lens body */}
      <circle cx="108" cy="128" r="20" fill="#c2a24d" opacity="0.95" />
      {/* Left lens glass (dark) */}
      <circle cx="108" cy="128" r="13" fill="#061a2e" opacity="0.92" />
      {/* Left reflection highlight */}
      <circle cx="103" cy="122" r="3.5" fill="#f5e08a" opacity="0.45" />

      {/* Right lens body */}
      <circle cx="152" cy="128" r="20" fill="#c2a24d" opacity="0.95" />
      {/* Right lens glass (dark) */}
      <circle cx="152" cy="128" r="13" fill="#061a2e" opacity="0.92" />
      {/* Right reflection highlight */}
      <circle cx="147" cy="122" r="3.5" fill="#f5e08a" opacity="0.45" />

      {/* Bridge connecting the two lenses */}
      <rect x="121" y="121" width="18" height="10" rx="3" fill="#c2a24d" opacity="0.95" />

      {/* Focus dial */}
      <circle cx="130" cy="119" r="6"   fill="#d4b366" opacity="0.9" />
      <circle cx="130" cy="119" r="3.5" fill="#061a2e" opacity="0.85" />
      <circle cx="130" cy="119" r="1.5" fill="#a88a3d" opacity="0.7" />

      {/* Outer eyecup lips */}
      <circle cx="108" cy="128" r="20" fill="none" stroke="#d4b366" strokeWidth="1.5" opacity="0.6" />
      <circle cx="152" cy="128" r="20" fill="none" stroke="#d4b366" strokeWidth="1.5" opacity="0.6" />
    </g>
  )
}

function WindowIcon({
  uid,
  serviceType = 'marina',
}: {
  uid: string
  serviceType: ServiceType
}) {
  const clip = `${uid}-window-clip`
  switch (serviceType) {
    case 'marina':      return <MarinaIcon clip={clip} />
    case 'car-rental':  return <CarIcon clip={clip} />
    case 'beach-club':  return <BeachClubIcon clip={clip} />
    case 'restaurant':  return <RestaurantIcon clip={clip} />
    case 'tour-guide':  return <TourGuideIcon clip={clip} />
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PartnerMapPin({
  uid,
  serviceType = 'marina',
  style,
  className,
  label = 'Montenegro Select location pin',
}: PartnerMapPinProps) {
  const p = uid // prefix for all SVG def IDs

  return (
    <svg
      viewBox="0 0 260 340"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      overflow="visible"
      role="img"
      aria-label={label}
    >
      <defs>
        {/* ── Gradients ─────────────────────────────────────────────── */}

        <radialGradient
          id={`${p}-body`}
          cx="34%"
          cy="26%"
          r="74%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#f5e08a" />
          <stop offset="20%"  stopColor="#d4b366" />
          <stop offset="50%"  stopColor="#c2a24d" />
          <stop offset="78%"  stopColor="#8b7232" />
          <stop offset="100%" stopColor="#4f411d" />
        </radialGradient>

        <linearGradient id={`${p}-shadow`} x1="55%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>

        <radialGradient
          id={`${p}-sheen`}
          cx="32%"
          cy="28%"
          r="48%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#fffae8" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#fffae8" stopOpacity="0"    />
        </radialGradient>

        <linearGradient id={`${p}-ring`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#f2dc8c" />
          <stop offset="40%"  stopColor="#d4b366" />
          <stop offset="70%"  stopColor="#a88a3d" />
          <stop offset="100%" stopColor="#6d5a28" />
        </linearGradient>

        <radialGradient id={`${p}-window`} cx="42%" cy="36%" r="68%">
          <stop offset="0%"   stopColor="#1e3d5c" />
          <stop offset="60%"  stopColor="#0c2238" />
          <stop offset="100%" stopColor="#030914" />
        </radialGradient>

        <clipPath id={`${p}-window-clip`}>
          <circle cx="130" cy="130" r="63" />
        </clipPath>

        <path
          id={`${p}-text-arc`}
          d="M 52,126 A 78,78 0 1 1 208,126"
          fill="none"
        />
        <path
          id={`${p}-select-arc`}
          d="M 65,126 A 65,65 0 1 1 195,126"
          fill="none"
        />
      </defs>

      {/* ── Outer teardrop body ─────────────────────────────────────── */}
      <path
        d="M 130 22 C 188 22,240 72,240 132 C 240 196,190 252,130 328
           C 70 252,20 196,20 132 C 20 72,72 22,130 22 Z"
        fill={`url(#${p}-body)`}
      />
      <path
        d="M 130 22 C 188 22,240 72,240 132 C 240 196,190 252,130 328
           C 70 252,20 196,20 132 C 20 72,72 22,130 22 Z"
        fill={`url(#${p}-shadow)`}
      />
      <path
        d="M 130 22 C 188 22,240 72,240 132 C 240 196,190 252,130 328
           C 70 252,20 196,20 132 C 20 72,72 22,130 22 Z"
        fill={`url(#${p}-sheen)`}
      />

      {/* ── Inner window (navy circle) ──────────────────────────────── */}
      <circle cx="130" cy="130" r="64" fill={`url(#${p}-window)`} />

      {/* ── Service icon inside the window ─────────────────────────── */}
      <WindowIcon uid={uid} serviceType={serviceType} />

      {/* ── Beveled ring border ─────────────────────────────────────── */}
      <circle
        cx="130" cy="130" r="80"
        fill="none"
        stroke={`url(#${p}-ring)`}
        strokeWidth="16"
      />

      {/* Fine inner-edge highlight */}
      <circle
        cx="130" cy="130" r="64"
        fill="none"
        stroke="rgba(242,220,140,0.28)"
        strokeWidth="1.5"
      />

      {/* Fine outer-edge shadow */}
      <circle
        cx="130" cy="130" r="88"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1"
      />

      {/* ── "Montenegro" arc text ───────────────────────────────────── */}
      <text
        fill="#f5e08a"
        fontSize="15.5"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontWeight="500"
        letterSpacing="0.8"
      >
        <textPath href={`#${p}-text-arc`} startOffset="25%">
          Montenegro
        </textPath>
      </text>

      {/* ── "SELECT" small-caps text ────────────────────────────────── */}
      <text
        fill="#d4b366"
        fontSize="7"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="600"
        letterSpacing="4"
      >
        <textPath href={`#${p}-select-arc`} startOffset="30%">
          SELECT
        </textPath>
      </text>

      {/* Fine bottom-tip edge line */}
      <path
        d="M 116 308 C 122 322,138 322,144 308"
        fill="none"
        stroke="rgba(242,220,140,0.2)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}
