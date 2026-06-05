import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'
import SalaryTable from '@/components/features/SalaryTable'
import type { SalaryWithCompany } from '@/types/salary'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Salary Data — India Tech Salaries by Company & Level | TalentDash',
  description:
    'Browse structured salary data for Software Engineers, Product Managers, and Data Scientists at Google, Amazon, Meta, Flipkart, TCS, and more. Filter by level (L3–L6, SDE-I to III), location, and company.',
  alternates: { canonical: 'https://talentdash.in/salaries' },
  openGraph: {
    title: 'Salary Data — India Tech Salaries | TalentDash',
    description: 'Structured, level-aware salary data for Indian tech professionals. Filter by company, role, level, and location.',
    url: 'https://talentdash.in/salaries',
  },
}

function SalaryJsonLd({ count }: { count: number }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TalentDash India Tech Salary Data',
    description: `Structured compensation data for ${count}+ salary records across Indian tech companies. Includes base salary, bonus, stock (RSU/ESOP), and total compensation by level and location.`,
    url: 'https://talentdash.in/salaries',
    creator: { '@type': 'Organization', name: 'TalentDash', url: 'https://talentdash.in' },
    keywords: ['India tech salaries', 'software engineer salary India', 'Google salary India', 'Amazon salary India', 'SDE salary Bengaluru', 'L4 L5 salary India'],
    variableMeasured: ['Base Salary', 'Bonus', 'Stock / RSU / ESOP', 'Total Compensation'],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}

const LOGO_DOMAINS: Record<string, string> = {
  google: 'google.com', amazon: 'amazon.com', microsoft: 'microsoft.com',
  meta: 'meta.com', nvidia: 'nvidia.com', flipkart: 'flipkart.com',
  razorpay: 'razorpay.com', tcs: 'tcs.com', infosys: 'infosys.com',
  wipro: 'wipro.com', meesho: 'meesho.com', zepto: 'zeptonow.com',
}

