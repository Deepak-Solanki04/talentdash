import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializePrismaRecord, computeMedian } from '@/lib/format'

// GET /api/companies/[slug]
// Returns company metadata + salary list + median TC + level distribution
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      salaries: {
        orderBy: { total_compensation: 'desc' },
      },
    },
  })

  if (!company) {
    return NextResponse.json(
      { error: true, message: 'Company not found' },
      { status: 404 }
    )
  }

  const salaries = company.salaries

  // ── Median total compensation (true statistical median, NOT average) ────────
  const tcValues = salaries.map((s) => Number(s.total_compensation))
  const median_total_compensation = computeMedian(tcValues)

  // ── Level distribution: counts per level ───────────────────────────────────
  const level_distribution: Record<string, number> = {}
  for (const s of salaries) {
    const level = String(s.level)
    level_distribution[level] = (level_distribution[level] ?? 0) + 1
  }

  const response = {
    ...serializePrismaRecord(company),
    salaries: serializePrismaRecord(salaries),
    median_total_compensation,
    level_distribution,
  }

  return NextResponse.json(response, {
    headers: {
      // 1hr CDN cache, stale OK for 24h
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
