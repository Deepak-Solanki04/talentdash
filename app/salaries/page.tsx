import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'
import SalaryTable from '@/components/features/SalaryTable'
import type { SalaryWithCompany } from '@/types/salary'
import SalariesContentManager from '@/components/features/SalariesContentManager'

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

export default async function SalariesPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await props.searchParams
  const location = typeof sp.location === 'string' ? sp.location : undefined
  const company = typeof sp.company === 'string' ? sp.company : undefined
  const roleParam = typeof sp.role === 'string' ? sp.role : undefined
  const exp = typeof sp.exp === 'string' ? sp.exp : undefined

  const whereClause: any = {}
  if (location) whereClause.location = { contains: location, mode: 'insensitive' }
  if (company) {
    whereClause.OR = [
      { company: { name: { contains: company, mode: 'insensitive' } } },
      { role: { contains: company, mode: 'insensitive' } }
    ]
  }

  const rawSalaries = await prisma.salary.findMany({
    where: whereClause,
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

  let pageTitle = 'India Tech Salaries'
  if (location && roleParam) pageTitle = `${roleParam} Salaries in ${location}`
  else if (location) pageTitle = `Tech Salaries in ${location}`
  else if (roleParam) pageTitle = `${roleParam} Salaries in India`
  else if (company) pageTitle = `Salaries for "${company}"`

  // Unique companies
  const uniqueCompanies = [...new Set(salaries.map((s) => s.company.slug))].slice(0, 8)

  return (
    <>
      <SalaryJsonLd count={count} />

      <div className="bg-[#F7F7F7] min-h-screen">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white border-b border-[#EBEBEB]">
          {/* Pink blob decorations */}
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,90,95,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-[320px] h-[320px] rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.5)_0%,transparent_70%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-medium text-[#717171] mb-6">
              <Link href="/companies" className="hover:text-[#222222] transition-colors">Companies</Link>
              <span>›</span>
              <span className="text-[#222222]">Salaries</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
              <div>
                {/* Title row */}
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h1 className="text-4xl md:text-5xl font-black text-[#222222] leading-tight tracking-tight">
                    {pageTitle}
                  </h1>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1">
                    ✓ Verified
                  </span>
                </div>
                <p className="text-[#717171] font-medium mb-8">
                  Based on {count} verified salary submissions {location ? `in ${location}` : 'in India'} · Updated June 2026
                </p>

                {/* 3 stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                  {[
                    {
                      icon: '💰',
                      label: 'Average Total Pay',
                      value: formatCurrency(avgTC, primaryCurrency),
                      sub: '/ year',
                      bg: 'bg-rose-50/50',
                    },
                    {
                      icon: '📊',
                      label: 'Salary Range',
                      value: `${formatCurrency(minTC, primaryCurrency)} – ${formatCurrency(maxTC, primaryCurrency)}`,
                      sub: 'Min — Max',
                      bg: 'bg-blue-50/50',
                    },
                    {
                      icon: '📍',
                      label: 'Top Location',
                      value: topLocation,
                      sub: 'Most submitted city',
                      bg: 'bg-emerald-50/50',
                    },
                  ].map(({ icon, label, value, sub, bg }) => (
                    <div key={label} className={`p-4 rounded-xl border border-[#EBEBEB] ${bg}`}>
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className="text-[11px] font-semibold text-[#717171] uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-lg font-bold text-[#222222] leading-tight">{value}</div>
                      <div className="text-[11px] font-medium text-[#9CA3AF] mt-1">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right decorative company logos */}
              <div className="hidden md:grid grid-cols-4 gap-2 opacity-80 mt-12 lg:mt-0">
                {uniqueCompanies.map((slug) => (
                  <div key={slug} className="relative w-12 h-12 bg-white rounded-xl shadow-sm border border-[#EBEBEB] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[#FF5A5F] flex items-center justify-center text-white font-bold text-xs">
                      {slug.slice(0, 2).toUpperCase()}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getLogoUrl(slug)}
                      alt={slug}
                      className="absolute inset-0 w-full h-full object-contain p-1.5 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Search + Filters + Table Content ───────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Suspense fallback={<div className="animate-pulse bg-white rounded-xl h-96 border border-[#EBEBEB]"></div>}>
            <SalaryTable initialData={salaries} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
