'use client'

import React from 'react'
import Image from 'next/image'
import { useLanguage } from '../contexts/LanguageContext'

export interface CategoryTileProps {
  category: string
  imageSrc?: string
  /** Optional object-position to shift image framing (e.g. "center 70%" to show more of bottom) */
  imagePosition?: string
  onClick?: () => void
}

export function CategoryTile({ category, imageSrc, imagePosition, onClick }: CategoryTileProps) {
  const { language } = useLanguage()
  const isMontenegrin = language === 'me'
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="group relative overflow-hidden rounded-lg cursor-pointer snap-center flex-shrink-0 w-[280px] aspect-[3/4] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_10px_25px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_12px_-2px_rgba(0,0,0,0.25),0_20px_40px_-10px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy transition-all duration-slow"
      aria-label={`View ${category} experiences`}
    >
      {/* Background - navy fallback when no image */}
      <div className="absolute inset-0 bg-navy flex items-center justify-center">
        {!imageSrc && (
          <span className="text-gold font-display text-2xl md:text-3xl font-semibold">
            {category}
          </span>
        )}
      </div>

      {/* Image - object-cover fills full width, crops top/bottom to match card */}
      {imageSrc && (
        <div className="absolute inset-0 transition-transform duration-slow group-hover:scale-105 select-none">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover select-none"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
            sizes="280px"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      )}

      {/* Frosted bottom bar - taller for Montenegrin (2 lines), smaller for English (1 line) */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/85 via-navy/65 to-transparent backdrop-blur-md transition-all duration-slow ${
          isMontenegrin ? 'h-24' : 'h-16'
        }`}
        aria-hidden
      />

      {/* Category Title - vertically centered in frosted pane */}
      <div
        className={`absolute bottom-0 left-0 right-0 flex items-center justify-center px-6 z-10 transition-all duration-slow ${
          isMontenegrin ? 'h-24' : 'h-16'
        }`}
      >
        <h3 className="font-display text-2xl font-semibold text-gold tracking-wide text-center relative">
          {category}
          {/* Gold underline animation on hover */}
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold scale-x-0 origin-center transition-transform duration-base group-hover:scale-x-100 mx-auto w-3/4" />
        </h3>
      </div>

      {/* Touch device: more visible gold accents */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-gold/40 to-transparent md:opacity-0" />
      <div className="absolute inset-0 border-2 border-gold/20 rounded-lg md:opacity-0 pointer-events-none" />
    </article>
  )
}
