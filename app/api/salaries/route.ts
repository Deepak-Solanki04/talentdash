import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializePrismaRecord } from '@/lib/format'
import { VALID_LEVELS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/config'

// GET /api/salaries
// Filterable, sortable, paginated salary list
// Cache-Control: s-maxage=300, stale-while-revalidate=3600
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const company = searchParams.get('company')
  const role = searchParams.get('role')
  const level = searchParams.get('level')
  const location = searchParams.get('location')
  const currency = searchParams.get('currency')
  const sort = searchParams.get('sort') ?? 'total_comp_desc'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  // Cap limit at MAX_PAGE_SIZE — returning unbounded rows is a hard failure
  const requestedLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)
  const limit = Math.min(Math.max(1, requestedLimit), MAX_PAGE_SIZE)

  // Validate level if provided
  if (level && !VALID_LEVELS.includes(level as any)) {
    return NextResponse.json(
      { error: true, field: 'level', message: `Invalid level: ${level}` },
      { status: 400 }
    )
  }

  // Build Prisma where clause
  const where: Record<string, unknown> = {}

  if (company) {
    where.company = {
      normalized_name: { contains: company.toLowerCase().trim(), mode: 'insensitive' },
    }
  }

  if (role) {
    where.role = { contains: role, mode: 'insensitive' }
  }

  if (level) {
    where.level = level
  }

  if (location) {
    where.location = { contains: location, mode: 'insensitive' }
  }

  if (currency) {
    where.currency = currency
  }

  // Sort configuration
  type OrderBy = Record<string, 'asc' | 'desc'>
  const orderByMap: Record<string, OrderBy> = {
    total_comp_desc: { total_compensation: 'desc' },
    total_comp_asc: { total_compensation: 'asc' },
    date_desc: { submitted_at: 'desc' },
  }
  const orderBy = orderByMap[sort] ?? { total_compensation: 'desc' }

  const skip = (page - 1) * limit

  // Execute count + data queries in parallel
  const [total, salaries] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { company: true },
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  const response = {
    data: serializePrismaRecord(salaries),
    meta: {
      total,
      page,
      limit, // return the actual capped limit
      totalPages,
    },
  }

  return NextResponse.json(response, {
    headers: {
      // Cloudflare CDN caches for 5 min, stale OK for 1 hour
      'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
    },
  })
}
