'use client'

import { useState } from 'react'

export default function SalariesContentManager({
  salariesContent
}: { salariesContent: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('Salaries')
  const tabs = ['Salaries', 'Insights', 'Benefits', 'Photos', 'Reviews', 'Jobs']

  return (
    <>
      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '14px 18px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#FF5A5F' : '#717171',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #FF5A5F' : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.15s, border-bottom-color 0.15s',
                  }}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'Salaries' && (
          <div className="animate-in fade-in duration-300">
            {salariesContent}
          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab !== 'Salaries' && (
          <div className="animate-in fade-in duration-300" style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              {activeTab} data coming soon
            </h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              We are currently collecting {activeTab.toLowerCase()} data. Check back later!
            </p>
          </div>
        )}
      </div>
    </>
  )
}
