import React, { forwardRef, useId } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName = '',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId

    const baseStyles =
      'w-full px-4 py-3.5 rounded-md text-base font-body bg-cream/10 border border-cream/30 text-cream placeholder:text-cream-muted transition-all duration-base focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]'

    const errorStyles = error
      ? 'border-error focus:border-error focus:ring-error/20 animate-shake'
      : ''

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-cream mb-2"
          >
            {label}
            {props.required && <span className="text-gold ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${errorStyles} ${className}`}
          disabled={disabled}
          {...props}
        />

        {(error || helperText) && (
          <p
            className={`mt-2 text-sm ${error ? 'text-error' : 'text-cream-muted'}`}
            role={error ? 'alert' : undefined}
            aria-live={error ? 'assertive' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
