'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

// ─── Design tokens ───────────────────────────────────────────────────────────

const GOLD    = '#c2a24d'
const NAVY    = '#0f2a44'
const CREAM   = '#e8e6e1'
const easeOut = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

// ─── Sequence timings (ms from loop start) ───────────────────────────────────

const SEQ = {
  calIn:    500,
  btnIn:    1070,
  press1:   1650,
  release1: 1870,
  swipe:    2250,
  amtIn:    2870,
  payIn:    3300,
  press2:   3750,
  release2: 3950,
  loop:     5000,
}

/**
 * Cycles through 10 animation phases (0–9) on a looping timer.
 * Only runs while `active` is true (section in viewport).
 */
function usePhoneAnim(active: boolean): number {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!active) { setPhase(0); return }

    let timers: ReturnType<typeof setTimeout>[] = []

    const run = () => {
      timers.forEach(clearTimeout)
      timers = []
      setPhase(0)

      const add = (p: number, ms: number) =>
        timers.push(setTimeout(() => setPhase(p), ms))

      add(1, SEQ.calIn)
      add(2, SEQ.btnIn)
      add(3, SEQ.press1)
      add(4, SEQ.release1)
      add(5, SEQ.swipe)
      add(6, SEQ.amtIn)
      add(7, SEQ.payIn)
      add(8, SEQ.press2)
      add(9, SEQ.release2)
      timers.push(setTimeout(run, SEQ.loop))
    }

    run()
    return () => timers.forEach(clearTimeout)
  }, [active])

  return phase
}

// ─── SVG icons ───────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
      {/* Body */}
      <rect x="5" y="11" width="44" height="38" rx="5" stroke={`${NAVY}40`} strokeWidth="1.6" />
      {/* Header band */}
      <rect x="5" y="11" width="44" height="14" rx="5" fill={`${NAVY}08`} />
      {/* Binding posts */}
      <line x1="18" y1="6" x2="18" y2="17" stroke={`${NAVY}55`} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="6" x2="36" y2="17" stroke={`${NAVY}55`} strokeWidth="2.5" strokeLinecap="round" />
      {/* Day dots row 1 */}
      <circle cx="15" cy="32" r="1.6" fill={`${NAVY}35`} />
      <circle cx="27" cy="32" r="1.6" fill={`${NAVY}35`} />
      <circle cx="39" cy="32" r="1.6" fill={`${NAVY}35`} />
      {/* Day dots row 2 */}
      <circle cx="15" cy="42" r="1.6" fill={`${NAVY}35`} />
      {/* Highlighted date */}
      <rect x="22" y="37" width="10" height="10" rx="2.5" fill={GOLD} opacity="0.9" />
      <circle cx="39" cy="42" r="1.6" fill={`${NAVY}35`} />
    </svg>
  )
}

function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="11" rx="3" fill="currentColor" />
      <path d="M7.5 11V8a4.5 4.5 0 019 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── Phone mockup ─────────────────────────────────────────────────────────────

