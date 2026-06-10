'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Companies', href: '/companies', icon: '🏢' },
    { label: 'Salaries', href: '/salaries', icon: '💰' },
    { label: 'Reviews', href: '/reviews', icon: '⭐' },
    { label: 'Interviews', href: '/interviews', icon: '💬' },
    { label: 'Jobs', href: '/jobs', icon: '💼' },
    { label: 'Community', href: '/community', icon: '👥' },
    { label: 'Tools', href: '/tools', icon: '🛠️' },
    { label: 'Workplace index', href: '/workplace', icon: '📊' },
  ]

  const bottomItems = [
    { label: 'Saved', href: '/saved', icon: '♡' },
    { label: 'Compare', href: '/compare', icon: '⇄' },
  ]

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 border-r bg-white flex flex-col z-50" style={{ borderColor: '#F3F4F6' }}>
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: '#222222', textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: '#FF5A5F' }}>
            {/* Simple logo approximation */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          TalentDash
        </Link>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: isActive ? '#FFF0F0' : 'transparent',
                color: isActive ? '#FF5A5F' : '#484848',
                textDecoration: 'none'
              }}
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Bottom Nav */}
      <div className="px-4 py-4 border-t flex flex-col gap-1" style={{ borderColor: '#F3F4F6' }}>
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: '#484848', textDecoration: 'none' }}
          >
            <span className="text-lg opacity-80">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {/* Go Pro Card */}
        <div className="mt-4 p-4 rounded-2xl" style={{ background: '#FFF5F5' }}>
          <h4 className="font-bold text-sm mb-1" style={{ color: '#222222' }}>Go Pro</h4>
          <p className="text-xs mb-3" style={{ color: '#717171', lineHeight: '1.4' }}>
            Unlock full access to salaries, reviews & insights.
          </p>
          <button className="w-full py-2 rounded-lg text-white font-bold text-xs" style={{ background: '#FF5A5F' }}>
            View Plans
          </button>
        </div>

        {/* User / Sign in */}
        <div className="mt-4 px-2 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm font-medium" style={{ color: '#484848' }}>
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</span>
            Sign in
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            ☀️
          </button>
        </div>
      </div>
    </aside>
  )
}
