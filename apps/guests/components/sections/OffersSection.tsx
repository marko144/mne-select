'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

// ─── Design tokens ───────────────────────────────────────────────────────────

const GOLD    = '#c2a24d'
const CREAM   = '#e8e6e1'
const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

// ─── QR code (programmatic — correct finder patterns + timing + data) ─────────

function isQRSet(r: number, c: number): boolean {
  /** Returns dark/light state for a given cell in a 21×21 QR grid. */
  const inFinder = (fr: number, fc: number): boolean | null => {
    const row = r - fr, col = c - fc
    if (row < 0 || row >= 7 || col < 0 || col >= 7) return null
    if (row === 0 || row === 6 || col === 0 || col === 6) return true
    if (row === 1 || row === 5 || col === 1 || col === 5) return false
    return true
  }
  const tl = inFinder(0, 0);  if (tl !== null) return tl
  const tr = inFinder(0, 14); if (tr !== null) return tr
  const bl = inFinder(14, 0); if (bl !== null) return bl
  // Separators (always light)
  if ((r === 7 && c <= 7) || (c === 7 && r <= 7)) return false
  if ((r === 7 && c >= 13) || (c === 13 && r <= 7)) return false
  if ((r === 13 && c <= 7) || (c === 7 && r >= 13)) return false
  // Timing patterns
  if (r === 6 && c >= 8 && c <= 12) return c % 2 === 0
  if (c === 6 && r >= 8 && r <= 12) return r % 2 === 0
  // Pseudo-random data modules
  return ((r * 17 + c * 29 + r * c * 7) % 100) > 44
}

function QRCode({ size = 60 }: { size?: number }) {
  const N = 21
  const cell = size / N
  const rects: React.ReactElement[] = []
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (isQRSet(r, c)) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cell} y={r * cell}
            width={Math.max(cell - 0.5, 0.5)}
            height={Math.max(cell - 0.5, 0.5)}
            rx={cell * 0.15}
            fill="currentColor"
          />
        )
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {rects}
    </svg>
  )
}

// ─── Barcode (decorative SVG) ─────────────────────────────────────────────────

