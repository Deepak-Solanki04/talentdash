import type { Level } from '@/types/salary'

// ─────────────────────────────────────────────────────────────────────────────
// Currency configuration
// Stored in config file so frontend and backend use the same rate
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENCY_CONVERSION = {
  INR_TO_USD: 0.012, // 1 INR = 0.012 USD (≈ ₹83 per $1)
  USD_TO_INR: 83.33,
  INR_TO_GBP: 0.0096,
  INR_TO_EUR: 0.011,
}

// ─────────────────────────────────────────────────────────────────────────────
// Level display labels
// ─────────────────────────────────────────────────────────────────────────────
export const LEVEL_LABELS: Record<Level, string> = {
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

// ─────────────────────────────────────────────────────────────────────────────
// Level badge colors (Tailwind classes)
// L3/SDE-I = slate, L4/SDE-II = blue, L5/SDE-III = indigo,
// L6/Staff = purple, Principal/IC5 = navy
// ─────────────────────────────────────────────────────────────────────────────
export const LEVEL_BADGE_STYLES: Record<Level, { bg: string; text: string; border: string }> = {
  L3: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  SDE_I: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  L4: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  SDE_II: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  IC4: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  L5: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  SDE_III: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  L6: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  STAFF: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  IC5: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  PRINCIPAL: { bg: 'bg-[#1e3a5f]/10', text: 'text-[#1e3a5f]', border: 'border-[#1e3a5f]/20' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Valid levels (for validation)
// ─────────────────────────────────────────────────────────────────────────────
export const VALID_LEVELS: Level[] = [
  'L3', 'L4', 'L5', 'L6',
  'SDE_I', 'SDE_II', 'SDE_III',
  'STAFF', 'PRINCIPAL', 'IC4', 'IC5',
]

export const VALID_CURRENCIES = ['INR', 'USD', 'GBP', 'EUR'] as const
export const VALID_SOURCES = ['CONTRIBUTOR', 'SCRAPED', 'AI_INFERRED'] as const

// ─────────────────────────────────────────────────────────────────────────────
// Pagination defaults
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 100

// ─────────────────────────────────────────────────────────────────────────────
// TalentDash brand colors (for non-Tailwind usage)
// ─────────────────────────────────────────────────────────────────────────────
export const COLORS = {
  primaryAccent: '#FF5A5F',
  deepText: '#222222',
  bodyText: '#484848',
  mutedText: '#717171',
  surface: '#FFFFFF',
  appBackground: '#F7F7F7',
  border: '#EBEBEB',
  successGreen: '#008A05',
  warningOrange: '#FFB400',
  errorRed: '#D93025',
  hoverSurface: '#F2F2F2',
  dataBlue: '#0369A1',
}
