'use client'

/**
 * HeroSectionAnimated - Premium hero with map outline animation
 *
 * DESKTOP:
 * 1. Map outline draws (centered, large, full impact)
 * 2. Image fills outline
 * 3. Layout shifts: map to right, text to left
 * 4. Text reveal, email slide in
 *
 * MOBILE:
 * 1. Map outline draws (most of screen)
 * 2. Image fills outline
 * 3. Text/email enters from top, PUSHES map down (stacked layout, no overlay)
 * 4. Text reveal, email slide in
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { EmailCaptureForm } from '../EmailCaptureForm'
import { MONTENEGRO_COASTLINE_PATH } from '../../lib/montenegro-coastline-path'
import { MONTENEGRO_LAND_POLYGON } from '../../lib/montenegro-land-polygon'

const HERO_IMAGE = '/images/porto-montenegro-heroshot-1224x690.avif'
const GOLD = '#c2a24d'

const TIMING = {
  mapDraw: 4000,
  imageRevealStart: 2000,
  imageReveal: 1200,
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

const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

/**
 * Montenegro shape bounds in viewBox coords (land polygon occupies ~41% of full 2752x1536).
 * Cropped viewBox makes the shape fill the SVG instead of floating in empty space.
 */
const MAP_VIEWBOX_FULL = '0 0 2752 1536'
const MAP_VIEWBOX_CROPPED = '750 70 1250 1380' // bounds of Montenegro shape + padding

