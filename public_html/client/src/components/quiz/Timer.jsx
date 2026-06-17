import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTimer } from '../../hooks/useTimer'
import { formatTime } from '../../utils/formatters'

/**
 * Circular SVG countdown timer.
 *
 * @param {number} totalSeconds - countdown from this value
 * @param {Function} onExpire - called when timer hits 0
 * @param {boolean} autoStart - start on mount
 * @param {number} size - SVG diameter in px (default 120)
 * @param {string} className
 */
export default function Timer({
  totalSeconds = 600,
  onExpire,
  autoStart = false,
  size = 120,
  className = '',
}) {
  const { timeLeft, isRunning, start, pause, reset } = useTimer(totalSeconds, onExpire)

  useEffect(() => {
    if (autoStart) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fraction = totalSeconds > 0 ? timeLeft / totalSeconds : 0
  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - fraction)

  // Color transitions
  let strokeColor
  if (fraction > 0.5) {
    strokeColor = '#10b981' // emerald
  } else if (fraction > 0.25) {
    strokeColor = '#f59e0b' // amber
  } else {
    strokeColor = '#f43f5e' // rose
  }

  const isUrgent = fraction <= 0.25 && timeLeft > 0

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e2a3a"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 ${isUrgent ? 8 : 4}px ${strokeColor})`,
              transition: 'stroke 0.5s ease, stroke-dashoffset 0.5s linear',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
            transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
            className={`text-lg font-bold tabular-nums leading-none ${
              isUrgent ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {formatTime(timeLeft)}
          </motion.span>
          {timeLeft === 0 && (
            <span className="text-xs text-rose-400 mt-0.5 font-semibold">Time up!</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isRunning && timeLeft > 0 && (
          <button
            onClick={start}
            className="px-3 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            Resume
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
            className="px-3 py-1 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={() => reset()}
          className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 bg-space-surface border border-space-border hover:text-slate-200 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
