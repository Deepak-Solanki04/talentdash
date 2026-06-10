'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SearchOption = {
  type: 'company' | 'role'
  name: string
  slug: string
}

export default function HeroSearch({ options, locations }: { options: SearchOption[], locations: string[] }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const normalizedQuery = query.toLowerCase().trim()
  const filtered = normalizedQuery === '' 
    ? [] 
    : options.filter(o => {
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

  const handleSelect = (option: SearchOption) => {
    setQuery('')
    setIsFocused(false)
    let url = option.type === 'company' ? `/companies/${option.slug}` : `/salaries?role=${option.slug}`
    if (location) url += url.includes('?') ? `&location=${location}` : `?location=${location}`
    if (experience) url += url.includes('?') ? `&exp=${experience}` : `?exp=${experience}`
    router.push(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() !== '' && filtered.length > 0) {
      handleSelect(filtered[0])
    } else if (query.trim() !== '' || location || experience) {
      const params = new URLSearchParams()
      if (query.trim() !== '') params.append('company', query.trim())
      if (location) params.append('location', location)
      if (experience) params.append('exp', experience)
      router.push(`/salaries?${params.toString()}`)
    }
  }

  const TABS = [
    { name: 'Salaries', icon: '💰', active: true },
    { name: 'Reviews', icon: '⭐', active: false },
    { name: 'Interviews', icon: '💬', active: false },
    { name: 'Forum', icon: '👥', active: false },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto z-20">
      <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative" ref={dropdownRef}>
        
        {/* Tabs */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {TABS.map(tab => (
            <button key={tab.name} className="flex items-center gap-2 pb-2 px-2 relative" style={{ color: tab.active ? '#FF5A5F' : '#717171' }}>
              <span className="text-lg">{tab.icon}</span>
              <span className={`text-sm ${tab.active ? 'font-bold' : 'font-medium'}`}>{tab.name}</span>
              {tab.active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#FF5A5F' }} />
              )}
            </button>
          ))}
        </div>

        {/* Search Inputs Container */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center border rounded-full transition-all" style={{ borderColor: isFocused ? '#FF5A5F' : '#E5E7EB', outlineColor: 'transparent' }}>
          
          {/* 1. Primary Search */}
          <div className="flex-1 w-full flex items-center pl-6 pr-4 py-3 relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <div className="flex flex-col w-full">
              <input
                type="text"
                className="w-full bg-transparent focus:outline-none font-medium placeholder-gray-400"
                style={{ color: '#222222', fontSize: '15px' }}
                placeholder="Search by job title, skill or company"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsFocused(true)
                }}
                onFocus={() => setIsFocused(true)}
              />
              <span className="text-[11px] text-gray-400 mt-0.5 hidden md:block">e.g. Software Engineer, Data Analyst</span>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-200 shrink-0" />

          {/* 2. Location */}
          <div className="w-full md:w-56 flex items-center px-4 py-3 relative border-t md:border-t-0 border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div className="flex flex-col w-full">
              <select
                className="w-full bg-transparent focus:outline-none font-medium appearance-none cursor-pointer"
                style={{ color: location ? '#222222' : '#9CA3AF', fontSize: '15px' }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Location</option>
                {locations.map(l => <option key={l} value={l} style={{ color: '#222' }}>{l}</option>)}
              </select>
              <span className="text-[11px] text-gray-400 mt-0.5 hidden md:block">e.g. Bangalore, Remote</span>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-200 shrink-0" />

          {/* 3. Experience */}
          <div className="w-full md:w-56 flex items-center pl-4 pr-2 py-2 relative border-t md:border-t-0 border-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <div className="flex flex-col w-full">
              <select
                className="w-full bg-transparent focus:outline-none font-medium appearance-none cursor-pointer"
                style={{ color: experience ? '#222222' : '#9CA3AF', fontSize: '15px' }}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Experience</option>
                <option value="0-2" style={{ color: '#222' }}>0-2 years</option>
                <option value="3-5" style={{ color: '#222' }}>3-5 years</option>
                <option value="6-9" style={{ color: '#222' }}>6-9 years</option>
                <option value="10+" style={{ color: '#222' }}>10+ years</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-0.5 hidden md:block">e.g. 0-2 years</span>
            </div>
            
            <button 
              type="submit" 
              className="ml-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 shrink-0 hidden md:block"
              style={{ background: '#FF5A5F', fontSize: '15px' }}
            >
              Search
            </button>
          </div>
          
          <button 
            type="submit" 
            className="w-[calc(100%-2rem)] mx-4 mb-4 mt-2 py-3.5 rounded-full font-bold text-white transition-all hover:opacity-90 block md:hidden"
            style={{ background: '#FF5A5F', fontSize: '15px' }}
          >
            Search
          </button>
        </form>

        {/* Autocomplete Dropdown */}
        {isFocused && filtered.length > 0 && (
          <div className="absolute top-[120px] left-8 right-8 bg-white rounded-xl shadow-xl border overflow-hidden z-30" style={{ borderColor: '#E5E7EB' }}>
            {filtered.map((option, i) => (
              <button
                key={`${option.type}-${option.slug}`}
                onClick={() => handleSelect(option)}
                className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-4 transition-colors"
                style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #F3F4F6' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: option.type === 'company' ? '#F3F4F6' : '#EFF6FF', color: option.type === 'company' ? '#6B7280' : '#3B82F6' }}>
                  {option.type === 'company' ? '🏢' : '💼'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold flex items-center gap-2 truncate" style={{ color: '#222222', fontSize: '15px' }}>
                    <span className="truncate">{option.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0" style={{ background: option.type === 'company' ? '#E5E7EB' : '#DBEAFE', color: option.type === 'company' ? '#4B5563' : '#1D4ED8' }}>
                      {option.type}
                    </span>
                  </div>
                  <div className="text-xs font-medium mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
                    {option.type === 'company' ? 'View salaries & reviews' : 'View global role insights'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
