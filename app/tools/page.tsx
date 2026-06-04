import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Career & Salary Tools | TalentDash',
  description: 'Calculators and tools to help you negotiate better offers, understand your taxes, and evaluate your compensation.',
}

export default function ToolsDirectoryPage() {
  const tools = [
    {
      title: 'Salary & Tax Calculator',
      description: 'Calculate your monthly in-hand salary after standard Indian tax deductions (New/Old regime estimates).',
      href: '/tools/salary-calculator',
      icon: '💵'
    },
    {
      title: 'Hike Calculator',
      description: 'Calculate your percentage hike or target base pay during job switches and appraisals.',
      href: '/tools/hike-calculator',
      icon: '📈'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3">Career Tools</h1>
        <p className="meta-text max-w-xl mx-auto text-base">
          Evaluate your compensation, calculate your take-home pay, and prepare for your next negotiation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {tools.map(tool => (
          <Link
            key={tool.title}
            href={tool.href}
            className="card p-6 hover:shadow-md transition-all duration-200"
            style={{ textDecoration: 'none' }}
          >
            <div className="text-4xl mb-4">{tool.icon}</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: '#222222' }}>{tool.title}</h2>
            <p className="meta-text">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
