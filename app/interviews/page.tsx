import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Interview Questions & Experiences | TalentDash',
  description: 'Practice real interview questions shared by verified candidates. Explore interview experiences by company, role, and difficulty to ace your next tech interview.',
  alternates: { canonical: 'https://talentdash.in/interviews' },
}

// Mock Data
const RECENT_QUESTIONS = [
  {
    companyId: 'google', companyName: 'Google', role: 'Software Engineer', time: '2h ago',
    question: 'Given a binary tree, serialize and deserialize it. How would you design the serialization method?',
    tags: ['Algorithms', 'Binary Tree', 'Design'],
    difficulty: 'Easy', answers: 128
  },
  {
    companyId: 'microsoft', companyName: 'Microsoft', role: 'Product Manager', time: '3h ago',
    question: 'How would you improve customer retention for Microsoft 365? Walk me through your approach.',
    tags: ['Product Sense', 'Metrics', 'Strategy'],
    difficulty: 'Medium', answers: 96
  },
  {
    companyId: 'amazon', companyName: 'Amazon', role: 'SDE II', time: '5h ago',
    question: 'Design a rate limiter. How would you handle distributed systems and ensure scalability?',
    tags: ['System Design', 'Scalability', 'API'],
    difficulty: 'Hard', answers: 64
  },
  {
    companyId: 'apple', companyName: 'Apple', role: 'Data Analyst', time: '6h ago',
    question: 'How would you analyze App Store performance and suggest data-driven improvements?',
    tags: ['SQL', 'Analytics', 'Data Visualization'],
    difficulty: 'Medium', answers: 52
  },
  {
    companyId: 'meta', companyName: 'Meta', role: 'Product Designer', time: '7h ago',
    question: 'Redesign the Facebook Events creation flow to improve user engagement. What would you do?',
    tags: ['Product Design', 'UX', 'User Research'],
    difficulty: 'Medium', answers: 41
  },
]

const ROLES = [
  {
    id: 'software-engineer', name: 'Software Engineer', count: '12.4K', icon: '</>', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100',
    latest: 'Implement LRU Cache in O(1) time complexity',
    companies: ['google', 'amazon', 'meta'], moreCompanies: 3, trend: '+18%', trendUp: true
  },
  {
    id: 'product-manager', name: 'Product Manager', count: '8.7K', icon: '📦', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
    latest: 'How would you launch a new payments feature?',
    companies: ['amazon', 'google', 'apple'], moreCompanies: 2, trend: '+14%', trendUp: true
  },
  {
    id: 'data-analyst', name: 'Data Analyst', count: '6.3K', icon: '📊', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
    latest: 'Analyze sales performance and identify trends',
    companies: ['microsoft', 'google', 'apple'], moreCompanies: 2, trend: '+22%', trendUp: true
  },
  {
    id: 'product-designer', name: 'Product Designer', count: '4.1K', icon: '🎨', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100',
    latest: 'Improve the checkout flow for better conversion',
    companies: ['google', 'meta', 'apple'], moreCompanies: 2, trend: '+16%', trendUp: true
  },
]

