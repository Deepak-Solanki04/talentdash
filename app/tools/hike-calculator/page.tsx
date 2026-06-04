import type { Metadata } from 'next'
import HikeCalculator from '@/components/features/HikeCalculator'

export const metadata: Metadata = {
  title: 'Salary Hike Calculator | TalentDash',
  description: 'Calculate your target base pay given an expected percentage hike.',
}

export default function HikeCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3">Hike Calculator</h1>
        <p className="meta-text max-w-xl mx-auto text-base">
          Determine your exact new salary and absolute gain based on a target percentage increase.
        </p>
      </div>

      <HikeCalculator />
    </div>
  )
}
