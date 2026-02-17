'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'
import { CategoryTile } from '../CategoryTile'

const categories = [
  'travelInSafeHands',
  'charterBoat',
  'joinBoatTour',
  'experienceHiddenGems',
  'tasteLocalWines',
  'stayFit',
  'accessBeachClubs',
  'tasteLocalFlavours',
] as const

/** Image paths for each category - optimized WebP */
const CATEGORY_IMAGES: Record<(typeof categories)[number], string> = {
  charterBoat: '/images/experiences/cards/charter_boat.webp',
  joinBoatTour: '/images/experiences/cards/join_boat_tour.webp?v=2',
  experienceHiddenGems: '/images/experiences/cards/find_hidden_gems.webp',
  tasteLocalWines: '/images/experiences/cards/taste_local_wines.webp',
  stayFit: '/images/experiences/cards/stay_fit.webp',
  accessBeachClubs: '/images/experiences/cards/access_beach_clubs.webp',
  travelInSafeHands: '/images/experiences/cards/travel_safe_hands.webp',
  tasteLocalFlavours: '/images/experiences/cards/taste_local_flavours.webp',
}

/** Optional object-position per category to adjust image framing */
const CATEGORY_IMAGE_POSITIONS: Partial<Record<(typeof categories)[number], string>> = {
  travelInSafeHands: 'center 70%', // shift up so car is more visible above frosted pane
}

const DRAG_THRESHOLD_PX = 5
const MOMENTUM_DECAY = 0.92
const MOMENTUM_MIN_VELOCITY = 0.5
const CARD_WIDTH = 280
const CARD_GAP = 24
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP

/** Chevron arrow icon - gold, subtle */
function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const isLeft = direction === 'left'
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gold opacity-90 transition-opacity duration-base group-hover:opacity-100 group-disabled:opacity-30"
      aria-hidden
    >
      {isLeft ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  )
}

export function ExperienceGridSection() {
  const { t } = useLanguage()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragState = useRef({
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  })
  const momentumRef = useRef<number | null>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return
    const rect = scrollRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    setIsDragging(true)
    dragState.current = {
      startX: x,
      scrollLeft: scrollRef.current.scrollLeft,
      hasMoved: false,
      lastX: x,
      lastTime: performance.now(),
      velocity: 0,
    }
    if (momentumRef.current !== null) {
      cancelAnimationFrame(momentumRef.current)
      momentumRef.current = null
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return
      const rect = scrollRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const now = performance.now()
      const dt = now - dragState.current.lastTime
      if (dt > 0) {
        dragState.current.velocity = (dragState.current.lastX - x) / dt
      }
      dragState.current.lastX = x
      dragState.current.lastTime = now
      const walk = (x - dragState.current.startX) * 1.2
      scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk
      if (Math.abs(walk) > DRAG_THRESHOLD_PX) {
        dragState.current.hasMoved = true
      }
    },
    [isDragging]
  )

  const applyMomentum = useCallback(() => {
    if (!scrollRef.current) return
    const velocity = dragState.current.velocity
    if (Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) return

    let v = velocity * 12
    const el = scrollRef.current

    const animate = () => {
      if (!el) return
      el.scrollLeft += v
      v *= MOMENTUM_DECAY
      if (Math.abs(v) > 0.5) {
        momentumRef.current = requestAnimationFrame(animate)
      }
    }
    momentumRef.current = requestAnimationFrame(animate)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      applyMomentum()
    }
  }, [isDragging, applyMomentum])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      applyMomentum()
    }
  }, [isDragging, applyMomentum])

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragState.current.hasMoved) {
      e.preventDefault()
      e.stopPropagation()
      dragState.current.hasMoved = false
    }
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        applyMomentum()
      }
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isDragging, applyMomentum])

  useEffect(() => {
    return () => {
      if (momentumRef.current !== null) {
        cancelAnimationFrame(momentumRef.current)
      }
    }
  }, [])

  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  }, [])

  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }, [])

  const [canScrollLeft, setCanScrollLeft] = useState(true)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState)
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  return (
    <Section spacing="md" id="experiences">
      <Container maxWidth="full">
        {/* Optional Section Header */}
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream text-center mb-16 md:mb-24">
          {t('categories.sectionTitle')}
        </h2>

        {/* MOBILE: Vertical snap scroll cards */}
        <div className="md:hidden flex flex-col gap-6 px-6">
          {categories.map((categoryKey) => (
            <div
              key={categoryKey}
              className="snap-start snap-always"
              style={{ scrollSnapAlign: 'start' }}
            >
              <CategoryTile
                category={t(`categories.${categoryKey}`)}
                imageSrc={CATEGORY_IMAGES[categoryKey]}
                imagePosition={CATEGORY_IMAGE_POSITIONS[categoryKey]}
                onClick={() => {
                  console.log(`Navigate to ${categoryKey}`)
                  // TODO: Add navigation when category pages are built
                }}
              />
            </div>
          ))}
        </div>

        {/* DESKTOP/TABLET: Horizontal scroll carousel */}
        <div
          className="hidden md:block relative"
          role="region"
          aria-label="Experience categories"
        >
          {/* Left Fade Gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none" />

          {/* Carousel wrapper - same bounds as scroll area so arrows position correctly */}
          <div className="relative w-full max-w-[1440px] mx-auto">
            {/* Scrollable Container - drag on desktop, swipe on tablet, no scrollbar */}
            <div
              ref={scrollRef}
              className={`carousel-scroll overflow-x-auto hide-scrollbar snap-x snap-proximity select-none w-full ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onClickCapture={handleClickCapture}
            >
              <div className="flex items-start gap-6 px-6 md:px-12 lg:px-16 py-4">
                {categories.map((categoryKey) => (
                  <CategoryTile
                    key={categoryKey}
                    category={t(`categories.${categoryKey}`)}
                    imageSrc={CATEGORY_IMAGES[categoryKey]}
                    imagePosition={CATEGORY_IMAGE_POSITIONS[categoryKey]}
                    onClick={() => {
                      console.log(`Navigate to ${categoryKey}`)
                      // TODO: Add navigation when category pages are built
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: floating arrows - top right of carousel, subtle, gold, side by side */}
            <div className="hidden lg:flex absolute top-4 right-4 z-20 gap-2">
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll carousel left"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-navy/90 backdrop-blur-md border-2 border-gold/60 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:border-gold hover:bg-navy transition-all duration-base focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gold/60"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll carousel right"
              className="group flex items-center justify-center w-10 h-10 rounded-full bg-navy/90 backdrop-blur-md border-2 border-gold/60 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:border-gold hover:bg-navy transition-all duration-base focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gold/60"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
          </div>

          {/* Right Fade Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none" />
        </div>
      </Container>
    </Section>
  )
}
