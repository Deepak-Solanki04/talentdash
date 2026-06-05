'use client'

import { useState } from 'react'

type Props = {
  overviewContent: React.ReactNode
  salariesContent: React.ReactNode
  faqContent: React.ReactNode
  similarCompaniesContent: React.ReactNode
}

export default function CompanyContentManager({
  overviewContent,
  salariesContent,
  faqContent,
  similarCompaniesContent
}: Props) {
  const [activeTab, setActiveTab] = useState('Overview')
  const tabs = ['Overview', 'Reviews', 'Salaries', 'Benefits', 'Jobs', 'Interviews', 'Q&A']

  return (
    <>
      {/* Sub-nav tabs (sticky) */}
      <div style={{ position: 'sticky', top: '0', zIndex: 40, background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
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
        {activeTab === 'Overview' && (
          <div className="animate-in fade-in duration-300">
            {overviewContent}
            {similarCompaniesContent}
          </div>
        )}

        {activeTab === 'Salaries' && (
          <div className="animate-in fade-in duration-300">
            {salariesContent}
          </div>
        )}

        {activeTab === 'Q&A' && (
          <div className="animate-in fade-in duration-300">
            {faqContent}
          </div>
        )}

        {/* Placeholders for other tabs */}
        {['Reviews', 'Benefits', 'Jobs', 'Interviews'].includes(activeTab) && (
          <div className="animate-in fade-in duration-300" style={{ padding: '64px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              {activeTab} data coming soon
            </h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              We are currently collecting {activeTab.toLowerCase()} for this company. Check back later!
            </p>
          </div>
        )}
      </div>
    </>
  )
}
