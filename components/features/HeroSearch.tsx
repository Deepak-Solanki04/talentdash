'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SearchOption = {
  type: 'company' | 'role'
  name: string
  slug: string
}

export default function HeroSearch({ options }: { options: SearchOption[] }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim() === '' 
    ? [] 
    : options.filter(o => o.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: SearchOption) => {
    setQuery('')
    setIsFocused(false)
    if (option.type === 'company') {
      router.push(`/companies/${option.slug}`)
    } else {
      router.push(`/salaries?role=${option.slug}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filtered.length > 0) {
      handleSelect(filtered[0])
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto mb-8 w-full z-20" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          className="w-full pl-14 pr-32 py-4 rounded-2xl border bg-white focus:outline-none transition-all"
          style={{ 
            borderColor: isFocused ? '#FF5A5F' : '#E5E7EB',
            boxShadow: isFocused ? '0 10px 25px -5px rgba(255, 90, 95, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            fontSize: '16px',
            color: '#222222',
            outlineColor: 'transparent'
          }}
          placeholder="Search for a company (e.g. Google, Amazon)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsFocused(true)
          }}
          onFocus={() => setIsFocused(true)}
        />
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button 
            type="submit" 
            className="px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#FF5A5F', fontSize: '14px' }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isFocused && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border overflow-hidden z-30" style={{ borderColor: '#E5E7EB' }}>
          {filtered.map((option, i) => (
            <button
              key={`${option.type}-${option.slug}`}
              onClick={() => handleSelect(option)}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-4 transition-colors"
              style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #F3F4F6' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: option.type === 'company' ? '#F3F4F6' : '#EFF6FF', color: option.type === 'company' ? '#6B7280' : '#3B82F6' }}>
                {option.type === 'company' ? '🏢' : '💼'}
              </div>
              <div>
                <div className="font-bold flex items-center gap-2" style={{ color: '#222222', fontSize: '15px' }}>
                  {option.name}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase" style={{ background: option.type === 'company' ? '#E5E7EB' : '#DBEAFE', color: option.type === 'company' ? '#4B5563' : '#1D4ED8' }}>
                    {option.type}
                  </span>
                </div>
                <div className="text-xs font-medium mt-0.5" style={{ color: '#9CA3AF' }}>
                  {option.type === 'company' ? 'View salaries & reviews' : 'View global role insights'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
