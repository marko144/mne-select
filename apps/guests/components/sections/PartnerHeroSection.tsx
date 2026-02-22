'use client'

/**
 * PartnerHeroSection — animated hero for the /partner page.
 *
 * ANIMATION SEQUENCE (desktop):
 *  1. Dark navy background.
 *  2. Gold spotlight fades in at top-centre (box-shadow, same technique as main hero).
 *  3. Large branded map pin fades in — lamp-lit, centred.
 *  4. Brief hold with pin fully visible.
 *  5. Bay of Kotor map fades up from the bottom of the section simultaneously as
 *     the pin scales down and translates to land precisely on Seljanovo.
 *  6. Headline + subheadline clip in from the left.
 *  7. CTA button fades in.
 *
 * All animation is constrained inside the section — the map occupies the
 * bottom 52 vh, text sits in the upper-left quadrant, and the pin travels
 * between them.
 *
 * MOBILE:
 *  Text stacked above the map.  Pin reveal → map appears and pin lands.
 *
 * Respects prefers-reduced-motion by jumping straight to the complete state.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'
import { PartnerMapPin } from '../PartnerMapPin'
import {
  BOK_VIEWBOX,
  BOK_LAND_PATHS,
  BOK_STROKE_PATHS,
  BOK_PLACES,
  BOK_SELJANOVO,
} from '../../lib/bay-of-kotor-map'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

/** Animation phase durations in ms */
const TIMING = {
  initial:    350,   // brief settle before anything begins
  lightAppear: 700,  // spotlight fades in
  pinReveal:  1300,  // pin opacity fade-in
  pinHold:    550,   // pause while pin is fully visible
  mapFade:    950,   // map opacity transition
  pinShrink:  1100,  // pin scale + translate to landing
  pinLand:    180,   // settle bounce
  textReveal:  600,  // headline clip-path reveal
  ctaFade:    380,   // CTA button fade
} as const

/** Final scale of the pin when it lands on the map */
const FINAL_SCALE = 0.25

/**
 * Fallback pin dimensions used only when the ref is unavailable.
 * The actual CSS size is set responsively via clamp() — the ref measurement
 * is used for the landing-offset calculation so we're always accurate.
 */
const PIN_W_FALLBACK = 400  // px
const PIN_H_FALLBACK = Math.round(PIN_W_FALLBACK * (340 / 260)) // → 523px

/** Only show place labels at these priority levels */
const MAX_LABEL_PRIORITY = 2

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
// Bay of Kotor map sub-component
// ---------------------------------------------------------------------------

interface BayOfKotorMapProps {
  /** ref forwarded to the invisible Seljanovo position marker */
  seljanovoMarkerRef: React.RefObject<SVGCircleElement | null>
  showLabels: boolean
}

/** Labels filtered to priority 1-2 and deduplicated by name */
const displayedPlaces = Array.from(
  new Map(
    BOK_PLACES.filter((p) => p.priority <= MAX_LABEL_PRIORITY).map((p) => [p.name, p])
  ).values()
)

