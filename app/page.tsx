import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'
import CompanyHeroSearch from '@/components/features/CompanyHeroSearch'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'TalentDash — Career Intelligence Platform for India',
  description:
    'Structured salary data, company reviews, and interview experiences for Indian tech professionals. Compare offers, discover compensation by level, and make career decisions with real data.',
  alternates: { canonical: 'https://talentdash.in' },
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
  apple: 'apple.com',
  netflix: 'netflix.com',
  tesla: 'tesla.com',
  adobe: 'adobe.com',
  salesforce: 'salesforce.com',
  ibm: 'ibm.com',
  oracle: 'oracle.com',
  sap: 'sap.com',
  hcltech: 'hcltech.com',
  openai: 'openai.com',
  anthropic: 'anthropic.com',
  databricks: 'databricks.com',
  cohere: 'cohere.com',
  huggingface: 'huggingface.co',
  midjourney: 'midjourney.com',
}

const COMPANY_GRADIENTS: Record<string, string> = {
  google: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
  amazon: 'linear-gradient(135deg, #fff3e0 0%, #fffde7 100%)',
  apple: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
  microsoft: 'linear-gradient(135deg, #e0f7fa 0%, #e3f2fd 100%)',
  meta: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
  netflix: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  tesla: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  adobe: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  salesforce: 'linear-gradient(135deg, #e0f7fa 0%, #e3f2fd 100%)',
  infosys: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  tcs: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
  ibm: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  oracle: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  sap: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)',
  hcltech: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  // AI
  openai: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
  nvidia: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
  anthropic: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
  googledeepmind: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  microsoftai: 'linear-gradient(135deg, #e0f7fa 0%, #e3f2fd 100%)',
  perplexityai: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)',
  databricks: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  cohere: 'linear-gradient(135deg, #fbe9e7 0%, #ffccbc 100%)',
  huggingface: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
  stabilityai: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
  mistralai: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
  midjourney: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)',
}

const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
  'linear-gradient(135deg, #fff3e0 0%, #fffde7 100%)',
  'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
  'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
  'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
  'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
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

export default async function HomePage() {
  const companies = await prisma.company.findMany({
    include: {
      salaries: {
        select: { total_compensation: true, level: true, currency: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const serialized = serializePrismaRecord(companies) as any[]

  const searchOptions = serialized.map(c => ({ name: c.name, slug: c.slug }))

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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #FFE4E6 0%, transparent 70%)' }} />
          <div className="absolute -top-12 right-0 w-80 h-80 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-12 text-center">
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

          <CompanyHeroSearch companies={searchOptions} />
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
              const gradient = COMPANY_GRADIENTS[company.slug] || DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length]
              return (
                <Link
                  key={company.slug}
                  href={`/companies/${company.slug}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                  style={{ background: gradient, borderColor: 'rgba(0,0,0,0.03)', textDecoration: 'none' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#FF5A5F' }}>
                        {company.name.slice(0, 1)}
                      </div>
                      <img
                        src={`https://logo.clearbit.com/${domain}`}
                        alt={company.name}
                        className="absolute inset-0 w-8 h-8 rounded-lg object-contain bg-white shadow-sm"
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
                const gradient = COMPANY_GRADIENTS[company.slug] || DEFAULT_GRADIENTS[i % DEFAULT_GRADIENTS.length]
                return (
                  <Link
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                    style={{ background: gradient, borderColor: 'rgba(0,0,0,0.03)', textDecoration: 'none' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: '#FF5A5F' }}>
                          {company.name.slice(0, 1)}
                        </div>
                        <img
                          src={`https://logo.clearbit.com/${domain}`}
                          alt={company.name}
                          className="absolute inset-0 w-8 h-8 rounded-lg object-contain bg-white shadow-sm"
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
                const gradient = COMPANY_GRADIENTS[company.slug] || DEFAULT_GRADIENTS[(i + 2) % DEFAULT_GRADIENTS.length]
                return (
                  <Link
                    key={company.slug}
                    href={`/companies/${company.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 hover:shadow-md"
                    style={{ background: gradient, borderColor: 'rgba(0,0,0,0.03)', textDecoration: 'none' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: '#FF5A5F' }}>
                          {company.name.slice(0, 1)}
                        </div>
                        <img
                          src={`https://logo.clearbit.com/${domain}`}
                          alt={company.name}
                          className="absolute inset-0 w-8 h-8 rounded-lg object-contain bg-white shadow-sm"
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
                    <img src={`https://logo.clearbit.com/${LOGO_DOMAINS[a] ?? `${a}.com`}`} alt={aName}
                      className="absolute inset-0 w-9 h-9 rounded-xl object-contain bg-white" style={{ padding: '2px' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#9CA3AF' }}>vs</span>
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: '#6366F1' }}>
                      {bName[0]}
                    </div>
                    <img src={`https://logo.clearbit.com/${LOGO_DOMAINS[b] ?? `${b}.com`}`} alt={bName}
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
        </section>
      </div>
    </div>
  )
}
