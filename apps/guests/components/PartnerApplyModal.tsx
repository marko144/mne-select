'use client'

import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { Modal, Input, Button } from '@mne-select/ui'
import { useLanguage } from '../contexts/LanguageContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

/** Major country dial codes, Montenegro first then alphabetical. */
const COUNTRY_CODES = [
  { code: 'ME', dial: '+382', name: 'Montenegro'          },
  { code: 'AL', dial: '+355', name: 'Albania'             },
  { code: 'AR', dial: '+54',  name: 'Argentina'           },
  { code: 'AU', dial: '+61',  name: 'Australia'           },
  { code: 'AT', dial: '+43',  name: 'Austria'             },
  { code: 'BE', dial: '+32',  name: 'Belgium'             },
  { code: 'BA', dial: '+387', name: 'Bosnia & Herzegovina'},
  { code: 'BR', dial: '+55',  name: 'Brazil'              },
  { code: 'BG', dial: '+359', name: 'Bulgaria'            },
  { code: 'CA', dial: '+1',   name: 'Canada'              },
  { code: 'CN', dial: '+86',  name: 'China'               },
  { code: 'HR', dial: '+385', name: 'Croatia'             },
  { code: 'CY', dial: '+357', name: 'Cyprus'              },
  { code: 'CZ', dial: '+420', name: 'Czech Republic'      },
  { code: 'DK', dial: '+45',  name: 'Denmark'             },
  { code: 'FI', dial: '+358', name: 'Finland'             },
  { code: 'FR', dial: '+33',  name: 'France'              },
  { code: 'DE', dial: '+49',  name: 'Germany'             },
  { code: 'GR', dial: '+30',  name: 'Greece'              },
  { code: 'HU', dial: '+36',  name: 'Hungary'             },
  { code: 'IN', dial: '+91',  name: 'India'               },
  { code: 'IE', dial: '+353', name: 'Ireland'             },
  { code: 'IL', dial: '+972', name: 'Israel'              },
  { code: 'IT', dial: '+39',  name: 'Italy'               },
  { code: 'JP', dial: '+81',  name: 'Japan'               },
  { code: 'KR', dial: '+82',  name: 'South Korea'         },
  { code: 'LU', dial: '+352', name: 'Luxembourg'          },
  { code: 'MK', dial: '+389', name: 'North Macedonia'     },
  { code: 'MT', dial: '+356', name: 'Malta'               },
  { code: 'MX', dial: '+52',  name: 'Mexico'              },
  { code: 'NL', dial: '+31',  name: 'Netherlands'         },
  { code: 'NZ', dial: '+64',  name: 'New Zealand'         },
  { code: 'NO', dial: '+47',  name: 'Norway'              },
  { code: 'PL', dial: '+48',  name: 'Poland'              },
  { code: 'PT', dial: '+351', name: 'Portugal'            },
  { code: 'RO', dial: '+40',  name: 'Romania'             },
  { code: 'RU', dial: '+7',   name: 'Russia'              },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia'        },
  { code: 'RS', dial: '+381', name: 'Serbia'              },
  { code: 'SG', dial: '+65',  name: 'Singapore'           },
  { code: 'SI', dial: '+386', name: 'Slovenia'            },
  { code: 'ZA', dial: '+27',  name: 'South Africa'        },
  { code: 'ES', dial: '+34',  name: 'Spain'               },
  { code: 'SE', dial: '+46',  name: 'Sweden'              },
  { code: 'CH', dial: '+41',  name: 'Switzerland'         },
  { code: 'TR', dial: '+90',  name: 'Turkey'              },
  { code: 'UA', dial: '+380', name: 'Ukraine'             },
  { code: 'AE', dial: '+971', name: 'UAE'                 },
  { code: 'GB', dial: '+44',  name: 'United Kingdom'      },
  { code: 'US', dial: '+1',   name: 'United States'       },
]

/** Towns and areas in Montenegro for location autocomplete. */
const MNE_LOCATIONS = [
  'Podgorica', 'Nikšić', 'Budva', 'Bar', 'Herceg Novi', 'Bijelo Polje',
  'Berane', 'Cetinje', 'Tivat', 'Kotor', 'Rožaje', 'Ulcinj', 'Pljevlja',
  'Kolašin', 'Mojkovac', 'Žabljak', 'Plav', 'Gusinje', 'Petnjica',
  'Šavnik', 'Plužine', 'Andrijevica', 'Tuzi', 'Perast', 'Porto Montenegro',
  'Lustica Bay', 'Sveti Stefan', 'Petrovac', 'Sutomore', 'Igalo',
  'Zelenika', 'Kumbor', 'Bijela', 'Old Town Kotor',
].sort()

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates against ITU-T E.164: the combined dial code + local number
 * must be ≤ 15 digits, and the local part must be ≥ 4 digits.
 */
