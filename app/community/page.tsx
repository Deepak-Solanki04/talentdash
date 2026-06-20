import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tech Community & Discussions | TalentDash',
  description: 'Join real conversations with verified tech professionals. Discuss salaries, work culture, interview prep, and career advice across top companies.',
  alternates: { canonical: 'https://talentdash.in/community' },
}

// Mock Data
const TRENDING_DISCUSSIONS = [
  { id: 1, company: 'amazon', title: 'Amazon appraisal discussion 2026', tag: 'Trending', tagColor: 'text-orange-600 bg-orange-50', replies: 312, time: '2h ago', users: ['amazon'] },
  { id: 2, company: 'google', title: 'Google hiring freeze impact on offers?', tag: 'Hot', tagColor: 'text-green-600 bg-green-50', replies: 245, time: '3h ago', users: ['google'] },
  { id: 3, icon: '🤖', bg: 'bg-blue-50', color: 'text-blue-600', title: 'Best companies for GenAI engineers', tag: 'Hot', tagColor: 'text-green-600 bg-green-50', replies: 189, time: '4h ago', users: ['microsoft', 'meta'] },
  { id: 4, icon: '🏠', bg: 'bg-purple-50', color: 'text-purple-600', title: 'Remote work vs office in 2026', tag: 'Trending', tagColor: 'text-orange-600 bg-orange-50', replies: 156, time: '6h ago', users: ['google', 'amazon'] },
  { id: 5, icon: '₹', bg: 'bg-rose-50', color: 'text-rose-600', title: '2026 PM salaries in India', tag: 'Hot', tagColor: 'text-green-600 bg-green-50', replies: 278, time: '8h ago', users: ['flipkart', 'google'] },
  { id: 6, icon: '🚀', bg: 'bg-indigo-50', color: 'text-indigo-600', title: 'Startup layoffs megathread', tag: 'Hot', tagColor: 'text-green-600 bg-green-50', replies: 512, time: '10h ago', users: ['swiggy', 'zomato'] },
]

const TRENDING_NOW = [
  { id: '01', company: 'amazon', title: 'Amazon SDE-2 salary hike 2026 — What are you expecting?', replies: 189, time: '1h ago', tag: 'Hot', tagColor: 'text-green-600 bg-green-50' },
  { id: '02', company: 'google', title: 'Google L4 hiring bar — Is it really that high in 2026?', replies: 156, time: '2h ago', tag: 'Hot', tagColor: 'text-green-600 bg-green-50' },
  { id: '03', company: 'microsoft', title: 'Microsoft return to office mandate — How\'s it going?', replies: 132, time: '3h ago', tag: 'Trending', tagColor: 'text-orange-600 bg-orange-50' },
  { id: '04', company: 'meta', title: 'Meta E5 performance review experiences', replies: 98, time: '4h ago', tag: 'Trending', tagColor: 'text-orange-600 bg-orange-50' },
  { id: '05', company: 'apple', title: 'Apple PM salary band leaked — Real numbers?', replies: 87, time: '5h ago', tag: 'Hot', tagColor: 'text-green-600 bg-green-50' },
]

const POPULAR_COMMUNITIES = [
  { id: 1, name: 'Software Engineering', members: '128K members', icon: '</>', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 2, name: 'Product Management', members: '98K members', icon: '📦', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 3, name: 'Data Science', members: '76K members', icon: '📊', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 4, name: 'MBA / Business', members: '54K members', icon: '💼', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 5, name: 'Startups', members: '42K members', icon: '🚀', color: 'text-indigo-600', bg: 'bg-indigo-50' },
]

const TOP_CONTRIBUTORS = [
  { id: '01', name: 'Arjun R.', tag: 'Top 1%', replies: '2.4K replies', avatar: 'bg-amber-100', emoji: '👨' },
  { id: '02', name: 'Priya S.', tag: 'Top 1%', replies: '1.8K replies', avatar: 'bg-rose-100', emoji: '👩' },
  { id: '03', name: 'Karthik M.', tag: 'Top 1%', replies: '1.2K replies', avatar: 'bg-blue-100', emoji: '👨‍𱟰' },
  { id: '04', name: 'Neha T.', tag: 'Top 1%', replies: '980 replies', avatar: 'bg-emerald-100', emoji: '👩‍𱟰' },
  { id: '05', name: 'Rohit P.', tag: 'Top 1%', replies: '875 replies', avatar: 'bg-purple-100', emoji: '👨' },
]

