import type { Metadata } from 'next'
import SalaryCalculator from '@/components/features/SalaryCalculator'

export const metadata: Metadata = {
  title: 'Salary & Tax Calculator | TalentDash',
  description: 'Calculate your in-hand monthly salary based on Indian tax regimes.',
}

export default function SalaryCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3">Salary Calculator</h1>
        <p className="meta-text max-w-xl mx-auto text-base">
          Estimate your monthly take-home pay based on your Annual CTC.
        </p>
      </div>

      <SalaryCalculator />
    </div>
  )
}
