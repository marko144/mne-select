'use client'

import React, { useEffect, useRef, useState } from 'react'

export interface AutocompleteInputProps {
  /** Full list of options to filter from. */
  options:       string[]
  value:         string
  onChange:      (value: string) => void
  label?:        string
  placeholder?:  string
  error?:        string
  helperText?:   string
  required?:     boolean
  /** Maximum suggestions shown at once. Defaults to 7. */
  maxSuggestions?: number
  autoComplete?: string
  disabled?:     boolean
}

const inputBase =
  'w-full px-4 py-3.5 rounded-md text-base font-body bg-cream/10 border text-cream placeholder:text-cream-muted transition-all duration-base focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]'

/**
 * Text input with a filtered autocomplete dropdown.
 *
 * - Suggestions are derived by case-insensitive substring match.
 * - Closes on outside click or when a suggestion is selected.
 * - Accessible: input has aria-autocomplete / aria-expanded attributes.
 * - Styling follows the shared design system (navy/cream/gold).
 */
export function AutocompleteInput({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  helperText,
  required,
  maxSuggestions = 7,
  autoComplete = 'off',
  disabled,
}: AutocompleteInputProps) {
  const [open, setOpen]   = useState(false)
  const wrapRef           = useRef<HTMLDivElement>(null)

  const suggestions = value.trim().length > 0
    ? options.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    : []

  const borderCls = error
    ? 'border-error focus:border-error focus:ring-error/20'
    : 'border-cream/30'

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-cream mb-2">
          {label}
          {required && <span className="text-gold ml-1">*</span>}
        </label>
      )}

      {/* Input */}
      <input
        type="text"
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`${inputBase} ${borderCls}`}
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
      />

      {/* Suggestion list */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-cream/15 overflow-hidden"
          style={{ background: '#0d2035', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {suggestions.slice(0, maxSuggestions).map(opt => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              onMouseDown={() => { onChange(opt); setOpen(false) }}
              className="px-4 py-2.5 text-sm font-body text-cream cursor-pointer hover:bg-gold/10 hover:text-gold transition-colors duration-100"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* Error / helper */}
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
