'use client'

import React, { useState } from 'react'

export interface AccordionItemProps {
  /** Unique id for accessibility */
  id: string
  /** Question/trigger text */
  question: string
  /** Answer content */
  children: React.ReactNode
  /** Whether this item is expanded */
  expanded?: boolean
  /** Called when the trigger is clicked */
  onToggle?: () => void
}

export interface AccordionProps {
  /** Accordion items */
  items: Omit<AccordionItemProps, 'expanded' | 'onToggle'>[]
  /** Allow multiple items open at once */
  allowMultiple?: boolean
  /** Additional class for the container */
  className?: string
}

/** Chevron icon - rotates when expanded */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-gold transition-transform duration-base shrink-0 ${expanded ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function AccordionItem({
  id,
  question,
  children,
  expanded = false,
  onToggle,
}: AccordionItemProps) {
  const contentId = `${id}-content`
  const triggerId = `${id}-trigger`

  return (
    <div className="border-b border-cream/20 last:border-b-0">
      <h3>
        <button
          id={triggerId}
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-xl md:text-2xl font-semibold text-cream transition-colors duration-base hover:text-gold focus:outline-none focus:ring-3 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy"
        >
          {question}
          <ChevronIcon expanded={expanded} />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        aria-hidden={!expanded}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{
          gridTemplateRows: expanded ? '1fr' : '0fr',
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="font-body pb-5 pr-10 text-base text-cream leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Accordion({
  items,
  allowMultiple = false,
  className = '',
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const handleToggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) {
          next.clear()
        }
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className={className} role="list">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          id={item.id}
          question={item.question}
          expanded={openIds.has(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.children}
        </AccordionItem>
      ))}
    </div>
  )
}
