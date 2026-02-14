'use client'

import React from 'react'

export interface CategoryTileProps {
  category: string
  imageSrc?: string
  onClick?: () => void
}

export function CategoryTile({ category, imageSrc, onClick }: CategoryTileProps) {
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
      className="group relative overflow-hidden rounded-lg cursor-pointer snap-center flex-shrink-0 w-[280px] h-[380px] md:w-[320px] md:h-[430px] lg:w-[360px] lg:h-[480px] focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy transition-all duration-slow"
      aria-label={`View ${category} experiences`}
    >
      {/* Background - Placeholder (navy with gold text) */}
      <div className="absolute inset-0 bg-navy flex items-center justify-center">
        <span className="text-gold font-display text-2xl md:text-3xl font-semibold">
          {category}
        </span>
      </div>

      {/* TODO: When real images are added, replace with:
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-slow group-hover:scale-105">
        <Image
          src={imageSrc}
          alt={category}
          fill
          className="object-cover"
        />
      </div>
      */}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-darker/80 transition-all duration-slow group-hover:to-navy-darker/90" />

      {/* Category Title */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
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
