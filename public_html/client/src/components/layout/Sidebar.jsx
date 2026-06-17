import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  PenTool,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import ProgressBar from '../ui/ProgressBar'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/study', label: 'Study Guide', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: PenTool },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/**
 * Collapsible left sidebar (hidden on mobile).
 * Shows navigation links, XP mini-bar, user info.
 */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuthStore()

  const xp = user?.xp || 0
  const xpToNext = user?.xpToNextLevel || 500
  const level = user?.level || 1
  const xpPercent = Math.min(100, Math.round((xp % xpToNext) / xpToNext * 100))

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="hidden lg:flex flex-col flex-shrink-0 bg-space-deep border-r border-space-border relative overflow-hidden"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3.5 top-6 z-10 w-7 h-7 rounded-full bg-space-card border border-space-border flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shadow-md"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User mini-profile */}
      <div className={`pt-5 pb-4 border-b border-space-border ${collapsed ? 'px-3' : 'px-4'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-slate-100 truncate">
                  {user?.name || 'Student'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">
                    Level {level}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* XP bar */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Zap size={10} className="text-amber-400" />
                  {(xp % xpToNext).toLocaleString()} / {xpToNext.toLocaleString()} XP
                </span>
              </div>
              <ProgressBar value={xpPercent} color="amber" size="sm" animated={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className={`flex-1 py-3 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-2' : 'px-3'}`}>
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                'group flex items-center rounded-xl transition-all duration-150 mb-1',
                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-brand-blue/10 text-brand-blue-light border border-brand-blue/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${isActive ? 'text-brand-blue-light' : 'text-slate-500 group-hover:text-slate-300'}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom version tag */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-space-border"
          >
            <p className="text-xs text-slate-600">ACTstroyds v1.0</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