function getLogoUrl(slug: string) {
  const domain = LOGO_DOMAINS[slug] ?? slug + '.com'
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`
}

const TABS = ['Salaries', 'Insights', 'Benefits', 'Photos', 'Reviews', 'Jobs']

export default async function SalariesPage() {
  const rawSalaries = await prisma.salary.findMany({
    include: { company: true },
    orderBy: { total_compensation: 'desc' },
  })
  const salaries = serializePrismaRecord(rawSalaries) as unknown as SalaryWithCompany[]

  const count = salaries.length
  const tcVals = salaries.map((s) => s.total_compensation)
  const avgTC = tcVals.length > 0 ? Math.round(tcVals.reduce((a, b) => a + b, 0) / tcVals.length) : 0
  const minTC = tcVals.length > 0 ? Math.min(...tcVals) : 0
  const maxTC = tcVals.length > 0 ? Math.max(...tcVals) : 0
  const primaryCurrency = (salaries[0]?.currency ?? 'INR') as any

  // Top paying location
  const locCounts: Record<string, number> = {}
  for (const s of salaries) locCounts[s.location] = (locCounts[s.location] ?? 0) + 1
  const topLocation = Object.entries(locCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Bengaluru'

  // Role groups (sorted by count)
  const roleMap: Record<string, { slugs: string[]; tcs: number[]; bases: number[]; bonuses: number[]; stocks: number[]; expData: number[] }> = {}
  for (const s of salaries) {
    if (!roleMap[s.role]) roleMap[s.role] = { slugs: [], tcs: [], bases: [], bonuses: [], stocks: [], expData: [] }
    roleMap[s.role].slugs.push(s.company.slug)
    roleMap[s.role].tcs.push(s.total_compensation)
    roleMap[s.role].bases.push(s.base_salary)
    roleMap[s.role].bonuses.push(s.bonus)
    roleMap[s.role].stocks.push(s.stock)
    roleMap[s.role].expData.push(s.experience_years)
  }
  const roleGroups = Object.entries(roleMap)
    .map(([role, data]) => ({
      role,
      count: data.tcs.length,
      medianTC: computeMedian(data.tcs),
      minTC: Math.min(...data.tcs),
      maxTC: Math.max(...data.tcs),
      avgBase: data.bases.length > 0 ? Math.round(data.bases.reduce((a, b) => a + b, 0) / data.bases.length) : 0,
      avgBonus: data.bonuses.length > 0 ? Math.round(data.bonuses.reduce((a, b) => a + b, 0) / data.bonuses.length) : 0,
      avgStock: data.stocks.length > 0 ? Math.round(data.stocks.reduce((a, b) => a + b, 0) / data.stocks.length) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  const firstRole = roleGroups[0]

  // Unique companies
  const uniqueCompanies = [...new Set(salaries.map((s) => s.company.slug))].slice(0, 8)
  const uniqueLocations = [...new Set(salaries.map((s) => s.location))].slice(0, 6)

  return (
    <>
      <SalaryJsonLd count={count} />

      <div style={{ background: '#fff', minHeight: '100vh' }}>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', overflow: 'hidden', background: '#fff' }}>
          {/* Pink blob decorations */}
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,90,95,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(219,234,254,0.5) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
              <a href="/companies" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Companies</a>
              <span>›</span>
              <span style={{ color: '#222222', fontWeight: 500 }}>Salaries</span>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'flex-start' }}>
              <div>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#111827', margin: 0, lineHeight: '1.2' }}>
                    India Tech Salaries
                  </h1>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '999px', fontSize: '12px', fontWeight: 600, padding: '3px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ✓ Verified
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px' }}>
                  Based on {count} verified salary submissions in India · Updated June 2026
                </p>

                {/* 3 stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', maxWidth: '640px' }}>
                  {[
                    {
                      icon: '💰',
                      label: 'Average Total Pay',
                      value: formatCurrency(avgTC, primaryCurrency),
                      sub: '/ year',
                      bg: '#FFF5F5',
                    },
                    {
                      icon: '📊',
                      label: 'Salary Range (Annual)',
                      value: `${formatCurrency(minTC, primaryCurrency)} – ${formatCurrency(maxTC, primaryCurrency)}`,
                      sub: 'Min — Max',
                      bg: '#F0F9FF',
                    },
                    {
                      icon: '📍',
                      label: 'Top Paying Location',
                      value: topLocation,
                      sub: 'Most submitted city',
                      bg: '#F0FDF4',
                    },
                  ].map(({ icon, label, value, sub, bg }) => (
                    <div key={label} style={{ padding: '16px', background: bg, border: '1px solid #F3F4F6', borderRadius: '12px' }}>
                      <div style={{ fontSize: '20px', marginBottom: '8px' }}>{icon}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>{label}</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', lineHeight: '1.2', wordBreak: 'break-word' }}>{value}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right decorative company logos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 48px)', gap: '8px', opacity: 0.85 }}>
                {uniqueCompanies.slice(0, 8).map((slug) => (
                  <div key={slug} style={{ position: 'relative', width: '48px', height: '48px' }}>
                    <div style={{ position: 'absolute', inset: 0, background: '#FF5A5F', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
                      {slug.slice(0, 2).toUpperCase()}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getLogoUrl(slug)}
                      alt={slug}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '6px', background: '#fff', borderRadius: '12px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Search + Filters ──────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA', padding: '14px 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search roles, job titles or keywords"
                  style={{ width: '100%', padding: '10px 14px 10px 42px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#222222', background: '#fff', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="16" height="16" fill="none" stroke="#FF5A5F" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
              </div>

              <select style={{ padding: '10px 36px 10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#484848', background: '#fff', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option>📍 India</option>
                {uniqueLocations.map((loc) => <option key={loc}>{loc}</option>)}
              </select>

              <select style={{ padding: '10px 36px 10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#484848', background: '#fff', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option>All Experience</option>
                <option>0–2 years</option>
                <option>2–5 years</option>
                <option>5–8 years</option>
                <option>8+ years</option>
              </select>

              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#484848', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                More filters
              </button>
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  style={{
                    padding: '14px 18px',
                    fontSize: '14px',
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? '#FF5A5F' : '#717171',
                    background: 'none',
                    border: 'none',
                    borderBottom: i === 0 ? '2px solid #FF5A5F' : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {tab}
                  {tab === 'Insights' && (
                    <span style={{ background: '#FF5A5F', color: '#fff', borderRadius: '4px', fontSize: '10px', fontWeight: 700, padding: '1px 5px' }}>New</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content: Sidebar + Detail panel ──────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'flex-start' }}>

            {/* ── Left: Roles sidebar ─────────────────────────────────────────── */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>All Roles</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{roleGroups.length} roles</div>
                </div>
                <select style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: '6px', color: '#484848', background: '#fff', fontFamily: 'inherit' }}>
                  <option>Sort by Popular</option>
                  <option>Sort by TC</option>
                </select>
              </div>

              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {roleGroups.map((rg, i) => (
                  <div
                    key={rg.role}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #F9FAFB',
                      borderLeft: i === 0 ? '3px solid #FF5A5F' : '3px solid transparent',
                      background: i === 0 ? '#FFF5F5' : '#fff',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: i === 0 ? 600 : 500, color: i === 0 ? '#FF5A5F' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {rg.role}
                        {i === 0 && <span style={{ marginLeft: '4px', fontSize: '10px' }}>✏️</span>}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0369A1', flexShrink: 0 }}>
                        {formatCurrency(rg.medianTC, primaryCurrency)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      {formatCurrency(rg.minTC, primaryCurrency)} – {formatCurrency(rg.maxTC, primaryCurrency)}
                    </div>
                    <div style={{ fontSize: '10px', color: '#D1D5DB', marginTop: '2px' }}>{rg.count} records</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
                <a href="#all-records" style={{ fontSize: '13px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none' }}>
                  View all {roleGroups.length} roles →
                </a>
              </div>
            </div>

            {/* ── Right: Role detail ──────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {firstRole && (
                <>
                  {/* Role header */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>{firstRole.role}</h2>
                      <span style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '2px 8px' }}>✓ Verified</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 20px' }}>
                      {firstRole.count} {firstRole.count === 1 ? 'salary' : 'salaries'} submitted
                    </p>

                    {/* Big TC figure */}
                    <div style={{ background: '#FFF5F5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pay (Annual)</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 800, color: '#FF5A5F', lineHeight: 1 }}>
                          {formatCurrency(firstRole.medianTC, primaryCurrency)}
                        </span>
                        <span style={{ fontSize: '14px', color: '#9CA3AF' }}> / year</span>
                      </div>
                      {/* Range bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{formatCurrency(firstRole.minTC, primaryCurrency)}</span>
                        <div style={{ flex: 1, height: '6px', background: '#FFE4E6', borderRadius: '3px', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '0', top: 0, bottom: 0, width: '60%', background: 'linear-gradient(90deg, #FF5A5F 0%, #FF8C69 100%)', borderRadius: '3px' }} />
                          <div style={{ position: 'absolute', left: '55%', top: '50%', transform: 'translate(-50%,-50%)', width: '12px', height: '12px', background: '#FF5A5F', borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{formatCurrency(firstRole.maxTC, primaryCurrency)}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '4px' }}>Most reports</div>
                    </div>

                    {/* Compensation breakdown */}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Compensation Breakdown</div>
                      {(() => {
                        const total = firstRole.avgBase + firstRole.avgBonus + firstRole.avgStock
                        if (total === 0) return null
                        const basePct = Math.round((firstRole.avgBase / total) * 100)
                        const bonusPct = Math.round((firstRole.avgBonus / total) * 100)
                        const stockPct = 100 - basePct - bonusPct
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[
                              { label: 'Base Pay', value: firstRole.avgBase, pct: basePct, color: '#3B82F6' },
                              { label: 'Bonus', value: firstRole.avgBonus, pct: bonusPct, color: '#F59E0B' },
                              { label: 'Equity', value: firstRole.avgStock, pct: stockPct, color: '#8B5CF6' },
                            ].map(({ label, value, pct, color }) => (
                              <div key={label} style={{ padding: '12px', border: '1px solid #F3F4F6', borderRadius: '8px', background: '#FAFAFA' }}>
                                <div style={{ width: '28px', height: '4px', background: color, borderRadius: '2px', marginBottom: '8px' }} />
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{formatCurrency(value, primaryCurrency)}</div>
                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{label}</div>
                                <div style={{ fontSize: '11px', fontWeight: 600, color, marginTop: '2px' }}>{pct}%</div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Compare banner */}
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFF5F5', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', background: '#FF5A5F', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📈</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>High performer? See how your compensation compares.</div>
                      </div>
                    </div>
                    <a href="/compare" style={{ padding: '8px 16px', background: '#FF5A5F', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Compare your salary →
                    </a>
                  </div>
                </>
              )}

              {/* People also viewed */}
              {roleGroups.length > 1 && (
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>People also viewed</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {roleGroups.slice(1, 5).map((rg) => (
                      <div key={rg.role} style={{ padding: '14px', border: '1px solid #F3F4F6', borderRadius: '10px', background: '#FAFAFA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '28px', height: '28px', background: '#FFF5F5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>💼</div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rg.role}</span>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#FF5A5F' }}>
                          {formatCurrency(rg.medianTC, primaryCurrency)}
                          <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}> /yr</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                          {formatCurrency(rg.minTC, primaryCurrency)} – {formatCurrency(rg.maxTC, primaryCurrency)}
                        </div>
                        <a href="#" style={{ display: 'block', fontSize: '11px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none', marginTop: '8px' }}>View insights →</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Full Salary Table ──────────────────────────────────────────────── */}
          <div id="all-records" style={{ marginTop: '32px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>All Salary Records</h2>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{count} records · Filter and search below</p>
              </div>
            </div>
            <Suspense fallback={<TableSkeleton />}>
              <SalaryTable initialData={salaries} />
            </Suspense>
          </div>

          {/* ── Submit salary footer CTA ──────────────────────────────────────── */}
          <div style={{ marginTop: '24px', border: '1px solid #E5E7EB', borderRadius: '12px', background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', background: '#FF5A5F', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📋</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>Didn't find your role?</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Submit your salary and help others make informed decisions.</div>
              </div>
            </div>
            <a href="/salaries/submit" style={{ padding: '12px 24px', background: '#FF5A5F', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Submit your salary →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

function TableSkeleton() {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '44px', borderRadius: '8px' }} />
        ))}
      </div>
    </div>
  )
}
