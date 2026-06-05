import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'
import SalaryTable from '@/components/features/SalaryTable'
import type { SalaryWithCompany, Currency } from '@/types/salary'

export const revalidate = 3600 // ISR: revalidate every hour

export const metadata: Metadata = {
  title: 'Salary Data — India Tech Salaries by Company & Level | TalentDash',
  description:
    'Browse structured salary data for Software Engineers, Product Managers, and Data Scientists at Google, Amazon, Meta, Flipkart, TCS, and more. Filter by level (L3–L6, SDE-I to III), location, and company.',
  alternates: {
    canonical: 'https://talentdash.in/salaries',
  },
  openGraph: {
    title: 'Salary Data — India Tech Salaries | TalentDash',
    description:
      'Structured, level-aware salary data for Indian tech professionals. Filter by company, role, level, and location.',
    url: 'https://talentdash.in/salaries',
  },
}

// JSON-LD structured data for Google rich results
function SalaryJsonLd({ count }: { count: number }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TalentDash India Tech Salary Data',
    description: `Structured compensation data for ${count}+ salary records across Indian tech companies. Includes base salary, bonus, stock (RSU/ESOP), and total compensation by level and location.`,
    url: 'https://talentdash.in/salaries',
    creator: {
      '@type': 'Organization',
      name: 'TalentDash',
      url: 'https://talentdash.in',
    },
    keywords: [
      'India tech salaries',
      'software engineer salary India',
      'Google salary India',
      'Amazon salary India',
      'SDE salary Bengaluru',
      'L4 L5 salary India',
    ],
    variableMeasured: [
      'Base Salary',
      'Bonus',
      'Stock / RSU / ESOP',
      'Total Compensation',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ── Server-side stat helpers ─────────────────────────────────────────────────

function getTopLocation(salaries: SalaryWithCompany[]): string {
  const counts: Record<string, number> = {}
  for (const s of salaries) {
    counts[s.location] = (counts[s.location] ?? 0) + 1
  }
  return (
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'India'
  )
}

interface RoleGroup {
  role: string
  count: number
  medianTC: number
  minTC: number
  maxTC: number
  tcs: number[]
  experienceGroups: ExperienceGroup[]
  avgBase: number
  avgBonus: number
  avgStock: number
}

interface ExperienceGroup {
  label: string
  minYears: number
  maxYears: number
  medianTC: number
  count: number
}

const EXP_BUCKETS = [
  { label: '0–2 yrs', minYears: 0, maxYears: 2 },
  { label: '3–5 yrs', minYears: 3, maxYears: 5 },
  { label: '6–9 yrs', minYears: 6, maxYears: 9 },
  { label: '10+ yrs', minYears: 10, maxYears: 99 },
]

function buildRoleGroups(salaries: SalaryWithCompany[]): RoleGroup[] {
  const map: Record<string, SalaryWithCompany[]> = {}
  for (const s of salaries) {
    if (!map[s.role]) map[s.role] = []
    map[s.role].push(s)
  }

  return Object.entries(map)
    .map(([role, records]) => {
      const tcs = records.map((r) => r.total_compensation)
      const bases = records.map((r) => r.base_salary)
      const bonuses = records.map((r) => r.bonus)
      const stocks = records.map((r) => r.stock)

      const experienceGroups: ExperienceGroup[] = EXP_BUCKETS.map((bucket) => {
        const subset = records.filter(
          (r) =>
            r.experience_years >= bucket.minYears &&
            r.experience_years <= bucket.maxYears
        )
        return {
          label: bucket.label,
          minYears: bucket.minYears,
          maxYears: bucket.maxYears,
          medianTC: computeMedian(subset.map((r) => r.total_compensation)),
          count: subset.length,
        }
      }).filter((g) => g.count > 0)

      const n = records.length
      return {
        role,
        count: n,
        medianTC: computeMedian(tcs),
        minTC: Math.min(...tcs),
        maxTC: Math.max(...tcs),
        tcs,
        experienceGroups,
        avgBase: bases.reduce((a, b) => a + b, 0) / n,
        avgBonus: bonuses.reduce((a, b) => a + b, 0) / n,
        avgStock: stocks.reduce((a, b) => a + b, 0) / n,
      }
    })
    .sort((a, b) => b.count - a.count)
}

// ── Sub-components (server) ─────────────────────────────────────────────────

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="6" fill="#059669" />
        <path d="M3.5 6.2l1.8 1.8 3.2-3.5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string
  label: string
  value: string
  sub?: string
}) {
  return (
    <div
      className="flex-1 min-w-0 rounded-xl p-4"
      style={{ border: '1px solid #E5E7EB', background: '#fff' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium" style={{ color: '#717171' }}>
          {label}
        </span>
      </div>
      <div className="text-xl font-bold" style={{ color: '#222222' }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: '#717171' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function RangeBar({
  value,
  min,
  max,
  label,
}: {
  value: number
  min: number
  max: number
  label: string
}) {
  const pct = max === min ? 50 : Math.round(((value - min) / (max - min)) * 100)
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1" style={{ color: '#717171' }}>
        <span>{formatCurrency(min, 'INR')}</span>
        <span className="font-semibold" style={{ color: '#222222' }}>
          {label}
        </span>
        <span>{formatCurrency(max, 'INR')}</span>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: '#F3F4F6' }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #FF5A5F 0%, #FF8A8E 100%)',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
          style={{
            left: `calc(${pct}% - 6px)`,
            background: '#FF5A5F',
          }}
        />
      </div>
    </div>
  )
}

function ExperienceBarChart({ groups }: { groups: ExperienceGroup[] }) {
  if (groups.length === 0) return null
  const maxTC = Math.max(...groups.map((g) => g.medianTC))
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#222222' }}>
        Total Pay by Experience
      </h3>
      <div className="space-y-3">
        {groups.map((g) => {
          const pct = maxTC === 0 ? 0 : Math.round((g.medianTC / maxTC) * 100)
          return (
            <div key={g.label}>
              <div className="flex justify-between text-xs mb-1" style={{ color: '#717171' }}>
                <span>{g.label}</span>
                <span className="font-semibold" style={{ color: '#222222' }}>
                  {formatCurrency(g.medianTC, 'INR')}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: '#F3F4F6' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: 'linear-gradient(90deg, #FF5A5F 0%, #FF8A8E 100%)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CompBreakdown({
  avgBase,
  avgBonus,
  avgStock,
  avgTC,
}: {
  avgBase: number
  avgBonus: number
  avgStock: number
  avgTC: number
}) {
  const safe = avgTC || 1
  const items = [
    { label: 'Base Pay', value: avgBase, color: '#FF5A5F' },
    { label: 'Bonus', value: avgBonus, color: '#FF8A8E' },
    { label: 'Equity', value: avgStock, color: '#FECACA' },
    {
      label: 'Benefits',
      value: Math.max(0, avgTC - avgBase - avgBonus - avgStock),
      color: '#FEE2E2',
    },
  ]

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#222222' }}>
        Compensation Breakdown
      </h3>
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {items.map((item) => {
          const pct = Math.round((item.value / safe) * 100)
          return pct > 0 ? (
            <div
              key={item.label}
              style={{ width: `${pct}%`, background: item.color }}
            />
          ) : null
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const pct = Math.round((item.value / safe) * 100)
          return (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-xs" style={{ color: '#717171' }}>
                {item.label}
              </span>
              <span className="text-xs font-semibold ml-auto" style={{ color: '#222222' }}>
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RoleDetailPanel({ group }: { group: RoleGroup }) {
  const avgTC = group.avgBase + group.avgBonus + group.avgStock

  return (
    <div>
      {/* Role header */}
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h2 className="text-xl font-bold" style={{ color: '#222222' }}>
          {group.role}
        </h2>
        <VerifiedBadge />
      </div>
      <p className="text-xs mb-4" style={{ color: '#717171' }}>
        Based on {group.count} verified submissions
      </p>

      {/* Total pay highlight */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: '#FFF5F5', border: '1px solid #FECACA' }}
      >
        <div className="text-xs font-medium mb-1" style={{ color: '#717171' }}>
          Total Pay (Annual) · Median
        </div>
        <div className="text-3xl font-bold" style={{ color: '#FF5A5F' }}>
          {formatCurrency(group.medianTC, 'INR')}
        </div>
        <RangeBar value={group.medianTC} min={group.minTC} max={group.maxTC} label="Median" />
      </div>

      {/* Experience chart */}
      <ExperienceBarChart groups={group.experienceGroups} />

      {/* Compensation breakdown */}
      <CompBreakdown
        avgBase={group.avgBase}
        avgBonus={group.avgBonus}
        avgStock={group.avgStock}
        avgTC={avgTC}
      />

      {/* CTA banner */}
      <div
        className="mt-6 rounded-xl p-4 flex items-center justify-between gap-4"
        style={{ background: '#FFF1F2', border: '1px solid #FECACA' }}
      >
        <p className="text-sm font-medium" style={{ color: '#222222' }}>
          High performer? See how your compensation compares.
        </p>
        <a
          href="/salaries/submit"
          className="flex-shrink-0 text-sm font-semibold whitespace-nowrap"
          style={{ color: '#FF5A5F' }}
        >
          Compare your salary →
        </a>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default async function SalariesPage() {
  // RSC: fetch all salary data at build time
  const rawSalaries = await prisma.salary.findMany({
    include: { company: true },
    orderBy: { total_compensation: 'desc' },
  })

  // Serialize BigInt for client component
  const salaries = serializePrismaRecord(rawSalaries) as unknown as SalaryWithCompany[]

  // ── Compute server-side stats ──────────────────────────────────────────────
  const count = salaries.length
  const allTCs = salaries.map((s) => s.total_compensation)
  const avgTC = allTCs.length > 0 ? allTCs.reduce((a, b) => a + b, 0) / allTCs.length : 0
  const minTC = allTCs.length > 0 ? Math.min(...allTCs) : 0
  const maxTC = allTCs.length > 0 ? Math.max(...allTCs) : 0
  const topLocation = getTopLocation(salaries)
  const roleGroups = buildRoleGroups(salaries)
  const firstRole = roleGroups[0]
  // "People also viewed" — next 4 roles after the first
  const alsoViewed = roleGroups.slice(1, 5)

  return (
    <>
      <SalaryJsonLd count={count} />

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,90,95,0.08) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,90,95,0.06) 0%, transparent 70%)',
          }}
          aria-hidden
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Left: headline + stats */}
            <div className="flex-1">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs mb-4" style={{ color: '#717171' }}>
                <a href="/companies" className="hover:underline" style={{ color: '#717171' }}>
                  Companies
                </a>
                <span>›</span>
                <span style={{ color: '#222222' }}>Salaries</span>
              </nav>

              {/* Headline */}
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#222222' }}>
                  India Tech Salaries
                </h1>
                <VerifiedBadge />
              </div>
              <p className="text-sm mb-6" style={{ color: '#717171' }}>
                Based on{' '}
                <span className="font-semibold" style={{ color: '#222222' }}>
                  {count.toLocaleString()}
                </span>{' '}
                verified salary submissions in India · Updated June 2026
              </p>

              {/* Stat cards */}
              <div className="flex flex-col sm:flex-row gap-3">
                <StatCard
                  icon="💰"
                  label="Average Total Pay"
                  value={formatCurrency(avgTC, 'INR' as Currency)}
                  sub="Annual, all levels"
                />
                <StatCard
                  icon="📊"
                  label="Salary Range"
                  value={`${formatCurrency(minTC, 'INR' as Currency)} – ${formatCurrency(maxTC, 'INR' as Currency)}`}
                  sub="Min – Max across dataset"
                />
                <StatCard
                  icon="📍"
                  label="Top Paying Location"
                  value={topLocation}
                  sub="Most submissions"
                />
              </div>
            </div>

            {/* Right: decorative pink gradient blob */}
            <div
              className="hidden lg:flex flex-shrink-0 w-72 h-48 rounded-2xl items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECACA 100%)',
                border: '1px solid #FECACA',
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-2">💼</div>
                <p className="text-xs font-medium" style={{ color: '#FF5A5F' }}>
                  {count.toLocaleString()} Verified Records
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Search + Filter Bar ──────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none"
                aria-hidden
              >
                🔍
              </span>
              <input
                type="search"
                placeholder="Search roles, job titles or keywords"
                className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
                style={{
                  border: '1px solid #E5E7EB',
                  color: '#222222',
                  background: '#FAFAFA',
                }}
                aria-label="Search roles"
              />
            </div>

            {/* Location dropdown */}
            <select
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                border: '1px solid #E5E7EB',
                color: '#222222',
                background: '#fff',
                minWidth: '140px',
              }}
              defaultValue="India"
              aria-label="Location"
            >
              <option value="India">📍 India</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune">Pune</option>
            </select>

            {/* Experience dropdown */}
            <select
              className="rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{
                border: '1px solid #E5E7EB',
                color: '#222222',
                background: '#fff',
                minWidth: '160px',
              }}
              defaultValue=""
              aria-label="Experience"
            >
              <option value="">All Experience</option>
              <option value="0-2">0–2 years</option>
              <option value="3-5">3–5 years</option>
              <option value="6-9">6–9 years</option>
              <option value="10+">10+ years</option>
            </select>

            {/* More filters */}
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{
                border: '1px solid #E5E7EB',
                color: '#222222',
                background: '#fff',
              }}
            >
              <span>⚙️</span>
              More filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs Row ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-0 overflow-x-auto" role="tablist">
            {[
              { label: 'Salaries', active: true },
              { label: 'Insights', badge: 'New' },
              { label: 'Benefits' },
              { label: 'Photos' },
              { label: 'Reviews' },
              { label: 'Jobs' },
            ].map((tab) => (
              <button
                key={tab.label}
                role="tab"
                aria-selected={tab.active ?? false}
                className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0"
                style={{
                  color: tab.active ? '#FF5A5F' : '#717171',
                  borderBottom: tab.active ? '2px solid #FF5A5F' : '2px solid transparent',
                  marginBottom: '-1px',
                  background: 'none',
                  cursor: tab.active ? 'default' : 'pointer',
                }}
              >
                {tab.label}
                {tab.badge && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: '#FF5A5F', color: '#fff' }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Two-Column Layout ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6 items-start">

          {/* ── Left Sidebar: Role List ─────────────────────────────────────── */}
          <aside
            className="hidden lg:block flex-shrink-0 rounded-xl overflow-hidden"
            style={{
              width: '288px',
              border: '1px solid #E5E7EB',
              background: '#fff',
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}
            >
              <h2 className="text-sm font-semibold" style={{ color: '#222222' }}>
                All Roles
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#717171' }}>
                {roleGroups.length} roles · sorted by submissions
              </p>
            </div>
            <ul className="divide-y" style={{ borderColor: '#E5E7EB' }}>
              {roleGroups.map((rg, idx) => (
                <li
                  key={rg.role}
                  className="px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    borderLeft: idx === 0 ? '3px solid #FF5A5F' : '3px solid transparent',
                    background: idx === 0 ? '#FFF5F5' : '#fff',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: idx === 0 ? '#FF5A5F' : '#222222' }}
                      >
                        {rg.role}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#717171' }}>
                        {formatCurrency(rg.minTC, 'INR')} –{' '}
                        {formatCurrency(rg.maxTC, 'INR')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: '#222222' }}
                      >
                        {formatCurrency(rg.medianTC, 'INR')}
                      </p>
                      <p className="text-xs" style={{ color: '#717171' }}>
                        {rg.count} records
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* ── Right Content ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Role Detail Panel */}
            {firstRole && (
              <div
                className="rounded-xl p-6"
                style={{ border: '1px solid #E5E7EB', background: '#fff' }}
              >
                <RoleDetailPanel group={firstRole} />
              </div>
            )}

            {/* Salary Table — client component */}
            <div>
              <h2 className="text-base font-semibold mb-4" style={{ color: '#222222' }}>
                All Salary Records
              </h2>
              <Suspense fallback={<TableSkeleton />}>
                <SalaryTable initialData={salaries} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* ── People Also Viewed ──────────────────────────────────────────── */}
        {alsoViewed.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#222222' }}>
              People also viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {alsoViewed.map((rg) => (
                <div
                  key={rg.role}
                  className="rounded-xl p-4 cursor-pointer transition-shadow hover:shadow-md"
                  style={{ border: '1px solid #E5E7EB', background: '#fff' }}
                >
                  <p className="text-sm font-semibold mb-1 truncate" style={{ color: '#222222' }}>
                    {rg.role}
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#FF5A5F' }}>
                    {formatCurrency(rg.medianTC, 'INR')}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#717171' }}>
                    Median TC · {rg.count} records
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#717171' }}>
                    {formatCurrency(rg.minTC, 'INR')} – {formatCurrency(rg.maxTC, 'INR')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        <div
          className="mt-10 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            border: '1px solid #FECACA',
          }}
        >
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#222222' }}>
              Didn&apos;t find your role?
            </h3>
            <p className="text-sm" style={{ color: '#717171' }}>
              Submit your salary and help others make informed decisions.
            </p>
          </div>
          <a
            href="/salaries/submit"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#FF5A5F', color: '#fff' }}
          >
            Submit your salary →
          </a>
        </div>
      </div>
    </>
  )
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div
      className="rounded-xl p-4"
      style={{ border: '1px solid #E5E7EB', background: '#fff' }}
    >
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-lg animate-pulse"
            style={{ background: '#F3F4F6' }}
          />
        ))}
      </div>
    </div>
  )
}
