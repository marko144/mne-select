'use client'

/**
 * HeroSectionAnimated - Premium hero with map outline animation sequence (desktop)
 *
 * Animation phases:
 * 1. Large country outline draws (stroke-dashoffset) - centered, full impact
 * 2. Image fills the outline - fade in, gold border on clipped shape
 * 3. Resize clipped image to appropriate size, shift to right half
 * 4. Hero text left-to-right reveal (on left side)
 * 5. Email input + button slide in
 *
 * Mobile: different sequence (handled separately)
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { EmailCaptureForm } from '../EmailCaptureForm'
import { MONTENEGRO_COASTLINE_PATH } from '../../lib/montenegro-coastline-path'
import { MONTENEGRO_LAND_POLYGON } from '../../lib/montenegro-land-polygon'

const HERO_IMAGE = '/images/porto-montenegro-heroshot-1224x690.avif'
const GOLD = '#c2a24d'

// Timing (ms) - desktop sequence
const TIMING = {
  mapDraw: 4000, // Hand-draw outline over 4 seconds
  imageRevealStart: 2000, // Start image fade well before draw completes (heavy overlap)
  imageReveal: 1200, // Image fade duration
  layoutShift: 1100,
  textReveal: 700,
  textStagger: 50,
  emailSlide: 350,
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return prefersReducedMotion
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setIsDesktop(mq.matches)
    const handler = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

type Phase =
  | 'idle'
  | 'map-draw'
  | 'image-reveal'
  | 'layout-shift'
  | 'text-reveal'
  | 'email-slide'
  | 'complete'

function HeroSectionAnimated() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()

  const [phase, setPhase] = useState<Phase>('idle')
  const pathRef = useRef<SVGPathElement>(null)
  const hasStarted = useRef(false)

  // Start animation on mount (desktop only; mobile will have different sequence)
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    if (prefersReducedMotion || !isDesktop) {
      setPhase('complete')
      return
    }

    setPhase('map-draw')

    const t1 = setTimeout(() => setPhase('image-reveal'), TIMING.imageRevealStart)
    // Start layout shift as soon as image is visible (imageRevealStart + imageReveal)
    const layoutShiftStart = TIMING.imageRevealStart + TIMING.imageReveal
    const t2 = setTimeout(() => setPhase('layout-shift'), layoutShiftStart)
    const t3 = setTimeout(
      () => setPhase('text-reveal'),
      layoutShiftStart + TIMING.layoutShift
    )
    const t4 = setTimeout(
      () => setPhase('email-slide'),
      layoutShiftStart + TIMING.layoutShift + TIMING.textReveal * 0.4
    )
    const t5 = setTimeout(
      () => setPhase('complete'),
      layoutShiftStart + TIMING.layoutShift + TIMING.textReveal + TIMING.emailSlide
    )

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
    }
  }, [prefersReducedMotion, isDesktop])

  // Hand-draw outline via stroke-dashoffset - useLayoutEffect so it runs before paint (no flash)
  useLayoutEffect(() => {
    if (phase !== 'map-draw' || !pathRef.current) return

    const path = pathRef.current
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    path.style.strokeDashoffset = `${len}`

    // Trigger reflow so the initial state is applied before we animate
    path.getBoundingClientRect()

    requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${TIMING.mapDraw}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
      path.style.strokeDashoffset = '0'
    })
  }, [phase])

  const showFinalLayout =
    prefersReducedMotion ||
    !isDesktop ||
    phase === 'layout-shift' ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'

  const showText =
    prefersReducedMotion ||
    !isDesktop ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'

  const showEmail =
    prefersReducedMotion || !isDesktop || phase === 'email-slide' || phase === 'complete'

  const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

  const bgRevealComplete =
    prefersReducedMotion ||
    !isDesktop ||
    phase === 'map-draw' ||
    phase === 'image-reveal' ||
    phase === 'layout-shift' ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'

  // Light: starts center-top (reveal), then shifts to top-right and reduces (settle)
  const lightSettled =
    prefersReducedMotion ||
    !isDesktop ||
    phase === 'layout-shift' ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'

  const lightTransitionDuration = 1200

  return (
    <section
      className="relative -mt-20 min-h-screen overflow-hidden pt-20 lg:h-screen"
      style={{
        background: '#030914',
      }}
    >
      {/* Lamp-style reveal: radial light spill from top - box-shadow spreads naturally in all directions */}
      {/* Base gradient - fades in as light spreads (under the glow) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: bgRevealComplete ? 1 : 0,
          background: 'var(--hero-bg-gradient-a)',
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.mapDraw}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
        }}
      />
      {/* Light source: phase 1 = center-top, full spread (reveal); phase 2 = top-right, reduced (sun tucking in) */}
      <div
        className="pointer-events-none absolute top-0 h-px w-px -translate-x-1/2"
        style={{
          left: lightSettled ? '100%' : '50%',
          boxShadow: bgRevealComplete
            ? lightSettled
              ? `0 0 22vmin 14vmin rgba(194,162,77,0.35), 0 0 48vmin 30vmin rgba(194,162,77,0.12), 0 0 75vmin 45vmin rgba(194,162,77,0.05)`
              : `0 0 25vmin 15vmin rgba(194,162,77,0.4), 0 0 55vmin 40vmin rgba(194,162,77,0.2), 0 0 90vmin 65vmin rgba(194,162,77,0.06)`
            : `0 0 0 0 rgba(194,162,77,0), 0 0 0 0 rgba(194,162,77,0), 0 0 0 0 rgba(194,162,77,0)`,
          transition: prefersReducedMotion
            ? 'none'
            : `left ${lightTransitionDuration}ms ${easeOut}, box-shadow ${lightSettled ? lightTransitionDuration : TIMING.mapDraw}ms ${easeOut}`,
        }}
      />
      {/* Subtle gold accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: bgRevealComplete ? 0.3 : 0,
          background:
            'radial-gradient(ellipse 80% 50% at 85% 15%, rgba(194,162,77,0.12) 0%, transparent 50%)',
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.mapDraw}ms cubic-bezier(0.25, 0.1, 0.25, 1)`,
        }}
      />

      {/* Centered content - stays in middle on resize */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-8">
        <div
          className={`flex w-full max-w-[1600px] flex-col items-center lg:flex-row lg:items-center ${
            showFinalLayout ? 'lg:gap-4' : 'lg:gap-0'
          }`}
          style={{
            transition: prefersReducedMotion ? 'none' : `gap ${TIMING.layoutShift}ms ${easeOut}`,
          }}
        >
          {/* Left: Hero text + email */}
          <div
            className={`flex min-w-0 flex-1 flex-col items-center lg:items-start lg:justify-center ${
              showFinalLayout ? 'lg:flex-[0.7]' : 'lg:flex-[0] lg:overflow-hidden lg:opacity-0'
            }`}
            style={{
              transition: prefersReducedMotion
                ? 'none'
                : `flex ${TIMING.layoutShift}ms ${easeOut}, opacity 300ms ${easeOut}`,
            }}
          >
            <div
              className="flex w-full min-w-0 flex-col items-center space-y-5 text-center lg:items-start lg:text-left"
              style={{
                clipPath: showText ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
                transition: `clip-path ${TIMING.textReveal}ms ${easeOut}`,
              }}
            >
              <h1 className="font-display text-cream text-3xl md:text-4xl lg:text-5xl font-medium leading-tight">
                {t('hero.headline.full')}
              </h1>

              <p className="text-cream-muted text-lg lg:text-xl leading-relaxed">
                {t('hero.subheadline')}
              </p>

              <div
                className="w-full"
                style={{
                  opacity: showEmail ? 1 : 0,
                  transition: `opacity ${TIMING.emailSlide}ms ${easeOut} ${showText ? TIMING.textStagger : 0}ms`,
                }}
              >
                <EmailCaptureForm align="left" />
              </div>
            </div>
          </div>

          {/* Right: Map + Image - justify-start so it sits next to text, no gap */}
          <div
            className={`relative flex min-w-0 items-center justify-start ${
              showFinalLayout ? 'lg:flex-[1.3]' : 'lg:flex-1'
            }`}
            style={{
              transition: prefersReducedMotion ? 'none' : `flex ${TIMING.layoutShift}ms ${easeOut}`,
            }}
          >
            <div
              className="relative flex aspect-[2752/1536] w-full min-w-0 items-center justify-center"
              style={{
                maxHeight: 'min(95vh, 1080px)',
              }}
            >
              <svg
              viewBox="0 0 2752 1536"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full"
            >
              <defs>
                <clipPath id="hero-map-clip" clipPathUnits="userSpaceOnUse">
                  <path d={MONTENEGRO_LAND_POLYGON} fillRule="evenodd" />
                </clipPath>
              </defs>

              {/* Image inside map shape - fades in after outline completes */}
              <g
                clipPath="url(#hero-map-clip)"
                style={{
                  opacity:
                    phase === 'image-reveal' ||
                    phase === 'layout-shift' ||
                    phase === 'text-reveal' ||
                    phase === 'email-slide' ||
                    phase === 'complete'
                      ? 0.88
                      : 0,
                  transition: `opacity ${TIMING.imageReveal}ms ${easeOut}`,
                }}
              >
                <image
                  href={HERO_IMAGE}
                  x={0}
                  y={0}
                  width={2752}
                  height={1536}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>

              {/* Gold border on clipped shape - visible when image is shown */}
              <path
                d={MONTENEGRO_LAND_POLYGON}
                fill="none"
                stroke={GOLD}
                strokeWidth="6"
                strokeLinejoin="round"
                style={{
                  opacity:
                    phase === 'image-reveal' ||
                    phase === 'layout-shift' ||
                    phase === 'text-reveal' ||
                    phase === 'email-slide' ||
                    phase === 'complete'
                      ? 1
                      : 0,
                  transition: `opacity ${TIMING.imageReveal}ms ${easeOut}`,
                }}
              />

              {/* Map outline - stroke draw animation (hidden once image fills; gold border takes over) */}
              <g
                transform="translate(0,1536) scale(0.1,-0.1)"
                fill="none"
                stroke={GOLD}
                strokeWidth="20"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  opacity: phase === 'map-draw' ? 1 : 0,
                  transition: `opacity ${TIMING.imageReveal}ms ${easeOut}`,
                }}
              >
                <path ref={pathRef} d={MONTENEGRO_COASTLINE_PATH} />
              </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSectionAnimated
