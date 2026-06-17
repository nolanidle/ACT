import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  PenTool,
  LogOut,
  Settings,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { useAuth } from '../../hooks/useAuth'
import StreakBadge from '../gamification/StreakBadge'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/study', label: 'Study Guide', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: PenTool },
]

// Orbit animation for the "O" in logo
function OrbitDot() {
  return (
    <span className="relative inline-flex items-center justify-center w-5 h-5">
      <span className="text-brand-blue-light font-black">O</span>
      <span
        className="absolute w-1.5 h-1.5 rounded-full bg-brand-violet-light animate-orbit"
        style={{ top: '50%', left: '50%', marginTop: '-3px', marginLeft: '-3px' }}
      />
    </span>
  )
}

export default function Navbar() {
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const xp = user?.xp || 0
  const streak = user?.streak || 0

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-space-deep/90 border-b border-space-border backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-0.5 flex-shrink-0">
            <span className="text-xl font-black tracking-tight text-slate-100">
              ACTstr
            </span>
            <OrbitDot />
            <span className="text-xl font-black tracking-tight text-slate-100">yds</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="relative group">
                {({ isActive }) => (
                  <span
                    className={[
                      'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'text-brand-blue-light'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                    ].join(' ')}
                  >
                    <Icon size={15} />
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-brand-blue to-brand-blue-light"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side: streak + XP + avatar */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                {/* Streak */}
                <StreakBadge count={streak} compact />

                {/* XP */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-card border border-space-border">
                  <Zap size={13} className="text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {xp.toLocaleString()} XP
                  </span>
                </div>
              </>
            )}

            {/* Avatar dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-violet flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-space-card border border-space-border rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-space-border">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {user?.name || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                        >
                          <User size={15} />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                        >
                          <Settings size={15} />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t border-space-border py-1">
                        <button
                          onClick={() => { setDropdownOpen(false); logout() }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white bg-brand-blue/10 hover:bg-brand-blue/20 border border-brand-blue/30 transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-40 w-72 bg-space-deep border-r border-space-border md:hidden flex flex-col"
            >
              <div className="h-16 flex items-center px-6 border-b border-space-border">
                <span className="text-lg font-black tracking-tight text-slate-100">
                  ACTstroyds
                </span>
              </div>
              <nav className="flex-1 py-4 px-3 overflow-y-auto">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-colors',
                        isActive
                          ? 'bg-brand-blue/10 text-brand-blue-light border border-brand-blue/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                      ].join(' ')
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </nav>
              {isAuthenticated && (
                <div className="p-4 border-t border-space-border">
                  <button
                    onClick={() => { setMobileOpen(false); logout() }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top spacer */}
      <div className="h-16" />
    </>
  )
}
