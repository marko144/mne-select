'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import enTranslations from '../locales/en.json'
import meTranslations from '../locales/me.json'

type Language = 'en' | 'me'

type TranslationKey = string

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, params?: Record<string, string>) => any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: enTranslations,
  me: meTranslations,
}

const STORAGE_KEY = 'mne-select-language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isClient, setIsClient] = useState(false)

  // Initialize language from localStorage after mount (client-side only)
  useEffect(() => {
    setIsClient(true)
    const storedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'me')) {
      setLanguageState(storedLanguage)
    }
  }, [])

  // Update localStorage and HTML lang attribute when language changes
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.lang = lang
    }
  }, [])

  // Update HTML lang attribute on mount and language change
  useEffect(() => {
    if (isClient) {
      document.documentElement.lang = language
    }
  }, [language, isClient])

  // Translation function with dot notation support
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string>): any => {
      const keys = key.split('.')
      let value: any = translations[language]

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          console.warn(`Translation key not found: ${key}`)
          return key
        }
      }

      // Handle parameter substitution (e.g., {category})
      if (typeof value === 'string' && params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey] !== undefined ? params[paramKey] : match
        })
      }

      return value
    },
    [language]
  )

  const value = {
    language,
    setLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
