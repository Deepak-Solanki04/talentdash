import type { Currency } from '@/types/salary'
import { CURRENCY_CONVERSION } from './config'

// ─────────────────────────────────────────────────────────────────────────────
// Currency formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a salary number for display.
 * INR: Indian lakh/crore notation (₹42,00,000 → ₹42L or ₹4.2Cr)
 * USD/GBP/EUR: standard western notation
 *
 * The `amount` is always stored in the smallest unit (paise for INR, cents for USD).
 * So we divide by 100 before formatting.
 *
 * Wait — per integration contract, base_salary is "Annual gross, in smallest currency unit
 * (paise for INR, cents for USD)". But our seed data stores full rupees for readability.
 * We store as full units (rupees/dollars) since the frontend displays them that way.
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  displayCurrency?: Currency
): string {
  // Convert if needed
  let value = amount
  let targetCurrency = displayCurrency ?? currency

  if (currency === 'INR' && displayCurrency === 'USD') {
    value = amount * CURRENCY_CONVERSION.INR_TO_USD
    targetCurrency = 'USD'
  } else if (currency === 'USD' && displayCurrency === 'INR') {
    value = amount * CURRENCY_CONVERSION.USD_TO_INR
    targetCurrency = 'INR'
  }

  if (targetCurrency === 'INR') {
    return formatINR(value)
  }

  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
  }

  const symbol = symbols[targetCurrency] ?? targetCurrency

  if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(0)}K`
  }
  return `${symbol}${value.toLocaleString()}`
}

/**
 * Format a number in Indian number system (lakh/crore)
 * 2,00,000 → ₹2L
 * 42,00,000 → ₹42L
 * 1,00,00,000 → ₹1Cr
 * 4,00,00,000 → ₹4Cr
 */
export function formatINR(amount: number): string {
  if (amount >= 10_000_000) {
    // 1 crore+
    const crore = amount / 10_000_000
    return `₹${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(1)}Cr`
  }
  if (amount >= 100_000) {
    // 1 lakh+
    const lakh = amount / 100_000
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Full expanded format for tooltip/detail views
 * 4200000 → ₹42,00,000
 */
export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Format delta (difference between two salary figures)
 * Returns: +₹4L or -₹2L
 */
export function formatDelta(delta: number, currency: Currency): string {
  const formatted = formatCurrency(Math.abs(delta), currency)
  return delta >= 0 ? `+${formatted}` : `-${formatted}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Statistical utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the true statistical median of an array of numbers.
 * Returns 0 for empty arrays.
 */
export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

// ─────────────────────────────────────────────────────────────────────────────
// Level display
// ─────────────────────────────────────────────────────────────────────────────

export function formatLevel(level: string): string {
  const labels: Record<string, string> = {
    L3: 'L3',
    L4: 'L4',
    L5: 'L5',
    L6: 'L6',
    SDE_I: 'SDE-I',
    SDE_II: 'SDE-II',
    SDE_III: 'SDE-III',
    STAFF: 'Staff',
    PRINCIPAL: 'Principal',
    IC4: 'IC4',
    IC5: 'IC5',
  }
  return labels[level] ?? level
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug utilities
// ─────────────────────────────────────────────────────────────────────────────

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─────────────────────────────────────────────────────────────────────────────
// Company name normalization
// ─────────────────────────────────────────────────────────────────────────────

const LEGAL_SUFFIXES = [
  'pvt ltd', 'pvt. ltd.', 'pvt. ltd', 'private limited', 'limited',
  'ltd.', 'ltd', 'inc.', 'inc', 'llc', 'corp.', 'corp',
  'co.', 'co', 'bpo', 'technologies', 'technology', 'tech',
  'india', 'global', 'international', 'solutions', 'services',
  'internet', 'web', '.com',
]

/**
 * Normalize a company name for consistent storage
 * "Google India Pvt. Ltd." → "google"
 * "GOOGLE" → "google"
 * "Tata Consultancy Services" → check alias table → "tcs"
 */
export function normalizeCompanyName(raw: string): string {
  let name = raw.toLowerCase().trim()

  // Remove legal suffixes iteratively
  let prev = ''
  while (prev !== name) {
    prev = name
    for (const suffix of LEGAL_SUFFIXES) {
      if (name.endsWith(' ' + suffix)) {
        name = name.slice(0, -(suffix.length + 1)).trim()
      } else if (name.endsWith(suffix)) {
        name = name.slice(0, -suffix.length).trim()
      }
    }
  }

  // Remove punctuation
  name = name.replace(/[.,()&]/g, '').trim()

  return name
}

// ─────────────────────────────────────────────────────────────────────────────
// Experience formatting
// ─────────────────────────────────────────────────────────────────────────────

export function formatExperience(years: number): string {
  if (years === 1) return '1 yr'
  return `${years} yrs`
}

// ─────────────────────────────────────────────────────────────────────────────
// BigInt serialization helper (Prisma returns BigInt, JSON can't serialize it)
// ─────────────────────────────────────────────────────────────────────────────

export function serializePrismaRecord<T>(record: T): T {
  return JSON.parse(
    JSON.stringify(record, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    )
  )
}
