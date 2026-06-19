import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Mail, Lock, Eye, EyeOff, LogOut, Crown,
  Zap, Save, AlertTriangle, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import useAuth from '../hooks/useAuth'

/* ─── Section Header ─────────────────────────────────── */
function SectionHeader({ icon: Icon, title, color = 'text-brand-blue' }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={18} className={color} />
      <h2 className="text-base font-bold text-slate-100">{title}</h2>
    </div>
  )
}

/* ─── Component ──────────────────────────────────────── */
export default function Account() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const { logout } = useAuth()

  // Profile
  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Password
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Usage
  const [usage, setUsage] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loadingUsage, setLoadingUsage] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, subRes] = await Promise.allSettled([
          api.get('/user/usage'),
          api.get('/user/subscription'),
        ])
        if (usageRes.status === 'fulfilled') setUsage(usageRes.value.data)
        if (subRes.status === 'fulfilled') setSubscription(subRes.value.data)
      } catch {
        // silent
      } finally {
        setLoadingUsage(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name cannot be empty'); return }
    setSavingProfile(true)
    try {
      await api.patch('/user/profile', { name: name.trim() })
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!oldPassword) { toast.error('Enter your current password'); return }
    if (newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return }
    setSavingPassword(true)
    try {
      await api.patch('/user/password', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      toast.success('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'premium'

  return (
    <PageWrapper>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto space-y-5"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <h1 className="text-2xl font-black text-slate-100">Account Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your profile and preferences.</p>
        </motion.div>

        {/* ── Profile ── */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <SectionHeader icon={User} title="Profile" />
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-space-surface/50 border border-space-border text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-600">Email cannot be changed</p>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={savingProfile}
                leftIcon={<Save size={15} />}
              >
                Save Changes
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* ── Subscription ── */}
        <motion.div variants={fadeInUp}>
          <Card className={`p-6 ${isPro ? 'border-amber-500/30' : ''}`}>
            <SectionHeader icon={Crown} title="Subscription" color={isPro ? 'text-amber-400' : 'text-slate-400'} />
            {loadingUsage ? (
              <div className="flex items-center gap-2 py-4">
                <Spinner size="sm" />
                <span className="text-slate-400 text-sm">Loading...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-xl border ${
                  isPro ? 'bg-amber-500/10 border-amber-500/20' : 'bg-space-surface border-space-border'
                }`}>
                  <div className="flex items-center gap-3">
                    <Crown size={20} className={isPro ? 'text-amber-400' : 'text-slate-600'} />
                    <div>
                      <p className={`font-bold ${isPro ? 'text-amber-300' : 'text-slate-300'}`}>
                        {isPro ? 'Pro Plan' : 'Free Plan'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {isPro ? 'Unlimited AI generations' : 'Limited AI generations per day'}
                      </p>
                    </div>
                  </div>
                  {!isPro && (
                    <Button variant="violet" size="sm" leftIcon={<Zap size={14} />}>
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── AI Usage ── */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <SectionHeader icon={Zap} title="AI Usage Today" color="text-brand-violet" />
            {loadingUsage ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-slate-400 text-sm">Loading usage...</span>
              </div>
            ) : usage ? (
              <div className="space-y-4">
                {[
                  { label: 'Lessons Generated', used: usage.lessons_used, limit: usage.lessons_limit },
                  { label: 'Quizzes Generated', used: usage.quizzes_used, limit: usage.quizzes_limit },
                  { label: 'Exams Generated',   used: usage.exams_used,  limit: usage.exams_limit },
                ].map((u) => (
                  <div key={u.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{u.label}</span>
                      <span className={`font-semibold ${
                        u.limit && u.used >= u.limit ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {u.used} / {u.limit ?? '∞'}
                      </span>
                    </div>
                    {u.limit && (
                      <div className="h-1.5 rounded-full bg-space-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            u.used >= u.limit ? 'bg-rose-500' :
                            u.used / u.limit > 0.75 ? 'bg-amber-500' : 'bg-brand-blue'
                          }`}
                          style={{ width: `${Math.min(100, (u.used / u.limit) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <p className="text-xs text-slate-600">Usage resets at midnight.</p>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Usage data unavailable.</p>
            )}
          </Card>
        </motion.div>

        {/* ── Password ── */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <SectionHeader icon={Lock} title="Change Password" />
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: 'Current Password', value: oldPassword, onChange: setOldPassword, autoComplete: 'current-password' },
                { label: 'New Password', value: newPassword, onChange: setNewPassword, autoComplete: 'new-password' },
                { label: 'Confirm New Password', value: confirmNewPassword, onChange: setConfirmNewPassword, autoComplete: 'new-password' },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">{field.label}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      autoComplete={field.autoComplete}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm"
                    />
                    {field.label === 'Current Password' && (
                      <button
                        type="button"
                        onClick={() => setShowPasswords((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="submit"
                variant="secondary"
                size="md"
                loading={savingPassword}
                leftIcon={<Lock size={15} />}
              >
                Update Password
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6 border-rose-500/20">
            <SectionHeader icon={AlertTriangle} title="Danger Zone" color="text-rose-400" />
            <p className="text-slate-400 text-sm mb-4">
              Sign out of your ACTstroyds account on this device.
            </p>
            <Button
              variant="danger"
              size="md"
              onClick={handleLogout}
              leftIcon={<LogOut size={15} />}
            >
              Sign Out
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}
