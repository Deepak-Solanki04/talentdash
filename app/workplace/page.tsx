import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Workplace Index & Company Rankings | TalentDash',
  description: 'Explore the top companies to work for based on verified data. Rankings for overall best workplaces, top paying companies, best work-life balance, and more.',
  alternates: { canonical: 'https://talentdash.in/workplace' },
}

// Mock Data
const RANKINGS = [
  {
    title: 'Top 100 Companies', subtitle: 'Overall', icon: '💼', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    companies: [{ rank: 1, id: 'google', name: 'Google' }, { rank: 2, id: 'microsoft', name: 'Microsoft' }, { rank: 3, id: 'apple', name: 'Apple' }]
  },
  {
    title: 'Top 100 Companies', subtitle: 'for Millennials', icon: '👥', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100',
    companies: [{ rank: 1, id: 'google', name: 'Google' }, { rank: 2, id: 'microsoft', name: 'Microsoft' }, { rank: 3, id: 'netflix', name: 'Netflix' }]
  },
  {
    title: 'Top 100 Companies', subtitle: 'for Gen Z', icon: '🚀', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
    companies: [{ rank: 1, id: 'nvidia', name: 'NVIDIA' }, { rank: 2, id: 'google', name: 'Google' }, { rank: 3, id: 'spotify', name: 'Spotify' }]
  },
  {
    title: 'Top 100 Best Paying', subtitle: 'Companies', icon: '💰', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
    companies: [{ rank: 1, id: 'nvidia', name: 'NVIDIA' }, { rank: 2, id: 'google', name: 'Google' }, { rank: 3, id: 'microsoft', name: 'Microsoft' }]
  },
  {
    title: 'Top 100 for', subtitle: 'Work-Life Balance', icon: '⚖️', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    companies: [{ rank: 1, id: 'salesforce', name: 'Salesforce' }, { rank: 2, id: 'microsoft', name: 'Microsoft' }, { rank: 3, id: 'sap', name: 'SAP' }]
  },
  {
    title: 'Top 100 Most Loved', subtitle: 'Workplaces', icon: '❤️', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100',
    companies: [{ rank: 1, id: 'salesforce', name: 'Salesforce' }, { rank: 2, id: 'hubspot', name: 'HubSpot' }, { rank: 3, id: 'intuit', name: 'Intuit' }]
  }
]

const INDUSTRIES = [
  { name: 'IT Services', icon: '💻', color: 'text-indigo-600', bg: 'bg-indigo-50', logos: ['tcs', 'infosys', 'wipro'] },
  { name: 'BFSI', icon: '🏦', color: 'text-blue-600', bg: 'bg-blue-50', logos: ['hdfcbank', 'icicibank', 'sbi'] },
  { name: 'FMCG', icon: '🛒', color: 'text-green-600', bg: 'bg-green-50', logos: ['unilever', 'nestle', 'pg'] },
  { name: 'Consumer Services', icon: '🛍️', color: 'text-rose-600', bg: 'bg-rose-50', logos: ['zomato', 'swiggy', 'urbancompany'] },
  { name: 'E-Commerce', icon: '📦', color: 'text-orange-600', bg: 'bg-orange-50', logos: ['amazon', 'flipkart', 'myntra'] },
  { name: 'Healthcare', icon: '🏥', color: 'text-teal-600', bg: 'bg-teal-50', logos: ['apollohospitals', 'fortishealthcare', 'maxhealthcare'] },
  { name: 'Travel & Hospitality', icon: '✈️', color: 'text-sky-600', bg: 'bg-sky-50', logos: ['makemytrip', 'oyorooms', 'ihg'] },
  { name: 'Manufacturing', icon: '🏭', color: 'text-slate-600', bg: 'bg-slate-50', logos: ['tatamotors', 'mahindra', 'ril'] },
]

