'use client'

import React, { FormEvent, useState } from 'react'
import { Modal, Input, Button, AutocompleteInput, PhoneInput } from '@mne-select/ui'
import { useLanguage } from '../contexts/LanguageContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  name?:         string
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
  const [errors,      setErrors]      = useState<FormErrors>({})
  const [isLoading,   setIsLoading]   = useState(false)
  const [isSuccess,   setIsSuccess]   = useState(false)
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

            {/* Location — shared AutocompleteInput with Montenegro towns */}
            <AutocompleteInput
              label="Location"
              placeholder="e.g. Budva, Kotor, Tivat…"
              options={MNE_LOCATIONS}
              value={form.location}
              onChange={set('location')}
              error={errors.location}
              required
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

            {/* Phone — shared PhoneInput with dial-code selector */}
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
            className="px-6 pb-6 pt-5 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-cream/10"
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
