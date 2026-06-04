import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'
import CompaniesList from '@/components/features/CompaniesList'

export const revalidate = 3600 // ISR: hourly

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

export default async function HomePage() {
  // Fetch top companies and recent salary data
  const [companies, recentSalaries] = await Promise.all([
    prisma.company.findMany({
      include: { salaries: { select: { total_compensation: true } } },
      take: 12,
    }),
    prisma.salary.findMany({
      include: { company: { select: { name: true, slug: true } } },
      orderBy: { total_compensation: 'desc' },
      take: 6,
    }),
  ])

  const serializedCompanies = serializePrismaRecord(companies) as any[]
  const serializedSalaries = serializePrismaRecord(recentSalaries) as any[]

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center relative z-10">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            style={{ color: '#ffffff', lineHeight: '1.1', fontSize: 'clamp(36px, 5vw, 60px)' }}
          >
            Make career decisions
            <br />
            <span style={{ color: '#FF5A5F' }}>with real data</span>
          </h1>

          <p
            className="text-lg max-w-2xl mx-auto mb-10"
            style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}
          >
            Structured salary data, company reviews, and interview experiences
            for Indian tech professionals. Filter by level, company, and location.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/salaries" className="btn-primary text-base px-7 py-3">
              Explore Salaries →
            </Link>
            <Link
              href="/compare"
              className="btn-ghost text-base px-7 py-3"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Compare Offers
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-14">
            {[
              { value: `${serializedSalaries.length}+`, label: 'Salary Records' },
              { value: `${serializedCompanies.length}+`, label: 'Companies' },
              { value: '8+', label: 'Cities' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#FF5A5F' }}>{value}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search Companies ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 style={{ fontSize: '24px', margin: 0 }}>Search Companies</h2>
          <Link href="/companies" className="text-sm font-medium" style={{ color: '#FF5A5F' }}>
            View directory →
          </Link>
        </div>

        <CompaniesList companies={serializedCompanies} />
      </section>

      {/* ── Top Salaries ───────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid #EBEBEB', borderBottom: '1px solid #EBEBEB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 style={{ fontSize: '24px', margin: 0 }}>Highest Paying Roles</h2>
            <Link href="/salaries" className="text-sm font-medium" style={{ color: '#FF5A5F' }}>
              View all →
            </Link>
          </div>

          <div className="space-y-3">
            {serializedSalaries.map((s: any, i: number) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-xl border transition-colors duration-150 hover:bg-[#F7F7F7]"
                style={{ background: '#fff', borderColor: '#EBEBEB' }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: i < 3 ? '#FF5A5F' : '#F7F7F7', color: i < 3 ? '#fff' : '#717171' }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#222222' }}>
                      {s.company.name} · {s.role}
                    </div>
                    <div className="meta-text">
                      {s.level.replace(/_/g, '-')} · {s.location}
                    </div>
                  </div>
                </div>
                <div className="tc-amount text-right" style={{ fontSize: '18px' }}>
                  {formatCurrency(s.total_compensation, s.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform areas ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-center mb-3" style={{ fontSize: '28px' }}>
          Everything you need to make the right career move
        </h2>
        <p className="text-center mb-10 max-w-xl mx-auto" style={{ color: '#484848' }}>
          Structured data across 8 product areas, all connected.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: '💰',
              title: 'Salaries',
              desc: 'Level-aware compensation data by company, role, and location.',
              href: '/salaries',
            },
            {
              icon: '🏢',
              title: 'Companies',
              desc: 'Research employers: ratings, headcount, salary ranges, culture.',
              href: '/companies',
            },
            {
              icon: '⚖️',
              title: 'Compare',
              desc: 'Side-by-side salary comparison with delta calculations.',
              href: '/compare',
            },
            {
              icon: '📊',
              title: 'Analytics',
              desc: 'Salary heatmaps, level distributions, market trends.',
              href: '/salaries',
            },
          ].map(({ icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="card p-6 hover:shadow-md transition-all duration-200"
              style={{ textDecoration: 'none' }}
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px', color: '#222222' }}>
                {title}
              </h3>
              <p style={{ fontSize: '14px', color: '#717171', margin: 0, lineHeight: '1.5' }}>
                {desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
