import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const colorMap = {
  blue: 'from-brand-blue to-brand-blue-light shadow-brand-blue/40',
  violet: 'from-brand-violet to-brand-violet-light shadow-brand-violet/40',
  emerald: 'from-emerald-500 to-emerald-400 shadow-emerald-500/40',
  amber: 'from-amber-500 to-amber-400 shadow-amber-500/40',
  rose: 'from-rose-500 to-rose-400 shadow-rose-500/40',
}

/**
 * Horizontal progress bar with GSAP fill animation.
 *
 * @param {number} value - 0 to 100
 * @param {'blue'|'violet'|'emerald'|'amber'|'rose'} color
 * @param {string} label - optional label shown above
 * @param {boolean} animated - animate fill on mount
 * @param {boolean} showValue - show percentage text on the right
 * @param {'sm'|'md'|'lg'} size
 * @param {string} className
 */
export default function ProgressBar({
  value = 0,
  color = 'blue',
  label,
  animated = true,
  showValue = false,
  size = 'md',
  className = '',
}) {
  const fillRef = useRef(null)
  const clampedValue = Math.min(100, Math.max(0, value))

  const heightMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  useEffect(() => {
    if (!fillRef.current) return
    if (animated) {
      gsap.fromTo(
        fillRef.current,
        { width: '0%' },
        {
          width: `${clampedValue}%`,
          duration: 0.9,
          ease: 'power2.out',
          delay: 0.1,
        }
      )
    } else {
      fillRef.current.style.width = `${clampedValue}%`
    }
  }, [clampedValue, animated])

  // When value changes after mount, also animate
  const prevRef = useRef(clampedValue)
  useEffect(() => {
    if (!fillRef.current) return
    if (prevRef.current !== clampedValue && animated) {
      gsap.to(fillRef.current, {
        width: `${clampedValue}%`,
        duration: 0.6,
        ease: 'power2.out',
      })
    }
    prevRef.current = clampedValue
  })

  const gradient = colorMap[color] || colorMap.blue

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-slate-300">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heightMap[size] || heightMap.md} bg-space-surface rounded-full overflow-hidden border border-space-border/50`}
      >
        <div
          ref={fillRef}
          style={{ width: animated ? '0%' : `${clampedValue}%` }}
          className={`h-full rounded-full bg-gradient-to-r ${gradient} shadow-sm`}
        />
      </div>
    </div>
  )
}