const TOPICS = [
  { name: 'System Design', count: '2.4K questions', icon: '🏗️', bg: 'bg-indigo-50', color: 'text-indigo-600' },
  { name: 'Algorithms', count: '1.8K questions', icon: '⚙️', bg: 'bg-purple-50', color: 'text-purple-600' },
  { name: 'SQL', count: '1.6K questions', icon: '🗄️', bg: 'bg-blue-50', color: 'text-blue-600' },
  { name: 'Behavioral', count: '1.5K questions', icon: '🤝', bg: 'bg-rose-50', color: 'text-rose-600' },
  { name: 'Product Sense', count: '1.2K questions', icon: '💡', bg: 'bg-amber-50', color: 'text-amber-600' },
  { name: 'Data Structures', count: '987 questions', icon: '📚', bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { name: 'API Design', count: '876 questions', icon: '🔌', bg: 'bg-cyan-50', color: 'text-cyan-600' },
  { name: 'Case Studies', count: '765 questions', icon: '📋', bg: 'bg-fuchsia-50', color: 'text-fuchsia-600' },
  { name: 'Machine Learning', count: '654 questions', icon: '🤖', bg: 'bg-sky-50', color: 'text-sky-600' },
]

function DifficultyIndicator({ level }: { level: string }) {
  let bars = []
  if (level === 'Easy') {
    bars = ['bg-green-500', 'bg-[#EBEBEB]', 'bg-[#EBEBEB]']
  } else if (level === 'Medium') {
    bars = ['bg-orange-500', 'bg-orange-500', 'bg-[#EBEBEB]']
  } else if (level === 'Hard') {
    bars = ['bg-red-500', 'bg-red-500', 'bg-red-500']
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-bold text-[#484848]">{level}</span>
      <div className="flex gap-0.5">
        {bars.map((bg, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-sm ${bg}`} />
        ))}
      </div>
    </div>
  )
}

export default function InterviewsPage() {
  return (
    <div className="bg-[#F7F7F7] min-h-screen pb-16">
      
      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#EBEBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">💬</div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Interviews</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight mb-3">
                Real interview questions from real candidates
              </h1>
              <p className="text-[#717171] font-medium max-w-2xl text-sm sm:text-base">
                Recent interview experiences shared by verified professionals
              </p>
            </div>
            <Link href="/companies" className="shrink-0 px-5 py-2.5 bg-white border border-[#EBEBEB] text-[#222222] text-sm font-bold rounded-lg shadow-sm hover:bg-[#FAFAFA] transition-all">
              Explore all interviews →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">

        {/* ── Recent Questions ───────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-purple-500">⚡</span>
              <h2 className="text-[17px] font-bold text-[#222222]">Recent questions asked</h2>
            </div>
            <Link href="/interviews" className="text-xs font-bold text-indigo-600 hover:underline">View all →</Link>
          </div>
          
          {/* Horizontal scroll container */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {RECENT_QUESTIONS.map((q, idx) => (
              <div key={idx} className="shrink-0 w-[340px] snap-start bg-white p-5 rounded-xl border border-[#EBEBEB] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Image src={`https://logo.clearbit.com/${q.companyId}.com`} alt={q.companyName} width={36} height={36} className="w-9 h-9 rounded-lg object-contain border border-[#EBEBEB] p-1" />
                      <div>
                        <div className="font-bold text-[#222222] text-[13px]">{q.companyName}</div>
                        <div className="text-[11px] font-medium text-[#717171]">{q.role} · {q.time}</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-[#222222] font-semibold text-[14px] leading-snug mb-4 line-clamp-3">
                    {q.question}
                  </p>

                  <div className="flex gap-1.5 flex-wrap mb-6">
                    {q.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded bg-[#F9FAFB] text-[#484848] border border-[#E5E7EB] text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB] mt-auto">
                  <DifficultyIndicator level={q.difficulty} />
                  <div className="flex items-center gap-3">
                    <button className="text-[#9CA3AF] hover:text-[#484848]"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></button>
                    <span className="text-[11px] font-medium text-[#717171]">{q.answers} answers</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ── Two Column Content ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          
          {/* Left Col: Browse by Role */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">💼</span>
                <h2 className="text-[17px] font-bold text-[#222222]">Browse questions by role</h2>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm">
              
              {/* Fake Tabs */}
              <div className="flex items-center gap-6 border-b border-[#EBEBEB] px-6 pt-4 overflow-x-auto scrollbar-hide">
                <span className="text-[13px] font-bold text-indigo-600 border-b-2 border-indigo-600 pb-3 -mb-[1px] whitespace-nowrap">Popular Roles</span>
                {['Engineering', 'Product', 'Data', 'Design', 'Sales', 'Marketing', 'Operations'].map(t => (
                  <span key={t} className="text-[13px] font-semibold text-[#717171] hover:text-[#222222] cursor-pointer pb-3 whitespace-nowrap">{t}</span>
                ))}
              </div>

              {/* Roles List */}
              <div className="divide-y divide-[#EBEBEB]">
                {ROLES.map(role => (
                  <div key={role.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-all cursor-pointer">
                    
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${role.bg} ${role.color} ${role.border}`}>
                        {role.icon}
                      </div>
                      <div>
                        <div className="font-bold text-[#222222] text-[15px] mb-0.5">{role.name}</div>
                        <div className="text-[11px] font-medium text-[#717171] mb-2">{role.count} questions</div>
                        <div className="text-[13px] text-[#484848]"><span className="font-semibold text-[#717171]">Latest:</span> {role.latest}</div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto mt-2 sm:mt-0 gap-4 sm:gap-2">
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          {role.companies.map(c => (
                            <Image key={c} src={`https://logo.clearbit.com/${c}.com`} alt={c} width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white object-contain bg-white bg-clip-padding" />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium text-[#9CA3AF]">+{role.moreCompanies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500 text-xs">↗</span>
                        <span className="text-[11px] font-bold text-green-600">{role.trend}</span>
                        <span className="text-[10px] font-medium text-[#9CA3AF] ml-1 hidden lg:inline">vs last month</span>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
              
              {/* View all button */}
              <div className="p-4 border-t border-[#EBEBEB] text-center">
                <button className="text-[13px] font-bold text-indigo-600 hover:underline">View all roles and questions →</button>
              </div>

            </div>
          </div>

          {/* Right Col: Trending Topics & CTA */}
          <div className="flex flex-col gap-6">
            
            {/* Trending Topics */}
            <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500">🔥</span>
                  <h2 className="text-[15px] font-bold text-[#222222]">Trending interview topics</h2>
                </div>
                <button className="text-[11px] font-bold text-indigo-600 hover:underline">View all topics</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TOPICS.map(topic => (
                  <div key={topic.name} className="flex items-center gap-3 p-3 rounded-lg border border-[#F3F4F6] hover:border-[#E5E7EB] hover:bg-[#FAFAFA] transition-all cursor-pointer">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${topic.bg} ${topic.color}`}>
                      {topic.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#222222] text-[11px] truncate">{topic.name}</div>
                      <div className="text-[10px] text-[#717171]">{topic.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share CTA */}
            <div className="bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor" className="text-indigo-600"><path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm20.8 35.8l-26.6 26.6c-1.5 1.5-3.9 1.5-5.4 0l-12.2-12.2c-1.5-1.5-1.5-3.9 0-5.4 1.5-1.5 3.9-1.5 5.4 0l9.5 9.5 23.9-23.9c1.5-1.5 3.9-1.5 5.4 0 1.5 1.5 1.5 3.9 0 5.4z"/></svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📝</span>
                  <h2 className="text-[15px] font-bold text-[#222222]">Share your interview experience</h2>
                </div>
                <p className="text-[13px] text-[#484848] mb-5 font-medium leading-snug pr-8">
                  Help other professionals by sharing the questions you were asked in your interview.
                </p>
                <button className="w-full py-2.5 bg-indigo-600 text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  Submit interview questions →
                </button>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex -space-x-2">
                    {['man', 'woman', 'man2'].map((n, i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-indigo-200 border border-white overflow-hidden text-[10px] flex items-center justify-center">👤</div>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-[#717171]">Join 85K+ professionals contributing</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
