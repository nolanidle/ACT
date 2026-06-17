import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Zap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import api from '../utils/api'
import Button from '../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordLongEnough = password.length >= 8

  const validate = () => {
    if (!name.trim()) { toast.error('Name is required'); return false }
    if (!email.trim()) { toast.error('Email is required'); return false }
    if (!passwordLongEnough) { toast.error('Password must be at least 8 characters'); return false }
    if (!passwordsMatch) { toast.error('Passwords do not match'); return false }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/auth/register', { name: name.trim(), email: email.trim(), password })
      toast.success('Account created! Please verify your email.')
      navigate('/verify-email', { state: { email: email.trim() } })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen stars-bg flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-brand-violet/5 blur-3xl" />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={fadeInUp} className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-black text-slate-100 tracking-tight">
              ACTstr<span className="text-brand-blue">o</span>yds
            </h1>
          </Link>
          <p className="text-slate-400 mt-2">Create your free account</p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-space-border bg-space-card p-8 shadow-2xl"
        >
          <h2 className="text-xl font-bold text-slate-100 mb-6">Get started — it&apos;s free</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password hints */}
              {password.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle
                    size={13}
                    className={passwordLongEnough ? 'text-emerald-400' : 'text-slate-600'}
                  />
                  <span className={`text-xs ${passwordLongEnough ? 'text-emerald-400' : 'text-slate-500'}`}>
                    At least 8 characters
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-surface border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all text-sm ${
                    confirmPassword && !passwordsMatch
                      ? 'border-rose-500/50 focus:border-rose-500/50'
                      : 'border-space-border focus:border-brand-blue/50'
                  }`}
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-rose-400">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              leftIcon={<Zap size={16} />}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-blue-300 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </motion.div>

      <style>{`
        .stars-bg {
          background-color: #0a0e1a;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 55% 15%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 45%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 18% 60%, rgba(255,255,255,0.3) 0%, transparent 100%);
        }
      `}</style>
    </div>
  )
}
