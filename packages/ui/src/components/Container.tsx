import React from 'react'

export interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer'
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full'
}

const maxWidthClasses = {
  default: 'max-w-[1440px]', // Default container max-width
  narrow: 'max-w-[960px]', // For hero sections, text-heavy content
  wide: 'max-w-[1600px]', // For wide layouts
  full: 'max-w-full', // Full width
}

export function Container({
  children,
  className = '',
  as: Component = 'div',
  maxWidth = 'default',
}: ContainerProps) {
  return (
    <Component
      className={`
        mx-auto w-full
        px-6 sm:px-6 md:px-12 lg:px-16 xl:px-16 2xl:px-16
        ${maxWidthClasses[maxWidth]}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}
