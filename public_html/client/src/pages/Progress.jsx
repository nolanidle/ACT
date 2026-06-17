import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Target, BookOpen, Clock, Flame,
  Award, Lock, Brain, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import MasteryPill from '../components/gamification/MasteryPill'
import ScoreTrend from '../components/charts/ScoreTrend'
import SkillRadar from '../components/charts/SkillRadar'
import AccuracyBar from '../components/charts/AccuracyBar'
import api from '../utils/api'
import { formatTime } from '../utils/formatters'

/* ─── Stat Card ──────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-space-surface flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xl font-black text-slate-100">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </Card>
  )
}

/* ─── Streak Calendar ─────────────────────────────────── */
function StreakCalendar({ activeDays = [] }) {
  const days = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    days.push({ date: iso, active: activeDays.includes(iso) })
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Last 30 Days</h3>
      <div className="flex flex-wrap gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={`w-5 h-5 rounded-sm transition-colors ${
              day.active ? 'bg-brand-blue shadow-sm shadow-brand-blue/40' : 'bg-space-surface border border-space-border'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Component ──────────────────────────────────────── */
export default function Progress() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, skillsRes, trendRes, badgesRes] = await Promise.allSettled([
          api.get('/progress/stats'),
          api.get('/progress/skills'),
          api.get('/progress/score-trend'),
          api.get('/progress/badges'),
        ])

        setData({
          stats: statsRes.status === 'fulfilled' ? statsRes.value.data : null,
          skills: skillsRes.status === 'fulfilled' ? skillsRes.value.data : null,
          trend: trendRes.status === 'fulfilled' ? trendRes.value.data : null,
          badges: badgesRes.status === 'fulfilled' ? badgesRes.value.data : null,
        })
      } catch {
        toast.error('Failed to load progress data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="xl" />
        </div>
      </PageWrapper>
    )
  }

  const stats = data?.stats || {}
  const skills = data?.skills || []
  const trend = data?.trend || []
  const badges = data?.badges || { earned: [], locked: [] }

  const statCards = [
    { icon: Target,    label: 'Total Questions',       value: (stats.total_questions || 0).toLocaleString(), color: 'text-brand-blue' },
    { icon: CheckCircle, label: 'Correct Answers',     value: (stats.correct_answers || 0).toLocaleString(), color: 'text-emerald-400' },
    { icon: BookOpen,  label: 'Lessons Completed',     value: (stats.lessons_completed || 0).toLocaleString(), color: 'text-violet-400' },
    { icon: Clock,     label: 'Time Studied',          value: formatTime(stats.time_studied_seconds || 0), color: 'text-amber-400' },
    { icon: Flame,     label: 'Current Streak',        value: `${stats.streak || 0} days`, color: 'text-orange-400' },
  ]

  return (
    <PageWrapper>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <h1 className="text-2xl font-black text-slate-100">My Progress</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your ACT prep journey.</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeInUp}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        </motion.div>

        {/* Score Trend */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-blue" />
              Score Trend
            </h2>
            {trend.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Complete a diagnostic or quiz to see your score trend.</p>
              </div>
            ) : (
              <ScoreTrend data={trend} />
            )}
          </Card>
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Radar */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
              <Brain size={18} className="text-brand-violet" />
              Skill Radar
            </h2>
            {skills.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No skill data yet.
              </div>
            ) : (
              <SkillRadar data={skills} />
            )}
          </Card>

          {/* Accuracy by Topic */}
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
              <Target size={18} className="text-emerald-400" />
              Topic Accuracy
            </h2>
            {skills.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No topic data yet.
              </div>
            ) : (
              <AccuracyBar data={skills} />
            )}
          </Card>
        </motion.div>

        {/* Full Skill Table */}
        {skills.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card>
              <div className="px-5 py-4 border-b border-space-border">
                <h2 className="text-base font-bold text-slate-100">All Skills</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-space-border">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mastery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill, i) => (
                      <tr key={i} className="border-b border-space-border/50 last:border-0 hover:bg-space-surface/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-200">{skill.topic || skill.name}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Streak Calendar */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              Study Streak
            </h2>
            <StreakCalendar activeDays={stats.active_days || []} />
          </Card>
        </motion.div>

        {/* Badges */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Badges
            </h2>
            {badges.earned?.length === 0 && badges.locked?.length === 0 ? (
              <p className="text-slate-500 text-sm">Complete activities to earn badges!</p>
            ) : (
              <div className="space-y-5">
                {badges.earned?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Earned ({badges.earned.length})</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                      {badges.earned.map((badge) => (
                        <div key={badge.id} className="flex flex-col items-center gap-1.5 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                            {badge.emoji || '🏆'}
                          </div>
                          <p className="text-xs text-slate-400 leading-tight">{badge.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {badges.locked?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Locked ({badges.locked.length})</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                      {badges.locked.map((badge) => (
                        <div key={badge.id} className="flex flex-col items-center gap-1.5 text-center opacity-40">
                          <div className="w-14 h-14 rounded-2xl bg-space-surface border border-space-border flex items-center justify-center">
                            <Lock size={20} className="text-slate-600" />
                          </div>
                          <p className="text-xs text-slate-600 leading-tight">{badge.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}
