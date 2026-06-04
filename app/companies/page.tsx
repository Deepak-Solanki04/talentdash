import type { Metadata } from 'next'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Browse Companies</h1>
        <p style={{ color: '#484848' }}>
          Research {serialized.length} companies — salary ranges, level distributions, and compensation data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {serialized.map((company: any) => {
          const tcValues = company.salaries.map((s: any) => s.total_compensation)
          const median = computeMedian(tcValues)
          const primaryCurrency = company.salaries[0]?.currency ?? 'INR'

          // Get normalized domain guess for logo
          const domain = `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`

          return (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              id={`company-card-${company.slug}`}
              className="card p-5 hover:shadow-md transition-all duration-200"
              style={{ textDecoration: 'none' }}
            >
              <div className="flex items-start gap-4">
                {/* Logo with fallback */}
                <div className="relative w-11 h-11 flex-shrink-0">
                  {/* We use standard HTML img to allow onError fallback to the div behind it */}
                  <div
                    className="absolute inset-0 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-[#FF5A5F]"
                  >
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <img 
                    src={`https://logo.clearbit.com/${domain}`} 
                    alt={company.name}
                    className="absolute inset-0 w-11 h-11 rounded-xl object-cover bg-white border border-[#EBEBEB]"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-sm mb-0.5 truncate"
                    style={{ color: '#222222' }}
                    title={company.name}
                  >
                    {company.name}
                  </div>
                  {company.industry && (
                    <div className="meta-text truncate">{company.industry}</div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3" style={{ borderColor: '#EBEBEB' }}>
                <div>
                  <div className="meta-text">Median TC</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: '#0369A1' }}>
                    {median > 0 ? formatCurrency(median, primaryCurrency) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="meta-text">Records</div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: '#222222' }}>
                    {tcValues.length}
                  </div>
                </div>
              </div>

              {company.headquarters && (
                <div className="meta-text mt-3">📍 {company.headquarters}</div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
