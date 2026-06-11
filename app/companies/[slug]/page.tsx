import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian, formatLevel } from '@/lib/format'
import LevelBadge from '@/components/ui/LevelBadge'
import type { Level, SalaryRecord } from '@/types/salary'
import { VALID_LEVELS } from '@/lib/config'
import FollowButton from '@/components/features/FollowButton'
import CompanyContentManager from '@/components/features/CompanyContentManager'

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
  const domain = LOGO_DOMAINS[slug] ?? slug + '.com'
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`
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

      <div className="bg-[#F7F7F7] min-h-screen pb-16">

        {/* ── Company Header ─────────────────────────────────────────────────── */}
        <div className="border-b border-[#EBEBEB] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
              {/* Logo */}
              <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-[#EBEBEB] flex items-center justify-center shrink-0 overflow-hidden relative">
                {/* Fallback initials */}
                <div className="absolute inset-0 bg-[#FF5A5F] flex items-center justify-center text-white font-bold text-2xl">
                  {initials}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={`${company.name} logo`}
                  className="absolute inset-0 w-full h-full object-contain p-3 bg-white"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs font-medium text-[#717171] mb-2">
                  <Link href="/companies" className="hover:text-[#222222] transition-colors">Companies</Link>
                  <span>›</span>
                  <span className="text-[#222222]">{company.name}</span>
                </nav>

                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-3xl font-bold text-[#222222] leading-tight tracking-tight">{company.name}</h1>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1">
                    ✓ Verified
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap mb-4 text-[13px] text-[#717171]">
                  {company.industry && <span>{company.industry}</span>}
                  {company.industry && company.headquarters && <span className="text-[#EBEBEB]">•</span>}
                  {company.headquarters && <span>📍 {company.headquarters}</span>}
                  {company.headcount_range && (
                    <>
                      <span className="text-[#EBEBEB]">•</span>
                      <span>👥 {company.headcount_range} employees</span>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <FollowButton variant="secondary" />
                  <Link
                    href={`/compare?c1=${slug}`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-[#222222] border border-[#EBEBEB] hover:border-[#484848] rounded-lg font-semibold text-[13px] transition-all"
                  >
                    Compare
                  </Link>
                  <Link
                    href={`#`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#e0484d] text-white border-none rounded-lg font-semibold text-[13px] transition-colors"
                  >
                    Write a Review
                  </Link>
                </div>
              </div>

              {/* Right stat pills */}
              <div className="flex gap-8 items-center bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl px-6 py-4 self-stretch md:self-auto">
                {[
                  { label: 'Employees', value: company.headcount_range ?? '—' },
                  { label: 'Founded', value: company.founded_year ? String(company.founded_year) : '—' },
                  { label: 'Salaries', value: String(totalRecords) },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl font-bold text-[#222222]">{value}</div>
                    <div className="text-xs text-[#717171] mt-0.5 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <CompanyContentManager 
            overviewContent={
              <>
                {/* ── At a Glance ──────────────────────────────────────────────────── */}
            <section className="mb-6">
              <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#222222] mb-4">At a glance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <p className="text-[14px] text-[#484848] leading-relaxed mb-4">
                      {company.name} is a leading company{company.industry ? ` in the ${company.industry} sector` : ''}{company.headquarters ? `, headquartered in ${company.headquarters}` : ''}.
                      {totalRecords > 0 ? ` Based on ${totalRecords} verified salary records, we provide transparent compensation insights.` : ''}
                    </p>
                    <a href="#" className="text-[13px] text-[#FF5A5F] font-semibold hover:underline">View full profile →</a>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {[
                      { icon: '📅', label: 'Founded', value: company.founded_year ? String(company.founded_year) : '—' },
                      { icon: '👥', label: 'Employees', value: company.headcount_range ?? '—' },
                      { icon: '💰', label: 'Median TC', value: totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency) : '—' },
                      { icon: '🏭', label: 'Industry', value: company.industry ?? '—' },
                      { icon: '📍', label: 'Headquarters', value: company.headquarters ?? '—' },
                      { icon: '🌐', label: 'Website', value: `${slug}.com` },
                    ].map(({ icon, label, value }) => (
                      <div key={label}>
                        <div className="text-[11px] text-[#717171] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">{icon} {label}</div>
                        <div className="text-[14px] font-semibold text-[#222222]">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Popular Roles + Salary Insights + Jobs (3-col grid) ──────────── */}
            <section className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Popular roles */}
                <div className="lg:col-span-4 border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="text-[15px] font-bold text-[#222222] mb-4">Popular roles</h3>
                  <div className="flex flex-col gap-3">
                    {popularRoles.map(({ role, count, medianTC: rtc }) => (
                      <div key={role} className="flex items-center justify-between gap-2 border-b border-[#F7F7F7] pb-3 last:border-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[#222222] truncate">{role}</div>
                          <div className="text-[11px] text-[#717171] font-medium">{count} {count === 1 ? 'salary' : 'salaries'}</div>
                        </div>
                        <div className="text-[13px] font-bold text-[#0369A1] shrink-0">
                          {rtc > 0 ? formatCurrency(rtc, primaryCurrency) : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <a href="#salaries" className="block mt-4 text-[13px] text-[#FF5A5F] font-semibold hover:underline">View all roles →</a>
                </div>

                {/* Salary insights */}
                <div className="lg:col-span-4 border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="text-[15px] font-bold text-[#222222] mb-1">Salary insights</h3>
                  <p className="text-[12px] text-[#717171] mb-4">See what professionals are earning in top roles.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {popularRoles.slice(0, 4).map(({ role, medianTC: rtc }) => (
                      <div key={role} className="p-3 bg-[#FAFAFA] rounded-lg border border-[#EBEBEB]">
                        <div className="text-[11px] font-medium text-[#717171] truncate mb-1">{role}</div>
                        <div className="text-base font-bold text-[#222222]">
                          {rtc > 0 ? formatCurrency(rtc, primaryCurrency) : '—'}
                          <span className="text-[11px] font-normal text-[#717171]"> /yr</span>
                        </div>
                        <div className="text-[10px] font-medium text-[#9CA3AF] mt-1 uppercase tracking-wide">Median total pay</div>
                      </div>
                    ))}
                  </div>
                  <a href="#salaries" className="block mt-5 text-[13px] text-[#FF5A5F] font-semibold hover:underline">View all salaries →</a>
                </div>

                {/* Experience bar chart */}
                <div className="lg:col-span-4 border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                  <h3 className="text-[15px] font-bold text-[#222222] mb-1">Salary by experience</h3>
                  <p className="text-[12px] text-[#717171] mb-4">Median TC by years of experience.</p>
                  {totalRecords > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {expData.map(({ label, median, count }) => {
                        const pct = maxExpMedian > 0 ? (median / maxExpMedian) * 100 : 0
                        return (
                          <div key={label}>
                            <div className="flex justify-between mb-1">
                              <span className="text-[11px] font-medium text-[#717171]">{label}</span>
                              <span className="text-[11px] font-bold text-[#222222]">
                                {count > 0 ? formatCurrency(median, primaryCurrency) : '—'}
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#F7F7F7] rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${count > 0 ? pct : 0}%`,
                                  background: 'linear-gradient(90deg, #FFB3B5 0%, #FF5A5F 100%)',
                                }} 
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#9CA3AF]">No data available yet.</p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Compensation Overview ─────────────────────────────────────────── */}
            <section className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm text-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3 text-xl">💰</div>
                  <div className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-1">Median Total Comp</div>
                  <div className="text-[26px] font-black text-[#0369A1] tracking-tight">
                    {totalRecords > 0 ? formatCurrency(medianTC, primaryCurrency) : '—'}
                  </div>
                  <div className="text-[11px] font-medium text-[#9CA3AF] mt-1">Based on {totalRecords} records</div>
                </div>
                <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm text-center">
                  <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center mx-auto mb-3 text-xl">📊</div>
                  <div className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-1">TC Range</div>
                  <div className="text-[18px] font-bold text-[#222222] mt-2 mb-1.5">
                    {totalRecords > 0 ? `${formatCurrency(minTC, primaryCurrency)} – ${formatCurrency(maxTC, primaryCurrency)}` : '—'}
                  </div>
                  <div className="text-[11px] font-medium text-[#9CA3AF]">Min to Max</div>
                </div>
                <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm text-center">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3 text-xl">📁</div>
                  <div className="text-xs font-semibold text-[#717171] uppercase tracking-wide mb-1">Data Points</div>
                  <div className="text-[26px] font-black text-[#222222] tracking-tight">{totalRecords}</div>
                  <div className="text-[11px] font-medium text-[#9CA3AF] mt-1">Salary records</div>
                </div>
              </div>
            </section>
            </>
          }
          salariesContent={
            <>
            {/* ── Level Distribution ────────────────────────────────────────────── */}
            {totalRecords > 0 && (
              <section className="mb-6">
                <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-base font-bold text-[#222222] mb-4">Level Distribution</h2>
                  <LevelDistributionBar distribution={levelDist} total={totalRecords} />
                </div>
              </section>
            )}

            {/* ── Salary Records Table ──────────────────────────────────────────── */}
            <section id="salaries" className="mb-6">
              <div className="border border-[#EBEBEB] rounded-xl bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-[#EBEBEB] flex items-center justify-between bg-white">
                  <h2 className="text-base font-bold text-[#222222]">
                    Salary Records at {company.name}
                  </h2>
                  <span className="text-xs font-medium text-[#717171] px-2.5 py-1 bg-[#F7F7F7] rounded-md border border-[#EBEBEB]">{totalRecords} records</span>
                </div>
                {salaries.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-[#717171] text-sm font-medium">No salary records found for this company.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#EBEBEB]">
                          <th className="px-6 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">Role</th>
                          <th className="px-6 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">Level</th>
                          <th className="px-6 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">Location</th>
                          <th className="px-6 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">Exp.</th>
                          <th className="px-6 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">Base Salary</th>
                          <th className="px-6 py-3.5 text-xs font-semibold text-[#717171] uppercase tracking-wider whitespace-nowrap">Stock</th>
                          <th className="px-6 py-3.5 text-xs font-bold text-[#222222] uppercase tracking-wider whitespace-nowrap">Total Comp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBEBEB]">
                        {salaries.map((s) => (
                          <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-[13px] font-semibold text-[#222222] block max-w-[180px] truncate" title={s.role}>
                                {s.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><LevelBadge level={s.level as Level} /></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-[13px] font-medium text-[#484848]">{s.location}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-[13px] font-medium text-[#717171]">{s.experience_years} yr{s.experience_years !== 1 ? 's' : ''}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-[13px] font-medium text-[#484848]">{formatCurrency(s.base_salary, s.currency as any)}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`text-[13px] font-medium ${s.stock > 0 ? 'text-[#484848]' : 'text-[#9CA3AF]'}`}>{s.stock > 0 ? formatCurrency(s.stock, s.currency as any) : '—'}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-[15px] font-bold text-[#0369A1]">{formatCurrency(s.total_compensation, s.currency as any)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* ── Compare with similar companies banner ─────────────────────────── */}
            <section className="mb-6">
              <div className="border border-[#FFB3B5] rounded-xl bg-[#FFF5F5] p-6 flex items-center justify-between gap-4 flex-wrap shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-white rounded-xl border border-[#FFB3B5] flex items-center justify-center text-xl shrink-0 shadow-sm">🛡️</div>
                  <div>
                    <div className="text-[15px] font-bold text-[#222222] mb-0.5">
                      Salaries at {company.name} {totalRecords > 0 ? `— ${totalRecords} verified records` : ''}
                    </div>
                    <div className="text-[13px] font-medium text-[#717171]">See how your role compares.</div>
                  </div>
                </div>
                <Link href="/compare" className="px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#e0484d] text-white rounded-lg font-semibold text-[13px] transition-colors whitespace-nowrap shrink-0">
                  Compare your salary →
                </Link>
              </div>
            </section>
            </>
          }
          faqContent={
            <>
            {/* ── FAQ ──────────────────────────────────────────────────────────── */}
            <section className="mb-6">
              <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#222222] mb-4">Frequently asked questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
                  {FAQS.map(({ q, a }, i) => (
                    <details
                      key={i}
                      className="border-t border-[#F3F4F6] py-3 group"
                    >
                      <summary className="text-[14px] font-semibold text-[#222222] cursor-pointer list-none flex justify-between items-center pr-2">
                        {q}
                        <span className="text-[#9CA3AF] text-lg font-light group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="pt-2 pb-1 text-[13px] text-[#484848] leading-relaxed m-0 pr-6">{a}</p>
                    </details>
                  ))}
                </div>
                <a href="#" className="inline-block mt-4 text-[13px] text-[#FF5A5F] font-semibold hover:underline">View all FAQs →</a>
              </div>
            </section>
            </>
          }
          similarCompaniesContent={
            <>
            {/* ── Similar companies ─────────────────────────────────────────────── */}
            {similarCompanies.length > 0 && (
              <section className="mb-6">
                <div className="border border-[#EBEBEB] rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-bold text-[#222222] mb-1">Compare with similar companies</h2>
                      <p className="text-[13px] text-[#717171] m-0">See how {company.name} compares with other leading employers.</p>
                    </div>
                    <Link href="/compare" className="text-[13px] text-[#FF5A5F] font-semibold hover:underline hidden sm:block">Compare →</Link>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {similarCompanies.slice(0, 5).map((co: any) => (
                      <Link
                        key={co.slug}
                        href={`/companies/${co.slug}`}
                        className="flex flex-col items-center gap-2 p-4 border border-[#EBEBEB] rounded-xl bg-[#FAFAFA] hover:bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all min-w-[110px] flex-1"
                      >
                        {/* Logo */}
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 bg-[#FF5A5F] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                            {co.name.slice(0, 2).toUpperCase()}
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getLogoUrl(co.slug)}
                            alt={co.name}
                            className="absolute inset-0 w-full h-full object-contain p-1.5 bg-white rounded-xl border border-[#EBEBEB]"
                          />
                        </div>
                        <span className="text-[13px] font-bold text-[#222222] text-center truncate w-full">{co.name}</span>
                        <span className="text-[11px] font-medium text-[#717171]">⭐ 4.{Math.floor(Math.random() * 3) + 1}</span>
                        <span className="text-[12px] text-[#FF5A5F] font-semibold mt-1">View →</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── Footer CTA ────────────────────────────────────────────────────── */}
            <section className="mb-8">
              <div className="border border-[#EBEBEB] rounded-xl bg-[#FAFAFA] p-6 flex items-center justify-between gap-4 flex-wrap shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#FF5A5F] text-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">📝</div>
                  <div>
                    <div className="text-[15px] font-bold text-[#222222] mb-0.5">Share your experience</div>
                    <div className="text-[13px] font-medium text-[#717171]">Help others make better career decisions</div>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Link href="#" className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#e0484d] text-white rounded-lg font-semibold text-[13px] transition-colors">
                    Write a Review
                  </Link>
                  <Link href="#" className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-white hover:bg-gray-50 text-[#222222] border border-[#EBEBEB] hover:border-[#D1D5DB] rounded-lg font-semibold text-[13px] transition-colors">
                    Add Salary
                  </Link>
                </div>
              </div>
            </section>
            </>
          } />
        </div>
      </div>
    </>
  )
}

// ── Level Distribution Bar ─────────────────────────────────────────────────────
function LevelDistributionBar({ distribution, total }: { distribution: Record<string, number>; total: number }) {
  const levelOrder = VALID_LEVELS
  const levels = levelOrder.filter((l) => distribution[l] > 0)
  
  // Strict Tailwind classes for background colors instead of hex codes
  const barColors: Record<string, string> = {
    L3: 'bg-slate-400', SDE_I: 'bg-slate-400',
    L4: 'bg-blue-500', SDE_II: 'bg-blue-500', IC4: 'bg-blue-500',
    L5: 'bg-indigo-500', SDE_III: 'bg-indigo-500',
    L6: 'bg-purple-500', STAFF: 'bg-purple-500', IC5: 'bg-purple-500',
    PRINCIPAL: 'bg-slate-800',
  }
  
  const labelMap: Record<string, string> = {
    L3: 'L3', L4: 'L4', L5: 'L5', L6: 'L6',
    SDE_I: 'SDE-I', SDE_II: 'SDE-II', SDE_III: 'SDE-III',
    STAFF: 'Staff', PRINCIPAL: 'Principal', IC4: 'IC4', IC5: 'IC5',
  }

  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-7 gap-[2px] mb-4 bg-[#F7F7F7]">
        {levels.map((level) => {
          const count = distribution[level] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div
              key={level}
              className={`${barColors[level] ?? 'bg-gray-200'} transition-all duration-500 hover:opacity-90 cursor-pointer`}
              style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
              title={`${labelMap[level] ?? level}: ${count} records (${pct.toFixed(0)}%)`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {levels.map((level) => {
          const count = distribution[level] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-sm ${barColors[level] ?? 'bg-gray-200'} shrink-0`} />
              <span className="text-[12px] font-medium text-[#484848]">{labelMap[level] ?? level}: <span className="font-bold text-[#222222]">{count}</span> <span className="text-[#9CA3AF]">({pct.toFixed(0)}%)</span></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
