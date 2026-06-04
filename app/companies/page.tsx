import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, formatCurrency, computeMedian } from '@/lib/format'

import CompaniesList from '@/components/features/CompaniesList'

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

      <CompaniesList companies={serialized} />
    </div>
  )
}
