import type { Level } from '@/types/salary'
import { LEVEL_BADGE_STYLES, LEVEL_LABELS } from '@/lib/config'

interface LevelBadgeProps {
  level: Level
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  const styles = LEVEL_BADGE_STYLES[level] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
  }

  return (
    <span
      className={`badge ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {LEVEL_LABELS[level] ?? level}
    </span>
  )
}