function BayOfKotorMap({ seljanovoMarkerRef, showLabels }: BayOfKotorMapProps) {
  return (
    <svg
      viewBox={BOK_VIEWBOX}
      // slice: fills the container in both dimensions, cropping as needed.
      // This avoids empty bands and ensures the map always fills its panel.
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-label="Bay of Kotor map"
      role="img"
    >
      {/*
       * NO background rect — the section's navy gradient shows through as
       * the water colour.  This eliminates the hard colour-seam that appears
       * when the map SVG uses a different flat colour from the surrounding
       * gradient background.
       */}

      {/* ── Land polygons ──────────────────────────────────────────── */}
      {BOK_LAND_PATHS.map((d, i) => (
        <path key={i} d={d} fill="#0d2540" />
      ))}

      {/* ── Coastline strokes (gold) ────────────────────────────────── */}
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

      {/* ── Place labels ───────────────────────────────────────────── */}
      <g
        style={{
          opacity: showLabels ? 1 : 0,
          transition: `opacity 600ms ${easeOut} 400ms`,
        }}
      >
        {displayedPlaces.map((place) => (
          <g key={place.name}>
            <circle
              cx={place.x}
              cy={place.y}
              r={2.5}
              fill="rgba(232,230,225,0.55)"
            />
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

      {/*
       * Seljanovo reference marker — invisible, used only for getBoundingClientRect()
       * to calculate the pin's landing position in screen space.
       */}
      <circle
        ref={seljanovoMarkerRef}
        cx={BOK_SELJANOVO.x}
        cy={BOK_SELJANOVO.y}
        r={6}
        fill="transparent"
        stroke="none"
        aria-hidden="true"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Hero text sub-components
// ---------------------------------------------------------------------------

function DesktopHeroText({
  showText,
  showCta,
  t,
}: {
  showText: boolean
  showCta: boolean
  t: (k: string) => string
}) {
  return (
    <div className="flex flex-col space-y-5 items-start text-left">
      {/* Pre-headline */}
      <p
        className="text-gold text-sm uppercase tracking-widest font-body font-medium"
        style={{
          opacity: showText ? 1 : 0,
          transition: `opacity ${TIMING.textReveal}ms ${easeOut}`,
        }}
      >
        {t('partner.hero.preheadline')}
      </p>

      {/* Main headline */}
      <h1
        className="font-display text-cream font-medium leading-tight"
        style={{
          fontSize: 'clamp(2rem, 3.5vw, 3.25rem)',
          clipPath: showText ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: `clip-path ${TIMING.textReveal}ms ${easeOut}`,
        }}
      >
        {t('partner.hero.headline')}
      </h1>

      {/* Subheadline */}
      <p
        className="text-cream-muted leading-relaxed"
        style={{
          fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
          clipPath: showText ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: `clip-path ${TIMING.textReveal}ms ${easeOut} 80ms`,
        }}
      >
        {t('partner.hero.subheadline')}
      </p>

      {/* CTA */}
      <div
        style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? 'translateY(0)' : 'translateY(12px)',
          transition: `opacity ${TIMING.ctaFade}ms ${easeOut}, transform ${TIMING.ctaFade}ms ${easeOut}`,
        }}
      >
        <Link
          href="#apply"
          className="inline-block rounded-md bg-gold px-7 py-3.5 text-navy font-body font-semibold text-sm tracking-wide hover:bg-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 transition-colors duration-200"
          aria-label={t('partner.hero.cta')}
        >
          {t('partner.hero.cta')}
        </Link>
        <p className="mt-3 text-cream-subtle text-xs tracking-wider uppercase">
          {t('partner.hero.microcopy')}
        </p>
      </div>
    </div>
  )
}

function MobileHeroText({
  showText,
  showCta,
  t,
  prefersReducedMotion,
}: {
  showText: boolean
  showCta: boolean
  t: (k: string) => string
  prefersReducedMotion: boolean
}) {
  return (
    <div className="flex flex-col space-y-4 items-center text-center px-6">
      <p
        className="text-gold text-xs uppercase tracking-widest font-body font-medium"
        style={{
          opacity: showText ? 1 : 0,
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.textReveal}ms ${easeOut}`,
        }}
      >
        {t('partner.hero.preheadline')}
      </p>
      <h1
        className="font-display text-cream text-3xl font-medium leading-tight"
        style={{
          clipPath: showText ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: prefersReducedMotion ? 'none' : `clip-path ${TIMING.textReveal}ms ${easeOut}`,
        }}
      >
        {t('partner.hero.headline')}
      </h1>
      <p
        className="text-cream-muted text-lg leading-relaxed"
        style={{
          clipPath: showText ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
          transition: prefersReducedMotion ? 'none' : `clip-path ${TIMING.textReveal}ms ${easeOut} 80ms`,
        }}
      >
        {t('partner.hero.subheadline')}
      </p>
      <div
        style={{
          opacity: showCta ? 1 : 0,
          transform: showCta ? 'translateY(0)' : 'translateY(10px)',
          transition: prefersReducedMotion
            ? 'none'
            : `opacity ${TIMING.ctaFade}ms ${easeOut}, transform ${TIMING.ctaFade}ms ${easeOut}`,
        }}
      >
        <Link
          href="#apply"
          className="inline-block rounded-md bg-gold px-6 py-3 text-navy font-body font-semibold text-sm tracking-wide hover:bg-gold-light transition-colors duration-200"
        >
          {t('partner.hero.cta')}
        </Link>
        <p className="mt-3 text-cream-subtle text-xs tracking-wider uppercase">
          {t('partner.hero.microcopy')}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PartnerHeroSection() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()

  type Phase =
    | 'idle'
    | 'light-appear'
    | 'pin-reveal'
    | 'pin-visible'
    | 'map-reveal'
    | 'pin-land'
    | 'text-reveal'
    | 'cta-slide'
    | 'complete'

  const [phase, setPhase] = useState<Phase>('idle')
  const [pinOffset, setPinOffset] = useState({ dx: 0, dy: 0, calculated: false })
  const hasStarted = useRef(false)

  const sectionRef      = useRef<HTMLElement>(null)
  const pinContainerRef = useRef<HTMLDivElement>(null)   // for accurate height measurement
  const seljanovoRef    = useRef<SVGCircleElement>(null)

  // ── Animation orchestration ──────────────────────────────────────────────
  //
  // STRICT MODE NOTE: React 18 Strict Mode mounts → cleans up → remounts every
  // component in development.  Refs survive cleanup (unlike state), so if we
  // only set hasStarted=true and never reset it, the second mount finds
  // hasStarted=true and returns early — the animation never runs.
  //
  // Two-part fix:
  //   1. Call setPhase('light-appear') synchronously (before any setTimeout)
  //      so SOMETHING is rendered even if the timers get cleared by cleanup.
  //   2. Reset hasStarted in the cleanup so the remount restarts everything.
  //
  // This mirrors how HeroSectionAnimated calls setPhase('map-draw') immediately.
  //
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    if (prefersReducedMotion) {
      setPhase('complete')
      return
    }

    // Start light immediately — synchronous, survives Strict Mode cleanup.
    setPhase('light-appear')

    // All subsequent phases are relative to the moment 'light-appear' begins.
    const t1 = TIMING.lightAppear                             // pin starts fading in
    const t2 = t1 + TIMING.pinReveal                         // pin fully visible
    const t3 = t2 + TIMING.pinHold                           // map-reveal + pin shrink
    const t4 = t3 + TIMING.pinShrink                         // pin lands
    const t5 = t4 + TIMING.pinLand                           // text reveals
    const t6 = t5 + Math.round(TIMING.textReveal * 0.35)     // cta fades
    const t7 = t5 + TIMING.textReveal                        // complete

    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase('pin-reveal'), t1),
      setTimeout(() => setPhase('pin-visible'), t2),
      setTimeout(() => {
        // Calculate Seljanovo screen coordinates before triggering movement.
        // The map SVG is already in the DOM (opacity 0) so getBoundingClientRect is valid.
        if (seljanovoRef.current && sectionRef.current) {
          const dotRect = seljanovoRef.current.getBoundingClientRect()
          const secRect = sectionRef.current.getBoundingClientRect()
          const pinRect = pinContainerRef.current?.getBoundingClientRect()

          // Pin anchor: top-50%, left-50% of section → section centre
          const anchorX = secRect.left + secRect.width / 2
          const anchorY = secRect.top + secRect.height / 2

          // Seljanovo dot centre
          const selX = dotRect.left + dotRect.width / 2
          const selY = dotRect.top + dotRect.height / 2

          // Use the actual rendered pin height (responsive CSS) for accuracy.
          // We want the pin TIP (bottom of element) to align with Seljanovo:
          // anchorY + dy + halfH@finalScale = selY
          const actualPinH = pinRect?.height ?? PIN_H_FALLBACK
          const halfHAtFinal = (actualPinH / 2) * FINAL_SCALE

          setPinOffset({
            dx: selX - anchorX,
            dy: selY - anchorY - halfHAtFinal,
            calculated: true,
          })
        }
        setPhase('map-reveal')
      }, t3),
      setTimeout(() => setPhase('pin-land'), t4),
      setTimeout(() => setPhase('text-reveal'), t5),
      setTimeout(() => setPhase('cta-slide'), t6),
      setTimeout(() => setPhase('complete'), t7),
    ]

    return () => {
      // Reset so the Strict Mode remount (or any future remount) runs the full sequence.
      hasStarted.current = false
      timers.forEach(clearTimeout)
    }
  }, [prefersReducedMotion])

  // ── Derived state ────────────────────────────────────────────────────────
  const isComplete = (p: Phase) =>
    ['map-reveal', 'pin-land', 'text-reveal', 'cta-slide', 'complete'].includes(p)

  const lightOn    = phase !== 'idle'
  const pinVisible = !['idle', 'light-appear'].includes(phase)
  const mapVisible = isComplete(phase)
  const pinShrunk  = isComplete(phase)
  const textVisible = ['text-reveal', 'cta-slide', 'complete'].includes(phase)
  const ctaVisible  = ['cta-slide', 'complete'].includes(phase)

  // Background gradient is deliberately delayed: the section stays pitch-dark
  // during the spotlight reveal so the gold glow is the ONLY light source.
  // It fades in only once the pin is fully illuminated and visible.
  const bgReveal = prefersReducedMotion ||
    ['pin-visible', 'map-reveal', 'pin-land', 'text-reveal', 'cta-slide', 'complete'].includes(phase)

  // ── Pin transform ────────────────────────────────────────────────────────
  // Initial state: centred in section via top-50%/left-50%.
  // Transition: translate to Seljanovo + scale down simultaneously.
  const pinTransformStr = pinShrunk && pinOffset.calculated
    ? `translate(calc(-50% + ${pinOffset.dx}px), calc(-50% + ${pinOffset.dy}px)) scale(${FINAL_SCALE})`
    : 'translate(-50%, -50%) scale(1)'

  const pinTransition = pinShrunk
    ? `transform ${TIMING.pinShrink}ms ${easeOut}, opacity 300ms ${easeOut}`
    : `transform 0ms, opacity ${TIMING.pinReveal}ms ${easeOut}`

  // ── Reduced-motion: measure once on mount ────────────────────────────────
  useLayoutEffect(() => {
    if (!prefersReducedMotion) return
    if (!seljanovoRef.current || !sectionRef.current) return
    const dotRect = seljanovoRef.current.getBoundingClientRect()
    const secRect = sectionRef.current.getBoundingClientRect()
    const pinRect = pinContainerRef.current?.getBoundingClientRect()
    const anchorX = secRect.left + secRect.width / 2
    const anchorY = secRect.top + secRect.height / 2
    const selX = dotRect.left + dotRect.width / 2
    const selY = dotRect.top + dotRect.height / 2
    const actualPinH = pinRect?.height ?? PIN_H_FALLBACK
    const halfHAtFinal = (actualPinH / 2) * FINAL_SCALE
    setPinOffset({ dx: selX - anchorX, dy: selY - anchorY - halfHAtFinal, calculated: true })
  }, [prefersReducedMotion])

  const effectivePinTransform = prefersReducedMotion
    ? (pinOffset.calculated ? `translate(calc(-50% + ${pinOffset.dx}px), calc(-50% + ${pinOffset.dy}px)) scale(${FINAL_SCALE})` : 'translate(-50%, -50%) scale(1)')
    : pinTransformStr

  return (
    <section
      ref={sectionRef}
      className="relative -mt-20 min-h-screen pt-20 overflow-hidden"
      style={{ background: '#030914' }}
      aria-label="Partner hero"
    >
      {/* ── Background gradient (reveals with pin) ───────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          opacity: bgReveal ? 1 : 0,
          background: 'var(--hero-bg-gradient-a)',
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.pinReveal}ms ${easeOut}`,
        }}
      />

      {/* ── Gold spotlight ──────────────────────────────────────────────── */}
      {/*
        Same box-shadow technique as the main landing hero.  The spotlight
        starts at top-centre to reveal the pin, then smoothly drifts right
        and slightly downward — as if the sun is shifting to cast light onto
        the Boka Bay map.  Both `left` and `top` are transitioned so the
        perceived light-source position moves naturally.

        The map occupies the right 58 % of the hero section, so its centre
        sits at roughly left = 71 %.  `top: 10%` gives a shallow sun-angle
        that feels like late-afternoon Adriatic light from the upper-right.
      */}
      <div
        className="pointer-events-none absolute h-px w-px -translate-x-1/2"
        aria-hidden="true"
        style={{
          left: mapVisible ? '82%' : '50%',
          top:  mapVisible ? '10%' :  '0',
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
                `box-shadow ${lightOn ? TIMING.lightAppear : TIMING.pinReveal}ms ${easeOut}`,
                `left 2400ms ${easeOut}`,
                `top  2400ms ${easeOut}`,
              ].join(', '),
        }}
      />

      {/* ── Radial gold tint overlay ───────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          opacity: bgReveal ? 0.25 : 0,
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(194,162,77,0.14) 0%, transparent 60%)',
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.pinReveal}ms ${easeOut}`,
        }}
      />

      {/* ── Bay of Kotor map — right panel (desktop) / bottom (mobile) ─ */}
      {/*
        On desktop: occupies the right 58% of the section, full height.
        The SVG uses slice so it fills the panel — no empty space, no hard edges.
        A CSS mask fades the left edge so the map blends into the text area.
        The SVG itself has NO background rect; the section's navy gradient shows
        through as the "water" colour — this eliminates any seam or hard line.

        On mobile: occupies the bottom 45vh, full width.
      */}
      <div
        className="pointer-events-none absolute"
        aria-hidden={!mapVisible}
        style={
          isDesktop
            ? {
                top: 0,
                bottom: 0,
                right: 0,
                width: '58%',
                opacity: mapVisible ? 1 : 0,
                transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.mapFade}ms ${easeOut}`,
                zIndex: 10,
                // Fade the left edge so map dissolves into the text area
                maskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%)',
              }
            : {
                bottom: 0,
                left: 0,
                right: 0,
                height: '45vh',
                opacity: mapVisible ? 1 : 0,
                transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.mapFade}ms ${easeOut}`,
                zIndex: 10,
                // Fade the top edge on mobile to avoid a hard seam
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%)',
              }
        }
      >
        <BayOfKotorMap seljanovoMarkerRef={seljanovoRef} showLabels={mapVisible} />
      </div>

      {/* ── Animated map pin ─────────────────────────────────────────── */}
      {/*
        Anchored at section centre (top: 50%, left: 50%, translate(-50%,-50%)).
        Starts large (clamp responsive width) and fades in while illuminated by
        the gold spotlight.  Then scales down + translates to Seljanovo via a
        single CSS transform transition — no layout recalculation.
      */}
      <div
        ref={pinContainerRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          // Responsive large initial size — dramatic centre-stage presence
          width: 'clamp(260px, 34vw, 460px)',
          // height is derived from the SVG viewBox ratio (260:340)
          aspectRatio: '260 / 340',
          transform: effectivePinTransform,
          opacity: prefersReducedMotion ? (pinOffset.calculated ? 0.9 : 0) : (pinVisible ? 1 : 0),
          transition: prefersReducedMotion ? 'none' : pinTransition,
          willChange: 'transform',
          zIndex: 20,
          transformOrigin: 'center center',
          // Gold drop-shadow only when pin is large (fades with scale)
          filter: pinShrunk
            ? 'none'
            : 'drop-shadow(0 12px 60px rgba(194,162,77,0.22))',
        }}
      >
        <PartnerMapPin style={{ width: '100%', height: '100%' }} />
      </div>

      {/* ── DESKTOP TEXT — left panel (vertically centred) ─────────────── */}
      {/*
        Text lives in the left 42% of the section (the map occupies the right 58%).
        It is vertically centred within the full section height so it aligns
        naturally with the map panel beside it.
      */}
      {isDesktop && (
        <div
          className="absolute z-30"
          style={{
            top: '50%',
            left: '7%',
            width: '34%',
            transform: 'translateY(-50%)',
          }}
        >
          <DesktopHeroText showText={textVisible} showCta={ctaVisible} t={t} />
        </div>
      )}

      {/* ── MOBILE TEXT — stacked above the map ───────────────────────── */}
      {!isDesktop && (
        <div
          className="absolute z-30 left-0 right-0"
          style={{
            top: '18%',
            opacity: textVisible ? 1 : 0,
            transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.textReveal}ms ${easeOut}`,
          }}
        >
          <MobileHeroText
            showText={textVisible}
            showCta={ctaVisible}
            t={t}
            prefersReducedMotion={prefersReducedMotion}
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
  )
}
