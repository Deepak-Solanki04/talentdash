import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian, formatLevel } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'
import type { Level, SalaryRecord } from '@/types/salary'
import { VALID_LEVELS } from '@/lib/config'

// generateStaticParams: queries the LIVE DATABASE at build time
// Not a hardcoded array — adding a new company to the DB automatically adds the page
export async function generateStaticParams() {
  const companies = await prisma.company.findMany({
    select: { slug: true },
  })
  return companies.map((c) => ({ slug: c.slug }))
}

// ISR: revalidate company pages every 2 hours
export const revalidate = 7200

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await prisma.company.findUnique({ where: { slug } })

  if (!company) {
    return { title: 'Company Not Found | TalentDash' }
  }

  return {
    title: `${company.name} Salaries, Reviews & Interview Experiences | TalentDash`,
    description: `Explore structured salary data, employee reviews, and interview experiences at ${company.name}. Filter by level (L3–Principal), role, and location.`,
    alternates: {
      canonical: `https://talentdash.in/companies/${slug}`,
    },
    openGraph: {
      title: `${company.name} — Salaries & Reviews | TalentDash`,
      description: `Structured compensation data for ${company.name}. See what employees earn by level and location.`,
      url: `https://talentdash.in/companies/${slug}`,
    },
  }
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: 'desc' },
      },
    },
  })

  if (!company) {
    notFound()
  }

  const salaries = serializePrismaRecord(company.salaries) as unknown as SalaryRecord[]

  // Computed stats
  const tcValues = salaries.map((s) => s.total_compensation)
  const medianTC = computeMedian(tcValues)
  const minTC = tcValues.length > 0 ? Math.min(...tcValues) : 0
  const maxTC = tcValues.length > 0 ? Math.max(...tcValues) : 0

  // Level distribution
  const levelDist: Record<string, number> = {}
  for (const s of salaries) {
    const l = String(s.level)
    levelDist[l] = (levelDist[l] ?? 0) + 1
  }
  const totalRecords = salaries.length

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: `https://talentdash.in/companies/${slug}`,
    description: `Salary and compensation data for ${company.name} employees.`,
    ...(company.founded_year ? { foundingDate: String(company.founded_year) } : {}),
    ...(company.headquarters ? { location: { '@type': 'Place', name: company.headquarters } } : {}),
  }

  const primaryCurrency = salaries[0]?.currency ?? 'INR'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 meta-text mb-6">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/companies" className="hover:underline">Companies</Link>
          <span>/</span>
          <span style={{ color: '#222222' }}>{company.name}</span>
        </nav>

        {/* Company header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {/* H1 — matches primary search intent */}
              <h1 className="mb-1">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {company.industry && (
                  <span
                    className="badge"
                    style={{ background: '#f0f7ff', color: '#0369A1', borderColor: '#bde0ff' }}
                  >
                    {company.industry}
                  </span>
                )}
                {company.headquarters && (
                  <span className="meta-text">📍 {company.headquarters}</span>
                )}
                {company.founded_year && (
                  <span className="meta-text">Est. {company.founded_year}</span>
                )}
                {company.headcount_range && (
                  <span className="meta-text">👥 {company.headcount_range} employees</span>
                )}
              </div>
            </div>

            {/* Compare CTA */}
            <Link
              href={`/compare?c1=${slug}`}
              className="btn-primary"
              id={`compare-${slug}`}
            >
              Compare →
            </Link>
          </div>
        </div>

        {/* Compensation overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5 text-center">
            <div className="meta-text mb-1">Median Total Comp</div>
            <div className="text-2xl font-bold" style={{ color: '#0369A1' }}>
              {totalRecords > 0
                ? formatCurrency(medianTC, primaryCurrency as any)
                : '—'}
            </div>
            <div className="meta-text mt-1">Based on {totalRecords} records</div>
          </div>
          <div className="card p-5 text-center">
            <div className="meta-text mb-1">TC Range</div>
            <div className="text-base font-semibold" style={{ color: '#222222' }}>
              {totalRecords > 0
                ? `${formatCurrency(minTC, primaryCurrency as any)} – ${formatCurrency(maxTC, primaryCurrency as any)}`
                : '—'}
            </div>
            <div className="meta-text mt-1">Min to Max</div>
          </div>
          <div className="card p-5 text-center">
            <div className="meta-text mb-1">Data Points</div>
            <div className="text-2xl font-bold" style={{ color: '#222222' }}>
              {totalRecords}
            </div>
            <div className="meta-text mt-1">Salary records</div>
          </div>
        </div>

        {/* Level distribution bar */}
        {totalRecords > 0 && (
          <div className="card p-5 mb-6">
            <h2 className="text-base font-semibold mb-4" style={{ color: '#222222', fontSize: '16px' }}>
              Level Distribution
            </h2>
            <LevelDistributionBar distribution={levelDist} total={totalRecords} />
          </div>
        )}

        {/* Salary table for this company */}
        <div className="card overflow-x-auto">
          <div className="px-5 py-4 border-b" style={{ borderColor: '#EBEBEB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#222222', margin: 0 }}>
              Salary Records at {company.name}
            </h2>
          </div>
          {salaries.length === 0 ? (
            <div className="p-12 text-center">
              <p className="meta-text">No salary records found for this company.</p>
            </div>
          ) : (
            <table className="td-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Level</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Base Salary</th>
                  <th>Bonus</th>
                  <th>Stock</th>
                  <th>Total Comp</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span
                        className="font-medium text-sm block max-w-[200px] truncate"
                        style={{ color: '#222222' }}
                        title={s.role}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td>
                      <LevelBadge level={s.level as Level} />
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: '#484848' }}>{s.location}</span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: '#717171' }}>
                        {s.experience_years} yr{s.experience_years !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium">
                        {formatCurrency(s.base_salary, s.currency as any)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: s.bonus > 0 ? '#484848' : '#717171' }}>
                        {s.bonus > 0 ? formatCurrency(s.bonus, s.currency as any) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm" style={{ color: s.stock > 0 ? '#484848' : '#717171' }}>
                        {s.stock > 0 ? formatCurrency(s.stock, s.currency as any) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className="tc-amount">
                        {formatCurrency(s.total_compensation, s.currency as any)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

// ── Level Distribution Bar component ──────────────────────────────────────────
function LevelDistributionBar({
  distribution,
  total,
}: {
  distribution: Record<string, number>
  total: number
}) {
  const levelOrder = VALID_LEVELS
  const levels = levelOrder.filter((l) => distribution[l] > 0)

  const barColors: Record<string, string> = {
    L3: '#94a3b8', SDE_I: '#94a3b8',
    L4: '#3b82f6', SDE_II: '#3b82f6', IC4: '#3b82f6',
    L5: '#6366f1', SDE_III: '#6366f1',
    L6: '#a855f7', STAFF: '#a855f7', IC5: '#a855f7',
    PRINCIPAL: '#1e3a5f',
  }

  const labelMap: Record<string, string> = {
    L3: 'L3', L4: 'L4', L5: 'L5', L6: 'L6',
    SDE_I: 'SDE-I', SDE_II: 'SDE-II', SDE_III: 'SDE-III',
    STAFF: 'Staff', PRINCIPAL: 'Principal', IC4: 'IC4', IC5: 'IC5',
  }

  return (
    <div>
      {/* Stacked bar */}
      <div className="flex rounded-lg overflow-hidden h-6 mb-3" style={{ gap: '2px' }}>
        {levels.map((level) => {
          const count = distribution[level] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div
              key={level}
              style={{
                width: `${pct}%`,
                background: barColors[level] ?? '#e2e8f0',
                minWidth: pct > 0 ? '4px' : '0',
                transition: 'width 0.3s ease',
              }}
              title={`${labelMap[level] ?? level}: ${count} records (${pct.toFixed(0)}%)`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {levels.map((level) => {
          const count = distribution[level] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: barColors[level] ?? '#e2e8f0' }}
              />
              <span className="meta-text">
                {labelMap[level] ?? level}: {count} ({pct.toFixed(0)}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
