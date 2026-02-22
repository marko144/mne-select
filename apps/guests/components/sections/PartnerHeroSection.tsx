'use client'

/**
 * PartnerHeroSection — animated hero for the /partner page.
 *
 * ANIMATION SEQUENCE (desktop):
 *  1. Dark navy + gold spotlight fades in from top-centre.
 *  2-11. Five branded map pins appear one-at-a-time, large and centre-stage,
 *        each illuminated by the spotlight.  Each pin peels off and lands on
 *        its designated location on the Bay of Kotor map:
 *          0 – Marina      → Seljanovo
 *          1 – Car Rental  → Tivat Airport
 *          2 – Beach Club  → Luštica Bay
 *          3 – Restaurant  → Kotor
 *          4 – Tour Guide  → Perast
 *  12. Gold connecting lines draw between all landed pins (full mesh, 10 lines).
 *  13. Headline + sub-headline clip in.
 *  14. CTA button fades in.
 *
 * MOBILE:
 *  Only the first pin (Marina) does the full appear-at-centre sequence.
 *  Pins 1-4 appear directly on the map with a simple fade.
 *  Connecting lines and text animate as on desktop.
 *
 * Respects prefers-reduced-motion by jumping to the complete state.
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { PartnerApplyModal } from '../PartnerApplyModal'
import { PartnerMapPin } from '../PartnerMapPin'
import {
  BOK_LAND_PATHS,
  BOK_STROKE_PATHS,
  BOK_PLACES,
  BOK_MARKERS,
  BOK_INNER_VIEWBOX,
} from '../../lib/bay-of-kotor-map'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

/** Animation phase durations (ms) — "snappy" preset */
const TIMING = {
  lightAppear:  600,   // spotlight fades in
  m0Appear:     250,   // first pin appears large (dramatic light-reveal)
  m0Land:       250,   // first pin lands + map fades in
  markerGap:    0,     // next pin appears the moment the previous one lands
  mAppear:      200,   // pins 1-4 appear large at centre
  mLand:        300,   // pins 1-4 travel to their map positions
  textReveal:   1000,  // headline slide reveal
  ctaFade:      700,   // CTA button fade
} as const

/** Scale applied when a pin "lands" on the map */
const FINAL_SCALE = 0.25

/** Fallback pin dimensions when the ref is unavailable */
const PIN_W_FALLBACK = 400
const PIN_H_FALLBACK = Math.round(PIN_W_FALLBACK * (340 / 260))

/** Only show place labels at these priority levels */
const MAX_LABEL_PRIORITY = 2

// ---------------------------------------------------------------------------
// Phase definitions
// ---------------------------------------------------------------------------

const ALL_PHASES = [
  'idle',
  'light-appear',
  'm0-appear', 'm0-land',
  'm1-appear', 'm1-land',
  'm2-appear', 'm2-land',
  'm3-appear', 'm3-land',
  'm4-appear', 'm4-land',
  'text-reveal',
  'cta-slide',
  'complete',
] as const

type Phase = typeof ALL_PHASES[number]

// ---------------------------------------------------------------------------
// Utility hooks
// ---------------------------------------------------------------------------

