'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Level, Currency, SalaryWithCompany } from '@/types/salary'
import { VALID_LEVELS, LEVEL_LABELS } from '@/lib/config'
import { formatCurrency, formatExperience } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'

interface SalaryTableProps {
  initialData: SalaryWithCompany[]
}

type SortField = 'total_compensation' | 'base_salary' | 'experience_years'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 25

export default function SalaryTable({ initialData }: SalaryTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── Read initial filter state from URL ───────────────────────────────────
  const [company, setCompany] = useState(searchParams.get('company') ?? '')
  const [role, setRole] = useState(searchParams.get('role') ?? '')
  const [location, setLocation] = useState(searchParams.get('location') ?? '')
  const [selectedLevels, setSelectedLevels] = useState<Level[]>(() => {
    const l = searchParams.get('level')
    return l ? (l.split(',') as Level[]) : []
  })
  const [currency, setCurrency] = useState<'INR' | 'USD'>(
    (searchParams.get('currency') as 'INR' | 'USD') ?? 'INR'
  )
  const [sortField, setSortField] = useState<SortField>('total_compensation')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const companyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedCompany, setDebouncedCompany] = useState(company)

  // Debounce company search (300ms per spec)
  useEffect(() => {
    if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current)
    companyDebounceRef.current = setTimeout(() => {
      setDebouncedCompany(company)
      setPage(1)
    }, 300)
    return () => {
      if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current)
    }
  }, [company])

  // ── Sync filters to URL ───────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedCompany) params.set('company', debouncedCompany)
    if (role) params.set('role', role)
    if (selectedLevels.length > 0) params.set('level', selectedLevels.join(','))
    if (location) params.set('location', location)
    if (currency !== 'INR') params.set('currency', currency)
    router.replace(`/salaries?${params.toString()}`, { scroll: false })
  }, [debouncedCompany, role, selectedLevels, location, currency, router])

  // ── Filter data client-side (data comes from RSC at build time) ───────────
  const filtered = useMemo(() => {
    return initialData.filter((s) => {
      if (debouncedCompany) {
        const q = debouncedCompany.toLowerCase()
        if (!s.company.name.toLowerCase().includes(q) &&
            !s.company.normalized_name.includes(q)) return false
      }
      if (role) {
        if (!s.role.toLowerCase().includes(role.toLowerCase())) return false
      }
      if (selectedLevels.length > 0) {
        if (!selectedLevels.includes(s.level as Level)) return false
      }
      if (location) {
        if (!s.location.toLowerCase().includes(location.toLowerCase())) return false
      }
      if (currency === 'USD' && s.currency !== 'USD') return true // show all, convert display
      return true
    })
  }, [initialData, debouncedCompany, role, selectedLevels, location, currency])

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = a[sortField] as number
      const vb = b[sortField] as number
      return sortDir === 'desc' ? vb - va : va - vb
    })
  }, [filtered, sortField, sortDir])

  // ── Pagination ────────────────────────────────────────────────────────────
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const end = Math.min(start + PAGE_SIZE, total)
  const pageData = sorted.slice(start, end)

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
      } else {
        setSortField(field)
        setSortDir('desc')
      }
      setPage(1)
    },
    [sortField]
  )

  const toggleLevel = useCallback((level: Level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
    setPage(1)
  }, [])

  const clearAll = useCallback(() => {
    setCompany('')
    setRole('')
    setSelectedLevels([])
    setLocation('')
    setPage(1)
  }, [])

  // Get unique roles and locations for dropdowns
  const uniqueRoles = useMemo(
    () => [...new Set(initialData.map((s) => s.role))].sort(),
    [initialData]
  )
  const uniqueLocations = useMemo(
    () => [...new Set(initialData.map((s) => s.location))].sort(),
    [initialData]
  )

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 opacity-30">↕</span>
    return <span className="ml-1 text-[#FF5A5F]">{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="animate-fadein">
      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#EBEBEB] rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Company search (debounced) */}
          <div className="flex-1 min-w-[200px] max-w-[280px]">
            <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">Company</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                id="filter-company"
                type="text"
                className="w-full pl-9 pr-3 py-2.5 text-sm font-medium text-[#222222] bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] transition-all"
                placeholder="Search company..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          {/* Role dropdown */}
          <div className="flex-1 min-w-[160px] max-w-[220px]">
            <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">Role</label>
            <select
              id="filter-role"
              className="w-full px-3 py-2.5 text-sm font-medium text-[#222222] bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] transition-all appearance-none cursor-pointer"
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1) }}
            >
              <option value="">All Roles</option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Location dropdown */}
          <div className="flex-1 min-w-[150px] max-w-[200px]">
            <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">Location</label>
            <select
              id="filter-location"
              className="w-full px-3 py-2.5 text-sm font-medium text-[#222222] bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] transition-all appearance-none cursor-pointer"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setPage(1) }}
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Currency toggle */}
          <div className="min-w-[120px]">
            <label className="block text-xs font-semibold text-[#717171] uppercase tracking-wider mb-2">Currency</label>
            <div className="flex bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-1">
              {(['INR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  id={`currency-${c.toLowerCase()}`}
                  onClick={() => setCurrency(c)}
                  className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-150 ${
                    currency === c 
                      ? 'bg-white text-[#222222] shadow-sm ring-1 ring-gray-900/5' 
                      : 'text-[#717171] hover:text-[#222222]'
                  }`}
                >
                  {c === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Level multi-select */}
        <div className="mt-5 pt-4 border-t border-[#EBEBEB]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider">Levels</label>
            {(selectedLevels.length > 0 || company || role || location) && (
              <button
                id="clear-all-filters"
                onClick={clearAll}
                className="text-xs font-bold text-[#FF5A5F] hover:text-[#e0484d] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {VALID_LEVELS.map((level) => {
              const isSelected = selectedLevels.includes(level as Level)
              return (
                <button
                  key={level}
                  id={`level-filter-${level}`}
                  onClick={() => toggleLevel(level as Level)}
                  className={`px-3 py-1.5 text-[13px] font-semibold rounded-full border transition-all duration-150 ${
                    isSelected 
                      ? 'bg-[#FF5A5F] text-white border-[#FF5A5F] shadow-sm' 
                      : 'bg-white text-[#484848] border-[#EBEBEB] hover:border-[#D1D5DB] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {LEVEL_LABELS[level as Level]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Results Summary ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-[#222222]">
          Salary Data
        </h2>
        <span className="text-sm font-medium text-[#717171] bg-white border border-[#EBEBEB] px-3 py-1 rounded-md shadow-sm">
          {total === 0
            ? '0 records'
            : `Showing ${start + 1}–${end} of ${total}`}
        </span>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {total === 0 ? (
        // Empty state
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-[#222222] mb-2">
            No salary records found
          </h3>
          <p className="text-sm text-[#717171] mb-6">Try adjusting your filters or search terms.</p>
          <button
            id="empty-state-clear-all"
            onClick={clearAll}
            className="px-6 py-2.5 bg-[#FF5A5F] hover:bg-[#e0484d] text-white font-semibold rounded-lg shadow-sm transition-colors text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#EBEBEB]">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Location</th>
                  <th
                    id="sort-experience"
                    className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider cursor-pointer select-none hover:text-[#222222] hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('experience_years')}
                  >
                    <div className="flex items-center">Experience <SortIcon field="experience_years" /></div>
                  </th>
                  <th
                    id="sort-base"
                    className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider cursor-pointer select-none hover:text-[#222222] hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('base_salary')}
                  >
                    <div className="flex items-center">Base Salary <SortIcon field="base_salary" /></div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#717171] uppercase tracking-wider">Stock</th>
                  <th
                    id="sort-tc"
                    className="px-6 py-4 text-[11px] font-bold text-[#222222] uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors border-l border-[#F0F0F0] bg-[#FDFDFD]"
                    onClick={() => handleSort('total_compensation')}
                  >
                    <div className="flex items-center text-[#0369A1]">Total Comp <SortIcon field="total_compensation" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {pageData.map((salary) => (
                  <SalaryRow key={salary.id} salary={salary} displayCurrency={currency} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-1">
          <button
            id="pagination-prev"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-semibold text-[#484848] bg-white border border-[#EBEBEB] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            ← Previous
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) pageNum = i + 1
              else if (currentPage <= 3) pageNum = i + 1
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
              else pageNum = currentPage - 2 + i

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-150 ${
                    currentPage === pageNum
                      ? 'bg-[#FF5A5F] text-white shadow-sm'
                      : 'bg-white text-[#484848] border border-[#EBEBEB] hover:bg-[#FAFAFA] hover:border-[#D1D5DB]'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            id="pagination-next"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-semibold text-[#484848] bg-white border border-[#EBEBEB] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Salary Row component ─────────────────────────────────────────────────────
function SalaryRow({
  salary,
  displayCurrency,
}: {
  salary: SalaryWithCompany
  displayCurrency: 'INR' | 'USD'
}) {
  const { company, role, level, location, experience_years, base_salary, stock, total_compensation, bonus, currency } = salary

  const fmt = (amount: number) => formatCurrency(amount, currency as Currency, displayCurrency as Currency)

  const hasBonus = bonus > 0
  const hasStock = stock > 0

  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors group">
      {/* Company */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <a
            href={`/companies/${company.slug}`}
            className="text-[14px] font-bold text-[#222222] hover:text-[#FF5A5F] hover:underline truncate max-w-[160px] transition-colors"
            title={company.name}
          >
            {company.name}
          </a>
          {company.industry && (
            <span className="text-[12px] font-medium text-[#717171] mt-0.5 truncate max-w-[160px]">{company.industry}</span>
          )}
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <span
          className="text-[14px] font-semibold text-[#484848] block max-w-[180px] truncate"
          title={role}
        >
          {role}
        </span>
      </td>

      {/* Level badge */}
      <td className="px-6 py-4">
        <LevelBadge level={level as Level} />
      </td>

      {/* Location */}
      <td className="px-6 py-4">
        <span className="text-[13px] font-medium text-[#484848]">
          {location}
        </span>
      </td>

      {/* Experience */}
      <td className="px-6 py-4">
        <span className="text-[13px] font-medium text-[#717171]">
          {formatExperience(experience_years)}
        </span>
      </td>

      {/* Base Salary */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#484848]">
            {fmt(base_salary)}
          </span>
          <span className="text-[11px] font-medium text-[#9CA3AF] mt-0.5">
            {hasBonus ? `Bonus: ${fmt(bonus)}` : 'Bonus: —'}
          </span>
        </div>
      </td>

      {/* Stock */}
      <td className="px-6 py-4">
        <span className={`text-[14px] font-semibold ${hasStock ? 'text-[#484848]' : 'text-[#9CA3AF]'}`}>
          {hasStock ? fmt(stock) : '—'}
        </span>
      </td>

      {/* Total Comp — dominant */}
      <td className="px-6 py-4 border-l border-[#F0F0F0] bg-[#FDFDFD] group-hover:bg-white transition-colors">
        <span className="text-[16px] font-black text-[#0369A1] tracking-tight block">
          {fmt(total_compensation)}
        </span>
      </td>
    </tr>
  )
}
