'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/format'

export default function HikeCalculator() {
  const [current, setCurrent] = useState<number>(1000000)
  const [hikePercentage, setHikePercentage] = useState<number>(30)

  const newSalary = current * (1 + hikePercentage / 100)
  const difference = newSalary - current

  return (
    <div className="card p-6 md:p-8 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block font-semibold mb-2" style={{ color: '#222222' }}>
            Current Base Salary (INR)
          </label>
          <input
            type="number"
            className="td-input w-full text-lg"
            value={current}
            onChange={(e) => setCurrent(Number(e.target.value) || 0)}
            min={0}
            step={50000}
          />
        </div>
        <div>
          <label className="block font-semibold mb-2" style={{ color: '#222222' }}>
            Expected Hike (%)
          </label>
          <input
            type="number"
            className="td-input w-full text-lg"
            value={hikePercentage}
            onChange={(e) => setHikePercentage(Number(e.target.value) || 0)}
            min={0}
            step={1}
          />
        </div>
      </div>

      <div className="p-6 rounded-xl" style={{ background: '#F7F7F7', border: '1px solid #EBEBEB' }}>
        <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: '#EBEBEB' }}>
          <span className="font-semibold text-gray-600">New Salary</span>
          <span className="text-2xl font-bold" style={{ color: '#0369A1' }}>
            {formatCurrency(newSalary, 'INR')}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="meta-text">Absolute Increase</span>
          <span className="font-medium" style={{ color: '#008A05' }}>
            + {formatCurrency(difference, 'INR')}
          </span>
        </div>
      </div>
    </div>
  )
}