function usePrefersReducedMotion() {
  const [pref, setPref] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPref(mq.matches)
    const h = () => setPref(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return pref
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesktop(mq.matches)
    const h = () => setDesktop(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desktop
}

// ---------------------------------------------------------------------------
// Derived phase helpers
// ---------------------------------------------------------------------------

function phaseIndex(p: Phase): number {
  return ALL_PHASES.indexOf(p)
}

function markerAppearIdx(i: number): number {
  return phaseIndex(`m${i}-appear` as Phase)
}

function markerLandIdx(i: number): number {
  return phaseIndex(`m${i}-land` as Phase)
}

// ---------------------------------------------------------------------------
// Bay of Kotor map sub-component
// ---------------------------------------------------------------------------

/** Labels filtered to priority 1-2 and deduplicated by name */
const displayedPlaces = Array.from(
  new Map(
    BOK_PLACES.filter((p) => p.priority <= MAX_LABEL_PRIORITY).map((p) => [p.name, p])
  ).values()
)

interface BayOfKotorMapProps {
  markerRefs: React.RefObject<(SVGCircleElement | null)[]>
  showLabels: boolean
}

function BayOfKotorMap({ markerRefs, showLabels }: BayOfKotorMapProps) {
  return (
    <svg
      viewBox={BOK_INNER_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      aria-label="Bay of Kotor map"
      role="img"
    >
      {/* ── Land polygons ────────────────────────────────────────────── */}
      {BOK_LAND_PATHS.map((d, i) => (
        <path key={i} d={d} fill="#0d2540" />
      ))}

      {/* ── Coastline strokes (gold) ─────────────────────────────────── */}
      {BOK_STROKE_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="rgba(194,162,77,0.48)"
          strokeWidth="0.9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {/* ── Place labels ─────────────────────────────────────────────── */}
      <g
        style={{
          opacity: showLabels ? 1 : 0,
          transition: `opacity 600ms ${easeOut} 400ms`,
        }}
      >
        {displayedPlaces.map((place) => (
          <g key={place.name}>
            <circle cx={place.x} cy={place.y} r={2.5} fill="rgba(232,230,225,0.55)" />
            <text
              x={place.x}
              y={place.y - 7}
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize={8}
              fontWeight="400"
              fill="rgba(232,230,225,0.55)"
            >
              {place.name}
            </text>
          </g>
        ))}
      </g>

      {/* ── Invisible marker anchors — used for getBoundingClientRect ── */}
      {BOK_MARKERS.map((m, i) => (
        <circle
          key={m.id}
          ref={(el) => {
            if (markerRefs.current) markerRefs.current[i] = el
          }}
          cx={m.x}
          cy={m.y}
          r={8}
          fill="transparent"
          stroke="none"
          aria-hidden="true"
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Hero text sub-components
// ---------------------------------------------------------------------------

function DesktopHeroText({
  showText,
  t,
  onApply,
}: {
  showText: boolean
  t: (k: string) => string
  onApply: () => void
}) {
  return (
    <div className="flex flex-col space-y-5 items-start text-left">
      {/* Headline — slides in from the left */}
      <h1
        className="font-display text-cream text-3xl md:text-4xl lg:text-5xl font-medium leading-tight"
        style={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateX(0)' : 'translateX(-44px)',
          transition: `opacity ${TIMING.textReveal}ms ${easeOut}, transform ${TIMING.textReveal}ms ${easeOut}`,
        }}
      >
        {t('partner.hero.headline')}
      </h1>
      {/* Subheadline — slides in from the right */}
      <p
        className="text-cream-muted text-xl md:text-2xl leading-relaxed"
        style={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateX(0)' : 'translateX(44px)',
          transition: `opacity ${TIMING.textReveal}ms ${easeOut} 60ms, transform ${TIMING.textReveal}ms ${easeOut} 60ms`,
        }}
      >
        {t('partner.hero.subheadline')}
      </p>
      {/* CTA — slides in from the left, slightly behind the headline */}
      <div
        style={{
          opacity: showText ? 1 : 0,
          transform: showText ? 'translateX(0)' : 'translateX(-44px)',
          transition: `opacity ${TIMING.ctaFade}ms ${easeOut} 130ms, transform ${TIMING.ctaFade}ms ${easeOut} 130ms`,
        }}
      >
        <button
          type="button"
          onClick={onApply}
          className="inline-block rounded-md bg-gold px-7 py-3.5 text-navy font-body font-semibold text-sm tracking-wide hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 transition-colors duration-200"
          aria-label={t('partner.hero.cta')}
        >
          {t('partner.hero.cta')}
        </button>
      </div>
    </div>
  )
}

function MobileHeroText({
  showText,
  t,
  prefersReducedMotion,
  onApply,
}: {
  showText: boolean
  t: (k: string) => string
  prefersReducedMotion: boolean
  onApply: () => void
}) {
  const motion = (delay = 0, dir: 'left' | 'right' = 'left') => ({
    opacity: showText ? 1 : 0,
    transform: showText ? 'translateX(0)' : `translateX(${dir === 'left' ? '-36px' : '36px'})`,
    transition: prefersReducedMotion
      ? 'none'
      : `opacity ${TIMING.textReveal}ms ${easeOut} ${delay}ms, transform ${TIMING.textReveal}ms ${easeOut} ${delay}ms`,
  })

  return (
    <div className="flex flex-col space-y-4 items-center text-center px-6">
      {/* Headline — slides in from the left */}
      <h1 className="font-display text-cream text-3xl md:text-4xl font-medium leading-tight" style={motion(0, 'left')}>
        {t('partner.hero.headline')}
      </h1>
      {/* Subheadline — slides in from the right */}
      <p className="text-cream-muted text-xl md:text-2xl leading-relaxed" style={motion(60, 'right')}>
        {t('partner.hero.subheadline')}
      </p>
      {/* CTA — slides in from the left, slightly behind headline */}
      <div style={motion(130, 'left')}>
        <button
          type="button"
          onClick={onApply}
          className="inline-block rounded-md bg-gold px-6 py-3 text-navy font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors duration-200"
        >
          {t('partner.hero.cta')}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type PinOffset = { dx: number; dy: number; calculated: boolean }

export function PartnerHeroSection() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()

  // Mobile pins land at 80 % of the desktop scale so they fit the smaller map
  const activeFinalScale = isDesktop ? FINAL_SCALE : FINAL_SCALE * 0.8
  const finalScaleRef    = useRef(activeFinalScale)
  finalScaleRef.current  = activeFinalScale   // keep ref in sync on every render

  const [phase, setPhase]         = useState<Phase>('idle')
  const [modalOpen, setModalOpen] = useState(false)

  /** One offset record per marker (dx/dy from section centre to landing dot) */
  const [pinOffsets, setPinOffsets] = useState<PinOffset[]>(
    () => BOK_MARKERS.map(() => ({ dx: 0, dy: 0, calculated: false }))
  )

  const hasStarted    = useRef(false)
  const sectionRef    = useRef<HTMLElement>(null)
  /** Ref to the first pin container — used to read the rendered height */
  const pin0Ref       = useRef<HTMLDivElement>(null)
  /** Refs to the invisible anchor circles inside the SVG map */
  const markerRefs    = useRef<(SVGCircleElement | null)[]>(BOK_MARKERS.map(() => null))
  /** Live mirror of isDesktop — readable inside stable resize-handler closure */
  const isDesktopRef  = useRef(isDesktop)
  isDesktopRef.current = isDesktop

  // ── Animation orchestration ────────────────────────────────────────────
  //
  // React 18 Strict Mode mounts → cleans up → remounts every component in
  // development.  Two-part fix keeps animation running correctly:
  //   1. setPhase('light-appear') synchronously before any setTimeout —
  //      something is rendered even if timers get cleared by cleanup.
  //   2. hasStarted is reset in the cleanup so the remount re-runs fully.
  //
  // Scroll to top on mount — prevents the browser from restoring a previous
  // scroll position (e.g. from a #apply hash left in the URL after clicking
  // the CTA, then refreshing the page).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // ── Shared offset measurement ───────────────────────────────────────────
  const measureOffsets = useCallback(() => {
    if (!sectionRef.current) return
    const secRect = sectionRef.current.getBoundingClientRect()
    const anchorX = secRect.left + secRect.width  / 2
    const anchorY = secRect.top  + secRect.height / 2
    const pinH    = pin0Ref.current?.getBoundingClientRect()?.height ?? PIN_H_FALLBACK
    const halfH   = (pinH / 2) * finalScaleRef.current

    setPinOffsets(
      BOK_MARKERS.map((_, i) => {
        const el = markerRefs.current[i]
        if (!el) return { dx: 0, dy: 0, calculated: false }
        const r = el.getBoundingClientRect()
        return {
          dx: (r.left + r.width  / 2) - anchorX,
          dy: (r.top  + r.height / 2) - anchorY - halfH,
          calculated: true,
        }
      })
    )
  }, []) // refs and setter are stable — no deps needed

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    if (prefersReducedMotion) {
      setPhase('complete')
      return
    }

    setPhase('light-appear') // synchronous — survives Strict Mode cleanup

    // Cumulative timestamps from t = 0 (light-appear fires)
    const T = {
      m0Appear:     TIMING.lightAppear,
      m0Land:       TIMING.lightAppear + TIMING.m0Appear,
      m1Appear:     TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap,
      m1Land:       TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear,
      m2Appear:     TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap,
      m2Land:       TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear,
      m3Appear:     TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap,
      m3Land:       TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear,
      m4Appear:     TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap,
      m4Land:       TIMING.lightAppear + TIMING.m0Appear + TIMING.m0Land + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear + TIMING.mLand + TIMING.markerGap + TIMING.mAppear,
    }
    // Derive remaining timestamps relative to m4Land
    const m4LandEnd = T.m4Land + TIMING.mLand
    const textReveal = m4LandEnd + 150
    const ctaSlide   = textReveal + Math.round(TIMING.textReveal * 0.35)
    const complete   = textReveal + TIMING.textReveal

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase('m0-appear'), T.m0Appear),

      setTimeout(() => {
        measureOffsets()
        setPhase('m0-land')
      }, T.m0Land),

      setTimeout(() => setPhase('m1-appear'), T.m1Appear),
      setTimeout(() => setPhase('m1-land'),   T.m1Land),
      setTimeout(() => setPhase('m2-appear'), T.m2Appear),
      setTimeout(() => setPhase('m2-land'),   T.m2Land),
      setTimeout(() => setPhase('m3-appear'), T.m3Appear),
      setTimeout(() => setPhase('m3-land'),   T.m3Land),
      setTimeout(() => setPhase('m4-appear'), T.m4Appear),
      setTimeout(() => setPhase('m4-land'),   T.m4Land),

      setTimeout(() => setPhase('text-reveal'),  textReveal),
      setTimeout(() => setPhase('cta-slide'),    ctaSlide),
      setTimeout(() => setPhase('complete'),     complete),
    ]

    return () => {
      hasStarted.current = false
      timers.forEach(clearTimeout)
    }
  }, [prefersReducedMotion, measureOffsets])

  // ── Reduced-motion: measure once on mount ──────────────────────────────
  useLayoutEffect(() => {
    if (!prefersReducedMotion) return
    measureOffsets()
  }, [prefersReducedMotion, measureOffsets])

  // ── Re-measure on resize so landed pins stay aligned after layout shifts ─
  //
  // Desktop only: on mobile the map container and pins wrapper both use the
  // same `50vh` CSS value, so when the viewport height changes (e.g. address
  // bar appearing/disappearing during scroll) they shift by exactly the same
  // amount and pins stay aligned without re-measuring.  Re-measuring on mobile
  // AFTER the wrapper's translateY has been applied produces offsets that are
  // 50 vh too large, causing pins to jump down the page.
  useEffect(() => {
    let rafId: number
    const onResize = () => {
      if (!isDesktopRef.current) return   // mobile resize is address-bar noise
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(measureOffsets)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  }, [measureOffsets])

  // ── Derived state ────────────────────────────────────────────────────────
  const curIdx = phaseIndex(phase)

  /** True if marker i has completed its landing (phase is past m{i}-land) */
  const isLanded = (i: number) => curIdx > markerLandIdx(i)

  /** True if marker i is currently displayed large at centre */
  const isAtCenter = (i: number) =>
    curIdx === markerAppearIdx(i) || curIdx === markerLandIdx(i)

  /** True if marker i is currently in its travel animation */
  const isLanding = (i: number) => curIdx === markerLandIdx(i)

  const lightOn     = phase !== 'idle'
  const mapVisible  = phase !== 'idle'             // map fades in at the very start
  const lightDrifted = curIdx > markerLandIdx(0)  // light shifts right after first marker lands
  const showText    = curIdx >= phaseIndex('text-reveal')
  const showCta    = curIdx >= phaseIndex('cta-slide')

  // Background gradient delayed until first pin is illuminated
  const bgReveal = prefersReducedMotion || curIdx >= markerLandIdx(0)

  // ── Per-marker pin transform ─────────────────────────────────────────────
  const pinTransform = (i: number): string => {
    const offset = pinOffsets[i]
    if ((isLanded(i) || isLanding(i)) && offset.calculated) {
      return `translate(calc(-50% + ${offset.dx}px), calc(-50% + ${offset.dy}px)) scale(${activeFinalScale})`
    }
    return 'translate(-50%, -50%) scale(1)'
  }

  const pinTransition = (i: number): string => {
    if (prefersReducedMotion) return 'none'
    if (isLanding(i)) {
      const dur = i === 0 ? TIMING.m0Land : TIMING.mLand
      return `transform ${dur}ms ${easeOut}, opacity 300ms ${easeOut}`
    }
    if (isAtCenter(i) && !isLanding(i)) {
      // Appearing at centre
      return `opacity ${i === 0 ? TIMING.m0Appear : TIMING.mAppear}ms ${easeOut}`
    }
    return 'none'
  }

  const pinOpacity = (i: number): number => {
    if (prefersReducedMotion) return pinOffsets[i].calculated ? 0.95 : 0
    if (isAtCenter(i) || isLanded(i) || isLanding(i)) return 1
    return 0
  }

  return (
    <>
    <section
      ref={sectionRef}
      className="relative -mt-20 pt-20"
      style={{
        background: '#030914',
        // On mobile the map runs from 50 vh → 110 vh; give the section enough
        // height to fully contain it so markers don't bleed into the next section.
        minHeight: isDesktop ? '100vh' : '120vh',
      }}
      aria-label="Partner hero"
    >
      {/*
        Backdrop layer — overflow-hidden is scoped here so it clips the large
        box-shadow spotlight without clipping the absolutely-positioned pins,
        which can extend below 100vh on mobile after their translateY slide.
      */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* ── Background gradient (reveals after first pin is lit) ────── */}
        <div
          className="absolute inset-0"
          style={{
            opacity: bgReveal ? 1 : 0,
            background: 'var(--hero-bg-gradient-a)',
            transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.m0Land}ms ${easeOut}`,
          }}
        />

        {/* ── Gold spotlight ─────────────────────────────────────────────── */}
        {/*
          Starts at top-centre illuminating the large centred pin.
          Once the map appears it drifts to upper-right (left: 82%, top: 10%)
          suggesting late-afternoon Adriatic sunlight on the Bay of Kotor.
        */}
        <div
          className="absolute h-px w-px -translate-x-1/2"
          style={{
            left: lightDrifted ? '82%' : '50%',
            top:  lightDrifted ? '10%' : '0',
            boxShadow: lightOn
              ? `0 0 28vmin 16vmin rgba(194,162,77,0.38),
                 0 0 60vmin 38vmin rgba(194,162,77,0.16),
                 0 0 95vmin 60vmin rgba(194,162,77,0.06)`
              : `0 0 0 0 rgba(194,162,77,0),
                 0 0 0 0 rgba(194,162,77,0),
                 0 0 0 0 rgba(194,162,77,0)`,
            transition: prefersReducedMotion
              ? 'none'
              : [
                  `box-shadow ${lightOn ? TIMING.lightAppear : TIMING.m0Appear}ms ${easeOut}`,
                  `left 2400ms ${easeOut}`,
                  `top  2400ms ${easeOut}`,
                ].join(', '),
          }}
        />

        {/* ── Radial gold tint overlay ───────────────────────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            opacity: bgReveal ? 0.25 : 0,
            background:
              'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(194,162,77,0.14) 0%, transparent 60%)',
            transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.m0Land}ms ${easeOut}`,
          }}
        />
      </div>

      {/* ── Bay of Kotor map — right panel (desktop) / animated (mobile) ─ */}
      {/*
        Desktop: right 58% of section, full height, left edge masked.

        Mobile: starts at top:0, height:60vh (upper screen) so the markers
        animate in visible map space.  When text-reveal fires, `top` transitions
        to 40vh, sliding the map (and the pins wrapper below) down to make room
        for the headline and CTA in the cleared upper 40vh.
      */}
      <div
        className="pointer-events-none absolute"
        aria-hidden={!mapVisible}
        style={
          isDesktop
            ? {
                top: 0, bottom: 0, right: 0,
                width: '58%',
                opacity: mapVisible ? 1 : 0,
                transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.m0Land}ms ${easeOut}`,
                zIndex: 10,
                maskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
              }
            : {
                top: showText ? '50vh' : '0',
                left: 0, right: 0,
                height: '60vh',
                opacity: mapVisible ? 1 : 0,
                transition: prefersReducedMotion
                  ? 'none'
                  : `opacity ${TIMING.m0Land}ms ${easeOut}, top 700ms ${easeOut}`,
                zIndex: 10,
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
              }
        }
      >
        <BayOfKotorMap
          markerRefs={markerRefs}
          showLabels={mapVisible}
        />
      </div>

      {/* ── Animated map pins ─────────────────────────────────────────── */}
      {/*
        Five pins rendered simultaneously inside a slide wrapper.

        Desktop: wrapper is identity (no transform). Each pin shows the full
        appear-at-centre → peel-off sequence.

        Mobile: wrapper applies the same translateY(40vh) as the map container
        when text-reveal fires, so all landed pins travel with the map as it
        slides down.  Pin 0 only does the full centre-display; pins 1-4 fade
        directly onto the map at their landing positions.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 20,
          transform: (!isDesktop && showText) ? 'translateY(50vh)' : 'none',
          transition: (!isDesktop && !prefersReducedMotion)
            ? `transform 700ms ${easeOut}`
            : 'none',
        }}
      >
      {BOK_MARKERS.map((marker, i) => (
        <div
          key={marker.id}
          ref={i === 0 ? pin0Ref : undefined}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 'clamp(260px, 34vw, 460px)',
            aspectRatio: '260 / 340',
            transform: pinTransform(i),
            opacity: pinOpacity(i),
            transition: pinTransition(i),
            willChange: 'transform, opacity',
            zIndex: isAtCenter(i) ? 25 : 15,
            transformOrigin: 'center center',
            filter: (isLanded(i) || isLanding(i))
              ? 'none'
              : `drop-shadow(0 12px 60px rgba(194,162,77,0.22))`,
          }}
        >
          <PartnerMapPin
            uid={marker.id}
            serviceType={marker.serviceType}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ))}
      </div>{/* end pins slide wrapper */}

      {/* ── Desktop text — left panel (vertically centred) ───────────── */}
      {isDesktop && (
        <div
          className="absolute z-30"
          style={{ top: '50%', left: '7%', width: '34%', transform: 'translateY(-50%)' }}
        >
          <DesktopHeroText showText={showText} t={t} onApply={() => setModalOpen(true)} />
        </div>
      )}

      {/* ── Mobile text — appears in the upper 40vh once map has slid down ─ */}
      {/*
        Positioned at top: 8vh so it sits comfortably within the cleared
        space (0–40vh) after the map slides to 40–100vh.  The 500ms opacity
        delay lets the slide animation advance before text starts fading in.
      */}
      {!isDesktop && (
        <div className="absolute z-30 left-0 right-0" style={{ top: '23vh' }}>
          <MobileHeroText
            showText={showText}
            t={t}
            prefersReducedMotion={prefersReducedMotion}
            onApply={() => setModalOpen(true)}
          />
        </div>
      )}

      {/* ── Bottom gradient blend into next section ───────────────────── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(15,42,68,0.55) 50%, #0f2a44 100%)',
          zIndex: 15,
        }}
      />
    </section>

    <PartnerApplyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
