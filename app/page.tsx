import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HeroSearch from '@/components/features/HeroSearch'
import { prisma } from '@/lib/db'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'TalentDash — Career Intelligence Platform for India',
  description: 'Structured salary data, company reviews, and interview experiences for Indian tech professionals.',
}

export default async function HomePage() {
  const [companies, rolesData, locationsData] = await Promise.all([
    prisma.company.findMany({ select: { name: true, slug: true }, take: 100 }),
    prisma.salary.findMany({ select: { role: true }, distinct: ['role'] }),
    prisma.salary.findMany({ select: { location: true }, distinct: ['location'] }),
  ])

  const searchOptions = [
    ...companies.map(c => ({ type: 'company' as const, name: c.name, slug: c.slug })),
    ...rolesData.map(r => ({ type: 'role' as const, name: r.role, slug: encodeURIComponent(r.role) }))
  ]
  const locations = locationsData.map(l => l.location)

  return (
    <div className="bg-[#FAFAFA] min-h-screen relative w-full">
      {/* Top right auth buttons */}
      <div className="absolute top-6 right-8 flex items-center gap-4 z-10">
        <button className="text-sm font-medium px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors">Log in</button>
        <button className="text-sm font-bold px-6 py-2 rounded-lg text-white transition-opacity hover:opacity-90" style={{ background: '#FF5A5F' }}>Sign up</button>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 pt-16 pb-20">
        
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative mb-12">
          {/* Background Illustration Placeholder (Red Couch) */}
          <div className="absolute right-0 top-0 w-[400px] h-[300px] opacity-10 pointer-events-none hidden lg:block" style={{ background: 'radial-gradient(circle, #FF5A5F 0%, transparent 70%)' }}></div>
          
          <div className="relative z-10 max-w-2xl pt-4">
            <h1 className="text-5xl font-extrabold mb-4" style={{ color: '#111827', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              Explore. Compare. <span style={{ color: '#FF5A5F' }}>Grow.</span>
            </h1>
            <p className="text-lg mb-10 max-w-lg" style={{ color: '#4B5563', lineHeight: '1.6' }}>
              Discover real salary insights, read reviews, prepare for interviews, and find the right opportunities — all in one place.
            </p>
          </div>

          <div className="w-full relative z-20">
            <HeroSearch options={searchOptions} locations={locations} />
            
            <div className="flex items-center gap-4 mt-4 px-4 text-sm font-medium flex-wrap" style={{ color: '#4B5563' }}>
              <span className="text-gray-400">Trending searches</span>
              {['Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing Manager', 'Remote Jobs'].map(tag => (
                <Link key={tag} href={`/salaries?role=${encodeURIComponent(tag)}`} className="hover:text-[#FF5A5F] transition-colors">{tag}</Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Metrics Row ─────────────────────────────────────────────────── */}
        <section className="flex flex-wrap justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border" style={{ borderColor: '#F3F4F6' }}>
          {[
            { value: '12M+', label: 'Salaries', icon: '💰' },
            { value: '4.8M+', label: 'Reviews', icon: '⭐' },
            { value: '950K+', label: 'Companies', icon: '🏢' },
            { value: '210K+', label: 'Interviews', icon: '💬' },
            { value: '120K+', label: 'Active Community', icon: '👥' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center flex-1 min-w-[120px]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3" style={{ background: '#FFF5F5' }}>{stat.icon}</div>
              <div className="text-2xl font-bold" style={{ color: '#111827' }}>{stat.value}</div>
              <div className="text-xs font-medium uppercase tracking-wide mt-1" style={{ color: '#9CA3AF' }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ── Trust Badges ────────────────────────────────────────────────── */}
        <section className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 px-4">
          {[
            { title: 'Verified & Trusted', desc: 'Real data. Real people.', icon: '🛡️' },
            { title: '10M+ Users', desc: 'Across the globe', icon: '🌍' },
            { title: '500K+ Companies', desc: 'Researched & reviewed', icon: '🏢' },
            { title: '100% Free', desc: 'No hidden charges', icon: '🔓' },
          ].map(badge => (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="text-2xl opacity-80">{badge.icon}</div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#111827' }}>{badge.title}</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>{badge.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ── INTELLIGENCE HUB ────────────────────────────────────────────── */}
        <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#9CA3AF' }}>Intelligence Hub</div>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          {/* Card 1: Compensation */}
          <div className="bg-white p-6 rounded-2xl border flex flex-col justify-between" style={{ borderColor: '#F3F4F6', minHeight: '320px' }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#FFF5F5', color: '#FF5A5F' }}>📊</div>
                <h3 className="font-bold text-base text-gray-900">Compensation Intelligence</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Explore real salary data and compensation trends across roles, companies and cities.</p>
              
              <div className="mb-2">
                <div className="text-xs text-gray-400 font-medium">Average salary in India</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹28.4 <span className="text-sm">LPA</span></span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">↑ 18% vs last year</span>
                </div>
              </div>
            </div>
            
            <div className="relative h-24 mt-4 border-b border-l border-gray-100 pb-2">
              {/* Fake Chart CSS */}
              <div className="absolute bottom-0 left-0 right-0 top-0" style={{ background: 'linear-gradient(180deg, rgba(255,90,95,0.1) 0%, rgba(255,255,255,0) 100%)', clipPath: 'polygon(0 100%, 0 80%, 20% 60%, 40% 70%, 60% 40%, 80% 50%, 100% 20%, 100% 100%)' }}></div>
              <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline points="0,80 20,60 40,70 60,40 80,50 100,20" fill="none" stroke="#FF5A5F" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <circle cx="100" cy="20" r="4" fill="#FF5A5F" />
              </svg>
              <div className="absolute -bottom-5 w-full flex justify-between text-[10px] text-gray-400">
                <span>2021</span><span>2022</span><span>2023</span><span>2024</span><span>2025</span>
              </div>
            </div>
            
            <Link href="/salaries" className="text-sm font-bold text-[#FF5A5F] mt-6 inline-flex items-center gap-1 hover:underline">Explore salaries →</Link>
          </div>

          {/* Card 2: Reviews */}
          <div className="bg-white p-6 rounded-2xl border flex flex-col justify-between" style={{ borderColor: '#F3F4F6', minHeight: '320px' }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#FFF7ED', color: '#F97316' }}>⭐</div>
                <h3 className="font-bold text-base text-gray-900">Company Reviews & Culture</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Read honest reviews and discover what employees really think.</p>
              
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">4.2 <span className="text-orange-400 text-sm">★★★★☆</span></div>
                  <div className="text-xs text-gray-400">Based on 4.8M reviews</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">72%</div>
                  <div className="text-xs text-gray-400">Recommend to a friend</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top rated companies</div>
                <div className="flex gap-3">
                  {['google.com', 'microsoft.com', 'apple.com', 'amazon.com'].map(d => (
                    <Image key={d} src={`https://logo.clearbit.com/${d}`} width={40} height={40} className="w-10 h-10 rounded-xl border p-1" alt="company" />
                  ))}
                  <div className="w-10 h-10 rounded-xl border flex items-center justify-center text-gray-400 text-xs bg-gray-50">+</div>
                </div>
              </div>
            </div>
            <Link href="/companies" className="text-sm font-bold text-[#FF5A5F] mt-6 inline-flex items-center gap-1 hover:underline">Explore companies →</Link>
          </div>

          {/* Card 3: Offers */}
          <div className="bg-white p-6 rounded-2xl border flex flex-col justify-between" style={{ borderColor: '#F3F4F6', minHeight: '280px' }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#F0FDF4', color: '#22C55E' }}>🤝</div>
                <h3 className="font-bold text-base text-gray-900">Offers & Negotiations</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">See real offers, compare packages and negotiate confidently.</p>
              
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="text-2xl font-bold text-gray-900">₹62 <span className="text-sm">LPA</span></div>
                  <div className="text-xs text-gray-400">Highest reported offer</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">63%</div>
                  <div className="text-xs text-gray-400">Received negotiation</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white"></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">Join 120K+ professionals</span>
              </div>
            </div>
            <Link href="/salaries" className="text-sm font-bold text-[#FF5A5F] mt-6 inline-flex items-center gap-1 hover:underline">Explore offers →</Link>
          </div>

          {/* Card 4: Interviews & Community */}
          <div className="bg-white rounded-2xl border grid grid-rows-2" style={{ borderColor: '#F3F4F6', minHeight: '280px' }}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>🎤</div>
                <h3 className="font-bold text-base text-gray-900">Interview Experiences</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Practice real interview questions shared by candidates.</p>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top interview roles</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-50 border px-3 py-1.5 rounded-full text-gray-600">Software Engineer</span>
                    <span className="text-xs bg-gray-50 border px-3 py-1.5 rounded-full text-gray-600">Product Manager</span>
                  </div>
                </div>
                <Link href="/interviews" className="text-sm font-bold text-[#8B5CF6] inline-flex items-center gap-1 hover:underline">Explore interviews →</Link>
              </div>
            </div>
            <div className="p-6 relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#EFF6FF', color: '#3B82F6' }}>👥</div>
                <h3 className="font-bold text-base text-gray-900">Community Discussions</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Join conversations, ask questions and share knowledge.</p>
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-sm font-medium text-gray-800 mb-2">
                "How is the work-life balance at top tech companies?"
              </div>
              <Link href="/community" className="text-sm font-bold text-[#3B82F6] inline-flex items-center gap-1 hover:underline">Explore community →</Link>
            </div>
          </div>

        </section>

        {/* ── Explore by what matters ─────────────────────────────────────── */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Explore by what matters to you</h2>
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {[
            { title: 'Salaries', desc: 'Discover pay by role, location and experience.', color: 'text-green-500', bg: 'bg-green-50', icon: '💰', link: '/salaries' },
            { title: 'Reviews', desc: 'Discover what employees say about companies.', color: 'text-orange-500', bg: 'bg-orange-50', icon: '⭐', link: '/reviews' },
            { title: 'Interviews', desc: 'Practice real questions and ace your interviews.', color: 'text-purple-500', bg: 'bg-purple-50', icon: '🎤', link: '/interviews' },
            { title: 'Jobs', desc: 'Find the right opportunities for your career.', color: 'text-pink-500', bg: 'bg-pink-50', icon: '💼', link: '/jobs' },
            { title: 'Offers', desc: 'Compare offers, understand compensation.', color: 'text-red-500', bg: 'bg-red-50', icon: '🤝', link: '/salaries' },
            { title: 'Community', desc: 'Be a part of conversations that matter.', color: 'text-blue-500', bg: 'bg-blue-50', icon: '👥', link: '/community' },
          ].map(item => (
            <div key={item.title} className="bg-white p-5 rounded-2xl border flex flex-col justify-between" style={{ borderColor: '#F3F4F6', minHeight: '180px' }}>
              <div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-3 ${item.bg} ${item.color}`}>{item.icon}</div>
                <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
              <Link href={item.link} className={`text-xs font-bold ${item.color} hover:underline mt-4`}>Explore {item.title.toLowerCase()} →</Link>
            </div>
          ))}
        </section>

        {/* ── Workplace & Tools ───────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {/* Workplace Index */}
          <div className="bg-white p-6 rounded-2xl border" style={{ borderColor: '#F3F4F6' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#FFF5F5', color: '#FF5A5F' }}>📈</div>
              <h3 className="font-bold text-base text-gray-900">Workplace Index</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Measure and improve workplace experience.</p>
            
            <div className="flex gap-8 mb-6 pb-6 border-b border-gray-100">
              <div>
                <div className="text-2xl font-bold text-gray-900">4.1</div>
                <div className="text-xs text-gray-400">Workplace Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">73%</div>
                <div className="text-xs text-gray-400">Positive Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-xs text-gray-400">Recommend to a friend</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 opacity-70 grayscale">
                <Image src="https://logo.clearbit.com/microsoft.com" width={96} height={24} className="h-6 w-auto" alt="Microsoft" />
                <Image src="https://logo.clearbit.com/google.com" width={96} height={24} className="h-6 w-auto" alt="Google" />
                <Image src="https://logo.clearbit.com/deloitte.com" width={96} height={24} className="h-6 w-auto" alt="Deloitte" />
              </div>
              <Link href="/workplace" className="text-sm font-bold text-[#FF5A5F] hover:underline">Explore Workplace Index →</Link>
            </div>
          </div>

          {/* Tools */}
          <div className="bg-white p-6 rounded-2xl border" style={{ borderColor: '#F3F4F6' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: '#EFF6FF', color: '#3B82F6' }}>🛠️</div>
              <h3 className="font-bold text-base text-gray-900">Tools & Resources</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Free tools to help you plan your career.</p>
            
            <div className="flex justify-between gap-4 mb-6">
              {[
                { label: 'Salary Calculator', icon: '🧮', color: 'text-pink-500', bg: 'bg-pink-50' },
                { label: 'Resume Review', icon: '📄', color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Offer Letter Comparison', icon: '⚖️', color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'Hike Calculator', icon: '📈', color: 'text-green-500', bg: 'bg-green-50' },
              ].map(tool => (
                <div key={tool.label} className="flex flex-col items-center text-center flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 ${tool.bg} ${tool.color}`}>{tool.icon}</div>
                  <div className="text-xs font-medium text-gray-600">{tool.label}</div>
                </div>
              ))}
            </div>
            
            <div className="text-right">
              <Link href="/tools" className="text-sm font-bold text-[#3B82F6] hover:underline">Explore all tools →</Link>
            </div>
          </div>
        </section>

        {/* ── Latest Insights ──────────────────────────────────────────────── */}
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-900">Latest insights from the community</h2>
          <Link href="/community" className="text-sm font-bold text-gray-400 hover:text-gray-900">View all →</Link>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { title: 'How much can a Product Manager make in 2026?', author: 'Aarav Sharma', time: '2h ago', bg: 'bg-pink-50' },
            { title: 'Top skills to learn in AI/ML in 2026', author: 'Neha Patil', time: '5h ago', bg: 'bg-blue-50' },
            { title: 'SDE vs Data Scientist: Which pays more?', author: 'Rahul Verma', time: '1d ago', bg: 'bg-purple-50' },
          ].map(post => (
            <div key={post.title} className="bg-white p-5 rounded-2xl border hover:shadow-sm transition-shadow cursor-pointer flex gap-4" style={{ borderColor: '#F3F4F6' }}>
              <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${post.bg}`}></div>
              <div className="flex flex-col justify-between">
                <h4 className="font-bold text-sm text-gray-900 mb-2 leading-tight">{post.title}</h4>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                  <div className="text-[10px] text-gray-400 font-medium">{post.author} • {post.time}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}
