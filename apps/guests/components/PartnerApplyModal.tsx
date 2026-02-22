'use client'

import React, { FormEvent, useRef, useState } from 'react'
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
        className={`flex rounded-md border bg-cream/10 transition-all duration-base overflow-hidden min-h-[48px] ${borderCls} ${focusCls}`}
      >
        {/* Country code select */}
        <select
          value={dialCode}
          onChange={e => onDialChange(e.target.value)}
          aria-label="Country dial code"
          className="shrink-0 bg-transparent text-cream text-sm font-body pl-3 pr-1 py-3.5 border-r border-cream/15 focus:outline-none cursor-pointer appearance-none"
          style={{ minWidth: '5rem', maxWidth: '7rem' }}
        >
          {COUNTRY_CODES.map(c => (
            <option
              key={`${c.code}-${c.dial}`}
              value={c.dial}
              style={{ background: '#0f2a44', color: '#e8e6e1' }}
            >
              {c.dial} {c.name}
            </option>
          ))}
        </select>

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
  businessName: string
  location:     string
  email:        string
  dialCode:     string
  phoneNumber:  string
}

interface FormErrors {
  businessName?: string
  location?:     string
  email?:        string
  phone?:        string
}

export function PartnerApplyModal({ isOpen, onClose }: PartnerApplyModalProps) {
  const { t } = useLanguage()

  const [form, setForm] = useState<FormState>({
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
      setForm({ businessName: '', location: '', email: '', dialCode: '+382', phoneNumber: '' })
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
