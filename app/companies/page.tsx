import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Browse Companies — Salaries, Reviews & Culture | TalentDash',
  description:
    'Discover and research top employers in India. View salary ranges, employee reviews, level distributions, and compensation data for Google, Amazon, TCS, Flipkart, and more.',
  alternates: { canonical: 'https://talentdash.in/companies' },
}

// Domain mappings for Clearbit logos
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

// Subtle card background tints to match design
const CARD_TINTS = [
  '#EFF6FF', '#FFFBEB', '#F0FFF4', '#FFF5F5',
  '#F5F3FF', '#ECFDF5', '#FEF2F2', '#F0F9FF',
  '#FEFCE8', '#F7FEE7', '#FFF7ED', '#F0FDFA',
]

const FUNDING_STAGES = [
  { label: 'Pre-Seed', icon: '🛡️' },
  { label: 'Seed', icon: '🌱' },
  { label: 'Series A', icon: '🚀' },
  { label: 'Series B', icon: '📈' },
  { label: 'Series C', icon: '💎' },
  { label: 'Series D', icon: '🏆' },
  { label: 'Series E+', icon: '⚡' },
  { label: 'Post IPO', icon: '📊' },
]

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      salaries: {
        select: {
          total_compensation: true,
          level: true,
          currency: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const serialized = serializePrismaRecord(companies) as any[]

  // Split companies into groups
  const aiCompanies = serialized.filter(c =>
    ['nvidia', 'google'].includes(c.slug)
  )
  const indianCompanies = serialized.filter(c =>
    ['tcs', 'infosys', 'wipro', 'meesho', 'zepto', 'razorpay', 'flipkart'].includes(c.slug)
  )
  const popularCompanies = serialized.filter(c =>
    ['google', 'amazon', 'microsoft', 'meta', 'nvidia', 'flipkart', 'razorpay'].includes(c.slug)
  )

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#fff' }}>
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #FFE4E6 0%, transparent 70%)' }} />
          <div className="absolute -top-12 right-0 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-12 text-center">
          {/* Pill label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ background: '#FFF0F0', color: '#FF5A5F', letterSpacing: '0.12em' }}>
            Companies
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: '#222222', lineHeight: '1.15' }}>
            Search for <span style={{ color: '#FF5A5F' }}>Company</span>
          </h1>
          <p className="text-base mb-8" style={{ color: '#717171' }}>
            Search companies to explore salaries, benefits, and more.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <svg width="18" height="18" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for a company..."
              className="w-full pl-12 pr-6 py-4 text-base rounded-full border outline-none transition-all"
              style={{
                borderColor: '#E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                fontSize: '15px',
                color: '#222222',
              }}
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Popular Companies ──────────────────────────────────────────────── */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222222', margin: 0 }}>Popular Companies</h2>
            <Link href="/companies" className="flex items-center gap-1 text-sm font-medium" style={{ color: '#FF5A5F' }}>
              View all companies <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {popularCompanies.map((company: any, i: number) => {
              const domain = LOGO_DOMAINS[company.slug] ?? `${company.slug}.com`
              const tint = CARD_TINTS[i % CARD_TINTS.length]
              return (
                <Link
                  key={company.slug}
                  href={`/companies/${company.slug}`}
                  id={`company-card-${company.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                  style={{ background: tint, borderColor: 'transparent', textDecoration: 'none' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#FF5A5F' }}>
                        {company.name.slice(0, 1)}
                      </div>
                      <Image
                        src={`https://logo.clearbit.com/${domain}`}
                        alt={company.name}
                        width={32}
                        height={32}
                        className="absolute inset-0 w-8 h-8 rounded-lg object-contain bg-white"
                        style={{ padding: '2px' }}
                      />
                    </div>
                    <span className="text-sm font-medium truncate" style={{ color: '#222222' }}>{company.name}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                    style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: '11px', color: '#484848' }}>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Startups by Funding Stage ─────────────────────────────────────── */}
        <section className="py-8 border-t" style={{ borderColor: '#F3F4F6' }}>
          <h2 className="mb-5" style={{ fontSize: '18px', fontWeight: 700, color: '#222222', margin: '0 0 20px 0' }}>
            Startups by Funding Stage
          </h2>
          <div className="flex flex-wrap gap-2">
            {FUNDING_STAGES.map(({ label, icon }) => (
              <button
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:shadow-sm hover:border-gray-300"
                style={{ background: '#fff', borderColor: '#E5E7EB', color: '#484848' }}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Top AI Companies ──────────────────────────────────────────────── */}
        {aiCompanies.length > 0 && (
          <section className="py-8 border-t" style={{ borderColor: '#F3F4F6' }}>
            <h2 className="mb-5" style={{ fontSize: '18px', fontWeight: 700, color: '#222222', margin: '0 0 20px 0' }}>
              Top AI Companies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {aiCompanies.map((company: any, i: number) => {
                const domain = LOGO_DOMAINS[company.slug] ?? `${company.slug}.com`
                return (
                  <Link
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB', textDecoration: 'none' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: '#FF5A5F' }}>
                          {company.name.slice(0, 1)}
                        </div>
                        <Image
                          src={`https://logo.clearbit.com/${domain}`}
                          alt={company.name}
                          width={32}
                          height={32}
                          className="absolute inset-0 w-8 h-8 rounded-lg object-contain bg-white"
                          style={{ padding: '2px' }}
                        />
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: '#222222' }}>{company.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#9CA3AF', flexShrink: 0 }}>→</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Top Indian Companies ──────────────────────────────────────────── */}
        {indianCompanies.length > 0 && (
          <section className="py-8 border-t" style={{ borderColor: '#F3F4F6' }}>
            <h2 className="mb-5" style={{ fontSize: '18px', fontWeight: 700, color: '#222222', margin: '0 0 20px 0' }}>
              Top Indian Companies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {indianCompanies.map((company: any, i: number) => {
                const domain = LOGO_DOMAINS[company.slug] ?? `${company.slug}.com`
                return (
                  <Link
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                    style={{ background: '#F9FAFB', borderColor: '#E5E7EB', textDecoration: 'none' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: '#FF5A5F' }}>
                          {company.name.slice(0, 1)}
                        </div>
                        <Image
                          src={`https://logo.clearbit.com/${domain}`}
                          alt={company.name}
                          width={32}
                          height={32}
                          className="absolute inset-0 w-8 h-8 rounded-lg object-contain bg-white"
                          style={{ padding: '2px' }}
                        />
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: '#222222' }}>{company.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#9CA3AF', flexShrink: 0 }}>→</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Not sure banner ───────────────────────────────────────────────── */}
        <section className="py-6">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: '#FFF5F5' }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <p className="text-sm m-0" style={{ color: '#484848' }}>
              Not sure where to start?{' '}
              <Link href="/salaries" className="font-semibold" style={{ color: '#FF5A5F' }}>
                Check out our top paying companies in India. →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Compare Companies ─────────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#222222', margin: '0 0 8px' }}>
              Compare companies. Make <span style={{ color: '#FF5A5F' }}>better</span> career moves.
            </h2>
            <p className="text-sm" style={{ color: '#717171' }}>
              Compare salaries, benefits, culture, growth and more to find the right workplace for you.
            </p>
          </div>

          {/* + vs + */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <Link href="/compare"
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all hover:shadow-md"
              style={{ background: '#FFF0F0', border: '2px dashed #FFB3B5' }}>
              <span style={{ color: '#FF5A5F', fontSize: '28px', lineHeight: 1 }}>+</span>
            </Link>
            <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>vs</span>
            <Link href="/compare"
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-light transition-all hover:shadow-md"
              style={{ background: '#F0F0FF', border: '2px dashed #C4B5FD' }}>
              <span style={{ color: '#7C3AED', fontSize: '28px', lineHeight: 1 }}>+</span>
            </Link>
          </div>

          {/* Popular comparisons */}
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#222222', margin: 0 }}>Popular comparisons</h3>
            <Link href="/compare" className="text-sm font-medium" style={{ color: '#FF5A5F' }}>
              View all comparisons →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { a: 'google', b: 'meta', aName: 'Google', bName: 'Meta', tag: 'Compensation & Benefits' },
              { a: 'amazon', b: 'microsoft', aName: 'Amazon', bName: 'Microsoft', tag: 'Career Growth' },
              { a: 'nvidia', b: 'google', aName: 'NVIDIA', bName: 'Google', tag: 'Culture & Work-Life' },
              { a: 'tcs', b: 'infosys', aName: 'TCS', bName: 'Infosys', tag: 'Salaries & Benefits' },
            ].map(({ a, b, aName, bName, tag }) => (
              <Link
                key={`${a}-${b}`}
                href={`/compare`}
                className="p-4 rounded-xl border transition-all hover:shadow-md"
                style={{ background: '#FAFAFA', borderColor: '#E5E7EB', textDecoration: 'none' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: '#FF5A5F' }}>
                      {aName[0]}
                    </div>
                    <Image src={`https://logo.clearbit.com/${LOGO_DOMAINS[a] ?? `${a}.com`}`} alt={aName} width={36} height={36}
                      className="absolute inset-0 w-9 h-9 rounded-xl object-contain bg-white" style={{ padding: '2px' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>vs</span>
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: '#6366F1' }}>
                      {bName[0]}
                    </div>
                    <Image src={`https://logo.clearbit.com/${LOGO_DOMAINS[b] ?? `${b}.com`}`} alt={bName} width={36} height={36}
                      className="absolute inset-0 w-9 h-9 rounded-xl object-contain bg-white" style={{ padding: '2px' }} />
                  </div>
                </div>
                <div className="font-semibold text-sm" style={{ color: '#222222' }}>{aName} vs {bName}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>{tag}</span>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>→</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Can't decide banner */}
          <div className="mt-6 flex items-center justify-between px-5 py-4 rounded-xl border"
            style={{ background: '#FAFAFA', borderColor: '#E5E7EB' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '20px' }}>✨</span>
              <div>
                <p className="text-sm font-medium m-0" style={{ color: '#222222' }}>Can't decide which companies to compare?</p>
                <p className="text-xs m-0" style={{ color: '#9CA3AF' }}>Explore top companies or view comparisons by category.</p>
              </div>
            </div>
            <Link href="/compare"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-white"
              style={{ color: '#222222', borderColor: '#E5E7EB', background: '#fff', textDecoration: 'none' }}>
              Explore companies →
            </Link>
          </div>
        </section>

        {/* ── Explore companies your way ────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: '#FFF0F0', color: '#FF5A5F' }}>
                Discover companies ✨
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#222222', margin: 0 }}>
                Explore companies your way
              </h2>
              <p className="text-sm mt-1" style={{ color: '#717171' }}>
                Find the right companies based on what matters to you.
              </p>
            </div>
            <Link href="/companies" className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all hover:bg-gray-50"
              style={{ color: '#222222', borderColor: '#E5E7EB', textDecoration: 'none' }}>
              View all companies →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-8">
            {[
              { label: 'Top paying companies', count: `${serialized.length} companies`, color: '#EF4444', bg: '#FEF2F2' },
              { label: 'Remote friendly companies', count: 'Remote & hybrid', color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Highly rated companies', count: 'Top rated', color: '#10B981', bg: '#ECFDF5' },
              { label: 'Fast growing companies', count: 'High growth', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Product based companies', count: 'Product roles', color: '#EC4899', bg: '#FDF2F8' },
              { label: 'AI & tech companies', count: 'Cutting edge', color: '#6366F1', bg: '#EEF2FF' },
            ].map(({ label, count, color, bg }) => (
              <Link
                key={label}
                href="/companies"
                className="p-4 rounded-xl border transition-all hover:shadow-md flex flex-col justify-between"
                style={{ background: bg, borderColor: 'transparent', minHeight: '120px', textDecoration: 'none' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#222222', lineHeight: '1.4' }}>{label}</span>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="w-8 h-1 rounded-full mb-1" style={{ background: color }} />
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{count}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#484848' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Quick ways to explore ─────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <h2 className="mb-6" style={{ fontSize: '18px', fontWeight: 700, color: '#222222', margin: '0 0 20px' }}>
            Quick ways to explore
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: '👤', label: 'By experience', sub: 'Internship to Leadership' },
              { icon: '📍', label: 'By location', sub: 'Top cities & remote' },
              { icon: '📊', label: 'By company size', sub: 'Startups to Enterprises' },
              { icon: '🏭', label: 'By industry', sub: 'Tech, Finance, Healthcare & more' },
              { icon: '⭐', label: 'By rating', sub: '4★ & above companies' },
              { icon: '🚀', label: 'By funding stage', sub: 'Pre-seed to Unicorns' },
              { icon: '🏅', label: 'By known for', sub: 'Benefits, Culture & more' },
              { icon: '🛡️', label: 'By badges', sub: 'Verified & featured companies' },
            ].map(({ icon, label, sub }) => (
              <Link
                key={label}
                href="/companies"
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all hover:shadow-sm hover:bg-gray-50"
                style={{ background: '#fff', borderColor: '#E5E7EB', textDecoration: 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: '#FFF5F5' }}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#222222' }}>{label}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</div>
                  </div>
                </div>
                <span style={{ color: '#9CA3AF', fontSize: '14px', flexShrink: 0 }}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── All Companies Grid ────────────────────────────────────────────── */}
        <section className="py-10 border-t" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222222', margin: 0 }}>
              All Companies <span className="text-base font-normal" style={{ color: '#9CA3AF' }}>({serialized.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {serialized.map((company: any, i: number) => {
              const tcValues = company.salaries.map((s: any) => s.total_compensation)
              const median = computeMedian(tcValues)
              const primaryCurrency = company.salaries[0]?.currency ?? 'INR'
              const domain = LOGO_DOMAINS[company.slug] ?? `${company.slug.replace(/[^a-z0-9]/g, '')}.com`

              return (
                <Link
                  key={company.slug}
                  href={`/companies/${company.slug}`}
                  id={`company-card-${company.slug}`}
                  className="p-5 rounded-xl border transition-all duration-200 hover:shadow-md"
                  style={{ background: '#fff', borderColor: '#E5E7EB', textDecoration: 'none' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative w-11 h-11 flex-shrink-0">
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: '#FF5A5F' }}>
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <img
                        src={`https://logo.clearbit.com/${domain}`}
                        alt={company.name}
                        className="absolute inset-0 w-11 h-11 rounded-xl object-contain bg-white border"
                        style={{ borderColor: '#F3F4F6', padding: '2px' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: '#222222' }} title={company.name}>
                        {company.name}
                      </div>
                      {company.industry && (
                        <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{company.industry}</div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-3" style={{ borderColor: '#F3F4F6' }}>
                    <div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>Median TC</div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: '#0369A1' }}>
                        {median > 0 ? formatCurrency(median, primaryCurrency) : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>Records</div>
                      <div className="text-sm font-semibold mt-0.5" style={{ color: '#222222' }}>{tcValues.length}</div>
                    </div>
                  </div>

                  {company.headquarters && (
                    <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: '#9CA3AF' }}>
                      <span>📍</span> {company.headquarters}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>

        {/* Bottom banner */}
        <section className="py-8">
          <div className="flex items-center gap-3 px-5 py-4 rounded-xl" style={{ background: '#FFF5F5' }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <p className="text-sm m-0" style={{ color: '#484848' }}>
              Not sure where to start?{' '}
              <Link href="/salaries" className="font-semibold" style={{ color: '#FF5A5F' }}>
                Check out our top paying companies in India. →
              </Link>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
