'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SalaryWithCompany, Level, Currency } from '@/types/salary'
import { formatCurrency, formatExperience } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'

interface ComparePanelProps {
  salaries: SalaryWithCompany[]
}

// ── Format delta with sign, color, and percentage ─────────────────────────────
function DeltaCell({ 
  value, 
  currency, 
  baseValue 
}: { 
  value: number; 
  currency: Currency;
  baseValue?: number;
}) {
  if (value === 0) return <span className="text-[#717171] font-medium">—</span>

  const fmt = formatCurrency(Math.abs(value), currency)
  const isPositive = value > 0
  
  // Calculate percentage if baseValue is provided and > 0
  let pctStr = ''
  if (baseValue && baseValue > 0) {
    const pct = Math.abs((value / baseValue) * 100)
    pctStr = ` (${isPositive ? '+' : '-'}${pct.toFixed(1)}%)`
  }

  return (
    <span
      className={`font-bold ${isPositive ? 'text-[#008A05]' : 'text-[#D93025]'}`}
    >
      {isPositive ? `+${fmt}` : `-${fmt}`}{pctStr}
    </span>
  )
}

export default function ComparePanel({ salaries }: ComparePanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-fill from URL state
  const [s1Id, setS1Id] = useState(searchParams.get('s1') ?? '')
  const [s2Id, setS2Id] = useState(searchParams.get('s2') ?? '')

  // Also support pre-filling company from c1 param (coming from company page)
  const c1Slug = searchParams.get('c1')

  // Auto-select first record for c1 company
  useEffect(() => {
    if (c1Slug && !s1Id) {
      const firstRecord = salaries.find((s) => s.company.slug === c1Slug)
      if (firstRecord) setS1Id(firstRecord.id)
    }
  }, [c1Slug, salaries, s1Id])

  // Sync selections to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (s1Id) params.set('s1', s1Id)
    if (s2Id) params.set('s2', s2Id)
    router.replace(`/compare?${params.toString()}`, { scroll: false })
  }, [s1Id, s2Id, router])

  const record1 = useMemo(() => salaries.find((s) => s.id === s1Id) ?? null, [salaries, s1Id])
  const record2 = useMemo(() => salaries.find((s) => s.id === s2Id) ?? null, [salaries, s2Id])

  // Delta: record1 - record2
  const delta = useMemo(() => {
    if (!record1 || !record2) return null
    return {
      base: record1.base_salary - record2.base_salary,
      bonus: record1.bonus - record2.bonus,
      stock: record1.stock - record2.stock,
      tc: record1.total_compensation - record2.total_compensation,
      exp: record1.experience_years - record2.experience_years,
    }
  }, [record1, record2])

  // Dropdown option label
  const optionLabel = (s: SalaryWithCompany) =>
    `${s.company.name} — ${s.role} (${s.level.replace(/_/g, '-')}) · ${s.location}`

  const r1Currency = (record1?.currency ?? 'INR') as Currency
  const r2Currency = (record2?.currency ?? 'INR') as Currency

  const winner = delta
    ? delta.tc > 0
      ? 'record1'
      : delta.tc < 0
      ? 'record2'
      : 'tie'
    : null

  return (
    <div>
      {/* ── Selectors ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Record 1 */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 shadow-sm">
          <label className="flex items-center gap-3 text-xs font-bold text-[#717171] uppercase tracking-wider mb-3">
            Select Record A
            {winner === 'record1' && (
              <span className="bg-[#0369A1] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-normal uppercase">
                Higher TC
              </span>
            )}
          </label>
          <div className="relative">
            <select
              id="compare-select-1"
              className="w-full pl-3 pr-10 py-3 text-sm font-semibold text-[#222222] bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] transition-all appearance-none cursor-pointer"
              value={s1Id}
              onChange={(e) => setS1Id(e.target.value)}
            >
              <option value="">Select a salary record...</option>
              {salaries.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === s2Id}>
                  {optionLabel(s)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>

          {record1 && (
            <div className="mt-4 p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="font-bold text-base text-[#222222]">{record1.company.name}</span>
                <LevelBadge level={record1.level as Level} />
              </div>
              <div className="text-[13px] font-medium text-[#717171] mb-2">{record1.role} · {record1.location}</div>
              <div className="text-2xl font-black text-[#0369A1] tracking-tight">
                {formatCurrency(record1.total_compensation, r1Currency)}
              </div>
            </div>
          )}
        </div>

        {/* Record 2 */}
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 shadow-sm">
          <label className="flex items-center gap-3 text-xs font-bold text-[#717171] uppercase tracking-wider mb-3">
            Select Record B
            {winner === 'record2' && (
              <span className="bg-[#0369A1] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-normal uppercase">
                Higher TC
              </span>
            )}
          </label>
          <div className="relative">
            <select
              id="compare-select-2"
              className="w-full pl-3 pr-10 py-3 text-sm font-semibold text-[#222222] bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20 focus:border-[#FF5A5F] transition-all appearance-none cursor-pointer"
              value={s2Id}
              onChange={(e) => setS2Id(e.target.value)}
            >
              <option value="">Select a salary record...</option>
              {salaries.map((s) => (
                <option key={s.id} value={s.id} disabled={s.id === s1Id}>
                  {optionLabel(s)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>

          {record2 && (
            <div className="mt-4 p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="font-bold text-base text-[#222222]">{record2.company.name}</span>
                <LevelBadge level={record2.level as Level} />
              </div>
              <div className="text-[13px] font-medium text-[#717171] mb-2">{record2.role} · {record2.location}</div>
              <div className="text-2xl font-black text-[#0369A1] tracking-tight">
                {formatCurrency(record2.total_compensation, r2Currency)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      {record1 && record2 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-sm overflow-hidden animate-fadein">
          <div className="px-6 py-4 bg-[#FAFAFA] border-b border-[#EBEBEB]">
            <h2 className="text-[15px] font-bold text-[#222222]">
              Side-by-Side Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-[#EBEBEB]">
                  <th className="px-6 py-4 w-1/4 text-[11px] font-bold text-[#717171] uppercase tracking-wider bg-white">Field</th>
                  <th className="px-6 py-4 w-[30%] bg-[#FAFAFA] border-l border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#222222]">Record A</span>
                      {winner === 'record1' && (
                        <span className="bg-[#0369A1] text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-normal uppercase">
                          Higher TC
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 w-[30%] bg-[#FAFAFA] border-l border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#222222]">Record B</span>
                      {winner === 'record2' && (
                        <span className="bg-[#0369A1] text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-normal uppercase">
                          Higher TC
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 w-[15%] bg-blue-50/30 border-l border-[#F0F0F0] text-[11px] font-bold text-[#717171] uppercase tracking-wider">
                    Delta (A − B)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                <CompareRow
                  field="Company"
                  v1={record1.company.name}
                  v2={record2.company.name}
                  isText
                />
                <CompareRow field="Role" v1={record1.role} v2={record2.role} isText />
                <CompareRow
                  field="Level"
                  v1={<LevelBadge level={record1.level as Level} />}
                  v2={<LevelBadge level={record2.level as Level} />}
                  isText
                />
                <CompareRow
                  field="Location"
                  v1={record1.location}
                  v2={record2.location}
                  isText
                />
                <CompareRow
                  field="Experience"
                  v1={formatExperience(record1.experience_years)}
                  v2={formatExperience(record2.experience_years)}
                  deltaValue={delta!.exp}
                  deltaText={`${delta!.exp > 0 ? '+' : ''}${delta!.exp} yr${Math.abs(delta!.exp) !== 1 ? 's' : ''}`}
                  deltaColor={delta!.exp === 0 ? 'text-[#717171]' : 'text-[#484848]'}
                />
                <CompareRow
                  field="Base Salary"
                  v1={formatCurrency(record1.base_salary, r1Currency)}
                  v2={formatCurrency(record2.base_salary, r2Currency)}
                  deltaValue={delta!.base}
                  baseValue={record2.base_salary}
                  deltaCurrency={r1Currency}
                />
                <CompareRow
                  field="Bonus"
                  v1={record1.bonus > 0 ? formatCurrency(record1.bonus, r1Currency) : '—'}
                  v2={record2.bonus > 0 ? formatCurrency(record2.bonus, r2Currency) : '—'}
                  deltaValue={delta!.bonus}
                  baseValue={record2.bonus}
                  deltaCurrency={r1Currency}
                />
                <CompareRow
                  field="Stock (RSU/ESOP)"
                  v1={record1.stock > 0 ? formatCurrency(record1.stock, r1Currency) : '—'}
                  v2={record2.stock > 0 ? formatCurrency(record2.stock, r2Currency) : '—'}
                  deltaValue={delta!.stock}
                  baseValue={record2.stock}
                  deltaCurrency={r1Currency}
                />
                <tr className="bg-[#F4F9FF]">
                  <td className="px-6 py-4 text-[14px] font-black text-[#0369A1]">Total Comp</td>
                  <td className="px-6 py-4 border-l border-[#F0F0F0]">
                    <span className="text-[16px] font-black text-[#0369A1] tracking-tight">
                      {formatCurrency(record1.total_compensation, r1Currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-l border-[#F0F0F0]">
                    <span className="text-[16px] font-black text-[#0369A1] tracking-tight">
                      {formatCurrency(record2.total_compensation, r2Currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-l border-[#F0F0F0]">
                    <DeltaCell value={delta!.tc} currency={r1Currency} baseValue={record2.total_compensation} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Winner summary */}
          {winner && winner !== 'tie' && (
            <div className="px-6 py-4 bg-[#F4F9FF] border-t border-[#EBEBEB] flex items-center gap-3">
              <span className="bg-[#0369A1] text-white px-2 py-1 rounded text-[11px] font-bold tracking-wider uppercase shadow-sm">
                Higher TC
              </span>
              <span className="text-[14px] font-medium text-[#222222]">
                <span className="font-bold">{winner === 'record1' ? record1.company.name : record2.company.name}</span> pays more by{' '}
                <span className="font-bold">{formatCurrency(Math.abs(delta!.tc), r1Currency)}</span> in total compensation
              </span>
            </div>
          )}

          {winner === 'tie' && (
            <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#EBEBEB] text-[14px] font-medium text-[#484848]">
              Both records have equal total compensation.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">⚖️</div>
          <h3 className="text-lg font-bold text-[#222222] mb-2">
            Select records to compare
          </h3>
          <p className="text-sm text-[#717171]">
            Choose two salary records from the dropdowns above to see a detailed side-by-side comparison of base, bonus, stock, and total compensation.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Row component ─────────────────────────────────────────────────────────────
function CompareRow({
  field,
  v1,
  v2,
  deltaValue,
  baseValue,
  deltaCurrency,
  deltaText,
  deltaColor,
  isText,
}: {
  field: string
  v1: React.ReactNode
  v2: React.ReactNode
  deltaValue?: number
  baseValue?: number
  deltaCurrency?: Currency
  deltaText?: string
  deltaColor?: string
  isText?: boolean
}) {
  return (
    <tr className="hover:bg-[#F9FAFB] transition-colors">
      <td className="px-6 py-4 text-[13px] font-semibold text-[#717171] bg-white">
        {field}
      </td>
      <td className="px-6 py-4 text-[14px] font-semibold text-[#222222] border-l border-[#F0F0F0]">
        {v1}
      </td>
      <td className="px-6 py-4 text-[14px] font-semibold text-[#222222] border-l border-[#F0F0F0]">
        {v2}
      </td>
      <td className="px-6 py-4 border-l border-[#F0F0F0] bg-blue-50/10">
        {isText ? (
          <span className="text-[#9CA3AF] font-medium">—</span>
        ) : deltaText ? (
          <span className={`font-bold ${deltaColor ?? 'text-[#717171]'}`}>
            {deltaText}
          </span>
        ) : deltaValue !== undefined && deltaCurrency ? (
          <DeltaCell value={deltaValue} currency={deltaCurrency} baseValue={baseValue} />
        ) : (
          <span className="text-[#9CA3AF] font-medium">—</span>
        )}
      </td>
    </tr>
  )
}
