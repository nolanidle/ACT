import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Zap, Star } from 'lucide-react'

/**
 * XP progress bar with GSAP animation.
 * Shows current XP, level, and progress to next milestone.
 *
 * @param {number} xp - current total XP
 * @param {number} level - current level
 * @param {number} xpThisLevel - XP earned within the current level
 * @param {number} xpToNextLevel - XP needed to reach next level
 * @param {string} className
 */
export default function XPBar({
  xp = 0,
  level = 1,
  xpThisLevel = 0,
  xpToNextLevel = 500,
  className = '',
}) {
  const fillRef = useRef(null)
  const glowRef = useRef(null)
  const prevPercent = useRef(0)

  const percent = xpToNextLevel > 0
    ? Math.min(100, Math.round((xpThisLevel / xpToNextLevel) * 100))
    : 100

  useEffect(() => {
    if (!fillRef.current) return

    const from = prevPercent.current
    const to = percent

    gsap.fromTo(
      fillRef.current,
      { width: `${from}%` },
      {
        width: `${to}%`,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.15,
      }
    )

    // Glow pulse when XP increases
    if (to > from && glowRef.current) {
      gsap.fromTo(
        glowRef.current,
        { opacity: 0.8, scaleX: 1 },
        { opacity: 0, scaleX: 1.3, duration: 0.6, ease: 'power2.out' }
      )
    }

    prevPercent.current = to
  }, [percent])

  return (
    <div className={`w-full ${className}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
            <Star size={13} className="text-white fill-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-400">Level {level}</p>
            <p className="text-xs text-slate-500 leading-none">
              {xpThisLevel.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-space-surface border border-space-border">
          <Zap size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-slate-200">
            {xp.toLocaleString()} total XP
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 bg-space-surface rounded-full overflow-hidden border border-space-border/60">
        {/* Fill */}
        <div
          ref={fillRef}
          style={{ width: '0%' }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-blue via-blue-400 to-brand-blue-light shadow-[0_0_12px_rgba(59,130,246,0.6)]"
        />
        {/* Animated glow burst */}
        <div
          ref={glowRef}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 pointer-events-none"
        />
        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 animate-shimmer" />
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-600">Lv {level}</span>
        <span className="text-xs text-slate-600">Lv {level + 1}</span>
      </div>
    </div>
  )
}
