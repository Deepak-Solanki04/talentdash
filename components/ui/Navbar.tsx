'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Explore', href: '/' },
  { label: 'Compare', href: '/compare' },
  { label: 'Salaries', href: '/salaries' },
  { label: 'Reviews', href: '/salaries' },
  { label: 'Companies', href: '/companies' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: '#EBEBEB' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base flex-shrink-0"
          style={{ color: '#222222' }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 4.667c2.577 0 4.667 2.09 4.667 4.666C20.667 13.91 18.577 16 16 16s-4.667-2.09-4.667-4.667c0-2.576 2.09-4.666 4.667-4.666zM16 25.333a10.667 10.667 0 01-8.148-3.8C7.905 19.52 12.04 18 16 18s8.094 1.52 8.148 3.533A10.667 10.667 0 0116 25.333z" fill="#FF5A5F"/>
          </svg>
          <span>TalentDash</span>
        </Link>

        {/* Nav links — centered */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={label}
                href={href}
                className="relative px-3 py-1.5 text-sm font-medium transition-colors duration-150 rounded-md hover:bg-gray-50"
                style={{ color: isActive ? '#222222' : '#717171' }}
              >
                {label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                    style={{ background: '#FF5A5F' }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right: Search + Sign in */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full border cursor-pointer hover:shadow-sm transition-shadow"
            style={{ borderColor: '#EBEBEB', background: '#fff', minWidth: '220px' }}>
            <svg width="14" height="14" fill="none" stroke="#717171" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize: '13px', color: '#717171' }}>Search companies, roles, locations...</span>
          </div>

          {/* Sign in */}
          <button
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
            style={{ color: '#222222', borderColor: '#EBEBEB' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </nav>
  )
}
