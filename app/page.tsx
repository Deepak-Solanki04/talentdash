import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'TalentDash — Career Intelligence Platform for India',
  description:
    'Structured salary data, company reviews, and interview experiences for Indian tech professionals. Compare offers, discover compensation by level, and make career decisions with real data.',
  alternates: { canonical: 'https://talentdash.in' },
  openGraph: {
    title: 'TalentDash — Career Intelligence for India',
    description: 'Real salary data. Real companies. Real decisions.',
    url: 'https://talentdash.in',
  },
}

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

export default async function HomePage() {
  const [companies, recentSalaries, totalSalaries, totalCompanies] = await Promise.all([
    prisma.company.findMany({
      include: { salaries: { select: { total_compensation: true, currency: true } } },
      take: 12,
    }),
    prisma.salary.findMany({
      include: { company: { select: { name: true, slug: true } } },
      orderBy: { total_compensation: 'desc' },
      take: 6,
    }),
    prisma.salary.count(),
    prisma.company.count(),
  ])

  const serializedCompanies = serializePrismaRecord(companies) as any[]
  const serializedSalaries = serializePrismaRecord(recentSalaries) as any[]

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#fff' }}>
        {/* Background blob decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, #FFE4E6 0%, transparent 65%)' }} />
          <div className="absolute -top-16 right-0 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 65%)' }} />
          <div className="absolute top-40 left-1/2 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #F0FDF4 0%, transparent 65%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
          <h1
            className="font-bold mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', color: '#222222', lineHeight: '1.15' }}
          >
            Make career decisions<br />
            <span style={{ color: '#FF5A5F' }}>with real data</span>
          </h1>

          <p className="max-w-xl mx-auto mb-8 text-base" style={{ color: '#717171', lineHeight: '1.7' }}>
            Structured salary data for Indian tech professionals. Filter by level, company, and location. Compare offers side-by-side.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <Link href="/salaries"
              className="btn-primary text-sm px-7 py-3 rounded-xl">
              Explore Salaries →
            </Link>
            <Link href="/companies"
              className="btn-ghost text-sm px-7 py-3 rounded-xl">
              Browse Companies
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl border"
            style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#E5E7EB', backdropFilter: 'blur(8px)' }}>
            {[
              { value: `${totalSalaries}+`, label: 'Salary Records' },
              { value: `${totalCompanies}+`, label: 'Companies' },
              { value: '8+', label: 'Cities' },
            ].map(({ value, label }, i) => (
              <div key={label} className="text-center">
                {i > 0 && <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-6 bg-gray-200" />}
                <div className="text-xl font-bold" style={{ color: '#FF5A5F' }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Popular Companies ─────────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#222222', margin: 0 }}>Popular Companies</h2>
            <Link href="/companies" className="text-sm font-medium" style={{ color: '#FF5A5F' }}>
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {serializedCompanies.slice(0, 12).map((company: any, i: number) => {
              const domain = LOGO_DOMAINS[company.slug] ?? `${company.slug}.com`
              const tcValues = company.salaries.map((s: any) => s.total_compensation)
              const median = computeMedian(tcValues)
              const primaryCurrency = company.salaries[0]?.currency ?? 'INR'
              const tints = ['#EFF6FF', '#FFFBEB', '#F0FFF4', '#FFF5F5', '#F5F3FF', '#ECFDF5']
              const tint = tints[i % tints.length]

              return (
                <Link
                  key={company.slug}
                  href={`/companies/${company.slug}`}
                  id={`company-card-${company.slug}`}
                  className="p-4 rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col items-center text-center"
                  style={{ background: tint, borderColor: 'transparent', textDecoration: 'none' }}
                >
                  <div className="relative w-12 h-12 mb-3">
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: '#FF5A5F' }}>
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <img
                      src={`https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`}
                      alt={company.name}
                      className="absolute inset-0 w-12 h-12 rounded-xl object-contain bg-white"
                      style={{ padding: '3px', border: '1px solid rgba(0,0,0,0.06)' }}
                    />
                  </div>
                  <div className="text-xs font-semibold truncate w-full" style={{ color: '#222222' }}>{company.name}</div>
                  {median > 0 && (
                    <div className="text-xs mt-1 font-medium" style={{ color: '#0369A1' }}>
                      {formatCurrency(median, primaryCurrency)}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Highest Paying Roles ──────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#222222', margin: 0 }}>Highest Paying Roles</h2>
            <Link href="/salaries" className="text-sm font-medium" style={{ color: '#FF5A5F' }}>
              View all →
            </Link>
          </div>

          <div className="space-y-2">
            {serializedSalaries.map((s: any, i: number) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all hover:shadow-sm hover:bg-gray-50"
                style={{ background: '#fff', borderColor: '#E5E7EB' }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i < 3 ? '#FF5A5F' : '#F3F4F6',
                      color: i < 3 ? '#fff' : '#9CA3AF'
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#222222' }}>
                      {s.company.name} · {s.role}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                      {s.level.replace(/_/g, '-')} · {s.location}
                    </div>
                  </div>
                </div>
                <div className="font-bold text-sm" style={{ color: '#0369A1', whiteSpace: 'nowrap' }}>
                  {formatCurrency(s.total_compensation, s.currency)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Compare Offers ────────────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#222222', margin: '0 0 8px' }}>
              Compare offers. Make <span style={{ color: '#FF5A5F' }}>smarter</span> decisions.
            </h2>
            <p className="text-sm" style={{ color: '#717171' }}>
              Compare any two salary records side-by-side with exact delta calculations.
            </p>
          </div>

          <div className="flex items-center justify-center gap-5 mb-8">
            <Link href="/compare"
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:shadow-md"
              style={{ background: '#FFF0F0', border: '2px dashed #FFB3B5' }}>
              <span style={{ color: '#FF5A5F', fontSize: '28px', lineHeight: 1 }}>+</span>
            </Link>
            <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>vs</span>
            <Link href="/compare"
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all hover:shadow-md"
              style={{ background: '#F0F0FF', border: '2px dashed #C4B5FD' }}>
              <span style={{ color: '#7C3AED', fontSize: '28px', lineHeight: 1 }}>+</span>
            </Link>
          </div>

          <div className="text-center">
            <Link href="/compare" className="btn-ghost text-sm px-6 py-2.5 rounded-xl">
              Start comparing →
            </Link>
          </div>
        </section>

        {/* ── Platform Areas ────────────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <h2 className="text-center mb-2" style={{ fontSize: '22px', fontWeight: 700, color: '#222222' }}>
            Everything you need to make the right career move
          </h2>
          <p className="text-center text-sm mb-8" style={{ color: '#717171' }}>
            Structured data across key product areas, all connected.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '💰', title: 'Salaries', desc: 'Level-aware compensation data by company, role, and location.', href: '/salaries' },
              { icon: '🏢', title: 'Companies', desc: 'Research employers: ratings, salary ranges, and headcount.', href: '/companies' },
              { icon: '⚖️', title: 'Compare', desc: 'Side-by-side salary comparison with delta calculations.', href: '/compare' },
              { icon: '🛠️', title: 'Tools', desc: 'Tax calculator, hike calculator, and more career tools.', href: '/tools' },
            ].map(({ icon, title, desc, href }) => (
              <Link
                key={title}
                href={href}
                className="p-6 rounded-xl border transition-all duration-200 hover:shadow-md"
                style={{ background: '#fff', borderColor: '#E5E7EB', textDecoration: 'none' }}
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px', color: '#222222' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, lineHeight: '1.5' }}>{desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
