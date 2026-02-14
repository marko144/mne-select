import React from 'react'

export interface SectionProps {
  children: React.ReactNode
  className?: string
  background?: 'navy' | 'navy-darker' | 'transparent'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  id?: string
}

const backgroundClasses = {
  navy: 'bg-navy',
  'navy-darker': 'bg-navy-darker',
  transparent: 'bg-transparent',
}

const spacingClasses = {
  none: '',
  sm: 'py-12 md:py-16 lg:py-20', // Smaller spacing
  md: 'py-16 md:py-24 lg:py-32', // Default section spacing (64/96/128px)
  lg: 'py-20 md:py-28 lg:py-40', // Larger spacing for emphasis
}

export function Section({
  children,
  className = '',
  background = 'navy',
  spacing = 'md',
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`
        ${backgroundClasses[background]}
        ${spacingClasses[spacing]}
        ${className}
      `}
    >
      {children}
    </section>
  )
}
