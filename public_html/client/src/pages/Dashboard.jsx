import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Zap, Target, Brain, TrendingUp, Activity,
  ChevronRight, Flame, Star, Clock, ArrowRight, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import MasteryPill from '../components/gamification/MasteryPill'
import XPBar from '../components/gamification/XPBar'
import StreakBadge from '../components/gamification/StreakBadge'
import api from '../utils/api'
import useAuthStore from '../store/authStore'
import { formatRelative, formatDate } from '../utils/formatters'
import { getScoreColor } from '../utils/scoring'

/* ─── Score Card ─────────────────────────────────────── */
function ScoreCard({ section, score, label }) {
  const colorClass = getScoreColor(score || 0)
  return (
    <motion.div variants={fadeInUp}>
      <Card className="p-5 text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <p className={`text-4xl font-black ${score ? colorClass : 'text-slate-600'}`}>
          {score || '—'}
        </p>
        <p className="text-xs text-slate-500 mt-1">/ 36</p>
      </Card>
    </motion.div>
  )
}

/* ─── Skeleton ───────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-2xl bg-space-card border border-space-border" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-space-card border border-space-border" />
        ))}
      </div>
      <div className="h-20 rounded-2xl bg-space-card border border-space-border" />
      <div className="h-64 rounded-2xl bg-space-card border border-space-border" />
    </div>
  )
}

/* ─── Activity Icon ──────────────────────────────────── */
function activityIcon(type) {
  switch (type) {
    case 'lesson': return <BookOpen size={15} className="text-blue-400" />
    case 'quiz': return <Target size={15} className="text-violet-400" />
    case 'diagnostic': return <Brain size={15} className="text-amber-400" />
    case 'exam': return <Activity size={15} className="text-emerald-400" />
    default: return <Star size={15} className="text-slate-400" />
  }
}

/* ─── Component ──────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get('/progress/dashboard')
        setData(res)
      } catch (err) {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const scores = data?.scores || {}
  const composite = data?.composite || null
  const streak = data?.streak || 0
  const xp = data?.xp || 0
  const xpToNext = data?.xpToNext || 500
  const level = data?.level || 1
  const skills = data?.skill_mastery || []
  const recentActivity = data?.recent_activity || []
  const todaysBestMove = data?.todays_best_move || null

  const quickActions = [
    { label: 'Generate Lesson', icon: BookOpen, route: '/lesson-generator', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Generate Quiz', icon: Target, route: '/quiz-generator', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Take Diagnostic', icon: Brain, route: '/select-test', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'View Progress', icon: TrendingUp, route: '/progress', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ]

  return (
    <PageWrapper>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── Header ── */}
          <motion.div variants={fadeInUp} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
                {user?.name ? `Hey, ${user.name.split(' ')[0]}` : 'Dashboard'} 👋
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Here&apos;s your prep overview for today.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/study-guide')}
              rightIcon={<ChevronRight size={16} />}
            >
              Study Guide
            </Button>
          </motion.div>

          {/* ── Today's Best Move ── */}
          {todaysBestMove && (
            <motion.div variants={fadeInUp}>
              <Card glow className="relative overflow-hidden">
                {/* Shimmer */}
                <div className="shimmer-bar absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={22} className="text-brand-blue" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-blue uppercase tracking-widest mb-1">
                        Today&apos;s Best Move
                      </p>
                      <p className="text-slate-100 font-semibold text-base">
                        {todaysBestMove.title}
                      </p>
                      {todaysBestMove.description && (
                        <p className="text-slate-400 text-sm mt-0.5">{todaysBestMove.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(todaysBestMove.route || '/lesson-generator')}
                    rightIcon={<ArrowRight size={15} />}
                    className="flex-shrink-0"
                  >
                    {todaysBestMove.cta || 'Start Now'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Score Overview ── */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Estimated Scores
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <ScoreCard section="english" score={scores.english} label="English" />
              <ScoreCard section="math" score={scores.math} label="Math" />
              <ScoreCard section="reading" score={scores.reading} label="Reading" />
              <ScoreCard section="science" score={scores.science} label="Science" />
              {/* Composite — center card */}
              <motion.div variants={fadeInUp} className="col-span-2 sm:col-span-1">
                <Card glow className="p-5 text-center">
                  <p className="text-xs font-semibold text-brand-blue uppercase tracking-widest mb-2">Composite</p>
                  <p className={`text-5xl font-black ${getScoreColor(composite || 0)}`}>
                    {composite || '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">/ 36</p>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Streak & XP ── */}
          <motion.div variants={fadeInUp}>
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="flex-shrink-0">
                  <StreakBadge streak={streak} />
                </div>
                <div className="flex-1 w-full">
                  <XPBar xp={xp} xpToNext={xpToNext} level={level} />
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-black text-amber-400">{xp.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-medium">Total XP</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── Quick Actions ── */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.route)}
                    className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border ${action.bg} hover:scale-[1.02] hover:brightness-110 transition-all duration-200 text-center group`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-space-surface flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* ── Skill Accuracy Table ── */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Skill Mastery
            </h2>
            <Card>
              {skills.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<Brain size={32} className="text-slate-600" />}
                    title="No skills tracked yet"
                    description="Complete a quiz or diagnostic to start tracking your skill mastery."
                    action={
                      <Button variant="primary" size="sm" onClick={() => navigate('/select-test')}>
                        Take Diagnostic
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-space-border">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mastery</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Practiced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.slice(0, 10).map((skill, i) => (
                        <tr
                          key={i}
                          className="border-b border-space-border/50 last:border-0 hover:bg-space-surface/50 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium text-slate-200">{skill.topic}</td>
                          <td className="px-4 py-3 text-slate-400 capitalize">{skill.section}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${
                              (skill.accuracy || 0) >= 80 ? 'text-emerald-400' :
                              (skill.accuracy || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                              {skill.accuracy != null ? `${skill.accuracy}%` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <MasteryPill level={skill.mastery || 'not_started'} />
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {skill.last_practiced ? formatRelative(skill.last_practiced) : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>

          {/* ── Recent Activity ── */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Recent Activity
            </h2>
            <Card>
              {recentActivity.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<Activity size={32} className="text-slate-600" />}
                    title="No activity yet"
                    description="Start with a lesson or quiz to see your activity here."
                  />
                </div>
              ) : (
                <div className="divide-y divide-space-border/50">
                  {recentActivity.slice(0, 10).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-space-surface/40 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-space-surface flex items-center justify-center flex-shrink-0">
                        {activityIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                      </div>
                      {item.score != null && (
                        <span className={`text-sm font-bold flex-shrink-0 ${
                          item.score >= 80 ? 'text-emerald-400' :
                          item.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {item.score}%
                        </span>
                      )}
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {item.created_at ? formatRelative(item.created_at) : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(400%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s ease-in-out infinite;
        }
      `}</style>
    </PageWrapper>
  )
}
