import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeCompanyName } from '@/lib/format'
import { VALID_LEVELS, VALID_CURRENCIES, VALID_SOURCES } from '@/lib/config'

// POST /api/ingest-salary
// Accepts the integration contract JSON body
// Validates → Normalises → Deduplicates → Stores
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: true, field: 'body', message: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // ── VALIDATION PIPELINE ────────────────────────────────────────────────────

  // 1. Required fields
  const required = ['company', 'role', 'level', 'location', 'currency', 'experience_years', 'base_salary', 'source', 'confidence_score']
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return NextResponse.json(
        { error: true, field, message: `Field '${field}' is required` },
        { status: 400 }
      )
    }
  }

  // 2. Type checks
  const company = String(body.company)
  const role = String(body.role)
  const level = String(body.level)
  const location = String(body.location)
  const currency = String(body.currency)
  const source = String(body.source)

  // 3. Level enum validation
  if (!VALID_LEVELS.includes(level as any)) {
    return NextResponse.json(
      {
        error: true,
        field: 'level',
        message: `Level must be one of: ${VALID_LEVELS.join(', ')}. Got: "${level}"`,
      },
      { status: 400 }
    )
  }

  // 4. Currency enum validation
  if (!VALID_CURRENCIES.includes(currency as any)) {
    return NextResponse.json(
      {
        error: true,
        field: 'currency',
        message: `Currency must be one of: ${VALID_CURRENCIES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  // 5. Source enum validation
  if (!VALID_SOURCES.includes(source as any)) {
    return NextResponse.json(
      {
        error: true,
        field: 'source',
        message: `Source must be one of: ${VALID_SOURCES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  // 6. experience_years > 0 and < 51
  const experience_years = Number(body.experience_years)
  if (!Number.isInteger(experience_years) || experience_years <= 0 || experience_years >= 51) {
    return NextResponse.json(
      {
        error: true,
        field: 'experience_years',
        message: 'experience_years must be an integer between 1 and 50',
      },
      { status: 400 }
    )
  }

  // 7. base_salary > 0
  const base_salary = Number(body.base_salary)
  if (!Number.isFinite(base_salary) || base_salary <= 0) {
    return NextResponse.json(
      {
        error: true,
        field: 'base_salary',
        message: 'base_salary must be a positive number',
      },
      { status: 400 }
    )
  }

  // 8. confidence_score 0.0–1.0
  const confidence_score = Number(body.confidence_score)
  if (!Number.isFinite(confidence_score) || confidence_score < 0 || confidence_score > 1) {
    return NextResponse.json(
      {
        error: true,
        field: 'confidence_score',
        message: 'confidence_score must be between 0.0 and 1.0',
      },
      { status: 400 }
    )
  }

  const bonus = Number(body.bonus ?? 0)
  const stock = Number(body.stock ?? 0)

  // ── NORMALISATION PIPELINE ─────────────────────────────────────────────────

  const normalized_name = normalizeCompanyName(company)
  const slug = normalized_name.replace(/\s+/g, '-')

  // Find or create Company record
  let companyRecord = await prisma.company.findUnique({
    where: { slug },
  })

  if (!companyRecord) {
    // Try by normalized_name in case slug differs
    companyRecord = await prisma.company.findFirst({
      where: { normalized_name },
    })
  }

  if (!companyRecord) {
    companyRecord = await prisma.company.create({
      data: {
        name: company.trim(),
        slug,
        normalized_name,
        industry: null,
        headquarters: null,
      },
    })
  }

  // ── ALWAYS recompute total_compensation — NEVER trust client value ──────────
  const total_compensation = base_salary + (bonus || 0) + (stock || 0)

  // ── DUPLICATE CHECK ────────────────────────────────────────────────────────
  // Same company + role + level + location, base_salary within 10%, submitted in last 48h
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const lower = base_salary * 0.9
  const upper = base_salary * 1.1

  const duplicate = await prisma.salary.findFirst({
    where: {
      company_id: companyRecord.id,
      role: { equals: role, mode: 'insensitive' },
      level: level as any,
      location: { equals: location, mode: 'insensitive' },
      base_salary: { gte: BigInt(Math.floor(lower)), lte: BigInt(Math.ceil(upper)) },
      submitted_at: { gte: fortyEightHoursAgo },
    },
  })

  if (duplicate) {
    return NextResponse.json(
      {
        error: true,
        field: 'duplicate',
        message: 'A similar record for this company/role/level/location was submitted in the last 48 hours. Duplicate detected.',
        existing_id: duplicate.id,
      },
      { status: 409 }
    )
  }

  // ── STORE RECORD ────────────────────────────────────────────────────────────
  const salary = await prisma.salary.create({
    data: {
      company_id: companyRecord.id,
      role,
      level: level as any,
      location,
      currency: currency as any,
      experience_years,
      base_salary: BigInt(Math.round(base_salary)),
      bonus: BigInt(Math.round(bonus)),
      stock: BigInt(Math.round(stock)),
      total_compensation: BigInt(Math.round(total_compensation)), // COMPUTED server-side
      source: source as any,
      confidence_score,
      is_verified: false,
    },
    include: { company: true },
  })

  // Serialize BigInt for JSON response
  const serialized = JSON.parse(
    JSON.stringify(salary, (_, v) => (typeof v === 'bigint' ? Number(v) : v))
  )

  return NextResponse.json(serialized, { status: 201 })
}