/** Shared map SVG - used by both desktop and mobile */
function HeroMapSvg({
  phase,
  pathRef,
  imageOpacity,
  fillMode = 'meet',
  viewBox = MAP_VIEWBOX_FULL,
}: {
  phase: Phase
  pathRef: React.RefObject<SVGPathElement | null>
  imageOpacity: number
  fillMode?: 'meet' | 'slice'
  viewBox?: string
}) {
  const showImage =
    phase === 'image-reveal' ||
    phase === 'layout-shift' ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={fillMode === 'slice' ? 'xMidYMid slice' : 'xMidYMid meet'}
      className="h-full w-full"
    >
      <defs>
        <clipPath id="hero-map-clip" clipPathUnits="userSpaceOnUse">
          <path d={MONTENEGRO_LAND_POLYGON} fillRule="evenodd" />
        </clipPath>
      </defs>
      <g
        clipPath="url(#hero-map-clip)"
        style={{
          opacity: showImage ? imageOpacity : 0,
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
      <path
        d={MONTENEGRO_LAND_POLYGON}
        fill="none"
        stroke={GOLD}
        strokeWidth="6"
        strokeLinejoin="round"
        style={{
          opacity: showImage ? 1 : 0,
          transition: `opacity ${TIMING.imageReveal}ms ${easeOut}`,
        }}
      />
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
  )
}

/** Desktop hero text - left-to-right clip-path reveal */
function DesktopHeroContent({
  showText,
  showEmail,
  t,
}: {
  showText: boolean
  showEmail: boolean
  t: (key: string) => string
}) {
  return (
    <div
      className="flex w-full flex-col space-y-5 items-start text-left"
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
  )
}

/** Mobile hero text - slides down from top as container expands, pushes map */
function MobileHeroContent({
  showFinalLayout,
  showEmail,
  t,
  prefersReducedMotion,
}: {
  showFinalLayout: boolean
  showEmail: boolean
  t: (key: string) => string
  prefersReducedMotion: boolean
}) {
  return (
    <div
      className="flex w-full flex-col space-y-5 items-center text-center"
      style={{
        transform: showFinalLayout ? 'translateY(0)' : 'translateY(-100%)',
        transition: prefersReducedMotion ? 'none' : `transform ${TIMING.layoutShift}ms ${easeOut}`,
      }}
    >
      <h1 className="font-display text-cream text-3xl md:text-4xl font-medium leading-tight">
        {t('hero.headline.full')}
      </h1>
      <p className="text-cream-muted text-lg leading-relaxed">
        {t('hero.subheadline')}
      </p>
      <div
        className="w-full"
        style={{
          opacity: showEmail ? 1 : 0,
          transform: showEmail ? 'translateY(0)' : 'translateY(-20px)',
          transition: prefersReducedMotion
            ? 'none'
            : `opacity ${TIMING.emailSlide}ms ${easeOut}, transform ${TIMING.emailSlide}ms ${easeOut} ${showFinalLayout ? TIMING.textStagger : 0}ms`,
        }}
      >
        <EmailCaptureForm align="center" />
      </div>
    </div>
  )
}

function HeroSectionAnimated() {
  const { t } = useLanguage()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isDesktop = useIsDesktop()
  const [phase, setPhase] = useState<Phase>('idle')
  const pathRef = useRef<SVGPathElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    if (prefersReducedMotion) {
      setPhase('complete')
      return
    }
    setPhase('map-draw')
    const layoutShiftStart = TIMING.imageRevealStart + TIMING.imageReveal
    const t1 = setTimeout(() => setPhase('image-reveal'), TIMING.imageRevealStart)
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
  }, [prefersReducedMotion])

  useLayoutEffect(() => {
    if (phase !== 'map-draw' || !pathRef.current) return
    const path = pathRef.current
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    path.style.strokeDashoffset = `${len}`
    path.getBoundingClientRect()
    requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${TIMING.mapDraw}ms ${easeOut}`
      path.style.strokeDashoffset = '0'
    })
  }, [phase])

  const showFinalLayout =
    prefersReducedMotion ||
    phase === 'layout-shift' ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'
  const showText =
    prefersReducedMotion ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'
  const showEmail =
    prefersReducedMotion || phase === 'email-slide' || phase === 'complete'
  const bgRevealComplete =
    prefersReducedMotion || phase !== 'idle'
  const lightSettled =
    prefersReducedMotion ||
    phase === 'layout-shift' ||
    phase === 'text-reveal' ||
    phase === 'email-slide' ||
    phase === 'complete'

  return (
    <section
      className={`relative -mt-20 min-h-screen pt-20 ${
        isDesktop ? 'h-screen overflow-hidden' : 'overflow-visible'
      }`}
      style={{ background: '#030914' }}
    >
      {/* Background layers - shared */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: bgRevealComplete ? 1 : 0,
          background: 'var(--hero-bg-gradient-a)',
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.mapDraw}ms ${easeOut}`,
        }}
      />
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
            : `left 1200ms ${easeOut}, box-shadow ${lightSettled ? 1200 : TIMING.mapDraw}ms ${easeOut}`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: bgRevealComplete ? 0.3 : 0,
          background:
            'radial-gradient(ellipse 80% 50% at 85% 15%, rgba(194,162,77,0.12) 0%, transparent 50%)',
          transition: prefersReducedMotion ? 'none' : `opacity ${TIMING.mapDraw}ms ${easeOut}`,
        }}
      />

      {/* DESKTOP LAYOUT - transform-based (GPU) for smooth animation, no flex layout thrashing */}
      {isDesktop && (
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 py-8">
          <div className="relative w-full max-w-[1600px] overflow-hidden">
            {/* Text - absolute overlay, transform for reveal (GPU, no layout) */}
            <div
              className="absolute left-0 top-0 z-10 flex h-full w-[35%] flex-col justify-center overflow-hidden pr-4"
              style={{
                opacity: showFinalLayout ? 1 : 0,
                transform: showFinalLayout ? 'translateX(0)' : 'translateX(-100%)',
                transition: prefersReducedMotion
                  ? 'none'
                  : `transform ${TIMING.layoutShift}ms ${easeOut}, opacity ${TIMING.layoutShift}ms ${easeOut}`,
              }}
            >
              <DesktopHeroContent showText={showText} showEmail={showEmail} t={t} />
            </div>

            {/* Map - transform for smooth slide (GPU-accelerated); centered when alone, right when with text */}
            <div className="flex justify-center">
              <div
                className="flex aspect-[1250/1380] w-full max-w-[65%] items-center justify-center"
                style={{
                  maxHeight: 'min(calc(100vh - 9rem), 900px)',
                  transform: showFinalLayout ? 'translateX(17.5%)' : 'translateX(0)',
                  transition: prefersReducedMotion ? 'none' : `transform ${TIMING.layoutShift}ms ${easeOut}`,
                  willChange: showFinalLayout ? 'auto' : 'transform',
                }}
              >
                <HeroMapSvg
                  phase={phase}
                  pathRef={pathRef}
                  imageOpacity={0.88}
                  viewBox={MAP_VIEWBOX_CROPPED}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE LAYOUT - stacked: text expands from top, map below. Uses page scroll (no nested scroll) to avoid iOS "stuck on first scroll" issue. */}
      {!isDesktop && (
        <div
          className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col"
        >
          {/* Text - enters from top, expands and pushes map down */}
          <div
            className="flex-shrink-0 overflow-hidden px-6 pt-4"
            style={{
              maxHeight: showFinalLayout ? '55vh' : 0,
              transition: prefersReducedMotion ? 'none' : `max-height ${TIMING.layoutShift}ms ${easeOut}`,
            }}
          >
            <div className="w-full max-w-xl mx-auto pb-4">
              <MobileHeroContent
                showFinalLayout={showFinalLayout}
                showEmail={showEmail}
                t={t}
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          </div>

          {/* Map - 80% width, natural height from aspect ratio. flex-shrink-0 so it's never clipped. */}
          <div className="relative flex-shrink-0 min-w-0 flex items-center justify-center w-full px-[10%] pt-4 pb-10">
            <div
              className="flex-shrink-0 w-full"
              style={{ aspectRatio: '1250/1380' }}
            >
              <HeroMapSvg
                phase={phase}
                pathRef={pathRef}
                imageOpacity={0.88}
                fillMode="meet"
                viewBox={MAP_VIEWBOX_CROPPED}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default HeroSectionAnimated
