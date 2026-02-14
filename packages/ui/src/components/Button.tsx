import React from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-base focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    // Primary (Gold) - Main CTAs
    primary:
      'bg-gold text-navy hover:bg-gold/90 hover:shadow-gold disabled:hover:bg-gold disabled:hover:shadow-none font-medium',

    // Outline (Gold border) - Secondary actions
    outline:
      'border-2 border-gold bg-transparent text-gold hover:bg-gold hover:text-navy font-medium',

    // Text Link - Tertiary actions
    text: 'bg-transparent text-cream hover:text-gold relative underline-gold font-normal',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]', // 36px height
    md: 'px-6 py-3 text-base min-h-[44px]', // 44px minimum touch target
    lg: 'px-8 py-4 text-lg min-h-[48px]', // 48px height
  }

  const isDisabled = disabled || isLoading

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  )
}
