'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Select } from './Select'

// ─── Country data ─────────────────────────────────────────────────────────────

export interface DialCountryCode {
  /** ISO 3166-1 alpha-2 code, e.g. 'ME'. Used as the unique Select value. */
  code: string
  /** E.164 dial prefix, e.g. '+382'. */
  dial: string
  /** Full country name shown in the dropdown list. */
  name: string
}

/** Montenegro first, then alphabetical. Exported so consumers can extend/override. */
export const DIAL_COUNTRY_CODES: DialCountryCode[] = [
  { code: 'ME', dial: '+382', name: 'Montenegro'           },
  { code: 'AL', dial: '+355', name: 'Albania'              },
  { code: 'AR', dial: '+54',  name: 'Argentina'            },
  { code: 'AU', dial: '+61',  name: 'Australia'            },
  { code: 'AT', dial: '+43',  name: 'Austria'              },
  { code: 'BE', dial: '+32',  name: 'Belgium'              },
  { code: 'BA', dial: '+387', name: 'Bosnia & Herzegovina' },
  { code: 'BR', dial: '+55',  name: 'Brazil'               },
  { code: 'BG', dial: '+359', name: 'Bulgaria'             },
  { code: 'CA', dial: '+1',   name: 'Canada'               },
  { code: 'CN', dial: '+86',  name: 'China'                },
  { code: 'HR', dial: '+385', name: 'Croatia'              },
  { code: 'CY', dial: '+357', name: 'Cyprus'               },
  { code: 'CZ', dial: '+420', name: 'Czech Republic'       },
  { code: 'DK', dial: '+45',  name: 'Denmark'              },
  { code: 'FI', dial: '+358', name: 'Finland'              },
  { code: 'FR', dial: '+33',  name: 'France'               },
  { code: 'DE', dial: '+49',  name: 'Germany'              },
  { code: 'GR', dial: '+30',  name: 'Greece'               },
  { code: 'HU', dial: '+36',  name: 'Hungary'              },
  { code: 'IN', dial: '+91',  name: 'India'                },
  { code: 'IE', dial: '+353', name: 'Ireland'              },
  { code: 'IL', dial: '+972', name: 'Israel'               },
  { code: 'IT', dial: '+39',  name: 'Italy'                },
  { code: 'JP', dial: '+81',  name: 'Japan'                },
  { code: 'KR', dial: '+82',  name: 'South Korea'          },
  { code: 'LU', dial: '+352', name: 'Luxembourg'           },
  { code: 'MK', dial: '+389', name: 'North Macedonia'      },
  { code: 'MT', dial: '+356', name: 'Malta'                },
  { code: 'MX', dial: '+52',  name: 'Mexico'               },
  { code: 'NL', dial: '+31',  name: 'Netherlands'          },
  { code: 'NZ', dial: '+64',  name: 'New Zealand'          },
  { code: 'NO', dial: '+47',  name: 'Norway'               },
  { code: 'PL', dial: '+48',  name: 'Poland'               },
  { code: 'PT', dial: '+351', name: 'Portugal'             },
  { code: 'RO', dial: '+40',  name: 'Romania'              },
  { code: 'RU', dial: '+7',   name: 'Russia'               },
  { code: 'SA', dial: '+966', name: 'Saudi Arabia'         },
  { code: 'RS', dial: '+381', name: 'Serbia'               },
  { code: 'SG', dial: '+65',  name: 'Singapore'            },
  { code: 'SI', dial: '+386', name: 'Slovenia'             },
  { code: 'ZA', dial: '+27',  name: 'South Africa'         },
  { code: 'ES', dial: '+34',  name: 'Spain'                },
  { code: 'SE', dial: '+46',  name: 'Sweden'               },
  { code: 'CH', dial: '+41',  name: 'Switzerland'          },
  { code: 'TR', dial: '+90',  name: 'Turkey'               },
  { code: 'UA', dial: '+380', name: 'Ukraine'              },
  { code: 'AE', dial: '+971', name: 'UAE'                  },
  { code: 'GB', dial: '+44',  name: 'United Kingdom'       },
  { code: 'US', dial: '+1',   name: 'United States'        },
]