function Barcode({ height = 28 }: { height?: number }) {
  const W = 200
  const pattern = [2,1,3,1,2,2,1,3,2,1,2,1,3,1,2,3,1,2,1,3,2,1,2,2,1,3,1,2]
  const total = pattern.reduce((a, b) => a + b, 0)
  const unitW = W / total
  const bars: React.ReactElement[] = []
  let x = 0
  pattern.forEach((w, i) => {
    const bw = w * unitW
    if (i % 2 === 0) {
      bars.push(<rect key={i} x={x} y={0} width={Math.max(bw - 0.6, 0.4)} height={28} fill="currentColor" />)
    }
    x += bw
  })
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} 28`} preserveAspectRatio="none" aria-hidden="true">
      {bars}
    </svg>
  )
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

function CutleryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2v6a2 2 0 004 0V2M8 8v14" />
      <path d="M16 2c0 4 2 6 2 9a4 4 0 01-4 0c0-3 2-5 2-9M16 17v5" />
    </svg>
  )
}

function DumbbellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  )
}

// ─── Card shell — shared wrapper with 3D tilt + shimmer ───────────────────────

function CardShell({ children }: { children: React.ReactNode }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10
    const y = -((e.clientY - rect.top)  / rect.height - 0.5) * 6
    setTilt({ x, y })
  }

  const isNeutral = tilt.x === 0 && tilt.y === 0

  /*
   * The 3D perspective transform and overflow/border-radius MUST live on
   * separate elements. Combining them on the same element causes browsers
   * (especially Safari) to skip the corner clip, showing sharp edges.
   * Outer div: only the tilt transform.
   * Inner div: all visual styling (background, border-radius, overflow, shadow).
   */
  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
        transition: isNeutral ? `transform 600ms ${easeOut}` : 'transform 80ms ease-out',
        willChange: 'transform',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          background: 'linear-gradient(145deg, #122336 0%, #0d1e30 55%, #091829 100%)',
          border: '1px solid rgba(194,162,77,0.22)',
          boxShadow: [
            '0 0 0 1px rgba(194,162,77,0.18)',
            '0 4px 20px rgba(0,0,0,0.35)',
            '0 16px 56px rgba(0,0,0,0.3)',
            'inset 0 1px 0 rgba(255,255,255,0.08)',
          ].join(', '),
          overflow: 'hidden',
        }}
      >
        {/* Diagonal shimmer sweep */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit', zIndex: 5 }}
        >
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: '22%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
            animationName: 'mns-offer-shimmer',
            animationDuration: '6s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '-2s',
          }} />
        </div>

        {/* Inner top-edge highlight */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
            pointerEvents: 'none', zIndex: 6,
          }}
        />

        {children}
      </div>
    </div>
  )
}

// ─── Card header ──────────────────────────────────────────────────────────────

function CardHeader({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
      borderBottom: '1px solid rgba(194,162,77,0.1)',
      background: 'rgba(194,162,77,0.035)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ color: GOLD, opacity: 0.8 }}>{icon}</div>
        <span style={{
          fontSize: 11, fontWeight: 600, color: CREAM,
          letterSpacing: '0.13em', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase',
        }}>
          {name}
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/full_logo_gold.svg" alt="" aria-hidden="true" style={{ height: 13, width: 'auto', opacity: 0.6 }} />
    </div>
  )
}

// ─── Card 1: Restaurant offer ─────────────────────────────────────────────────

function RestaurantCard() {
  return (
    <CardShell>
      <CardHeader icon={<CutleryIcon />} name="Marina Bistro" />
      <div style={{ padding: '20px 20px 18px' }}>
        <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-display,Cormorant Garamond,Georgia,serif)', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
          €10 off dinner
        </p>
        <p style={{ margin: '7px 0 0', fontSize: 12.5, color: `${CREAM}BB`, fontFamily: 'Inter,sans-serif', lineHeight: 1.4 }}>
          When you spend €60 or more
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
          <div style={{ color: `${CREAM}50` }}><ClockIcon /></div>
          <p style={{ margin: 0, fontSize: 11, color: `${CREAM}60`, fontFamily: 'Inter,sans-serif' }}>
            Valid 12:00 – 17:00
          </p>
        </div>

        <div style={{ height: 1, background: 'rgba(194,162,77,0.1)', margin: '16px 0' }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ color: `${CREAM}C0` }}>
            <QRCode size={62} />
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 2 }}>
            <p style={{ margin: 0, fontSize: 9, color: `${CREAM}40`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Offer code
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: `${CREAM}90`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.08em', fontWeight: 500 }}>
              MS-2024-0042
            </p>
            <p style={{ margin: '5px 0 0', fontSize: 9, color: `${CREAM}35`, fontFamily: 'Inter,sans-serif' }}>
              Montenegro Select member
            </p>
          </div>
        </div>
      </div>
    </CardShell>
  )
}

// ─── Card 2: Fitness pass ─────────────────────────────────────────────────────

function FitnessCard() {
  return (
    <CardShell>
      <CardHeader icon={<DumbbellIcon />} name="Life Fitness Gym" />
      <div style={{ padding: '20px 20px 18px' }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: `${CREAM}55`, letterSpacing: '0.16em', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase' }}>
          Fitness Pass
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 40, fontWeight: 700, color: GOLD, fontFamily: 'var(--font-display,Cormorant Garamond,Georgia,serif)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          €60
        </p>

        {/* Three stat pills */}
        <div style={{ display: 'flex', gap: 0, marginTop: 14 }}>
          {[
            { label: 'Valid for', value: '7 days' },
            { label: 'Visits',    value: '3 incl.' },
            { label: 'Access',    value: 'Full gym' },
          ].map(({ label, value }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div style={{ width: 1, background: `${CREAM}14`, margin: '0 14px' }} />}
              <div>
                <p style={{ margin: 0, fontSize: 9, color: `${CREAM}45`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {label}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 600, color: CREAM, fontFamily: 'Inter,sans-serif' }}>
                  {value}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(194,162,77,0.1)', margin: '16px 0 12px' }} />

        <div style={{ color: `${CREAM}B0` }}>
          <Barcode height={28} />
        </div>
        <p style={{ margin: '6px 0 0', textAlign: 'center', fontSize: 9, color: `${CREAM}35`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.1em' }}>
          Montenegro Select member access
        </p>
      </div>
    </CardShell>
  )
}

// ─── Card carousel (auto-rotating loop, 3 s per card) ────────────────────────

const CARD_COUNT = 2

function CardCarousel({ active }: { active: boolean }) {
  const [idx, setIdx]   = useState(0)
  const [prev, setPrev] = useState<number | null>(null)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setIdx(i => {
        const next = (i + 1) % CARD_COUNT
        setPrev(i)
        setTimeout(() => setPrev(null), 420)
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [active])

  const cards = [<RestaurantCard key="r" />, <FitnessCard key="f" />]

  return (
    /*
     * Both cards sit in the same CSS grid cell (gridArea '1/1').
     * The grid row height = the tallest card — it never changes,
     * so the surrounding text never reflows when cards swap.
     * No position:absolute, no overflow:hidden — shadows render freely.
     */
    <div style={{ display: 'grid' }}>
      {cards.map((card, i) => {
        const isActive = i === idx
        const isPrev   = i === prev
        const dx = isActive ? 40 : -40
        return (
          <div
            key={i}
            style={{
              gridArea: '1 / 1',
              opacity:   isActive ? 1 : 0,
              transform: isActive ? 'translateX(0) scale(1)' : `translateX(${dx}px) scale(0.98)`,
              transition: (isActive || isPrev)
                ? `opacity 400ms ${easeOut}, transform 400ms ${easeOut}`
                : 'none',
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {card}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function OffersSection() {
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

  return (
    <>
      {/* Shimmer keyframe — injected once */}
      <style>{`
        @keyframes mns-offer-shimmer {
          0%   { transform: translateX(-120%) skewX(-18deg); }
          100% { transform: translateX(500%)  skewX(-18deg); }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="offers"
        className="bg-navy"
        style={{ paddingTop: 'clamp(4rem, 8vw, 7rem)', paddingBottom: 'clamp(4rem, 8vw, 7rem)' }}
        aria-labelledby="offers-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-24">

            {/* ── Text column ─────────────────────────────────── */}
            <div
              className="lg:w-5/12 flex flex-col gap-6"
              style={{
                opacity:   revealed ? 1 : 0,
                transform: revealed ? 'translateX(0)' : 'translateX(-32px)',
                transition: `opacity 700ms ${easeOut}, transform 700ms ${easeOut}`,
              }}
            >
              <h2
                id="offers-heading"
                className="font-display font-medium text-cream leading-tight"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
              >
                {t('partner.offers.headline')}
              </h2>
              <p
                className="font-body leading-relaxed"
                style={{
                  fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                  color: `${CREAM}99`,
                }}
              >
                {t('partner.offers.subheadline')}
              </p>
            </div>

            {/* ── Cards column ────────────────────────────────── */}
            <div
              className="lg:w-7/12"
              style={{
                maxWidth: 400,
                width: '100%',
                margin: '0 auto',
                opacity:   revealed ? 1 : 0,
                transform: revealed ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 700ms ${easeOut} 180ms, transform 700ms ${easeOut} 180ms`,
              }}
            >
              <CardCarousel active={revealed} />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
