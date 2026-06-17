import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, X } from 'lucide-react'
import useUIStore from '../../store/uiStore'
import Button from '../ui/Button'

const PARTICLE_COLORS = [
  '#3b82f6', '#60a5fa', '#7c3aed', '#a78bfa',
  '#f59e0b', '#fde68a', '#10b981', '#34d399',
]

function Particle({ index, total }) {
  const angle = (index / total) * 360
  const distance = 80 + Math.random() * 40
  const rad = (angle * Math.PI) / 180
  const tx = Math.cos(rad) * distance
  const ty = Math.sin(rad) * distance
  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length]
  const size = 6 + Math.random() * 8

  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: tx,
        y: ty,
        scale: 0,
        opacity: 0,
      }}
      transition={{
        duration: 0.9 + Math.random() * 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1 + index * 0.03,
      }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: '50%',
        left: '50%',
        marginTop: -size / 2,
        marginLeft: -size / 2,
        boxShadow: `0 0 ${size}px ${color}`,
      }}
    />
  )
}

/**
 * Modal that appears when a new badge is unlocked.
 * Auto-dismisses after 5 seconds.
 *
 * Driven by the badgeUnlock state in uiStore.
 */
export default function BadgeUnlockModal() {
  const { badgeUnlock, clearBadgeUnlock } = useUIStore()

  const isOpen = !!badgeUnlock

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      clearBadgeUnlock()
    }, 5000)
    return () => clearTimeout(timer)
  }, [isOpen, clearBadgeUnlock])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') clearBadgeUnlock()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, clearBadgeUnlock])

  const PARTICLE_COUNT = 12

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={clearBadgeUnlock}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="relative z-10 w-full max-w-sm bg-space-card border border-space-border rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-violet/5 pointer-events-none" />

            {/* Close button */}
            <button
              onClick={clearBadgeUnlock}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="px-8 py-10 flex flex-col items-center text-center">
              {/* Badge icon + particles */}
              <div className="relative flex items-center justify-center mb-6">
                {/* Particles */}
                {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                  <Particle key={i} index={i} total={PARTICLE_COUNT} />
                ))}

                {/* Glow rings */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute w-32 h-32 rounded-full bg-brand-blue/20"
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.05, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="absolute w-24 h-24 rounded-full bg-brand-violet/20"
                />

                {/* Main badge circle */}
                <motion.div
                  initial={{ rotate: -15 }}
                  animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-2 border-amber-300/30"
                >
                  {badgeUnlock?.icon ? (
                    <span className="text-4xl">{badgeUnlock.icon}</span>
                  ) : (
                    <Trophy size={42} className="text-white" strokeWidth={1.5} />
                  )}

                  {/* Stars around badge */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.3 + i * 0.12, duration: 0.3 }}
                      className="absolute"
                      style={{
                        top: i === 0 ? '-8px' : i === 1 ? '-4px' : '-6px',
                        left: i === 0 ? '50%' : i === 1 ? '-8px' : 'auto',
                        right: i === 2 ? '-8px' : 'auto',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <Star
                        size={14}
                        className="text-amber-300 fill-amber-300"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <p className="text-xs font-semibold text-brand-blue-light uppercase tracking-widest mb-2">
                  Badge Unlocked!
                </p>
                <h2 className="text-2xl font-black text-slate-100 mb-2">
                  {badgeUnlock?.name || 'Achievement'}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  {badgeUnlock?.description || 'You earned a new badge. Keep it up!'}
                </p>

                {badgeUnlock?.xpReward && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-bold"
                  >
                    <Star size={13} className="fill-amber-400" />
                    +{badgeUnlock.xpReward} XP
                  </motion.div>
                )}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 w-full"
              >
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={clearBadgeUnlock}
                >
                  Awesome! 🚀
                </Button>
              </motion.div>

              {/* Auto-dismiss progress */}
              <motion.div
                className="mt-4 w-full h-0.5 bg-space-surface rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className="h-full bg-brand-blue/40 rounded-full"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
