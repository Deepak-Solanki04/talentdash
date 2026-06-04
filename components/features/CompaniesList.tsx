'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, computeMedian } from '@/lib/format'

export default function CompaniesList({ companies }: { companies: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          className="td-input max-w-md"
          placeholder="Search companies by name or industry..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center card">
          <p className="meta-text">No companies found matching "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((company: any) => {
            const tcValues = company.salaries.map((s: any) => s.total_compensation)
            const median = computeMedian(tcValues)
            const primaryCurrency = company.salaries[0]?.currency ?? 'INR'

            return (
              <Link
                key={company.slug}
                href={`/companies/${company.slug}`}
                id={`company-card-${company.slug}`}
                className="card p-5 hover:shadow-md transition-all duration-200"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: '#FF5A5F' }}
                  >
                    {company.name.slice(0, 2).toUpperCase()}
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
                      {median > 0 ? formatCurrency(median, primaryCurrency as any) : 'N/A'}
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
      )}
    </>
  )
}
