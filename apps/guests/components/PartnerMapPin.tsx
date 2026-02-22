'use client'

/**
 * PartnerMapPin — branded gold map-pin SVG component.
 *
 * Designed to match the pin.png brand asset: teardrop silhouette with a
 * circular ring cutout, "Montenegro / SELECT" text arcing along the top,
 * and a speedboat silhouette (NPS public domain) in the inner window.  All geometry is
 * inline SVG so the element can be fully animated via CSS transforms
 * (scale, translate, opacity) with zero paint overhead.
 *
 * ViewBox: 0 0 260 340  (width × height in SVG units)
 * The pin tip is at the bottom-centre: (130, 330)
 */

import React from 'react'

interface PartnerMapPinProps {
  /** Forwarded to the root <svg> element for animation / sizing */
  style?: React.CSSProperties
  className?: string
  /** aria-label for the icon; defaults to 'Montenegro Select location pin' */
  label?: string
}

export function PartnerMapPin({
  style,
  className,
  label = 'Montenegro Select location pin',
}: PartnerMapPinProps) {
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

        {/* Main body: radial gold with upper-left highlight for 3-D sheen */}
        <radialGradient
          id="pmpin-body"
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

        {/* Right-side shadow to give body a sphere-like depth */}
        <linearGradient id="pmpin-shadow" x1="55%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#000" stopOpacity="0"    />
          <stop offset="100%" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>

        {/* Specular sheen – subtle oval highlight top-left */}
        <radialGradient
          id="pmpin-sheen"
          cx="32%"
          cy="28%"
          r="48%"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%"   stopColor="#fffae8" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#fffae8" stopOpacity="0"    />
        </radialGradient>

        {/* Beveled ring around the window */}
        <linearGradient id="pmpin-ring" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor="#f2dc8c" />
          <stop offset="40%"  stopColor="#d4b366" />
          <stop offset="70%"  stopColor="#a88a3d" />
          <stop offset="100%" stopColor="#6d5a28" />
        </linearGradient>

        {/* Inner window – dark navy depth, lighter near centre */}
        <radialGradient id="pmpin-window" cx="42%" cy="36%" r="68%">
          <stop offset="0%"   stopColor="#1e3d5c" />
          <stop offset="60%"  stopColor="#0c2238" />
          <stop offset="100%" stopColor="#030914" />
        </radialGradient>

        {/* Clip the yacht inside the window circle */}
        <clipPath id="pmpin-window-clip">
          <circle cx="130" cy="130" r="63" />
        </clipPath>

        {/* Arc path for "Montenegro" text */}
        <path
          id="pmpin-text-arc"
          d="M 52,126 A 78,78 0 1 1 208,126"
          fill="none"
        />

        {/* Arc path for "SELECT" text (slightly tighter radius) */}
        <path
          id="pmpin-select-arc"
          d="M 65,126 A 65,65 0 1 1 195,126"
          fill="none"
        />
      </defs>

      {/* ── Outer teardrop body ───────────────────────────────────────── */}
      {/*
        The shape: circle head (r≈108, centre 130,130) flowing into a
        pointed tail at (130,328).  Bezier control points give a smooth
        organic curve matching the pin.png silhouette.
      */}
      <path
        d="
          M 130 22
          C 188 22, 240 72, 240 132
          C 240 196, 190 252, 130 328
          C 70 252, 20 196, 20 132
          C 20 72, 72 22, 130 22
          Z
        "
        fill="url(#pmpin-body)"
      />

      {/* Right-side depth shadow overlay */}
      <path
        d="
          M 130 22
          C 188 22, 240 72, 240 132
          C 240 196, 190 252, 130 328
          C 70 252, 20 196, 20 132
          C 20 72, 72 22, 130 22
          Z
        "
        fill="url(#pmpin-shadow)"
      />

      {/* Upper-left specular sheen */}
      <path
        d="
          M 130 22
          C 188 22, 240 72, 240 132
          C 240 196, 190 252, 130 328
          C 70 252, 20 196, 20 132
          C 20 72, 72 22, 130 22
          Z
        "
        fill="url(#pmpin-sheen)"
      />

      {/* ── Inner window (navy circle) ────────────────────────────────── */}
      <circle cx="130" cy="130" r="64" fill="url(#pmpin-window)" />

      {/* ── Speedboat silhouette (NPS public domain, adapted) ──────────── */}
      {/*
        Source: https://commons.wikimedia.org/wiki/File:Speedboat_symbol.svg
        National Park Service, United States, 1982. Public domain.
        Original viewBox: 0 0 99.988 49.124

        Three original paths are used (water-wake path is omitted since the
        navy window circle already serves as the "sea"):
          • Hull  — wave-textured waterline + full above-water silhouette
          • Stern cabin — raised engine-housing protrusion
          • Windshield ring — cockpit opening circle

        Transform: translate(178, 110) scale(-0.9, 0.9)
          • scale(-0.9, …) flips the boat so the bow faces RIGHT
          • Combined with translate, maps original (0–100 × 0–40) →
            window (88–178 × 110–146), centred at (133, 128) inside r=63
      */}
      <g clipPath="url(#pmpin-window-clip)">
        <g transform="translate(178, 110) scale(-0.9, 0.9)">

          {/* Hull — full silhouette with wave-textured waterline bottom */}
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

          {/* Stern engine-housing — raised protrusion behind the cockpit */}
          <path
            d="M76.568,13.194l16.928,1.321l-1.275-8.649
               l-12.43-0.881c-3.361-0.162-2.875,3.2-2.875,3.2Z"
            fill="#d4b366"
            opacity="0.9"
          />

          {/* Windshield ring — dark fill to read as cockpit opening */}
          <path
            d="M45.172,11.223c3.107,0,5.611-2.504,5.611-5.611
               S48.279,0,45.172,0s-5.611,2.505-5.611,5.612
               S42.064,11.223,45.172,11.223Z"
            fill="#061a2e"
            opacity="0.88"
          />

          {/* Sheer-line highlight — thin bright strip along the deck edge */}
          <path
            d="M0.001,9.786L23.05,11.687l4.661,0.417
               c-3.54,3.575-7.08,7.138-10.62,10.713l0.8,0.067Z"
            fill="#f5e08a"
            opacity="0.4"
          />

        </g>
      </g>

      {/* ── Beveled ring border around the window ────────────────────── */}
      <circle
        cx="130"
        cy="130"
        r="80"
        fill="none"
        stroke="url(#pmpin-ring)"
        strokeWidth="16"
      />

      {/* Fine inner-edge highlight on the ring */}
      <circle
        cx="130"
        cy="130"
        r="64"
        fill="none"
        stroke="rgba(242,220,140,0.28)"
        strokeWidth="1.5"
      />

      {/* Fine outer-edge shadow on the ring */}
      <circle
        cx="130"
        cy="130"
        r="88"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1"
      />

      {/* ── Text: "Montenegro" arcing along the top of the ring ─────── */}
      <text
        fill="#f5e08a"
        fontSize="15.5"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontWeight="500"
        letterSpacing="0.8"
      >
        <textPath href="#pmpin-text-arc" startOffset="25%">
          Montenegro
        </textPath>
      </text>

      {/* ── Text: "SELECT" smaller tracked caps below ─────────────────── */}
      <text
        fill="#d4b366"
        fontSize="7"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="600"
        letterSpacing="4"
      >
        <textPath href="#pmpin-select-arc" startOffset="30%">
          SELECT
        </textPath>
      </text>

      {/* ── Fine bottom-tip edge line for polish ──────────────────────── */}
      <path
        d="M 116 308 C 122 322, 138 322, 144 308"
        fill="none"
        stroke="rgba(242,220,140,0.2)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  )
}
