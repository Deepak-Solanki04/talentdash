'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type CompanyOption = {
  name: string
  slug: string
}

export default function CompanyHeroSearch({ companies }: { companies: CompanyOption[] }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const normalizedQuery = query.toLowerCase().trim()
  const filtered = normalizedQuery === '' 
    ? [] 
    : companies.filter(o => {
        const normalizedName = o.name.toLowerCase()
        return normalizedName.includes(normalizedQuery) || 
               (normalizedName.length >= 2 && normalizedQuery.startsWith(normalizedName))
      }).slice(0, 6)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: CompanyOption) => {
    setQuery('')
    setIsFocused(false)
    router.push(`/companies/${option.slug}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filtered.length > 0) {
      handleSelect(filtered[0])
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto z-20 relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative transition-all">
        <div className="absolute left-6 top-1/2 -translate-y-1/2">
          <svg width="20" height="20" fill="none" stroke="#9CA3AF" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search for a company..."
          className="w-full pl-14 pr-6 py-4 text-base rounded-full border outline-none transition-all bg-white"
          style={{
            borderColor: isFocused ? '#FF5A5F' : '#E5E7EB',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            fontSize: '16px',
            color: '#222222',
          }}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsFocused(true)
          }}
          onFocus={() => setIsFocused(true)}
        />
      </form>

      {/* Autocomplete Dropdown */}
      {isFocused && filtered.length > 0 && (
        <div className="absolute top-[70px] left-0 right-0 bg-white rounded-2xl shadow-xl border overflow-hidden z-30" style={{ borderColor: '#E5E7EB' }}>
          {filtered.map((option, i) => (
            <button
              key={option.slug}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-4 transition-colors"
              style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #F3F4F6' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                🏢
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold flex items-center gap-2 truncate" style={{ color: '#222222', fontSize: '15px' }}>
                  <span className="truncate">{option.name}</span>
                </div>
                <div className="text-xs font-medium mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
                  View salaries & reviews
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
