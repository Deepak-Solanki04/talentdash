import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: '#EBEBEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg"
          style={{ color: '#222222' }}
        >
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: '#FF5A5F' }}
          >
            TD
          </span>
          <span>TalentDash</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/companies" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#484848' }}>Companies</Link>
          <Link href="/salaries" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#484848' }}>Salaries</Link>
          <Link href="/compare" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#484848' }}>Compare</Link>
          <Link href="/tools" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#484848' }}>Tools</Link>
        </div>

        {/* CTA */}
        <Link
          href="/salaries"
          className="btn-primary text-xs px-4 py-2"
        >
          Explore Salaries
        </Link>
      </div>
    </nav>
  )
}
