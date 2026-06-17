import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import api from '../utils/api'
import Button from '../components/ui/Button'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()

  // Email from navigation state or query param
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get('email') ||
    ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputs = useRef([])

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleChange = (index, value) => {
    // Only digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)
    // Auto-advance
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...code]
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch })
    setCode(next)
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) {
      toast.error('Please enter the full 6-digit code')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/verify-email', { email, code: fullCode })
      toast.success('Email verified! You can now sign in.')
      navigate('/login', { state: { verified: true } })
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired code'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setResending(true)
    try {
      await api.post('/auth/resend-verification', { email })
      toast.success('Verification code resent!')
      setResendCooldown(60)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code'
      toast.error(msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen stars-bg flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-brand-blue/5 blur-3xl" />
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
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="rounded-2xl border border-space-border bg-space-card p-8 shadow-2xl text-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-brand-blue" />
          </div>

          <h2 className="text-xl font-bold text-slate-100 mb-2">Check your email</h2>
          <p className="text-slate-400 text-sm mb-1">
            We sent a 6-digit code to
          </p>
          <p className="text-slate-200 font-medium text-sm mb-8">
            {email || 'your email address'}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Code inputs */}
            <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-12 h-14 rounded-xl bg-space-surface border border-space-border text-slate-100 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
            >
              Verify Email
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} className={resending ? 'animate-spin' : ''} />
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : resending
                ? 'Sending...'
                : 'Resend code'}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to="/login" className="text-brand-blue hover:text-blue-300 transition-colors">
              Back to Sign In
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
            radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.4) 0%, transparent 100%);
        }
      `}</style>
    </div>
  )
}
