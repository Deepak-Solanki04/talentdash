import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/db'
import { serializePrismaRecord } from '@/lib/format'
import SalaryTable from '@/components/features/SalaryTable'
import type { SalaryWithCompany } from '@/types/salary'

export const revalidate = 3600 // ISR: revalidate every hour

export const metadata: Metadata = {
  title: 'Salary Data — India Tech Salaries by Company & Level | TalentDash',
  description:
    'Browse structured salary data for Software Engineers, Product Managers, and Data Scientists at Google, Amazon, Meta, Flipkart, TCS, and more. Filter by level (L3–L6, SDE-I to III), location, and company.',
  alternates: {
    canonical: 'https://talentdash.in/salaries',
  },
  openGraph: {
    title: 'Salary Data — India Tech Salaries | TalentDash',
    description:
      'Structured, level-aware salary data for Indian tech professionals. Filter by company, role, level, and location.',
    url: 'https://talentdash.in/salaries',
  },
}

// JSON-LD structured data for Google rich results
function SalaryJsonLd({ count }: { count: number }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'TalentDash India Tech Salary Data',
    description: `Structured compensation data for ${count}+ salary records across Indian tech companies. Includes base salary, bonus, stock (RSU/ESOP), and total compensation by level and location.`,
    url: 'https://talentdash.in/salaries',
    creator: {
      '@type': 'Organization',
      name: 'TalentDash',
      url: 'https://talentdash.in',
    },
    keywords: [
      'India tech salaries',
      'software engineer salary India',
      'Google salary India',
      'Amazon salary India',
      'SDE salary Bengaluru',
      'L4 L5 salary India',
    ],
    variableMeasured: [
      'Base Salary',
      'Bonus',
      'Stock / RSU / ESOP',
      'Total Compensation',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function SalariesPage() {
  // RSC: fetch all salary data at build time
  const rawSalaries = await prisma.salary.findMany({
    include: { company: true },
    orderBy: { total_compensation: 'desc' },
  })

  // Serialize BigInt for client component
  const salaries = serializePrismaRecord(rawSalaries) as unknown as SalaryWithCompany[]

  return (
    <>
      <SalaryJsonLd count={salaries.length} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="mb-2">
            India Tech Salary Data
          </h1>
          <p className="text-base max-w-2xl" style={{ color: '#484848' }}>
            Structured compensation data for {salaries.length}+ records across top tech companies.
            Filter by company, role, level (L3–Principal), and location.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Salary Records', value: salaries.length },
            {
              label: 'Companies',
              value: new Set(salaries.map((s) => s.company.slug)).size,
            },
            {
              label: 'Cities',
              value: new Set(salaries.map((s) => s.location)).size,
            },
            {
              label: 'Roles',
              value: new Set(salaries.map((s) => s.role)).size,
            },
          ].map(({ label, value }) => (
            <div key={label} className="card px-4 py-3 text-center">
              <div
                className="text-xl font-bold"
                style={{ color: '#0369A1' }}
              >
                {value.toLocaleString()}
              </div>
              <div className="meta-text mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Salary table — client component for filtering */}
        <Suspense fallback={<TableSkeleton />}>
          <SalaryTable initialData={salaries} />
        </Suspense>
      </div>
    </>
  )
}

function TableSkeleton() {
  return (
    <div className="card p-4">
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded" />
        ))}
      </div>
    </div>
  )
}
