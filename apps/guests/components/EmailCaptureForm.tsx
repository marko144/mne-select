'use client'

import React, { useState, FormEvent } from 'react'
import { Button, Input } from '@mne-select/ui'
import { useLanguage } from '../contexts/LanguageContext'

export function EmailCaptureForm() {
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

    // Simulate loading state (no backend yet)
    setIsLoading(true)

    // Log to console for now
    console.log('Email submitted:', email)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 5000)
    }, 1000)
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
      className="w-full max-w-md mx-auto"
      noValidate
    >
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

      {/* Microcopy */}
      <p className="mt-4 text-sm text-cream-subtle text-center">
        {t('hero.microcopy')}
      </p>
    </form>
  )
}
