import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian, formatLevel } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'
import type { Level, SalaryRecord } from '@/types/salary'
import { VALID_LEVELS } from '@/lib/config'

// Logo domain mapping for Clearbit logos
const LOGO_DOMAINS: Record<string, string> = {
  google: 'google.com',
  amazon: 'amazon.com',
  microsoft: 'microsoft.com',
  meta: 'meta.com',
  nvidia: 'nvidia.com',
  flipkart: 'flipkart.com',
  razorpay: 'razorpay.com',
  tcs: 'tataconsultancyservices.com',
  infosys: 'infosys.com',
  wipro: 'wipro.com',
  meesho: 'meesho.com',
  zepto: 'zepto.com',
}

function getLogoUrl(slug: string): string {
  const domain = LOGO_DOMAINS[slug]
  if (domain) {
    return `https://logo.clearbit.com/${domain}`
  }
  return `https://logo.clearbit.com/${slug}.com`
}

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

  // Similar companies query
  const similarCompaniesRaw = await prisma.company.findMany({
    take: 5,
    where: { slug: { not: slug } },
  })
  const similarCompanies = serializePrismaRecord(similarCompaniesRaw) as Array<{
    id: string
    name: string
    slug: string
    industry: string | null
    headquarters: string | null
  }>

  const salaries = serializePrismaRecord(company.salaries) as unknown as SalaryRecord[]

  // Computed stats
  const tcValues = salaries.map((s) => s.total_compensation)
  const medianTC = computeMedian(tcValues)
  const minTC = tcValues.length > 0 ? Math.min(...tcValues) : 0
  const maxTC = tcValues.length > 0 ? Math.max(...tcValues) : 0
  const totalRecords = salaries.length
  const primaryCurrency = salaries[0]?.currency ?? 'INR'

  // Level distribution
  const levelDist: Record<string, number> = {}
  for (const s of salaries) {
    const l = String(s.level)
    levelDist[l] = (levelDist[l] ?? 0) + 1
  }

  // Salary by experience bracket for bar chart
  const expBrackets = [
    { label: '0–2 yr', min: 0, max: 2 },
    { label: '2–5 yr', min: 2, max: 5 },
    { label: '5–8 yr', min: 5, max: 8 },
    { label: '8–12 yr', min: 8, max: 12 },
    { label: '12+ yr', min: 12, max: Infinity },
  ]
  const expData = expBrackets.map((bracket) => {
    const group = salaries.filter(
      (s) => s.experience_years >= bracket.min && s.experience_years < bracket.max
    )
    const median = computeMedian(group.map((s) => s.total_compensation))
    return { label: bracket.label, median, count: group.length }
  })
  const maxExpMedian = Math.max(...expData.map((d) => d.median), 1)

  // Popular roles sorted by count
  const roleCounts: Record<string, { count: number; tcValues: number[] }> = {}
  for (const s of salaries) {
    if (!roleCounts[s.role]) roleCounts[s.role] = { count: 0, tcValues: [] }
    roleCounts[s.role].count++
    roleCounts[s.role].tcValues.push(s.total_compensation)
  }
  const popularRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([role, data]) => ({
      role,
      count: data.count,
      medianTC: computeMedian(data.tcValues),
    }))

  // Top paying roles for salary snapshot sidebar
  const topPayingRoles = [...popularRoles]
    .sort((a, b) => b.medianTC - a.medianTC)
    .slice(0, 5)

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

  const logoUrl = getLogoUrl(slug)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: '200px', background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8C69 100%)', overflow: 'hidden' }}>
        {/* Geometric dot overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Action buttons top-right */}
        <div style={{ position: 'absolute', top: '20px', right: '24px', display: 'flex', gap: '10px', zIndex: 10 }}>
          <button
            style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            Follow
          </button>
          <Link
            href={`/compare?c1=${slug}`}
            style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              backdropFilter: 'blur(4px)',
            }}
          >
            Compare
          </Link>
          <button
            style={{
              padding: '8px 18px',
              background: '#fff',
              color: '#FF5A5F',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* ── Company identity strip (overlapping hero) ───────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', transform: 'translateY(-40px)', marginBottom: '-20px' }}>
            {/* Logo square */}
            <div
              style={{
                width: '80px',
                height: '80px',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '2px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={`${company.name} logo`}
                width={56}
                height={56}
                style={{ objectFit: 'contain' }}
                onError={undefined}
              />
            </div>

            {/* Company info */}
            <div style={{ paddingBottom: '16px', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {company.name}
                </h1>
                <span
                  style={{
                    background: '#DCFCE7',
                    color: '#16A34A',
                    border: '1px solid #BBF7D0',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '2px 10px',
                  }}
                >
                  ✓ Verified
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                {company.industry && (
                  <span
                    style={{
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      border: '1px solid #BFDBFE',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '2px 10px',
                    }}
                  >
                    {company.industry}
                  </span>
                )}
                {company.headquarters && (
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    📍 {company.headquarters}
                  </span>
                )}
                {company.headcount_range && (
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    👥 {company.headcount_range} employees
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9CA3AF', padding: '8px 0' }}>
            <Link href="/companies" style={{ color: '#6B7280', textDecoration: 'none' }}>
              Companies
            </Link>
            <span>›</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>{company.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Sub-navigation tabs ──────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {['Overview', 'Reviews', 'Salaries', 'Benefits', 'Jobs', 'Interviews', 'Q&A'].map(
              (tab, i) => (
                <button
                  key={tab}
                  style={{
                    padding: '14px 18px',
                    fontSize: '14px',
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? '#FF5A5F' : '#6B7280',
                    background: 'none',
                    border: 'none',
                    borderBottom: i === 0 ? '2.5px solid #FF5A5F' : '2.5px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s',
                  }}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ paddingTop: '28px', paddingBottom: '64px' }}>

        {/* ── At a glance ─────────────────────────────────────────────────── */}
        <div
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            background: '#fff',
            padding: '24px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
          }}
          className="at-glance-grid"
        >
          {/* Left: description */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
              About {company.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6', margin: '0 0 12px 0' }}>
              {company.name} is a leading {company.industry?.toLowerCase() ?? 'technology'} company
              {company.headquarters ? ` headquartered in ${company.headquarters}` : ''}.
              Known for its competitive compensation, innovation-driven culture, and strong engineering teams.
            </p>
            <a href="#salary-records" style={{ fontSize: '14px', color: '#FF5A5F', fontWeight: 600, textDecoration: 'none' }}>
              View full profile →
            </a>
          </div>

          {/* Right: icon-stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              {
                icon: '📅',
                label: 'Founded',
                value: company.founded_year ? String(company.founded_year) : '—',
              },
              {
                icon: '👥',
                label: 'Employees',
                value: company.headcount_range ?? '—',
              },
              {
                icon: '💰',
                label: 'Median TC',
                value: totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency as any) : '—',
              },
              {
                icon: '🏭',
                label: 'Industry',
                value: company.industry ?? '—',
              },
              {
                icon: '📍',
                label: 'Headquarters',
                value: company.headquarters ?? '—',
              },
              {
                icon: '🌐',
                label: 'Website',
                value: LOGO_DOMAINS[slug] ? LOGO_DOMAINS[slug] : `${slug}.com`,
              },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#111827', fontWeight: 600, marginTop: '2px' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Salary snapshot + Popular roles ─────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '24px' }} className="snapshot-grid">

          {/* Salary snapshot card */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Salary Snapshot
            </h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #E5E7EB', marginBottom: '20px' }}>
              {['By Experience', 'By Location', 'By Role'].map((tab, i) => (
                <span
                  key={tab}
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? '#FF5A5F' : '#6B7280',
                    borderBottom: i === 0 ? '2px solid #FF5A5F' : '2px solid transparent',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* CSS bar chart by experience */}
            {totalRecords > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {expData.map((bracket) => {
                  const pct = maxExpMedian > 0 ? (bracket.median / maxExpMedian) * 100 : 0
                  return (
                    <div key={bracket.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '56px', fontSize: '12px', color: '#6B7280', flexShrink: 0, textAlign: 'right' }}>
                        {bracket.label}
                      </span>
                      <div style={{ flex: 1, background: '#F3F4F6', borderRadius: '4px', height: '16px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #FF5A5F, #FF8C69)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease',
                            minWidth: bracket.count > 0 ? '4px' : '0',
                          }}
                        />
                      </div>
                      <span style={{ width: '64px', fontSize: '12px', color: '#111827', fontWeight: 600, flexShrink: 0 }}>
                        {bracket.count > 0 ? formatCurrency(bracket.median, primaryCurrency as any) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>No salary data available yet.</p>
            )}

            {/* Top paying roles */}
            {topPayingRoles.length > 0 && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>
                  Top paying roles
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {topPayingRoles.map((r) => (
                    <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F3F4F6' }}>
                      <span style={{ fontSize: '13px', color: '#374151', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.role}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF5A5F' }}>
                        {formatCurrency(r.medianTC, primaryCurrency as any)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Popular roles card */}
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Popular Roles
            </h2>
            {popularRoles.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {popularRoles.map((r, i) => (
                    <div
                      key={r.role}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: i < popularRoles.length - 1 ? '1px solid #F3F4F6' : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', color: '#111827', fontWeight: 500, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.role}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                          {r.count} {r.count === 1 ? 'salary' : 'salaries'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#FF5A5F', fontWeight: 700 }}>
                          {formatCurrency(r.medianTC, primaryCurrency as any)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>median TC</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#salary-records" style={{ display: 'block', marginTop: '14px', fontSize: '13px', color: '#FF5A5F', fontWeight: 600, textDecoration: 'none' }}>
                  View all roles →
                </a>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No role data available yet.</p>
            )}
          </div>
        </div>

        {/* ── Compensation overview ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }} className="comp-overview-grid">
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Median Total Comp
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1D4ED8' }}>
              {totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency as any) : '—'}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Based on {totalRecords} records
            </div>
          </div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TC Range
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {totalRecords > 0
                ? `${formatCurrency(minTC, primaryCurrency as any)} – ${formatCurrency(maxTC, primaryCurrency as any)}`
                : '—'}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Min to Max</div>
          </div>
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Data Points
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>
              {totalRecords}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Salary records</div>
          </div>
        </div>

        {/* ── Level Distribution bar ──────────────────────────────────────── */}
        {totalRecords > 0 && (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Level Distribution
            </h2>
            <LevelDistributionBar distribution={levelDist} total={totalRecords} />
          </div>
        )}

        {/* ── Salary records table ─────────────────────────────────────────── */}
        <div id="salary-records" style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Salary Records at {company.name}
            </h2>
          </div>
          {salaries.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#9CA3AF' }}>No salary records found for this company.</p>
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

        {/* ── FAQ Accordion ────────────────────────────────────────────────── */}
        <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div>
            {[
              {
                q: `What is it like to work at ${company.name}?`,
                a: `${company.name} is known for its fast-paced environment, high-performance culture, and strong engineering teams. Employees report good learning opportunities, competitive pay, and challenging projects. Work-life balance can vary by team.`,
              },
              {
                q: `What is the average salary at ${company.name}?`,
                a: `Based on ${totalRecords} salary records on TalentDash, the median total compensation at ${company.name} is ${totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency as any) : 'not yet available'}. Compensation varies significantly by level, role, and location.`,
              },
              {
                q: `Does ${company.name} offer remote or hybrid work?`,
                a: `${company.name} offers a mix of remote, hybrid, and in-office work arrangements depending on the team and role. Many engineering positions support hybrid work with some flexibility.`,
              },
              {
                q: `How difficult is the interview process at ${company.name}?`,
                a: `The interview process at ${company.name} is known to be rigorous, typically involving multiple rounds of technical assessments, system design discussions, and behavioral interviews. Preparation with data structures, algorithms, and system design is strongly recommended.`,
              },
              {
                q: `What are the benefits offered at ${company.name}?`,
                a: `${company.name} typically offers a comprehensive benefits package including health insurance, stock options/RSUs, performance bonuses, flexible paid time off, learning & development budgets, and various wellness perks.`,
              },
            ].map((item, i) => (
              <details
                key={i}
                style={{ borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none' }}
              >
                <summary
                  style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}
                >
                  {item.q}
                  <span style={{ fontSize: '16px', color: '#9CA3AF', flexShrink: 0, marginLeft: '12px' }}>+</span>
                </summary>
                <div style={{ padding: '0 24px 16px 24px', fontSize: '14px', color: '#4B5563', lineHeight: '1.65' }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── Similar Companies ────────────────────────────────────────────── */}
        {similarCompanies.length > 0 && (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Similar Companies
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {similarCompanies.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/companies/${c.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center',
                      transition: 'box-shadow 0.15s, border-color 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                      ;(e.currentTarget as HTMLDivElement).style.borderColor = '#FF5A5F'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                      ;(e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'
                    }}
                  >
                    {/* Logo */}
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 10px', border: '1px solid #F3F4F6', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getLogoUrl(c.slug)}
                        alt={`${c.name} logo`}
                        width={36}
                        height={36}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </div>
                    {c.industry && (
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.industry}
                      </div>
                    )}
                    <span style={{ fontSize: '12px', color: '#FF5A5F', fontWeight: 600 }}>
                      View →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer CTA banner ────────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8C69 100%)',
            borderRadius: '16px',
            padding: '32px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Share your experience
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
              Help others make better career decisions
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              style={{
                padding: '12px 24px',
                background: '#fff',
                color: '#FF5A5F',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Write a Review
            </button>
            <Link
              href={`/salaries/add?company=${slug}`}
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1.5px solid rgba(255,255,255,0.6)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Add Salary
            </Link>
          </div>
        </div>

      </div>

      {/* Responsive grid fixes */}
      <style>{`
        @media (max-width: 768px) {
          .at-glance-grid { grid-template-columns: 1fr !important; }
          .snapshot-grid { grid-template-columns: 1fr !important; }
          .comp-overview-grid { grid-template-columns: 1fr !important; }
        }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span:last-child { transform: rotate(45deg); display: inline-block; }
      `}</style>
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