function validatePhone(dialCode: string, number: string): string | null {
  const localDigits = number.replace(/\D/g, '')
  if (localDigits.length < 4)  return 'Phone number is too short'
  if (localDigits.length > 12) return 'Phone number is too long'
  const dialDigits = dialCode.replace(/\D/g, '')
  if (dialDigits.length + localDigits.length > 15)
    return 'Phone number exceeds maximum length'
  return null
}

// ─── Location autocomplete ────────────────────────────────────────────────────

function LocationInput({
  value,
  onChange,
  error,
}: {
  value:    string
  onChange: (v: string) => void
  error?:   string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const suggestions = value.trim().length > 0
    ? MNE_LOCATIONS.filter(t => t.toLowerCase().includes(value.toLowerCase()))
    : []

  const inputBase =
    'w-full px-4 py-3.5 rounded-md text-base font-body bg-cream/10 border text-cream placeholder:text-cream-muted transition-all duration-base focus:outline-none focus:border-gold focus:ring-3 focus:ring-gold/20 min-h-[48px]'
  const borderCls = error
    ? 'border-error focus:border-error focus:ring-error/20'
    : 'border-cream/30'

  return (
    <div ref={wrapRef} className="relative w-full">
      <label className="block text-sm font-medium text-cream mb-2">
        Location <span className="text-gold ml-0.5">*</span>
      </label>
      <input
        type="text"
        autoComplete="off"
        placeholder="e.g. Budva, Kotor, Tivat…"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`${inputBase} ${borderCls}`}
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
      />
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-cream/15 overflow-hidden"
          style={{ background: '#0d2035', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {suggestions.slice(0, 7).map(town => (
            <li
              key={town}
              role="option"
              aria-selected={value === town}
              onMouseDown={() => { onChange(town); setOpen(false) }}
              className="px-4 py-2.5 text-sm font-body text-cream cursor-pointer hover:bg-gold/10 hover:text-gold transition-colors duration-100"
            >
              {town}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-2 text-sm text-error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Country dial code custom dropdown ───────────────────────────────────────

/**
 * Trigger shows: ISO code + dial (e.g. "ME +382")
 * Dropdown list shows: dial + full name (e.g. "+382 Montenegro")
 */
function PhoneDialSelect({
  dialCode,
  onChange,
}: {
  dialCode: string
  onChange: (dial: string) => void
}) {
  const [open, setOpen]   = useState(false)
  const wrapRef           = useRef<HTMLDivElement>(null)
  const listRef           = useRef<HTMLUListElement>(null)

  // Track ISO code internally so that shared dial codes (+1 for CA/US etc.) resolve correctly
  const [selectedCode, setSelectedCode] = useState(
    () => COUNTRY_CODES.find(c => c.dial === dialCode)?.code ?? 'ME'
  )
  const selected = COUNTRY_CODES.find(c => c.code === selectedCode) ?? COUNTRY_CODES[0]

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

  // Scroll selected item into view when list opens
  useEffect(() => {
    if (!open || !listRef.current) return
    const active = listRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null
    active?.scrollIntoView({ block: 'nearest' })
  }, [open])

  return (
    <div ref={wrapRef} className="relative shrink-0">
      {/* Trigger — shows ISO code + dial code only */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Country dial code"
        className="h-full px-3 py-3.5 flex items-center gap-1.5 text-cream text-sm font-body border-r border-cream/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer bg-transparent whitespace-nowrap"
      >
        <span className="font-medium">{selected.code}</span>
        <span className="text-cream/55">{selected.dial}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className="opacity-40 ml-0.5">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown list — shows dial + full country name */}
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Select country"
          className="absolute z-[60] top-full left-0 mt-1 rounded-md border border-cream/15 overflow-y-auto"
          style={{
            background: '#0d2035',
            boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
            maxHeight: 220,
            width: 230,
          }}
        >
          {COUNTRY_CODES.map(c => {
            const isSelected = c.code === selectedCode
            return (
              <li
                key={`${c.code}-${c.dial}`}
                role="option"
                aria-selected={isSelected}
                onMouseDown={() => { setSelectedCode(c.code); onChange(c.dial); setOpen(false) }}
                className={`px-4 py-2.5 text-sm font-body cursor-pointer flex items-center gap-2 transition-colors duration-100
                  ${isSelected
                    ? 'text-gold bg-gold/10'
                    : 'text-cream hover:bg-gold/10 hover:text-gold'
                  }`}
              >
                <span className="text-cream/45 w-10 shrink-0 tabular-nums">{c.dial}</span>
                <span>{c.name}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Phone field (dial code select + number input) ────────────────────────────

function PhoneInput({
  dialCode,
  number,
  onDialChange,
  onNumberChange,
  error,
}: {
  dialCode:       string
  number:         string
  onDialChange:   (v: string) => void
  onNumberChange: (v: string) => void
  error?:         string
}) {
  const borderCls = error ? 'border-error' : 'border-cream/30'
  const focusCls  = error
    ? 'focus-within:border-error focus-within:ring-error/20'
    : 'focus-within:border-gold focus-within:ring-3 focus-within:ring-gold/20'

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-cream mb-2">
        Phone number <span className="text-gold ml-0.5">*</span>
      </label>
      <div
        className={`flex rounded-md border bg-cream/10 transition-all duration-base overflow-visible min-h-[48px] ${borderCls} ${focusCls}`}
      >
        <PhoneDialSelect dialCode={dialCode} onChange={onDialChange} />

        {/* Number input */}
        <input
          type="tel"
          inputMode="tel"
          placeholder="61 234 5678"
          value={number}
          onChange={e => onNumberChange(e.target.value.replace(/[^\d\s\-().]/g, ''))}
          className="flex-1 bg-transparent text-cream placeholder:text-cream-muted text-base font-body px-3 py-3.5 focus:outline-none min-w-0"
          aria-label="Phone number"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface PartnerApplyModalProps {
  isOpen:  boolean
  onClose: () => void
}

interface FormState {
  name:         string
  businessName: string
  location:     string
  email:        string
  dialCode:     string
  phoneNumber:  string
}

interface FormErrors {
  name?:        string
  businessName?: string
  location?:     string
  email?:        string
  phone?:        string
}

export function PartnerApplyModal({ isOpen, onClose }: PartnerApplyModalProps) {
  const { t } = useLanguage()

  const [form, setForm] = useState<FormState>({
    name:         '',
    businessName: '',
    location:     '',
    email:        '',
    dialCode:     '+382',
    phoneNumber:  '',
  })
  const [errors,    setErrors]    = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const set = (key: keyof FormState) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!form.name.trim())
      e.name = 'Name is required'
    else if (form.name.trim().length > 25)
      e.name = 'Name must be 25 characters or fewer'
    if (!form.businessName.trim()) e.businessName = 'Business name is required'
    if (!form.location.trim())     e.location     = 'Location is required'
    if (!form.email.trim() || !EMAIL_RE.test(form.email))
      e.email = 'Please enter a valid email address'
    const phoneErr = validatePhone(form.dialCode, form.phoneNumber)
    if (phoneErr) e.phone = phoneErr
    return e
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setIsLoading(true)

    try {
      const res = await fetch('/api/partner-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name.trim(),
          businessName: form.businessName.trim(),
          location:     form.location.trim(),
          email:        form.email.trim(),
          phone:        `${form.dialCode} ${form.phoneNumber.trim()}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setIsSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset after transition
    setTimeout(() => {
      setForm({ name: '', businessName: '', location: '', email: '', dialCode: '+382', phoneNumber: '' })
      setErrors({})
      setServerError('')
      setIsSuccess(false)
    }, 300)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? undefined : t('partner.hero.cta')}
      size="md"
    >
      {isSuccess ? (
        /* ── Success state ─────────────────────────────────────── */
        <div className="flex flex-col items-center text-center px-6 py-10 gap-5">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-full"
            style={{ background: 'rgba(194,162,77,0.12)', border: '1px solid rgba(194,162,77,0.3)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2a24d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-medium text-cream">Application received</h2>
          <p className="font-body text-cream-muted leading-relaxed max-w-xs">
            Thank you for your interest. Our team will review your application and be in touch shortly.
          </p>
          <Button variant="outline" size="md" onClick={handleClose} className="mt-2">
            Close
          </Button>
        </div>
      ) : (
        /* ── Form ──────────────────────────────────────────────── */
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-6 flex flex-col gap-5">

            <Input
              label="Name"
              placeholder="e.g. Ana Petrović"
              required
              value={form.name}
              onChange={e => set('name')(e.target.value)}
              error={errors.name}
              autoComplete="name"
              maxLength={25}
            />

            <Input
              label="Business name"
              placeholder="e.g. Marina Bistro"
              required
              value={form.businessName}
              onChange={e => set('businessName')(e.target.value)}
              error={errors.businessName}
              autoComplete="organization"
            />

            <LocationInput
              value={form.location}
              onChange={set('location')}
              error={errors.location}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@yourbusiness.com"
              required
              value={form.email}
              onChange={e => set('email')(e.target.value)}
              error={errors.email}
              autoComplete="email"
              inputMode="email"
            />

            <PhoneInput
              dialCode={form.dialCode}
              number={form.phoneNumber}
              onDialChange={set('dialCode')}
              onNumberChange={set('phoneNumber')}
              error={errors.phone}
            />

            {serverError && (
              <p className="text-sm text-error font-body" role="alert" aria-live="assertive">
                {serverError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-cream/10"
            style={{ paddingTop: '1.25rem' }}
          >
            <Button variant="outline" size="md" type="button" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
              {isLoading ? 'Submitting…' : 'Submit application'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
