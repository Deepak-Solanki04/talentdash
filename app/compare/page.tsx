import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { serializePrismaRecord } from '@/lib/format'
import ComparePanel from '@/components/features/ComparePanel'
import type { SalaryWithCompany } from '@/types/salary'

import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Compare Salaries Side-by-Side | TalentDash',
  description:
    'Compare any two salary records side-by-side. See exact differences in base salary, bonus, stock, and total compensation.',
  alternates: {
    canonical: 'https://talentdash.in/compare',
  },
  openGraph: {
    title: 'Compare Salaries — TalentDash',
    description: 'Side-by-side salary comparison with delta calculation.',
    url: 'https://talentdash.in/compare',
  },
}

export const revalidate = 3600

export default async function ComparePage() {
  // Fetch all records for the dropdown selectors
  const rawSalaries = await prisma.salary.findMany({
    include: { company: true },
    orderBy: [{ company: { name: 'asc' } }, { total_compensation: 'desc' }],
  })

  const salaries = serializePrismaRecord(rawSalaries) as unknown as SalaryWithCompany[]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Compare Salary Records</h1>
        <p style={{ color: '#484848' }}>
          Select two salary records to compare compensation side-by-side.
        </p>
      </div>

      {/* Client component — justified use of 'use client' for interactive selectors */}
      <Suspense fallback={
        <div className="card p-12 text-center animate-pulse">
          <div className="text-4xl mb-3">⚖️</div>
          <p className="meta-text">Select two salary records above to see a detailed comparison.</p>
        </div>
      }>
        <ComparePanel salaries={salaries} />
      </Suspense>
    </div>
  )
}
