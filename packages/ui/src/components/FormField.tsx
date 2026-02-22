'use client'

import React from 'react'

export interface FormFieldProps {
  /** Text label rendered above the control. */
  label?:              string
  /** When true, renders a gold asterisk beside the label. */
  required?:           boolean
  /** Links the label to the control via htmlFor. */
  htmlFor?:            string
  /** Red validation message rendered below the control. */
  error?:              string
  /** Muted hint text rendered below the control (hidden when error is present). */
  helperText?:         string
  containerClassName?: string
  children:            React.ReactNode
}

/**
 * Standard form-field shell: label → control (children) → error / helper text.
 * Use this to wrap any custom control (Select, AutocompleteInput, etc.) so it
 * matches the label/error treatment of the shared Input component.
 */
export function FormField({
  label,
  required,
  htmlFor,
  error,
  helperText,
  containerClassName = '',
  children,
}: FormFieldProps) {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-cream mb-2"
        >
          {label}
          {required && <span className="text-gold ml-1">*</span>}
        </label>
      )}

      {children}

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
