import React from 'react'
import { motion } from 'framer-motion'

/**
 * Displays the current study streak with an animated flame.
 *
 * @param {number} count - streak day count
 * @param {boolean} compact - smaller pill version for navbar
 * @param {string} className
 */
export default function StreakBadge({ count = 0, compact = false, className = '' }) {
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-space-card border border-space-border ${className}`}
      >
        <FlameIcon size={16} />
        <span className="text-sm font-bold text-amber-400">{count}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex flex-col items-center gap-1 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md scale-150 animate-pulse" />
        <FlameIcon size={40} />
      </div>
      <p className="text-2xl font-black text-amber-400 leading-none">{count}</p>
      <p className="text-xs text-slate-500 font-medium">
        {count === 1 ? 'day streak' : 'day streak'}
      </p>
    </motion.div>
  )
}

function FlameIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-flame"
      aria-hidden="true"
    >
      {/* Outer flame — orange */}
      <path
        d="M12 2C12 2 8 6.5 8 11C8 13 8.8 14.8 10 16C9.5 14.5 9.8 13 11 12C11 14 12 15.5 13 16.5C14 17.5 14.5 18.5 14.5 20C14.5 20 16 18.5 16 16C16 14 15 12.5 14 11.5C14.5 13 14 14.5 13 15C13.5 12.5 12 9 12 9C12 9 13.5 11 13 13C13.5 12 13.5 10.5 13 9.5C13.5 8.5 14 6 12 2Z"
        fill="#f59e0b"
        opacity={0.9}
      />
      {/* Inner flame — yellow */}
      <path
        d="M12 8C12 8 10.5 10.5 10.5 13C10.5 14.5 11 15.5 12 16.5C12 14.5 13 13.5 13 12C13.5 13 13.5 14.5 13 15.5C14 14.5 14.5 13 14.5 11.5C14.5 10 13.5 8.5 12 8Z"
        fill="#fde68a"
        opacity={0.85}
      />
      {/* Core — white-hot */}
      <path
        d="M12 12C12 12 11.5 13 11.5 14.5C11.5 15.5 12 16.5 12.5 17C12.5 15.5 13 14.5 13 13.5C13 12.5 12 12 12 12Z"
        fill="#fff"
        opacity={0.7}
      />
    </svg>
  )
}