// ─── Select options derived from country data ─────────────────────────────────

const DIAL_SELECT_OPTIONS = DIAL_COUNTRY_CODES.map(c => ({
  value:        c.code,
  // List shows:    "+382  Montenegro"
  label:        `${c.dial}  ${c.name}`,
  // Trigger shows: "ME +382"  (handled via renderTrigger)
  triggerLabel: `${c.code} ${c.dial}`,
}))

// ─── PhoneInput ───────────────────────────────────────────────────────────────

export interface PhoneInputProps {
  /** E.164 dial prefix currently selected, e.g. '+382'. */
  dialCode:         string
  /** Local phone number string (digits / spaces / hyphens). */
  number:           string
  /** Called with the new dial prefix when the country changes. */
  onDialChange:     (dialCode: string) => void
  onNumberChange:   (number: string) => void
  error?:           string
  label?:           string
  /** Override the default country list. */
  countryCodes?:    DialCountryCode[]
  /**
   * ISO code of the initial country to display in the trigger.
   * Defaults to 'ME'. Only matters when multiple countries share a dial code (+1).
   */
  defaultIsoCode?:  string
}

/**
 * International phone number field composed of:
 * - A custom country-code selector (trigger: ISO code + dial; list: dial + full name)
 * - A plain number text input
 *
 * The component tracks the selected ISO code internally to handle cases where
 * multiple countries share the same dial code (e.g. +1 for CA and US).
 */
export function PhoneInput({
  dialCode,
  number,
  onDialChange,
  onNumberChange,
  error,
  label = 'Phone number',
  countryCodes = DIAL_COUNTRY_CODES,
  defaultIsoCode = 'ME',
}: PhoneInputProps) {
  // Track ISO code internally so shared-dial-code countries resolve correctly
  const [selectedCode, setSelectedCode] = useState<string>(
    () => countryCodes.find(c => c.dial === dialCode)?.code ?? defaultIsoCode
  )

  const options = countryCodes === DIAL_COUNTRY_CODES
    ? DIAL_SELECT_OPTIONS
    : countryCodes.map(c => ({
        value:        c.code,
        label:        `${c.dial}  ${c.name}`,
        triggerLabel: `${c.code} ${c.dial}`,
      }))

  const borderCls   = error ? 'border-error' : 'border-cream/30'
  const focusWithin = error
    ? 'focus-within:border-error focus-within:ring-error/20'
    : 'focus-within:border-gold focus-within:ring-3 focus-within:ring-gold/20'

  // ── Chevron icon ────────────────────────────────────────────────────────────
  const chevron = (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className="opacity-40 ml-0.5">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-cream mb-2">
        {label} <span className="text-gold ml-0.5">*</span>
      </label>

      {/* Compound field */}
      <div
        className={`flex rounded-md border bg-cream/10 transition-all duration-base overflow-visible min-h-[48px] ${borderCls} ${focusWithin}`}
      >
        {/* Country-code selector via shared Select */}
        <Select
          options={options}
          value={selectedCode}
          onChange={code => {
            const country = countryCodes.find(c => c.code === code)
            if (!country) return
            setSelectedCode(code)
            onDialChange(country.dial)
          }}
          aria-label="Country dial code"
          className="shrink-0"
          triggerClassName="h-full px-3 py-3.5 flex items-center gap-1.5 text-cream text-sm font-body border-r border-cream/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer bg-transparent whitespace-nowrap"
          listWidth={230}
          renderTrigger={selected => (
            <>
              <span className="font-medium">{selected?.triggerLabel?.split(' ')[0] ?? defaultIsoCode}</span>
              <span className="text-cream/55">{selected?.triggerLabel?.split(' ')[1] ?? dialCode}</span>
              {chevron}
            </>
          )}
          renderOption={(opt, isSelected) => (
            <span className={`flex items-center gap-2 ${isSelected ? 'text-gold' : ''}`}>
              <span className="text-cream/45 w-10 shrink-0 tabular-nums">
                {opt.label.split('  ')[0]}
              </span>
              <span>{opt.label.split('  ')[1]}</span>
            </span>
          )}
        />

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

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  )
}
