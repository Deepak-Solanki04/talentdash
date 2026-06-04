'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/format'

export default function SalaryCalculator() {
  const [ctc, setCtc] = useState<number>(1200000)
  
  // Basic tax approximation (New Regime style simplified for demonstration)
  // This is a UI mockup for the trial, not a certified tax engine.
  const calculateTax = (amount: number) => {
    if (amount <= 700000) return 0
    let tax = 0
    if (amount > 1500000) {
      tax += (amount - 1500000) * 0.3
      tax += 150000
    } else if (amount > 1200000) {
      tax += (amount - 1200000) * 0.2
      tax += 90000
    } else if (amount > 900000) {
      tax += (amount - 900000) * 0.15
      tax += 45000
    } else if (amount > 600000) {
      tax += (amount - 600000) * 0.1
      tax += 15000
    }
    return tax
  }

  const annualTax = calculateTax(ctc)
  const monthlyInHand = (ctc - annualTax) / 12

  return (
    <div className="card p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <label className="block font-semibold mb-2" style={{ color: '#222222' }}>
          Annual CTC (INR)
        </label>
        <input
          type="number"
          className="td-input w-full text-lg"
          value={ctc}
          onChange={(e) => setCtc(Number(e.target.value) || 0)}
          min={0}
          step={50000}
        />
        <p className="meta-text mt-2 text-xs">
          Assumes standard deduction and New Tax Regime (Simplified).
        </p>
      </div>

      <div className="p-6 rounded-xl" style={{ background: '#F7F7F7', border: '1px solid #EBEBEB' }}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: '#EBEBEB' }}>
          <span className="font-semibold text-gray-600">Monthly In-Hand</span>
          <span className="text-2xl font-bold" style={{ color: '#008A05' }}>
            {formatCurrency(monthlyInHand, 'INR')}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="meta-text">Gross Annual</span>
          <span className="font-medium">{formatCurrency(ctc, 'INR')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="meta-text">Estimated Tax (Annual)</span>
          <span className="font-medium" style={{ color: '#D93025' }}>
            - {formatCurrency(annualTax, 'INR')}
          </span>
        </div>
      </div>
    </div>
  )
}