function PhoneMockup({ phase }: { phase: number }) {
  const swiped      = phase >= 5
  const calVisible  = phase >= 1
  const btnVisible  = phase >= 2
  const bookPressed = phase === 3
  const amtVisible  = phase >= 6
  const payVisible  = phase >= 7
  const payPressed  = phase === 8

  return (
    <div
      style={{
        width: 240,
        height: 504,
        background: NAVY,
        borderRadius: 44,
        border: `1.5px solid ${GOLD}30`,
        boxShadow: [
          `0 0 0 1px ${GOLD}08`,
          '0 48px 100px rgba(232,230,225,0.10)',
          '0 16px 48px rgba(232,230,225,0.06)',
          `inset 0 1px 0 ${GOLD}12`,
        ].join(', '),
        padding: 8,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Decorative side buttons */}
      <div style={{ position: 'absolute', top: 88, left: -3, width: 3, height: 30, background: '#0a1f33', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', top: 130, left: -3, width: 3, height: 22, background: '#0a1f33', borderRadius: '2px 0 0 2px' }} />
      <div style={{ position: 'absolute', top: 100, right: -3, width: 3, height: 40, background: '#0a1f33', borderRadius: '0 2px 2px 0' }} />

      {/* Screen */}
      <div
        style={{
          background: CREAM,
          borderRadius: 36,
          overflow: 'hidden',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Notch — sits inside the navy header so it blends naturally */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 56,
            height: 5,
            background: '#061525',
            borderRadius: 3,
            zIndex: 10,
          }}
        />

        {/* Screens slide container — translateX(-50%) reveals screen 2 */}
        <div
          style={{
            display: 'flex',
            width: '200%',
            height: '100%',
            transform: swiped ? 'translateX(-50%)' : 'translateX(0)',
            transition: 'transform 290ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* ── Screen 1: Booking ──────────────────────────── */}
          <div style={{ width: '50%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Navy header bar — notch blends in */}
            <div style={{
              background: NAVY,
              paddingTop: 30,
              paddingBottom: 12,
              paddingLeft: 18,
              paddingRight: 18,
              display: 'flex',
              justifyContent: 'center',
              borderBottom: `1px solid ${GOLD}25`,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/full_logo_cream.svg"
                alt="Montenegro Select"
                height={18}
                width={72}
                style={{ height: 18, width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 18px' }}>
              {/* Calendar icon */}
              <div style={{
                opacity: calVisible ? 1 : 0,
                transform: calVisible ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 400ms ${easeOut}, transform 400ms ${easeOut}`,
              }}>
                <CalendarIcon />
              </div>

              {/* Date + tour info */}
              <div style={{
                opacity: calVisible ? 1 : 0,
                transform: calVisible ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 400ms ${easeOut} 80ms, transform 400ms ${easeOut} 80ms`,
                textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: 15, color: NAVY, fontFamily: 'Inter,sans-serif', fontWeight: 500 }}>Mon, 14 July</p>
                <p style={{ margin: '3px 0 0', fontSize: 10, color: `${NAVY}60`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.03em' }}>
                  Adventure Tour · 2 hrs
                </p>
              </div>

              <div style={{ width: '100%', height: 1, background: `${NAVY}15` }} />

              {/* Price row */}
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: calVisible ? 1 : 0,
                transition: `opacity 400ms ${easeOut} 160ms`,
              }}>
                <span style={{ fontSize: 10, color: `${NAVY}55`, fontFamily: 'Inter,sans-serif' }}>Total</span>
                <span style={{ fontSize: 14, color: NAVY, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>€55.00</span>
              </div>
            </div>

            {/* BOOK NOW button */}
            <div style={{
              padding: '0 18px 18px',
              opacity: btnVisible ? 1 : 0,
              transform: btnVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 350ms ${easeOut}, transform 350ms ${easeOut}`,
            }}>
              <div style={{
                background: GOLD,
                borderRadius: 12,
                padding: '14px 0',
                textAlign: 'center',
                transform: bookPressed ? 'scale(0.95)' : 'scale(1)',
                filter: bookPressed ? 'brightness(0.80)' : 'brightness(1)',
                transition: 'transform 80ms ease-in, filter 80ms ease-in',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.12em', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase' }}>
                  Book Now
                </span>
              </div>
            </div>
          </div>

          {/* ── Screen 2: Payment ──────────────────────────── */}
          <div style={{ width: '50%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Navy header bar — notch blends in */}
            <div style={{
              background: NAVY,
              paddingTop: 30,
              paddingBottom: 12,
              paddingLeft: 18,
              paddingRight: 18,
              display: 'flex',
              justifyContent: 'center',
              borderBottom: `1px solid ${GOLD}25`,
            }}>
              <p style={{ margin: 0, fontSize: 8, color: CREAM, letterSpacing: '0.15em', fontFamily: 'Inter,sans-serif', fontWeight: 600, textTransform: 'uppercase' }}>
                Secure Payment
              </p>
            </div>

            {/* Content area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '0 18px' }}>
              {/* Lock icon */}
              <div style={{
                color: GOLD,
                opacity: amtVisible ? 1 : 0,
                transform: amtVisible ? 'scale(1)' : 'scale(0.5)',
                transition: `opacity 350ms ${easeOut}, transform 350ms ${easeOut}`,
              }}>
                <LockIcon size={32} />
              </div>

              {/* Amount */}
              <div style={{
                textAlign: 'center',
                opacity: amtVisible ? 1 : 0,
                transform: amtVisible ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 400ms ${easeOut} 80ms, transform 400ms ${easeOut} 80ms`,
              }}>
                <p style={{ margin: 0, fontSize: 38, fontWeight: 700, color: NAVY, fontFamily: 'Inter,sans-serif', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  €55.00
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 10, color: `${NAVY}60`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.03em' }}>
                  Adventure Tour · 14 Jul
                </p>
              </div>

              <div style={{ width: '100%', height: 1, background: `${NAVY}15` }} />

              {/* Encrypted badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                opacity: amtVisible ? 1 : 0,
                transition: `opacity 400ms ${easeOut} 160ms`,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
                <span style={{ fontSize: 9, color: `${NAVY}55`, fontFamily: 'Inter,sans-serif', letterSpacing: '0.04em' }}>
                  256-bit encrypted
                </span>
              </div>
            </div>

            {/* PAY button */}
            <div style={{
              padding: '0 18px 18px',
              opacity: payVisible ? 1 : 0,
              transform: payVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 350ms ${easeOut}, transform 350ms ${easeOut}`,
            }}>
              <div style={{
                background: GOLD,
                borderRadius: 12,
                padding: '14px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transform: payPressed ? 'scale(0.95)' : 'scale(1)',
                filter: payPressed ? 'brightness(0.80)' : 'brightness(1)',
                transition: 'transform 80ms ease-in, filter 80ms ease-in',
              }}>
                <div style={{ color: NAVY }}><LockIcon size={13} /></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: '0.12em', fontFamily: 'Inter,sans-serif', textTransform: 'uppercase' }}>
                  Pay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function BookingsSection() {
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

  const phase = usePhoneAnim(revealed)

  return (
    <section
      ref={sectionRef}
      id="bookings"
      className="bg-navy"
      style={{ paddingTop: 'clamp(4rem, 8vw, 7rem)', paddingBottom: 'clamp(4rem, 8vw, 7rem)' }}
      aria-labelledby="bookings-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row-reverse lg:items-center gap-16 lg:gap-24">

          {/* ── Text column ──────────────────────────────────── */}
          <div
            className="lg:w-7/12 flex flex-col gap-6"
            style={{
              opacity:   revealed ? 1 : 0,
              transform: revealed ? 'translateX(0)' : 'translateX(32px)',
              transition: `opacity 700ms ${easeOut}, transform 700ms ${easeOut}`,
            }}
          >
            <h2
              id="bookings-heading"
              className="font-display font-medium text-cream leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)' }}
            >
              {t('partner.bookings.headline')}
            </h2>
            <p
              className="font-body leading-relaxed"
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.15rem)',
                color: `${CREAM}99`,
              }}
            >
              {t('partner.bookings.subheadline')}
            </p>
          </div>

          {/* ── Phone column ─────────────────────────────────── */}
          <div
            className="lg:w-5/12 flex justify-center"
            style={{
              opacity:   revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(-24px)',
              transition: `opacity 700ms ${easeOut} 200ms, transform 700ms ${easeOut} 200ms`,
            }}
          >
            <PhoneMockup phase={phase} />
          </div>

        </div>
      </div>
    </section>
  )
}