export default function CommunityPage() {
  return (
    <div className="bg-[#F7F7F7] min-h-screen pb-16">
      
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">👥</div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Community</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight mb-3">
                What professionals are discussing
              </h1>
              <p className="text-[#717171] font-medium max-w-2xl text-sm sm:text-base">
                Real conversations. Real insights. From verified professionals.
              </p>
            </div>
            <Link href="/community" className="shrink-0 px-5 py-2.5 bg-white border border-[#EBEBEB] text-[#222222] text-sm font-bold rounded-lg shadow-sm hover:bg-[#FAFAFA] transition-all">
              View all discussions →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        {/* ── Trending Discussions Horizontal Scroll ─────────────────────────── */}
        <section className="mb-10">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {TRENDING_DISCUSSIONS.map((d) => (
              <div key={d.id} className="shrink-0 w-[300px] snap-start bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer">
                
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    {d.company ? (
                      <Image src={`https://logo.clearbit.com/${d.company}.com`} alt={d.company} width={36} height={36} className="w-9 h-9 rounded-lg object-contain border border-[#EBEBEB] p-1 shrink-0 bg-white" />
                    ) : (
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${d.bg} ${d.color}`}>
                        {d.icon}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-[#222222] text-[14px] leading-snug line-clamp-2">{d.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${d.tagColor}`}>
                      {d.tag === 'Trending' ? '🔥 ' : '⚡ '} {d.tag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB] mt-auto">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[#717171]">
                    <span className="text-[#484848] font-bold">{d.replies} replies</span>
                    <span>·</span>
                    <span>{d.time}</span>
                  </div>
                  <div className="flex -space-x-1">
                    {d.users.map((c, i) => (
                      <Image key={i} src={`https://logo.clearbit.com/${c}.com`} alt={c} width={16} height={16} className="w-4 h-4 rounded-full border border-[#EBEBEB] object-contain bg-white bg-clip-padding" />
                    ))}
                    <div className="w-4 h-4 rounded-full border border-[#EBEBEB] bg-[#FAFAFA] flex items-center justify-center text-[8px] font-bold text-[#717171]">
                      +{Math.floor(Math.random() * 50) + 10}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ── Three Column Layout ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_300px] gap-6 mb-10">
          
          {/* Column 1: Trending Now */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 p-5 border-b border-[#EBEBEB]">
              <span className="text-orange-500">⚡</span>
              <h2 className="text-[15px] font-bold text-[#222222]">Trending now</h2>
            </div>
            <div className="divide-y divide-[#EBEBEB] flex-1">
              {TRENDING_NOW.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-[#FAFAFA] transition-all cursor-pointer">
                  <div className="text-[13px] font-bold text-[#9CA3AF] shrink-0 w-5 pt-0.5">{item.id}</div>
                  <Image src={`https://logo.clearbit.com/${item.company}.com`} alt={item.company} width={28} height={28} className="w-7 h-7 rounded-lg object-contain border border-[#EBEBEB] p-0.5 shrink-0 bg-white" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#222222] text-[14px] leading-snug mb-1.5">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[#717171]">
                      <span className="text-[#484848] font-bold">{item.replies} replies</span>
                      <span>·</span>
                      <span>{item.time}</span>
                      <span>·</span>
                      <span className="capitalize">{item.company}</span>
                      <span className={`ml-auto sm:ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${item.tagColor}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#EBEBEB] mt-auto">
              <button className="text-[12px] font-bold text-[#717171] hover:text-[#222222] w-full text-center">View all trending discussions →</button>
            </div>
          </div>

          {/* Column 2: Popular Communities */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 p-5 border-b border-[#EBEBEB]">
              <span className="text-yellow-500">⭐</span>
              <h2 className="text-[15px] font-bold text-[#222222]">Popular communities</h2>
            </div>
            <div className="divide-y divide-[#EBEBEB] flex-1 p-2">
              {POPULAR_COMMUNITIES.map((c) => (
                <div key={c.id} className="p-3 flex items-center justify-between gap-3 hover:bg-[#FAFAFA] rounded-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border ${c.bg} ${c.color} border-${c.color.split('-')[1]}-100`}>
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#222222] text-[13px] truncate">{c.name}</div>
                      <div className="text-[11px] text-[#717171] font-medium">{c.members}</div>
                    </div>
                  </div>
                  <button className="shrink-0 px-3 py-1.5 bg-white border border-[#EBEBEB] text-[#222222] text-[11px] font-bold rounded shadow-sm hover:border-[#D1D5DB] transition-all">
                    Join
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#EBEBEB] mt-auto">
              <button className="text-[12px] font-bold text-indigo-600 hover:underline w-full text-center">Explore all communities →</button>
            </div>
          </div>

          {/* Column 3: Top Contributors */}
          <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-2 p-5 border-b border-[#EBEBEB]">
              <span className="text-indigo-500">🏆</span>
              <h2 className="text-[15px] font-bold text-[#222222]">Top contributors</h2>
            </div>
            <div className="divide-y divide-[#EBEBEB] flex-1 p-2">
              {TOP_CONTRIBUTORS.map((c) => (
                <div key={c.id} className="p-3 flex items-center gap-3 hover:bg-[#FAFAFA] rounded-lg transition-all cursor-pointer">
                  <div className="text-[12px] font-bold text-[#9CA3AF] shrink-0 w-4">{c.id}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${c.avatar}`}>
                    {c.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="font-bold text-[#222222] text-[13px] truncate">{c.name}</div>
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px] font-bold shrink-0">
                        {c.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#717171] font-medium">{c.replies}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#EBEBEB] mt-auto">
              <button className="text-[12px] font-bold text-indigo-600 hover:underline w-full text-center">See all contributors →</button>
            </div>
          </div>

        </div>

        {/* ── Share CTA Banner ───────────────────────────────────────────────── */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -left-4 -bottom-4 w-32 h-32 opacity-10 pointer-events-none">
             <svg viewBox="0 0 100 100" fill="currentColor" className="text-indigo-600"><path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm20.8 35.8l-26.6 26.6c-1.5 1.5-3.9 1.5-5.4 0l-12.2-12.2c-1.5-1.5-1.5-3.9 0-5.4 1.5-1.5 3.9-1.5 5.4 0l9.5 9.5 23.9-23.9c1.5-1.5 3.9-1.5 5.4 0 1.5 1.5 1.5 3.9 0 5.4z"/></svg>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-indigo-600 flex items-center justify-center text-2xl shadow-sm shrink-0">
              💬
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#222222] mb-1">Share your experience. Help millions make better career decisions.</h2>
              <p className="text-[13px] text-[#484848] font-medium">Join 85K+ professionals contributing anonymously.</p>
            </div>
          </div>
          
          <button className="relative z-10 shrink-0 w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-[14px] font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Start a discussion
          </button>
        </div>

      </div>
    </div>
  )
}
