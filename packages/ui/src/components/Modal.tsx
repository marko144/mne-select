'use client'

import React, { useEffect, useRef } from 'react'

export interface ModalProps {
  isOpen:   boolean
  onClose:  () => void
  title?:   string
  children: React.ReactNode
  size?:    'sm' | 'md' | 'lg'
}

/**
 * Generic accessible modal dialog.
 * – Closes on Escape key and backdrop click.
 * – Locks body scroll while open.
 * – Focuses the dialog on open for screen-reader compatibility.
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef  = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll and focus dialog
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      dialogRef.current?.focus()
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size]

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      role="presentation"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/85 backdrop-blur-sm"
        aria-hidden="true"
        style={{ transition: 'opacity 200ms ease' }}
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={`relative w-full ${maxW} bg-navy rounded-2xl outline-none`}
        style={{
          border: '1px solid rgba(194,162,77,0.2)',
          boxShadow: [
            '0 0 0 1px rgba(194,162,77,0.08)',
            '0 24px 80px rgba(0,0,0,0.75)',
            '0 8px 24px rgba(0,0,0,0.5)',
          ].join(', '),
        }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-cream/10">
            <h2
              id="modal-title"
              className="font-display text-2xl font-medium text-cream leading-tight"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-cream/40 hover:text-cream hover:bg-cream/5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Close"
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
