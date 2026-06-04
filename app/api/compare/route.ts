import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializePrismaRecord } from '@/lib/format'

// GET /api/compare?s1=uuid&s2=uuid
// Returns both salary records + delta object
// Delta = record_1_value minus record_2_value
// Positive = record 1 is higher, Negative = record 2 is higher
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const s1 = searchParams.get('s1')
  const s2 = searchParams.get('s2')

  if (!s1 || !s2) {
    return NextResponse.json(
      { error: true, message: 'Both s1 and s2 query parameters are required' },
      { status: 400 }
    )
  }

  // Return 400 if both IDs are identical
  if (s1 === s2) {
    return NextResponse.json(
      { error: true, message: 's1 and s2 must be different records. Cannot compare a record with itself.' },
      { status: 400 }
    )
  }

  // Fetch both records in parallel
  const [record1, record2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: s1 }, include: { company: true } }),
    prisma.salary.findUnique({ where: { id: s2 }, include: { company: true } }),
  ])

  if (!record1) {
    return NextResponse.json(
      { error: true, message: `Record with id '${s1}' not found` },
      { status: 404 }
    )
  }

  if (!record2) {
    return NextResponse.json(
      { error: true, message: `Record with id '${s2}' not found` },
      { status: 404 }
    )
  }

  // Compute delta: record1 - record2
  // Positive = record1 is higher, Negative = record2 is higher
  const r1 = serializePrismaRecord(record1) as any
  const r2 = serializePrismaRecord(record2) as any

  const delta = {
    base_delta: r1.base_salary - r2.base_salary,
    bonus_delta: r1.bonus - r2.bonus,
    stock_delta: r1.stock - r2.stock,
    tc_delta: r1.total_compensation - r2.total_compensation,
    experience_delta: r1.experience_years - r2.experience_years,
  }

  return NextResponse.json({
    record1: r1,
    record2: r2,
    delta,
  })
}
