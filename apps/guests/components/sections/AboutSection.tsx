'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

export function AboutSection() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimated = useRef(false)

  // Load SVG
  useEffect(() => {
    fetch('/illustrations/montenegro_coastline_vector.svg')
      .then(r => r.text())
      .then(svgText => {
        console.log('✅ SVG loaded')
        setSvgContent(svgText)
      })
  }, [])

  // Intersection observer
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log('👁️ Visible')
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Animate
  useEffect(() => {
    if (!svgContent || !isVisible || hasAnimated.current || !containerRef.current) return

    hasAnimated.current = true
    console.log('🎬 ANIMATING')

    setTimeout(() => {
      const svg = containerRef.current?.querySelector('svg')
      if (!svg) {
        console.error('❌ NO SVG')
        return
      }

      // Make SVG responsive and properly sized
      svg.style.width = '100%'
      svg.style.height = '100%'
      svg.style.display = 'block'
      svg.style.maxWidth = '100%'
      svg.style.maxHeight = '100%'
      
      // Style the g element with stroke
      const g = svg.querySelector('g')
      if (g) {
        g.setAttribute('stroke', '#c2a24d')
        g.setAttribute('stroke-width', '50')  // This works with the transform scale
        g.setAttribute('fill', 'none')
        g.setAttribute('stroke-linecap', 'round')
        g.setAttribute('stroke-linejoin', 'round')
        console.log('✅ G styled')
      }

      const paths = svg.querySelectorAll('path')
      console.log(`✅ ${paths.length} paths`)

      paths.forEach((path, i) => {
        const len = path.getTotalLength()
        console.log(`📏 Path ${i}: ${len}`)

        // Path inherits stroke from g
        path.setAttribute('fill', 'none')

        // Hide for animation
        path.style.strokeDasharray = `${len}`
        path.style.strokeDashoffset = `${len}`

        // Animate
        setTimeout(() => {
          console.log(`✏️ Drawing ${i}`)
          path.style.transition = 'stroke-dashoffset 4s linear'
          requestAnimationFrame(() => {
            path.style.strokeDashoffset = '0'
            console.log(`✅ Path ${i} DRAWING NOW`)
          })

          // Pulse after
          setTimeout(() => {
            path.style.animation = 'svg-pulse 3s ease-in-out infinite'
          }, 4100)
        }, 200)
      })
    }, 200)
  }, [svgContent, isVisible])

  const bullets = t('about.bullets') as string[]

  return (
    <Section spacing="md" id="about">
      <Container maxWidth="default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="text-cream">{t('about.headline')} </span>
              <span className="text-gold">{t('about.headlineEmphasized')}</span>
              <span className="text-cream">{t('about.headlineSuffix')}</span>
            </h2>

            <ul className="space-y-6">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                  </div>
                  <p className="text-lg text-cream leading-relaxed">{bullet}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center w-full">
            <div 
              ref={containerRef}
              className="relative w-full max-w-[600px] lg:max-w-[700px] aspect-[16/9]"
            >
              {svgContent ? (
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                  suppressHydrationWarning
                />
              ) : (
                <div className="flex items-center justify-center h-full text-cream/30 text-sm">
                  Loading...
                </div>
              )}

              <div
                className="absolute inset-0 pointer-events-none -z-10"
                style={{
                  opacity: isVisible ? 1 : 0,
                  background: 'radial-gradient(ellipse, rgba(194,162,77,0.15) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                  transition: 'opacity 1s',
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
