import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found | TalentDash',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="mb-3" style={{ fontSize: '36px' }}>Page Not Found</h1>
      <p className="mb-8" style={{ color: '#484848' }}>
        The page or company you&apos;re looking for doesn&apos;t exist in our database yet.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/salaries" className="btn-primary">
          Browse Salaries
        </Link>
        <Link href="/companies" className="btn-ghost">
          View Companies
        </Link>
      </div>
    </div>
  )
}
