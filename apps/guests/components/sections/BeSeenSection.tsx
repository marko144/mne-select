'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  PM_VIEWBOX,
  PM_WATER_PATHS,
  PM_MARINA_PATHS,
  PM_PIER_PATHS,
  PM_LANDUSE_PATHS,
  PM_ROADS,
  PM_TOUR_OPERATORS,
} from '../../lib/porto-montenegro-map'

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const GOLD    = '#c2a24d'
const CREAM   = '#e8e6e1'
const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

// ---------------------------------------------------------------------------
// ViewBox animation
// ---------------------------------------------------------------------------

interface ViewBox { x: number; y: number; w: number; h: number }

/** Full map view */
const VB_INITIAL: ViewBox = { x: 0, y: 0, w: 700, h: 600 }

/**
 * 80 % zoom centred on the cluster of tour markers.
 * Marker centre ≈ (270, 334); zoom factor 1.8 → 700/1.8 ≈ 389, 600/1.8 ≈ 333.
 */
const VB_ZOOMED: ViewBox = { x: 76, y: 168, w: 389, h: 333 }

/**
 * EaseInOutQuart — starts very slowly, ramps to full speed, decelerates gently.
 * The quartic power means the initial "almost still" phase is longer and more
 * dramatic than a standard cubic, giving a strong ramp feel.
 */
function easeInOutQuart(t: number): number {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function interpolateVB(from: ViewBox, to: ViewBox, t: number): ViewBox {
  const e = easeInOutQuart(t)
  return {
    x: lerp(from.x, to.x, e),
    y: lerp(from.y, to.y, e),
    w: lerp(from.w, to.w, e),
    h: lerp(from.h, to.h, e),
  }
}

function vbString(vb: ViewBox) {
  return `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`
}

/** Runs the viewBox zoom animation over `duration` ms. */
function useZoomAnimation(active: boolean, duration = 2000): ViewBox {
  const [vb, setVb] = useState<ViewBox>(VB_INITIAL)
  const rafRef      = useRef<number | null>(null)
  const startRef    = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    startRef.current = null

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const t = Math.min(elapsed / duration, 1)
      setVb(interpolateVB(VB_INITIAL, VB_ZOOMED, t))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [active, duration])

  return vb
}

// ---------------------------------------------------------------------------
// SVG dimensions
// ---------------------------------------------------------------------------

const [VB_W, VB_H] = PM_VIEWBOX.split(' ').slice(2).map(Number)

// ---------------------------------------------------------------------------
// Simple teardrop map-pin
// ---------------------------------------------------------------------------

interface MarkerPinProps {
  isPartner: boolean
  label:     string
}

function MarkerPin({ isPartner, label }: MarkerPinProps) {
  const fill    = isPartner ? GOLD    : '#3d5670'
  const dotFill = isPartner ? '#0f2a44' : '#2a3f55'

  return (
    <div
      aria-label={label}
      title={label}
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        filter: isPartner
          ? 'drop-shadow(0 0 10px rgba(194,162,77,0.75)) drop-shadow(0 0 24px rgba(194,162,77,0.35))'
          : 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))',
      }}
    >
      <svg width="26" height="34" viewBox="0 0 26 34" fill="none" aria-hidden="true">
        <path
          d="M13 0C5.82 0 0 5.82 0 13c0 8.78 11.67 20.48 12.19 21.03a1.08 1.08 0 0 0 1.62 0C14.33 33.48 26 21.78 26 13 26 5.82 20.18 0 13 0Z"
          fill={fill}
        />
        <circle cx="13" cy="12" r="4.5" fill={dotFill} />
        {isPartner && <circle cx="13" cy="12" r="2" fill={GOLD} opacity="0.95" />}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Porto Montenegro SVG map
// ---------------------------------------------------------------------------

interface PortoMapProps {
  vb:           ViewBox   // current animated viewBox object
  markerCount:  number
}