export default function WorkplaceIndexPage() {
  return (
    <div className="bg-[#F7F7F7] min-h-screen pb-16">
      
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">🏆</div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Workplace Index</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight mb-3">
                TalentDash Workplace Index
              </h1>
              <p className="text-[#717171] font-medium max-w-2xl text-sm sm:text-base">
                Data-driven rankings of companies, industries and workplaces based on what professionals value the most.
              </p>
            </div>
            <Link href="/workplace" className="shrink-0 px-5 py-2.5 bg-white border border-[#EBEBEB] text-[#222222] text-sm font-bold rounded-lg shadow-sm hover:bg-[#FAFAFA] transition-all">
              Explore all rankings →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        {/* ── Global Stats ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-lg shrink-0">📊</div>
            <div>
              <div className="text-lg font-bold text-[#222222] mb-0.5">500+</div>
              <div className="text-xs font-bold text-[#484848] mb-0.5">Companies ranked</div>
              <div className="text-[11px] font-medium text-[#9CA3AF]">Across 50+ countries</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-lg shrink-0">🛡️</div>
            <div>
              <div className="text-lg font-bold text-[#222222] mb-0.5">15M+</div>
              <div className="text-xs font-bold text-[#484848] mb-0.5">Verified data points</div>
              <div className="text-[11px] font-medium text-[#9CA3AF]">From real professionals</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-lg shrink-0">⭐</div>
            <div>
              <div className="text-lg font-bold text-[#222222] mb-0.5">30+</div>
              <div className="text-xs font-bold text-[#484848] mb-0.5">Ranking categories</div>
              <div className="text-[11px] font-medium text-[#9CA3AF]">Updated monthly</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg shrink-0">🔍</div>
            <div>
              <div className="text-lg font-bold text-[#222222] mb-0.5">100%</div>
              <div className="text-xs font-bold text-[#484848] mb-0.5">Transparent methodology</div>
              <div className="text-[11px] font-medium text-[#9CA3AF]">No paid placements</div>
            </div>
          </div>
        </section>

        {/* ── Popular Ranking Lists ─────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-[#222222]">Popular ranking lists</h2>
            <Link href="/workplace" className="text-xs font-bold text-indigo-600 hover:underline">View all rankings →</Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {RANKINGS.map((ranking, idx) => (
              <div key={idx} className="shrink-0 w-[280px] sm:w-[300px] snap-start bg-white rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col hover:shadow-md transition-all">
                
                <div className="p-6 pb-5 flex flex-col items-center border-b border-[#F3F4F6] text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 border ${ranking.bg} ${ranking.color} ${ranking.border}`}>
                    {ranking.icon}
                  </div>
                  <h3 className="font-bold text-[#222222] text-[15px]">{ranking.title}</h3>
                  <div className="text-[13px] text-[#717171]">{ranking.subtitle}</div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-center">
                  {ranking.companies.map((co) => (
                    <div key={co.id} className="flex items-center gap-3 py-2.5">
                      <div className="text-[12px] font-bold text-[#9CA3AF] w-4 text-right">{co.rank}</div>
                      <Image src={`https://logo.clearbit.com/${co.id}.com`} alt={co.name} width={24} height={24} className="w-6 h-6 rounded-md object-contain border border-[#EBEBEB] p-0.5 bg-white shrink-0" />
                      <div className="font-bold text-[#222222] text-[14px] truncate">{co.name}</div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-[#F3F4F6] flex justify-end">
                  <span className="text-[#9CA3AF] text-sm">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Explore by Industry ───────────────────────────────────────────── */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-[#222222]">Explore by industry</h2>
            <Link href="/workplace" className="text-xs font-bold text-indigo-600 hover:underline">View all industries →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDUSTRIES.map((industry) => (
              <div key={industry.name} className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]">
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${industry.bg} ${industry.color}`}>
                    {industry.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#222222] text-[14px] leading-tight">{industry.name}</h3>
                    <div className="text-[11px] text-[#9CA3AF]">Top companies</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {industry.logos.map((logo) => (
                      <Image key={logo} src={`https://logo.clearbit.com/${logo}.com`} alt={logo} width={24} height={24} className="w-6 h-6 rounded border border-[#F3F4F6] object-contain p-0.5 bg-white" />
                    ))}
                  </div>
                  <span className="text-[#9CA3AF] text-sm">→</span>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ── Trust Banner ──────────────────────────────────────────────────── */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-4 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xl">🏆</span>
              <span className="text-[13px] font-bold text-[#222222]">Rankings you can trust</span>
            </div>
            <div className="h-4 w-px bg-indigo-200 hidden sm:block shrink-0"></div>
            <div className="flex items-center gap-4 shrink-0 text-[11px] font-medium text-[#484848]">
              <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Verified data only</span>
              <span className="flex items-center gap-1"><span className="text-green-500">✓</span> No paid placements</span>
              <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Updated monthly</span>
              <span className="flex items-center gap-1"><span className="text-green-500">✓</span> Transparent methodology</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
            <div className="flex -space-x-2">
              {['man', 'woman', 'man2', 'woman2'].map((n, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-indigo-200 border-2 border-indigo-50 overflow-hidden text-[12px] flex items-center justify-center">👤</div>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-[#717171]">Backed by 15M+ verified professionals globally</span>
          </div>
        </div>

      </div>
    </div>
  )
}
