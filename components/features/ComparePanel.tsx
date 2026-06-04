'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { SalaryWithCompany, Level, Currency } from '@/types/salary'
import { formatCurrency, formatExperience, formatLevel } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'

interface ComparePanelProps {
  salaries: SalaryWithCompany[]
}

// ── Format delta with sign and color ─────────────────────────────────────────
function DeltaCell({ value, currency }: { value: number; currency: Currency }) {
  if (value === 0) return <span style={{ color: '#717171' }}>—</span>

  const fmt = formatCurrency(Math.abs(value), currency)
  const isPositive = value > 0

  return (
    <span
      className="font-semibold"
      style={{ color: isPositive ? '#008A05' : '#D93025' }}
    >
      {isPositive ? `+${fmt}` : `-${fmt}`}
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
  const deltaCurrency: Currency = 'INR' // deltas always shown in INR

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Record 1 */}
        <div className="card p-4">
          <label className="label-sm block mb-2">
            Select Record A
            {winner === 'record1' && (
              <span
                className="ml-2 badge"
                style={{ background: '#0369A1', color: '#fff', borderColor: '#0369A1' }}
              >
                Higher TC
              </span>
            )}
          </label>
          <select
            id="compare-select-1"
            className="td-select"
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

          {record1 && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: '#F7F7F7' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{record1.company.name}</span>
                <LevelBadge level={record1.level as Level} />
              </div>
              <div className="meta-text">{record1.role} · {record1.location}</div>
              <div className="tc-amount mt-1" style={{ fontSize: '20px' }}>
                {formatCurrency(record1.total_compensation, r1Currency)}
              </div>
            </div>
          )}
        </div>

        {/* Record 2 */}
        <div className="card p-4">
          <label className="label-sm block mb-2">
            Select Record B
            {winner === 'record2' && (
              <span
                className="ml-2 badge"
                style={{ background: '#0369A1', color: '#fff', borderColor: '#0369A1' }}
              >
                Higher TC
              </span>
            )}
          </label>
          <select
            id="compare-select-2"
            className="td-select"
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

          {record2 && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: '#F7F7F7' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{record2.company.name}</span>
                <LevelBadge level={record2.level as Level} />
              </div>
              <div className="meta-text">{record2.role} · {record2.location}</div>
              <div className="tc-amount mt-1" style={{ fontSize: '20px' }}>
                {formatCurrency(record2.total_compensation, r2Currency)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      {record1 && record2 ? (
        <div className="card overflow-x-auto animate-fadein">
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EBEBEB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#222222', margin: 0 }}>
              Comparison Results
            </h2>
          </div>
          <table className="td-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Field</th>
                <th style={{ width: '30%' }}>
                  Record A
                  {winner === 'record1' && (
                    <span
                      className="ml-2 badge"
                      style={{ background: '#0369A1', color: '#fff', borderColor: '#0369A1', fontSize: '10px' }}
                    >
                      Higher TC
                    </span>
                  )}
                </th>
                <th style={{ width: '30%' }}>
                  Record B
                  {winner === 'record2' && (
                    <span
                      className="ml-2 badge"
                      style={{ background: '#0369A1', color: '#fff', borderColor: '#0369A1', fontSize: '10px' }}
                    >
                      Higher TC
                    </span>
                  )}
                </th>
                <th style={{ width: '15%' }}>Delta (A − B)</th>
              </tr>
            </thead>
            <tbody>
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
                deltaColor={delta!.exp === 0 ? '#717171' : '#484848'}
              />
              <CompareRow
                field="Base Salary"
                v1={formatCurrency(record1.base_salary, r1Currency)}
                v2={formatCurrency(record2.base_salary, r2Currency)}
                deltaValue={delta!.base}
                deltaCurrency={r1Currency}
              />
              <CompareRow
                field="Bonus"
                v1={record1.bonus > 0 ? formatCurrency(record1.bonus, r1Currency) : '—'}
                v2={record2.bonus > 0 ? formatCurrency(record2.bonus, r2Currency) : '—'}
                deltaValue={delta!.bonus}
                deltaCurrency={r1Currency}
              />
              <CompareRow
                field="Stock (RSU/ESOP)"
                v1={record1.stock > 0 ? formatCurrency(record1.stock, r1Currency) : '—'}
                v2={record2.stock > 0 ? formatCurrency(record2.stock, r2Currency) : '—'}
                deltaValue={delta!.stock}
                deltaCurrency={r1Currency}
              />
              <tr style={{ background: '#f0f7ff' }}>
                <td className="font-bold text-sm" style={{ color: '#0369A1' }}>Total Comp</td>
                <td>
                  <span className="tc-amount text-base">
                    {formatCurrency(record1.total_compensation, r1Currency)}
                  </span>
                </td>
                <td>
                  <span className="tc-amount text-base">
                    {formatCurrency(record2.total_compensation, r2Currency)}
                  </span>
                </td>
                <td>
                  <DeltaCell value={delta!.tc} currency={r1Currency} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Winner summary */}
          {winner && winner !== 'tie' && (
            <div
              className="px-5 py-3 flex items-center gap-3"
              style={{ background: '#f0f7ff', borderTop: '1px solid #EBEBEB' }}
            >
              <span
                className="badge"
                style={{ background: '#0369A1', color: '#fff', borderColor: '#0369A1' }}
              >
                Higher TC
              </span>
              <span className="text-sm font-medium" style={{ color: '#222222' }}>
                {winner === 'record1' ? record1.company.name : record2.company.name} pays more by{' '}
                {formatCurrency(Math.abs(delta!.tc), r1Currency)} in total compensation
              </span>
            </div>
          )}

          {winner === 'tie' && (
            <div
              className="px-5 py-3 text-sm"
              style={{ background: '#f5f5f5', borderTop: '1px solid #EBEBEB', color: '#484848' }}
            >
              Both records have equal total compensation.
            </div>
          )}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">⚖️</div>
          <p className="meta-text">Select two salary records above to see a detailed comparison.</p>
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
  deltaCurrency,
  deltaText,
  deltaColor,
  isText,
}: {
  field: string
  v1: React.ReactNode
  v2: React.ReactNode
  deltaValue?: number
  deltaCurrency?: Currency
  deltaText?: string
  deltaColor?: string
  isText?: boolean
}) {
  return (
    <tr>
      <td className="font-medium text-sm" style={{ color: '#717171' }}>
        {field}
      </td>
      <td className="text-sm font-medium" style={{ color: '#222222' }}>
        {v1}
      </td>
      <td className="text-sm font-medium" style={{ color: '#222222' }}>
        {v2}
      </td>
      <td>
        {isText ? (
          <span className="meta-text">—</span>
        ) : deltaText ? (
          <span className="font-semibold" style={{ color: deltaColor ?? '#717171' }}>
            {deltaText}
          </span>
        ) : deltaValue !== undefined && deltaCurrency ? (
          <DeltaCell value={deltaValue} currency={deltaCurrency} />
        ) : (
          <span className="meta-text">—</span>
        )}
      </td>
    </tr>
  )
}
