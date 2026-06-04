'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Level, Currency, SalaryWithCompany } from '@/types/salary'
import { VALID_LEVELS, LEVEL_LABELS } from '@/lib/config'
import { formatCurrency, formatExperience, formatLevel } from '@/lib/format'
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
    return <span className="ml-1" style={{ color: '#FF5A5F' }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  return (
    <div className="animate-fadein">
      {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-start">
          {/* Company search (debounced) */}
          <div className="flex-1 min-w-[180px] max-w-[240px]">
            <label className="label-sm block mb-1.5">Company</label>
            <input
              id="filter-company"
              type="text"
              className="td-input"
              placeholder="Search company..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          {/* Role dropdown */}
          <div className="flex-1 min-w-[160px] max-w-[200px]">
            <label className="label-sm block mb-1.5">Role</label>
            <select
              id="filter-role"
              className="td-select"
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
          <div className="flex-1 min-w-[150px] max-w-[190px]">
            <label className="label-sm block mb-1.5">Location</label>
            <select
              id="filter-location"
              className="td-select"
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
            <label className="label-sm block mb-1.5">Currency</label>
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#EBEBEB' }}>
              {(['INR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  id={`currency-${c.toLowerCase()}`}
                  onClick={() => setCurrency(c)}
                  className="flex-1 px-3 py-2 text-sm font-medium transition-all duration-150"
                  style={{
                    background: currency === c ? '#FF5A5F' : '#fff',
                    color: currency === c ? '#fff' : '#484848',
                  }}
                >
                  {c === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Level multi-select */}
        <div className="mt-3">
          <label className="label-sm block mb-2">Level</label>
          <div className="flex flex-wrap gap-1.5">
            {VALID_LEVELS.map((level) => (
              <button
                key={level}
                id={`level-filter-${level}`}
                onClick={() => toggleLevel(level as Level)}
                className="badge transition-all duration-150 cursor-pointer"
                style={{
                  background: selectedLevels.includes(level as Level) ? '#FF5A5F' : '#f5f5f5',
                  color: selectedLevels.includes(level as Level) ? '#fff' : '#484848',
                  borderColor: selectedLevels.includes(level as Level) ? '#FF5A5F' : '#EBEBEB',
                }}
              >
                {LEVEL_LABELS[level as Level]}
              </button>
            ))}
            {(selectedLevels.length > 0 || company || role || location) && (
              <button
                id="clear-all-filters"
                onClick={clearAll}
                className="text-xs font-medium ml-2 transition-colors duration-150"
                style={{ color: '#FF5A5F' }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results Summary ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="meta-text">
          {total === 0
            ? 'No records found'
            : `Showing ${start + 1}–${end} of ${total} records`}
        </p>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {total === 0 ? (
        // Empty state
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-base font-semibold mb-2" style={{ color: '#222222' }}>
            No records found for these filters
          </h3>
          <p className="meta-text mb-4">Try removing a filter to see more results.</p>
          <button
            id="empty-state-clear-all"
            onClick={clearAll}
            className="btn-primary text-sm"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="td-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Level</th>
                <th>Location</th>
                <th
                  id="sort-experience"
                  className="cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort('experience_years')}
                >
                  Experience <SortIcon field="experience_years" />
                </th>
                <th
                  id="sort-base"
                  className="cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort('base_salary')}
                >
                  Base Salary <SortIcon field="base_salary" />
                </th>
                <th>Stock</th>
                <th
                  id="sort-tc"
                  className="cursor-pointer select-none hover:text-gray-700"
                  onClick={() => handleSort('total_compensation')}
                >
                  Total Comp <SortIcon field="total_compensation" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((salary) => (
                <SalaryRow key={salary.id} salary={salary} displayCurrency={currency} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <button
            id="pagination-prev"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-ghost text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current
              let pageNum: number
              if (totalPages <= 5) pageNum = i + 1
              else if (currentPage <= 3) pageNum = i + 1
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
              else pageNum = currentPage - 2 + i

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: currentPage === pageNum ? '#FF5A5F' : 'transparent',
                    color: currentPage === pageNum ? '#fff' : '#484848',
                  }}
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
            className="btn-ghost text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
    <tr>
      {/* Company */}
      <td>
        <a
          href={`/companies/${company.slug}`}
          className="font-semibold text-sm hover:underline truncate block max-w-[160px]"
          style={{ color: '#222222' }}
          title={company.name}
        >
          {company.name}
        </a>
        {company.industry && (
          <span className="meta-text block">{company.industry}</span>
        )}
      </td>

      {/* Role */}
      <td>
        <span
          className="text-sm block max-w-[180px] truncate"
          style={{ color: '#484848' }}
          title={role}
        >
          {role}
        </span>
      </td>

      {/* Level badge */}
      <td>
        <LevelBadge level={level as Level} />
      </td>

      {/* Location */}
      <td>
        <span className="text-sm" style={{ color: '#484848' }}>
          {location}
        </span>
      </td>

      {/* Experience */}
      <td>
        <span className="text-sm" style={{ color: '#717171' }}>
          {formatExperience(experience_years)}
        </span>
      </td>

      {/* Base Salary */}
      <td>
        <span className="text-sm font-medium" style={{ color: '#484848' }}>
          {fmt(base_salary)}
        </span>
        {!hasBonus && (
          <span className="meta-text block">Bonus: —</span>
        )}
        {hasBonus && (
          <span className="meta-text block">Bonus: {fmt(bonus)}</span>
        )}
      </td>

      {/* Stock */}
      <td>
        <span className="text-sm" style={{ color: hasStock ? '#484848' : '#717171' }}>
          {hasStock ? fmt(stock) : '—'}
        </span>
      </td>

      {/* Total Comp — dominant */}
      <td>
        <span className="tc-amount">{fmt(total_compensation)}</span>
      </td>
    </tr>
  )
}
