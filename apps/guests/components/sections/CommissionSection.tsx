'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

// ─── Design tokens ────────────────────────────────────────────────────────────

const GOLD    = '#c2a24d'
const NAVY    = '#0f2a44'
const CREAM   = '#e8e6e1'
const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

// ─── Donut geometry ───────────────────────────────────────────────────────────

const CX        = 120
const CY        = 120
const R         = 76
const SW        = 42              // ring thickness
const CIRC      = 2 * Math.PI * R // ≈ 477.5
const EXTRUSION = 16              // SVG px of depth (creates visible wall after rotateX)

// Commission proportions — no hard numbers exposed to the UI
const PLATFORM_FEE = 0.30
const OUR_FEE      = 0.11

// Timings
const PHASE_MS      = 1800  // how long each state is held
const TRANSITION_MS = 950   // arc transition duration

type Phase = 'platform' | 'ours'

// ─── Animation hook ───────────────────────────────────────────────────────────

function useCommissionAnim(active: boolean): Phase {
  const [phase, setPhase] = useState<Phase>('platform')

  useEffect(() => {
    if (!active) return
    let timer: ReturnType<typeof setTimeout>

    const toggle = () => {
      setPhase(p => (p === 'platform' ? 'ours' : 'platform'))
      timer = setTimeout(toggle, PHASE_MS + TRANSITION_MS)
    }

    timer = setTimeout(toggle, PHASE_MS)
    return () => clearTimeout(timer)
  }, [active])

  return phase
}

// ─── 3D donut chart ───────────────────────────────────────────────────────────

function CommissionDonut({ phase }: { phase: Phase }) {
  const { t }  = useLanguage()
  const fee    = phase === 'platform' ? PLATFORM_FEE : OUR_FEE
  const feeArc = CIRC * fee

  const isPlatform = phase === 'platform'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      {/* Cycling label — above the chart */}
      <div style={{ position: 'relative', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 220 }}>
        {/* Other platforms text */}
        <p style={{
          margin: 0,
          position: 'absolute',
          fontSize: 13,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: `${CREAM}60`,
          opacity: isPlatform ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ${easeOut}`,
          whiteSpace: 'nowrap',
        }}>
          {t('partner.commission.otherPlatforms')}
        </p>

        {/* Montenegro Select logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/full_logo_gold.svg"
          alt="Montenegro Select"
          style={{
            position: 'absolute',
            height: 54,
            width: 'auto',
            objectFit: 'contain',
            opacity: isPlatform ? 0 : 1,
            transition: `opacity ${TRANSITION_MS}ms ${easeOut}`,
          }}
        />
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: 240, height: 260 }}>

        {/* Ground shadow — simulates the disc casting a shadow */}
        <div style={{
          position: 'absolute',
          bottom: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: 32,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }} />

        <svg
          width="240"
          height="260"
          viewBox="0 0 240 260"
          overflow="visible"
          style={{
            transform: 'perspective(700px) rotateX(54deg)',
            transformOrigin: 'center center',
            display: 'block',
          }}
        >
          {/* ── Wall layer (EXTRUSION px below top face) ─────────────
              Rendered first so the top face paints over the top half,
              leaving only the front-bottom edge visible as extrusion wall. */}

          {/* Gold wall — full earnings ring */}
          <circle
            cx={CX} cy={CY + EXTRUSION} r={R}
            fill="none"
            stroke="#7a6530"
            strokeWidth={SW}
            transform={`rotate(-90 ${CX} ${CY + EXTRUSION})`}
            style={{ strokeDasharray: `${CIRC} ${CIRC}` }}
          />

          {/* Navy wall — commission arc */}
          <circle
            cx={CX} cy={CY + EXTRUSION} r={R}
            fill="none"
            stroke="#040b16"
            strokeWidth={SW}
            transform={`rotate(-90 ${CX} ${CY + EXTRUSION})`}
            style={{
              strokeDasharray: `${feeArc} ${CIRC}`,
              transition: `stroke-dasharray ${TRANSITION_MS}ms ${easeOut}`,
            }}
          />

          {/* Wall outer edge — thin highlight at the very bottom rim */}
          <circle
            cx={CX} cy={CY + EXTRUSION} r={R + SW / 2 + 1}
            fill="none"
            stroke={`${CREAM}08`}
            strokeWidth="2"
          />

          {/* ── Top face (the bright visible surface) ──────────────── */}

          {/* Outer rim highlight */}
          <circle
            cx={CX} cy={CY} r={R + SW / 2 + 3}
            fill="none"
            stroke={`${CREAM}12`}
            strokeWidth="3"
          />

          {/* Earnings ring — always full gold circle */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={GOLD}
            strokeWidth={SW}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{
              strokeDasharray: `${CIRC} ${CIRC}`,
              filter: `drop-shadow(0 0 12px ${GOLD}55)`,
            }}
          />

          {/* Commission slice — dark navy, animates size */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={`${NAVY}f2`}
            strokeWidth={SW}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{
              strokeDasharray: `${feeArc} ${CIRC}`,
              transition: `stroke-dasharray ${TRANSITION_MS}ms ${easeOut}`,
            }}
          />

          {/* Inner rim — adds depth */}
          <circle
            cx={CX} cy={CY} r={R - SW / 2 - 1}
            fill="none"
            stroke={`${NAVY}70`}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 11, height: 11, borderRadius: 3,
            background: GOLD,
            boxShadow: `0 0 6px ${GOLD}50`,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 13, fontFamily: 'Inter, sans-serif',
            color: `${CREAM}70`, letterSpacing: '0.03em',
          }}>
            {t('partner.commission.yourEarnings')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 11, height: 11, borderRadius: 3,
            background: `${NAVY}f2`,
            border: `1px solid ${CREAM}30`,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 13, fontFamily: 'Inter, sans-serif',
            color: `${CREAM}70`, letterSpacing: '0.03em',
          }}>
            {t('partner.commission.commission')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function CommissionSection() {
  const { t }                   = useLanguage()
  const sectionRef              = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !revealed) setRevealed(true) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [revealed])

  const phase = useCommissionAnim(revealed)

  return (
    <section
      ref={sectionRef}
      id="commission"
      className="bg-navy"
      style={{ paddingTop: 'clamp(4rem, 8vw, 7rem)', paddingBottom: 'clamp(4rem, 8vw, 7rem)' }}
      aria-labelledby="commission-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row-reverse lg:items-center gap-16 lg:gap-24">

          {/* ── Text column ───────────────────────────────────────── */}
          <div
            className="lg:w-7/12 flex flex-col gap-6"
            style={{
              opacity:   revealed ? 1 : 0,
              transform: revealed ? 'translateX(0)' : 'translateX(32px)',
              transition: `opacity 700ms ${easeOut}, transform 700ms ${easeOut}`,
            }}
          >
            <h2
              id="commission-heading"
              className="font-display font-medium text-cream leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
            >
              {t('partner.commission.headline')}
            </h2>
            <p
              className="font-body leading-relaxed"
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                color: `${CREAM}99`,
              }}
            >
              {t('partner.commission.subheadline')}
            </p>
          </div>

          {/* ── Donut chart column ────────────────────────────────── */}
          <div
            className="lg:w-5/12 flex justify-center"
            style={{
              opacity:   revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(-28px)',
              transition: `opacity 700ms ${easeOut} 200ms, transform 700ms ${easeOut} 200ms`,
            }}
          >
            <CommissionDonut phase={phase} />
          </div>

        </div>
      </div>
    </section>
  )
}
