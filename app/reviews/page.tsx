import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Company Reviews — Real Professionals, Honest Insights | TalentDash',
  description: 'Read and explore millions of verified employee reviews. Discover insights about work culture, salaries, management, and work-life balance at top companies.',
  alternates: { canonical: 'https://talentdash.in/reviews' },
}

// Mock Data
const TOP_RATED = [
  { id: 'google', name: 'Google', rating: 4.3, reviews: '12.4K', tags: ['Best Work Culture 2026'], scores: { workLife: 4.6, comp: 4.4, culture: 4.2 } },
  { id: 'microsoft', name: 'Microsoft', rating: 4.2, reviews: '9.8K', tags: ['Top Companies 2026'], scores: { workLife: 4.4, comp: 4.3, culture: 4.1 } },
  { id: 'apple', name: 'Apple', rating: 4.1, reviews: '6.7K', tags: ['Most Loved Workplace'], scores: { workLife: 4.3, comp: 4.2, culture: 4.0 } },
  { id: 'amazon', name: 'Amazon', rating: 3.8, reviews: '14.2K', tags: ['Trending Choice'], scores: { workLife: 3.9, comp: 3.8, culture: 3.7 } },
]

const LATEST_REVIEWS = [
  {
    companyId: 'google', companyName: 'Google', role: 'Software Engineer', location: 'Bengaluru', rating: 4.3, time: '2h ago',
    title: 'Great learning culture, amazing colleagues, strong brand value.',
    scores: { workLife: 4.6, comp: 4.4, culture: 4.2 }
  },
  {
    companyId: 'microsoft', companyName: 'Microsoft', role: 'Product Manager', location: 'Hyderabad', rating: 4.2, time: '5h ago',
    title: 'Work-life balance, great benefits, supportive management.',
    scores: { workLife: 4.3, comp: 4.3, culture: 4.1 }
  },
  {
    companyId: 'amazon', companyName: 'Amazon', role: 'SDE II', location: 'Bengaluru', rating: 3.8, time: '8h ago',
    title: 'High compensation, career growth opportunities.',
    scores: { workLife: 3.9, comp: 3.8, culture: 3.7 }
  },
]

const TAGS = [
  'Great work culture', 'Learning & growth', 'Good WLB', 'Supportive management', 'High compensation',
  'Innovative projects', 'Career growth', 'Flexible work', 'Inclusive environment', 'Strong brand value', 'Job security'
]

