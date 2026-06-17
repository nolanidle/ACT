import React from 'react'
import { motion } from 'framer-motion'
import { masteryColor, masteryLabel } from '../../utils/formatters'

const masteryDot = {
  not_started: 'bg-slate-400',
  learning: 'bg-rose-400',
  practicing: 'bg-amber-400',
  proficient: 'bg-blue-400',
  mastered: 'bg-emerald-400',
}

/**
 * Animated colored pill showing mastery level.
 *
 * @param {string} level - 'not_started'|'learning'|'practicing'|'proficient'|'mastered'
 * @param {boolean} showDot - show a colored dot prefix
 * @param {'sm'|'md'} size
 * @param {string} className
 */
export default function MasteryPill({
  level = 'not_started',
  showDot = true,
  size = 'md',
  className = '',
}) {
  const normalized = (level || 'not_started').toLowerCase()
  const colorClasses = masteryColor(normalized)
  const label = masteryLabel(normalized)
  const dotClass = masteryDot[normalized] || 'bg-slate-400'

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-xs'

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors duration-500',
        colorClasses,
        sizeClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showDot && (
        <span
          className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotClass}`}
        />
      )}
      {label}
    </motion.span>
  )
}