function PortoMontenegroMap({ vb, markerCount }: PortoMapProps) {
  // Reveal order: 3 gray markers first, gold last
  const revealOrder = [1, 2, 3, 0]

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: `${VB_W} / ${VB_H}` }}>

      {/* ── SVG base map ───────────────────────────────────────── */}
      <svg
        viewBox={vbString(vb)}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* Sea background */}
        <rect width={VB_W} height={VB_H} fill="#091d33" />

        {/* Water bodies */}
        {PM_WATER_PATHS.map((d, i) => (
          <path key={`w${i}`} d={d} fill="#0c2445" />
        ))}

        {/* Marina / harbour */}
        {PM_MARINA_PATHS.map((d, i) => (
          <path key={`m${i}`} d={d} fill="#0e2a52" stroke="rgba(194,162,77,0.15)" strokeWidth="0.8" />
        ))}

        {/* Landuse */}
        {PM_LANDUSE_PATHS.map((d, i) => (
          <path key={`l${i}`} d={d} fill="rgba(15,42,68,0.65)" />
        ))}

        {/* Primary roads */}
        {PM_ROADS.primary.map((d, i) => (
          <path key={`rp${i}`} d={d} fill="none" stroke="rgba(232,230,225,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Minor roads */}
        {PM_ROADS.minor.map((d, i) => (
          <path key={`rm${i}`} d={d} fill="none" stroke="rgba(232,230,225,0.18)" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Pedestrian */}
        {PM_ROADS.pedestrian.map((d, i) => (
          <path key={`rf${i}`} d={d} fill="none" stroke="rgba(232,230,225,0.09)" strokeWidth="0.5" strokeLinecap="round" />
        ))}

        {/* Piers / breakwaters */}
        {PM_PIER_PATHS.map((d, i) => (
          <path key={`pier${i}`} d={d} fill="none" stroke="rgba(194,162,77,0.3)" strokeWidth="1.4" strokeLinecap="round" />
        ))}

      </svg>

      {/* ── Tour-operator pin shapes (HTML, positioned over SVG) ── */}
      {/*
        Positions are derived from the CURRENT viewBox so they remain
        locked to the correct map coordinate as the zoom progresses.
      */}
      {PM_TOUR_OPERATORS.map((op, i) => {
        const seqIdx    = revealOrder.indexOf(i)
        const isVisible = seqIdx < markerCount

        const leftPct = ((op.x - vb.x) / vb.w) * 100
        const topPct  = ((op.y - vb.y) / vb.h) * 100

        return (
          <div
            key={op.id}
            style={{
              position: 'absolute',
              left: `${leftPct}%`,
              top:  `${topPct}%`,
              opacity:   isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1)' : 'scale(0.4)',
              transition: `opacity 400ms ${easeOut}, transform 400ms ${easeOut}`,
              zIndex: op.isPartner ? 10 : 5,
            }}
          >
            <MarkerPin isPartner={op.isPartner} label={op.name} />
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export function BeSeenSection() {
  const { t }                  = useLanguage()
  const sectionRef             = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [markerCount, setMarkerCount] = useState(0)

  // Scroll-triggered reveal
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !revealed) setRevealed(true) },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [revealed])

  // Stagger the 4 marker reveals
  useEffect(() => {
    if (!revealed) return
    const timers = [
      setTimeout(() => setMarkerCount(1), 300),
      setTimeout(() => setMarkerCount(2), 650),
      setTimeout(() => setMarkerCount(3), 1000),
      setTimeout(() => setMarkerCount(4), 1450),
    ]
    return () => timers.forEach(clearTimeout)
  }, [revealed])

  // Smooth viewBox zoom — starts once section is revealed
  const animatedVB = useZoomAnimation(revealed, 2200)

  return (
    <section
      ref={sectionRef}
      id="be-seen"
      className="bg-navy"
      style={{ paddingTop: 'clamp(4rem, 8vw, 7rem)', paddingBottom: 'clamp(4rem, 8vw, 7rem)' }}
      aria-labelledby="be-seen-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-16">

        {/* Two-column: text left / map right (stacks on mobile) */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-24">

          {/* ── Text column ──────────────────────────────────────── */}
          <div
            className="lg:w-1/2 flex flex-col gap-6"
            style={{
              opacity:   revealed ? 1 : 0,
              transform: revealed ? 'translateX(0)' : 'translateX(-32px)',
              transition: `opacity 700ms ${easeOut}, transform 700ms ${easeOut}`,
            }}
          >
            <h2
              id="be-seen-heading"
              className="font-display font-medium text-cream leading-tight"
              style={{ fontSize: 'clamp(1.9rem, 2.4vw, 2.6rem)' }}
            >
              {t('partner.beSeen.headline')}
            </h2>

            <p
              className="font-body leading-relaxed"
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                color: `${CREAM}99`,
              }}
            >
              {t('partner.beSeen.subheadline')}
            </p>
          </div>

          {/* ── Map column ───────────────────────────────────────── */}
          <div
            className="lg:w-1/2"
            style={{
              position: 'relative',
              opacity:   revealed ? 1 : 0,
              transform: revealed ? 'translateX(0)' : 'translateX(32px)',
              transition: `opacity 700ms ${easeOut} 150ms, transform 700ms ${easeOut} 150ms`,
            }}
          >
            <PortoMontenegroMap
              vb={animatedVB}
              markerCount={markerCount}
            />

            {/* Four edge-bleed overlays — paint the exact section bg colour
                from each side inward so the map dissolves seamlessly */}
            {(['top','bottom','left','right'] as const).map(side => {
              const isH = side === 'left' || side === 'right'
              const size = isH ? '35%' : '40%'
              const gradDir = {
                top:    'to bottom',
                bottom: 'to top',
                left:   'to right',
                right:  'to left',
              }[side]
              return (
                <div
                  key={side}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    top:    side === 'bottom' ? 'auto' : 0,
                    bottom: side === 'top'    ? 'auto' : 0,
                    left:   side === 'right'  ? 'auto' : 0,
                    right:  side === 'left'   ? 'auto' : 0,
                    width:  isH   ? size : '100%',
                    height: isH   ? '100%' : size,
                    background: `linear-gradient(${gradDir}, #0f2a44 0%, rgba(15,42,68,0.7) 40%, transparent 100%)`,
                    zIndex: 2,
                  }}
                />
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}
