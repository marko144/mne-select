'use client'

import React, { useEffect, useRef, useState } from 'react'

export interface SelectOption {
  /** Unique value used for comparison and onChange callbacks. */
  value: string
  /** Text shown inside the dropdown list. */
  label: string
  /** Optional shorter text shown in the collapsed trigger (falls back to label). */
  triggerLabel?: string
}

export interface SelectProps {
  options:          SelectOption[]
  value:            string
  onChange:         (value: string) => void
  /** Custom renderer for the trigger button content. Receives the selected option (or undefined). */
  renderTrigger?:   (selected: SelectOption | undefined) => React.ReactNode
  /** Custom renderer for each list item. Receives the option and whether it is selected. */
  renderOption?:    (option: SelectOption, isSelected: boolean) => React.ReactNode
  placeholder?:     string
  /** Extra classes applied to the root wrapper div. */
  className?:       string
  /** Extra classes applied to the trigger button. */
  triggerClassName?: string
  /** Fixed pixel width for the dropdown list (defaults to auto / wider than trigger). */
  listWidth?:       number | string
  /** Maximum pixel height of the dropdown list before it scrolls. */
  maxListHeight?:   number
  'aria-label'?:    string
}

/**
 * Accessible custom dropdown select.
 *
 * - Closes on outside click and Escape key.
 * - Scrolls the selected item into view when opened.
 * - Supports custom trigger and option renderers for cases where a simple
 *   label string is not sufficient (e.g. country dial-code selectors).
 */
export function Select({
  options,
  value,
  onChange,
  renderTrigger,
  renderOption,
  placeholder = 'Select…',
  className = '',
  triggerClassName = '',
  listWidth,
  maxListHeight = 220,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen]   = useState(false)
  const wrapRef           = useRef<HTMLDivElement>(null)
  const listRef           = useRef<HTMLUListElement>(null)

  const selected = options.find(o => o.value === value)

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

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Scroll active item into view when list opens
  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null
    active?.scrollIntoView({ block: 'nearest' })
  }, [open])

  const defaultTriggerContent = selected
    ? (selected.triggerLabel ?? selected.label)
    : placeholder

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={triggerClassName}
      >
        {renderTrigger ? renderTrigger(selected) : defaultTriggerContent}
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-[60] top-full left-0 mt-1 rounded-md border border-cream/15 overflow-y-auto"
          style={{
            background:  '#0d2035',
            boxShadow:   '0 8px 32px rgba(0,0,0,0.55)',
            maxHeight:   maxListHeight,
            width:       listWidth ?? 'auto',
            minWidth:    '100%',
          }}
        >
          {options.map(opt => {
            const isSelected = opt.value === value
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseDown={() => { onChange(opt.value); setOpen(false) }}
                className={[
                  'px-4 py-2.5 text-sm font-body cursor-pointer transition-colors duration-100',
                  isSelected
                    ? 'text-gold bg-gold/10'
                    : 'text-cream hover:bg-gold/10 hover:text-gold',
                ].join(' ')}
              >
                {renderOption ? renderOption(opt, isSelected) : opt.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
