import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'elevated' | 'outlined' | 'filled'
}

export function Card({
  children,
  variant = 'elevated',
  className = '',
  ...props
}: CardProps) {
  const variants = {
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-gray-200',
    filled: 'bg-gray-50',
  }

  return (
    <div
      className={`rounded-xl p-6 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
