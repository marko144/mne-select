'use client'

import React, { useState, FormEvent } from 'react'
import { Button, Input } from '@mne-select/ui'
import { useLanguage } from '../contexts/LanguageContext'
import { trackWaitlistSignup } from '../lib/analytics'

interface EmailCaptureFormProps {
  align?: 'center' | 'left'
}

export function EmailCaptureForm({ align = 'center' }: EmailCaptureFormProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.trim()) {
      setError(t('form.errors.required'))
      return
    }

    if (!validateEmail(email)) {
      setError(t('form.errors.invalid'))
      return
    }

    setIsLoading(true)

    try {
      // Call API route to submit to Notion
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist')
      }

      console.log('✅ Email submitted successfully:', email)

      // Track successful waitlist signup
      trackWaitlistSignup('hero_form')

      // Success!
      setIsLoading(false)
      setIsSuccess(true)
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    } catch (error: any) {
      console.error('❌ Error submitting email:', error)
      setIsLoading(false)
      setError(error.message || 'Something went wrong. Please try again.')
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-gold/10 border border-gold/30 rounded-md p-4 animate-fade-in">
          <p className="text-gold font-medium">{t('form.success')}</p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-md ${align === 'left' ? 'lg:mx-0 lg:max-w-full lg:mr-auto' : 'mx-auto'}`}
      noValidate
    >
      {/* Microcopy - above email input */}
      <p className={`mb-4 text-sm text-cream-subtle ${align === 'left' ? 'lg:text-left' : 'text-center'}`}>
        {t('hero.microcopy')}
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder={t('hero.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
            disabled={isLoading}
            aria-label={t('hero.emailPlaceholder')}
            autoComplete="email"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading}
          className="md:flex-shrink-0 md:w-auto w-full"
        >
          {t('hero.cta')}
        </Button>
      </div>
    </form>
  )
}
