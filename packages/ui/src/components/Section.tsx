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
  sm: 'py-8 md:py-10 lg:py-12', // Compact spacing
  md: 'py-10 md:py-14 lg:py-20', // Default section spacing
  lg: 'py-12 md:py-18 lg:py-24', // Larger spacing for emphasis
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
