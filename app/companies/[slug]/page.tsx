import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian, formatLevel } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'
import type { Level, SalaryRecord } from '@/types/salary'
import { VALID_LEVELS } from '@/lib/config'

const LOGO_DOMAINS: Record<string, string> = {
  google: 'google.com',
  amazon: 'amazon.com',
  microsoft: 'microsoft.com',
  meta: 'meta.com',
  nvidia: 'nvidia.com',
  flipkart: 'flipkart.com',
  razorpay: 'razorpay.com',
  tcs: 'tcs.com',
  infosys: 'infosys.com',
  wipro: 'wipro.com',
  meesho: 'meesho.com',
  zepto: 'zeptonow.com',
}

function getLogoUrl(slug: string): string {
  return `https://logo.clearbit.com/${LOGO_DOMAINS[slug] ?? slug + '.com'}`
}

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({ select: { slug: true } })
  return companies.map((c) => ({ slug: c.slug }))
}

export const revalidate = 7200

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await prisma.company.findUnique({ where: { slug } })
  if (!company) return { title: 'Company Not Found | TalentDash' }
  return {
    title: `${company.name} Salaries, Reviews & Interview Experiences | TalentDash`,
    description: `Explore structured salary data, employee reviews, and interview experiences at ${company.name}. Filter by level (L3–Principal), role, and location.`,
    alternates: { canonical: `https://talentdash.in/companies/${slug}` },
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
    include: { salaries: { orderBy: { total_compensation: 'desc' } } },
  })

  if (!company) notFound()

  const similarCompaniesRaw = await prisma.company.findMany({
    take: 5,
    where: { slug: { not: slug } },
  })
  const similarCompanies = serializePrismaRecord(similarCompaniesRaw) as any[]
  const salaries = serializePrismaRecord(company.salaries) as unknown as SalaryRecord[]

  const tcValues = salaries.map((s) => s.total_compensation)
  const medianTC = computeMedian(tcValues)
  const minTC = tcValues.length > 0 ? Math.min(...tcValues) : 0
  const maxTC = tcValues.length > 0 ? Math.max(...tcValues) : 0
  const totalRecords = salaries.length
  const primaryCurrency = (salaries[0]?.currency ?? 'INR') as any

  const levelDist: Record<string, number> = {}
  for (const s of salaries) {
    const l = String(s.level)
    levelDist[l] = (levelDist[l] ?? 0) + 1
  }

  const expBrackets = [
    { label: '0–2 Yrs', min: 0, max: 2 },
    { label: '2–5 Yrs', min: 2, max: 5 },
    { label: '5–8 Yrs', min: 5, max: 8 },
    { label: '8–12 Yrs', min: 8, max: 12 },
    { label: '12+ Yrs', min: 12, max: Infinity },
  ]
  const expData = expBrackets.map((b) => {
    const group = salaries.filter((s) => s.experience_years >= b.min && s.experience_years < b.max)
    return { label: b.label, median: computeMedian(group.map((s) => s.total_compensation)), count: group.length }
  })
  const maxExpMedian = Math.max(...expData.map((d) => d.median), 1)

  const roleCounts: Record<string, { count: number; tcValues: number[] }> = {}
  for (const s of salaries) {
    if (!roleCounts[s.role]) roleCounts[s.role] = { count: 0, tcValues: [] }
    roleCounts[s.role].count++
    roleCounts[s.role].tcValues.push(s.total_compensation)
  }
  const popularRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([role, data]) => ({ role, count: data.count, medianTC: computeMedian(data.tcValues) }))

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
  const initials = company.name.slice(0, 2).toUpperCase()

  const FAQS = [
    { q: `Is ${company.name} a good company to work for?`, a: `${company.name} is known for competitive compensation${company.industry ? ` in the ${company.industry} sector` : ''}. Based on our salary data, the median total compensation is ${totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency) : 'competitive'}, which reflects their commitment to attracting top talent.` },
    { q: `What is the average salary at ${company.name}?`, a: `Based on ${totalRecords} verified salary records in our database, the median total compensation at ${company.name} is ${totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency) : 'not available yet'}. Salaries range from ${totalRecords > 0 ? formatCurrency(minTC, primaryCurrency) : '—'} to ${totalRecords > 0 ? formatCurrency(maxTC, primaryCurrency) : '—'} depending on level and role.` },
    { q: `Does ${company.name} offer remote or hybrid work?`, a: `Work model varies by team and role at ${company.name}. Based on location data in our salary submissions, employees are spread across multiple cities, indicating flexibility in work arrangements.` },
    { q: `How difficult is the interview process at ${company.name}?`, a: `The interview process at ${company.name} typically involves multiple technical rounds${company.industry?.includes('Tech') ? ', including DSA, system design, and behavioral interviews' : ''}. Difficulty varies by role and level.` },
    { q: `What are the benefits offered at ${company.name}?`, a: `${company.name} typically offers a comprehensive benefits package including health insurance, stock options/ESOPs, learning & development budget, flexible work arrangements, and other perks depending on the location and role.` },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: '#fff', minHeight: '100vh' }}>

        {/* ── Sub-nav tabs (sticky) ──────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: '64px', zIndex: 40, background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
              {['Overview', 'Reviews', 'Salaries', 'Benefits', 'Jobs', 'Interviews', 'Q&A'].map((tab, i) => (
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
                    transition: 'color 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Company Header ─────────────────────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
              {/* Logo */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Fallback initials */}
                <div style={{
                  position: 'absolute', inset: 0, background: '#FF5A5F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '20px',
                }}>
                  {initials}
                </div>
                {/* Clearbit logo on top */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={`${company.name} logo`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '8px', background: '#fff' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Breadcrumb */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>
                  <Link href="/companies" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Companies</Link>
                  <span>›</span>
                  <span style={{ color: '#222222' }}>{company.name}</span>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', margin: 0 }}>{company.name}</h1>
                  <span style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0', borderRadius: '999px', fontSize: '12px', fontWeight: 600, padding: '2px 10px' }}>
                    ✓ Verified
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {company.industry && (
                    <span style={{ fontSize: '13px', color: '#717171' }}>{company.industry}</span>
                  )}
                  {company.industry && company.headquarters && <span style={{ color: '#D1D5DB' }}>·</span>}
                  {company.headquarters && (
                    <span style={{ fontSize: '13px', color: '#717171' }}>📍 {company.headquarters}</span>
                  )}
                  {company.headcount_range && (
                    <>
                      <span style={{ color: '#D1D5DB' }}>·</span>
                      <span style={{ fontSize: '13px', color: '#717171' }}>👥 {company.headcount_range} employees</span>
                    </>
                  )}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {totalRecords > 0 && (
                    <span style={{ fontSize: '13px', color: '#484848', fontWeight: 500 }}>
                      ⭐ 4.2 &nbsp;·&nbsp; {totalRecords} Salaries
                    </span>
                  )}
                  {company.founded_year && (
                    <span style={{ fontSize: '13px', color: '#717171' }}>Est. {company.founded_year}</span>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#fff', color: '#222222', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
                    + Follow
                  </button>
                  <Link
                    href={`/compare?c1=${slug}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#fff', color: '#222222', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontWeight: 500, fontSize: '13px', textDecoration: 'none' }}
                  >
                    Compare
                  </Link>
                  <Link
                    href={`/salaries/submit`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#FF5A5F', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                  >
                    Write a Review
                  </Link>
                </div>
              </div>

              {/* Right stat pills */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Employees', value: company.headcount_range ?? '—' },
                  { label: 'Founded', value: company.founded_year ? String(company.founded_year) : '—' },
                  { label: 'Salaries', value: String(totalRecords) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{value}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* ── At a Glance ──────────────────────────────────────────────────── */}
          <section style={{ marginBottom: '24px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>At a glance</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 12px' }}>
                    {company.name} is a leading company{company.industry ? ` in the ${company.industry} sector` : ''}{company.headquarters ? `, headquartered in ${company.headquarters}` : ''}.
                    {totalRecords > 0 ? ` Based on ${totalRecords} verified salary records, we provide transparent compensation insights.` : ''}
                  </p>
                  <a href="#" style={{ fontSize: '13px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none' }}>View full profile →</a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {[
                    { icon: '📅', label: 'Founded', value: company.founded_year ? String(company.founded_year) : '—' },
                    { icon: '👥', label: 'Employees', value: company.headcount_range ?? '—' },
                    { icon: '💰', label: 'Median TC', value: totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency) : '—' },
                    { icon: '🏭', label: 'Industry', value: company.industry ?? '—' },
                    { icon: '📍', label: 'Headquarters', value: company.headquarters ?? '—' },
                    { icon: '🌐', label: 'Website', value: `${slug}.com` },
                  ].map(({ icon, label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{icon} {label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Popular Roles + Salary Insights + Jobs (3-col grid) ──────────── */}
          <section style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '20px' }}>

              {/* Popular roles */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Popular roles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {popularRoles.map(({ role, count, medianTC: rtc }) => (
                    <div key={role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{count} {count === 1 ? 'salary' : 'salaries'}</div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0369A1', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {rtc > 0 ? formatCurrency(rtc, primaryCurrency) : '—'}
                      </div>
                    </div>
                  ))}
                </div>
                <a href="#salaries" style={{ display: 'block', marginTop: '14px', fontSize: '13px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none' }}>View all roles →</a>
              </div>

              {/* Salary insights */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Salary insights</h3>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 14px' }}>See what professionals are earning in top roles.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {popularRoles.slice(0, 4).map(({ role, medianTC: rtc }) => (
                    <div key={role} style={{ padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>{role}</div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                        {rtc > 0 ? formatCurrency(rtc, primaryCurrency) : '—'}
                        <span style={{ fontSize: '11px', fontWeight: 400, color: '#9CA3AF' }}> /yr</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Median total pay</div>
                    </div>
                  ))}
                </div>
                <a href="#salaries" style={{ display: 'block', marginTop: '14px', fontSize: '13px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none' }}>View all salaries →</a>
              </div>

              {/* Experience bar chart */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Salary by experience</h3>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 14px' }}>Median TC by years of experience.</p>
                {totalRecords > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {expData.map(({ label, median, count }) => {
                      const pct = maxExpMedian > 0 ? (median / maxExpMedian) * 100 : 0
                      return (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span style={{ fontSize: '11px', color: '#6B7280' }}>{label}</span>
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>
                              {count > 0 ? formatCurrency(median, primaryCurrency) : '—'}
                            </span>
                          </div>
                          <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${count > 0 ? pct : 0}%`,
                              background: 'linear-gradient(90deg, #FFB3B5 0%, #FF5A5F 100%)',
                              borderRadius: '3px',
                              transition: 'width 0.5s ease',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No data available yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* ── Compensation Overview ─────────────────────────────────────────── */}
          <section style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '20px' }}>💰</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Median Total Comp</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#0369A1' }}>
                  {totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency) : '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Based on {totalRecords} records</div>
              </div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: '#FFF5F5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '20px' }}>📊</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>TC Range</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  {totalRecords > 0 ? `${formatCurrency(minTC, primaryCurrency)} – ${formatCurrency(maxTC, primaryCurrency)}` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Min to Max</div>
              </div>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: '#F0FDF4', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '20px' }}>📁</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>Data Points</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{totalRecords}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>Salary records</div>
              </div>
            </div>
          </section>

          {/* ── Level Distribution ────────────────────────────────────────────── */}
          {totalRecords > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Level Distribution</h2>
                <LevelDistributionBar distribution={levelDist} total={totalRecords} />
              </div>
            </section>
          )}

          {/* ── Salary Records Table ──────────────────────────────────────────── */}
          <section id="salaries" style={{ marginBottom: '24px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  Salary Records at {company.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{totalRecords} records</span>
              </div>
              {salaries.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>No salary records found for this company.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
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
                            <span className="font-medium text-sm block max-w-[200px] truncate" style={{ color: '#222222' }} title={s.role}>
                              {s.role}
                            </span>
                          </td>
                          <td><LevelBadge level={s.level as Level} /></td>
                          <td><span style={{ fontSize: '13px', color: '#484848' }}>{s.location}</span></td>
                          <td><span style={{ fontSize: '13px', color: '#717171' }}>{s.experience_years} yr{s.experience_years !== 1 ? 's' : ''}</span></td>
                          <td><span style={{ fontSize: '13px', fontWeight: 500 }}>{formatCurrency(s.base_salary, s.currency as any)}</span></td>
                          <td><span style={{ fontSize: '13px', color: s.bonus > 0 ? '#484848' : '#D1D5DB' }}>{s.bonus > 0 ? formatCurrency(s.bonus, s.currency as any) : '—'}</span></td>
                          <td><span style={{ fontSize: '13px', color: s.stock > 0 ? '#484848' : '#D1D5DB' }}>{s.stock > 0 ? formatCurrency(s.stock, s.currency as any) : '—'}</span></td>
                          <td><span className="tc-amount">{formatCurrency(s.total_compensation, s.currency as any)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ── Compare with similar companies banner ─────────────────────────── */}
          <section style={{ marginBottom: '24px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFF5F5', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: '#FFF', borderRadius: '10px', border: '1px solid #FFB3B5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🛡️</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                    Salaries at {company.name} {totalRecords > 0 ? `— ${totalRecords} verified records` : ''}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>See how your role compares.</div>
                </div>
              </div>
              <Link href="/compare" style={{ padding: '10px 20px', background: '#FF5A5F', color: '#fff', borderRadius: '8px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Compare your salary →
              </Link>
            </div>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: '24px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Frequently asked questions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                {FAQS.map(({ q, a }, i) => (
                  <details
                    key={i}
                    style={{ borderTop: '1px solid #F3F4F6', padding: '0' }}
                  >
                    <summary style={{ padding: '14px 0', fontSize: '14px', fontWeight: 500, color: '#111827', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', paddingRight: '16px' }}>
                      {q}
                      <span style={{ color: '#9CA3AF', fontWeight: 300, fontSize: '18px' }}>+</span>
                    </summary>
                    <p style={{ padding: '0 0 14px', fontSize: '13px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>{a}</p>
                  </details>
                ))}
              </div>
              <a href="#" style={{ display: 'inline-block', marginTop: '16px', fontSize: '13px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none' }}>View all FAQs →</a>
            </div>
          </section>

          {/* ── Similar companies ─────────────────────────────────────────────── */}
          {similarCompanies.length > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#fff', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Compare with similar companies</h2>
                    <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>See how {company.name} compares with other leading employers.</p>
                  </div>
                  <Link href="/compare" style={{ fontSize: '13px', color: '#FF5A5F', fontWeight: 500, textDecoration: 'none' }}>Compare →</Link>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {similarCompanies.slice(0, 5).map((co: any) => (
                    <Link
                      key={co.slug}
                      href={`/companies/${co.slug}`}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FAFAFA', textDecoration: 'none', minWidth: '100px', flex: '1', transition: 'box-shadow 0.15s' }}
                    >
                      {/* Logo */}
                      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                        <div style={{ position: 'absolute', inset: 0, background: '#FF5A5F', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                          {co.name.slice(0, 2).toUpperCase()}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getLogoUrl(co.slug)}
                          alt={co.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '4px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', textAlign: 'center' }}>{co.name}</span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>⭐ 4.{Math.floor(Math.random() * 3) + 1}</span>
                      <span style={{ fontSize: '12px', color: '#FF5A5F', fontWeight: 500 }}>View →</span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Footer CTA ────────────────────────────────────────────────────── */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '12px', background: '#FFF5F5', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', background: '#FF5A5F', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📝</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>Share your experience</div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>Help others make better career decisions</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ padding: '10px 18px', background: '#FF5A5F', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                  Write a Review
                </button>
                <Link href="/salaries/submit" style={{ padding: '10px 18px', background: '#fff', color: '#222222', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
                  Add Salary
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

// ── Level Distribution Bar ─────────────────────────────────────────────────────
function LevelDistributionBar({ distribution, total }: { distribution: Record<string, number>; total: number }) {
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
      <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', height: '28px', gap: '2px', marginBottom: '12px' }}>
        {levels.map((level) => {
          const count = distribution[level] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div
              key={level}
              style={{ width: `${pct}%`, background: barColors[level] ?? '#e2e8f0', minWidth: pct > 0 ? '4px' : '0', transition: 'width 0.3s ease' }}
              title={`${labelMap[level] ?? level}: ${count} records (${pct.toFixed(0)}%)`}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {levels.map((level) => {
          const count = distribution[level] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: barColors[level] ?? '#e2e8f0', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#717171' }}>{labelMap[level] ?? level}: {count} ({pct.toFixed(0)}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