// Score bar helper
function ScoreBar({ label, score }: { label: string, score: number }) {
  const percentage = (score / 5) * 100
  return (
    <div className="flex items-center gap-2 mb-1.5 text-[11px]">
      <span className="w-24 text-[#717171]">{label}</span>
      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="w-6 text-right font-medium text-[#222222]">{score.toFixed(1)}</span>
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <div className="bg-[#F7F7F7] min-h-screen pb-16">
      
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">⭐</div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Company Reviews</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight mb-3">
                Real reviews from real professionals
              </h1>
              <p className="text-[#717171] font-medium max-w-2xl text-sm sm:text-base">
                Discover honest insights about companies, work culture, salaries, and more.
              </p>
            </div>
            <Link href="/companies" className="shrink-0 px-5 py-2.5 bg-white border border-[#EBEBEB] text-[#222222] text-sm font-bold rounded-lg shadow-sm hover:bg-[#FAFAFA] transition-all">
              Explore all reviews →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        {/* ── Global Stats ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-lg shrink-0">💬</div>
            <div>
              <div className="text-xl font-bold text-[#222222] mb-0.5">2.4M+</div>
              <div className="text-xs font-medium text-[#717171] leading-tight">Reviews<br/>from verified professionals</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-lg shrink-0">🏢</div>
            <div>
              <div className="text-xl font-bold text-[#222222] mb-0.5">14.7K+</div>
              <div className="text-xs font-medium text-[#717171] leading-tight">Companies<br/>reviewed across industries</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-lg shrink-0">⭐</div>
            <div>
              <div className="text-xl font-bold text-[#222222] mb-0.5">4.1★</div>
              <div className="text-xs font-medium text-[#717171] leading-tight">Average rating<br/>across all companies</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg shrink-0">👥</div>
            <div>
              <div className="text-xl font-bold text-[#222222] mb-0.5">96%</div>
              <div className="text-xs font-medium text-[#717171] leading-tight">Verified reviews<br/>from real professionals</div>
            </div>
          </div>
        </section>

        {/* ── Top Rated Companies ────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-[#222222]">Top rated companies</h2>
            <Link href="/companies" className="text-xs font-bold text-[#FF5A5F] hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOP_RATED.map(company => (
              <Link key={company.id} href={`/companies/${company.id}`} className="block bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-3 mb-4">
                  <Image src={`https://logo.clearbit.com/${company.id}.com`} alt={company.name} width={40} height={40} className="w-10 h-10 rounded-xl object-contain border border-[#EBEBEB] p-1" />
                  <div>
                    <h3 className="font-bold text-[#222222] text-sm">{company.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-[#222222]">{company.rating.toFixed(1)}</span>
                      <span className="text-orange-400">★</span>
                      <span className="text-[#9CA3AF]">({company.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <ScoreBar label="Work Life" score={company.scores.workLife} />
                  <ScoreBar label="Comp & Benefits" score={company.scores.comp} />
                  <ScoreBar label="Culture" score={company.scores.culture} />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {company.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                      🏆 {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Two Column Content ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          
          {/* Left Col: Latest Reviews & Tag Cloud */}
          <div className="flex flex-col gap-8">
            
            {/* Tag Cloud */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-bold text-[#222222]">What professionals say</h2>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex flex-wrap gap-2">
                {TAGS.map((tag, i) => (
                  <button key={tag} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${i < 3 ? 'bg-blue-50 text-blue-700 border-blue-100' : i < 6 ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-[#FAFAFA] text-[#484848] border-[#EBEBEB] hover:bg-gray-100'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Latest Reviews Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-bold text-[#222222]">Latest reviews</h2>
                <button className="text-xs font-bold text-[#FF5A5F] hover:underline">View all reviews →</button>
              </div>
              
              <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm divide-y divide-[#EBEBEB]">
                {LATEST_REVIEWS.map((review, idx) => (
                  <div key={idx} className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <Image src={`https://logo.clearbit.com/${review.companyId}.com`} alt={review.companyName} width={36} height={36} className="w-9 h-9 rounded-lg object-contain border border-[#EBEBEB] p-1" />
                        <div>
                          <div className="font-bold text-[#222222] text-sm mb-0.5">{review.companyName}</div>
                          <div className="text-[11px] font-medium text-[#717171]">{review.role} · {review.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1 mb-1">
                          <span className="font-bold text-[#222222] text-sm">{review.rating.toFixed(1)}</span>
                          <span className="text-orange-400 text-sm">★</span>
                        </div>
                        <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase">{review.time}</div>
                      </div>
                    </div>
                    
                    <p className="text-[#222222] font-semibold text-[15px] leading-snug mb-4">
                      "{review.title}"
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-medium">
                      <span className="text-[#484848]">Work Life <span className="font-bold text-[#222222] ml-1">{review.scores.workLife}</span></span>
                      <span className="text-[#D1D5DB]">|</span>
                      <span className="text-[#484848]">Comp & Benefits <span className="font-bold text-[#222222] ml-1">{review.scores.comp}</span></span>
                      <span className="text-[#D1D5DB]">|</span>
                      <span className="text-[#484848]">Culture <span className="font-bold text-[#222222] ml-1">{review.scores.culture}</span></span>
                    </div>
                  </div>
                ))}
                
                {/* CTA at bottom of feed */}
                <div className="p-6 bg-[#FAFAFA] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#484848]">Share your experience and help others</span>
                  <button className="px-4 py-2 bg-white border border-[#EBEBEB] text-[#FF5A5F] text-xs font-bold rounded-lg shadow-sm hover:border-[#FF5A5F] transition-all">
                    Write a review
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Review Highlights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#222222]">Review highlights</h2>
              <button className="text-xs font-bold text-[#FF5A5F] hover:underline">View all insights →</button>
            </div>
            
            <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm p-6 sticky top-6">
              
              {/* Fake Tabs */}
              <div className="flex items-center gap-2 mb-6 border-b border-[#EBEBEB] pb-2">
                <span className="text-xs font-bold text-[#FF5A5F] border-b-2 border-[#FF5A5F] pb-2 -mb-[9px]">Work Life</span>
                <span className="text-xs font-semibold text-[#717171] hover:text-[#222222] cursor-pointer pb-2">Comp & Benefits</span>
                <span className="text-xs font-semibold text-[#717171] hover:text-[#222222] cursor-pointer pb-2">Culture</span>
              </div>

              {/* Big Score */}
              <div className="mb-6 p-4 bg-[#F0F9FF] rounded-xl border border-blue-100">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-[#0369A1] leading-none">4.2</span>
                  <span className="text-lg font-bold text-blue-300 leading-none mb-0.5">/5</span>
                </div>
                <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Average Work Life Score</div>
                <div className="flex text-orange-400 text-sm mb-1">★★★★<span className="text-blue-200">★</span></div>
                <div className="text-[10px] font-medium text-blue-600/70">Based on 128K reviews</div>
              </div>

              {/* Trend */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100 mb-8">
                <span className="text-green-600 font-bold">↑ 8%</span>
                <span className="text-xs font-medium text-green-800">vs last quarter</span>
              </div>

              {/* Top Positives */}
              <div className="mb-6">
                <div className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-3">Top positives</div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#484848]"><span className="text-green-500">👍</span> Flexible work hours</div>
                    <span className="font-bold text-[#222222]">28%</span>
                  </li>
                  <li className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#484848]"><span className="text-green-500">👍</span> Good work life balance</div>
                    <span className="font-bold text-[#222222]">24%</span>
                  </li>
                  <li className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#484848]"><span className="text-green-500">👍</span> Supportive team</div>
                    <span className="font-bold text-[#222222]">18%</span>
                  </li>
                </ul>
              </div>

              {/* Top Concerns */}
              <div>
                <div className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-3">Top concerns</div>
                <ul className="space-y-3">
                  <li className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#484848]"><span className="text-red-500">👎</span> Long working hours</div>
                    <span className="font-bold text-[#222222]">32%</span>
                  </li>
                  <li className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#484848]"><span className="text-red-500">👎</span> High work pressure</div>
                    <span className="font-bold text-[#222222]">26%</span>
                  </li>
                  <li className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2 text-[#484848]"><span className="text-red-500">👎</span> Weekend expectations</div>
                    <span className="font-bold text-[#222222]">15%</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
