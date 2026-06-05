'use client'

import { useState } from 'react'

export default function FollowButton({ 
  initialFollowed = false, 
  variant = 'primary' 
}: { 
  initialFollowed?: boolean,
  variant?: 'primary' | 'secondary' 
}) {
  const [followed, setFollowed] = useState(initialFollowed)

  if (variant === 'secondary') {
    return (
      <button 
        onClick={() => setFollowed(!followed)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: followed ? '#F3F4F6' : '#fff', color: followed ? '#111827' : '#222222', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
      >
        {followed ? '✓ Following' : '+ Follow'}
      </button>
    )
  }

  return (
    <button
      onClick={() => setFollowed(!followed)}
      style={{
        padding: '8px 18px',
        background: followed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
        color: '#fff',
        border: '1.5px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s'
      }}
    >
      {followed ? '✓ Following' : 'Follow'}
    </button>
  )
}
