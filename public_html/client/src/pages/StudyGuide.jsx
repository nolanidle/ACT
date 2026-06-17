import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Target, Brain, Zap, CheckCircle, Circle,
  RefreshCw, Calendar, Clock, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import api from '../utils/api'
import { formatDate } from '../utils/formatters'

/* ─── Week Card ──────────────────────────────────────── */
function WeekCard({ week, onTaskComplete }) {
  const [expanded, setExpanded] = useState(week.week_number === 1)

  const completedCount = week.days?.reduce(
    (sum, day) => sum + (day.tasks?.filter((t) => t.completed)?.length || 0),
    0
  ) || 0
  const totalCount = week.days?.reduce(
    (sum, day) => sum + (day.tasks?.length || 0),
    0
  ) || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-space-surface/40 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <Calendar size={18} className="text-brand-blue" />
          </div>
          <div>
            <p className="font-bold text-slate-100">Week {week.week_number}</p>
            <p className="text-xs text-slate-500">{completedCount}/{totalCount} tasks complete</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:block w-24 h-1.5 rounded-full bg-space-surface overflow-hidden">
            <div
              className="h-full bg-brand-blue rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-brand-blue font-semibold">{progress}%</span>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {week.days?.map((day, di) => (
                <div key={di}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Day {day.day_number} {day.date ? `— ${formatDate(day.date)}` : ''}
                  </p>
                  <div className="space-y-2">
                    {day.tasks?.map((task, ti) => (
                      <button
                        key={ti}
                        onClick={() => onTaskComplete(week.week_number, di, ti, !task.completed)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          task.completed
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-space-surface border-space-border hover:border-brand-blue/30'
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-600 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                            {task.title}
                          </p>
                          {task.type && (
                            <p className="text-xs text-slate-500 capitalize">{task.type}</p>
                          )}
                        </div>
                        {task.duration_min && (
                          <div className="flex items-center gap-1 text-slate-600 text-xs flex-shrink-0">
                            <Clock size={11} />
                            {task.duration_min}m
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

/* ─── Self Guide Tab ─────────────────────────────────── */
function SelfGuideTab({ recentLessons, recentQuizzes }) {
  const navigate = useNavigate()

  const generators = [
    { label: 'Lesson Generator', desc: 'AI-generated lessons for any topic', icon: BookOpen, route: '/lesson-generator', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Quiz Generator', desc: 'Practice with custom questions', icon: Target, route: '/quiz-generator', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Exam Generator', desc: 'Full-length practice exam', icon: Brain, route: '/exam-generator', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Generators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {generators.map((g) => {
            const Icon = g.icon
            return (
              <button
                key={g.label}
                onClick={() => navigate(g.route)}
                className={`flex flex-col items-start gap-3 p-5 rounded-2xl border ${g.bg} hover:scale-[1.02] transition-all duration-200 text-left group`}
              >
                <div className={`w-10 h-10 rounded-xl bg-space-surface flex items-center justify-center ${g.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-100 text-sm">{g.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{g.desc}</p>
                </div>
                <ArrowRight size={14} className={`${g.color} group-hover:translate-x-1 transition-transform`} />
              </button>
            )
          })}
        </div>
      </motion.div>

      {recentLessons?.length > 0 && (
        <motion.div variants={fadeInUp}>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Recent Lessons</h2>
          <Card>
            <div className="divide-y divide-space-border/50">
              {recentLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-space-surface/40 transition-colors text-left"
                >
                  <BookOpen size={15} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{lesson.section} · {lesson.topic}</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-600 -rotate-90" />
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ─── Component ──────────────────────────────────────── */
export default function StudyGuide() {
  const [tab, setTab] = useState('follow')
  const [plan, setPlan] = useState(null)
  const [recentLessons, setRecentLessons] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, lessonsRes] = await Promise.allSettled([
          api.get('/study-plan/active'),
          api.get('/lesson?limit=5'),
        ])
        if (planRes.status === 'fulfilled') setPlan(planRes.value.data)
        if (lessonsRes.status === 'fulfilled') setRecentLessons(lessonsRes.value.data?.lessons || lessonsRes.value.data || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleGeneratePlan = async () => {
    setGenerating(true)
    try {
      const { data } = await api.post('/study-plan/generate')
      setPlan(data)
      toast.success('New study plan generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleTaskComplete = async (weekNum, dayIdx, taskIdx, completed) => {
    if (!plan) return
    const updated = { ...plan }
    updated.weeks = updated.weeks.map((w) => {
      if (w.week_number !== weekNum) return w
      return {
        ...w,
        days: w.days.map((d, di) => {
          if (di !== dayIdx) return d
          return {
            ...d,
            tasks: d.tasks.map((t, ti) =>
              ti === taskIdx ? { ...t, completed } : t
            ),
          }
        }),
      }
    })
    setPlan(updated)
    try {
      const week = plan.weeks.find((w) => w.week_number === weekNum)
      const task = week?.days?.[dayIdx]?.tasks?.[taskIdx]
      if (task?.id) {
        await api.patch(`/study-plan/task/${task.id}`, { completed })
      }
    } catch {
      // silent — optimistic update
    }
  }

  return (
    <PageWrapper>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-100">Study Guide</h1>
            <p className="text-slate-400 text-sm mt-0.5">Your personalized ACT prep roadmap.</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp} className="flex gap-1 p-1 bg-space-card border border-space-border rounded-xl w-fit">
          {['follow', 'self'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t
                  ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'follow' ? 'Follow Guide' : 'Self Guide'}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'follow' ? (
              <motion.div
                key="follow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Plan header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {plan && (
                    <div>
                      <p className="text-sm text-slate-400">
                        Goal score: <span className="text-slate-200 font-semibold">{plan.goal_score || '—'}</span>
                        {plan.weeks?.length ? ` · ${plan.weeks.length} weeks` : ''}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGeneratePlan}
                    loading={generating}
                    leftIcon={<RefreshCw size={14} />}
                  >
                    Generate New Plan
                  </Button>
                </div>

                {!plan ? (
                  <EmptyState
                    icon={<Calendar size={40} className="text-slate-600" />}
                    title="No study plan yet"
                    description="Generate a personalized AI study plan based on your goals and schedule."
                    action={
                      <Button
                        variant="primary"
                        onClick={handleGeneratePlan}
                        loading={generating}
                        leftIcon={<Zap size={16} />}
                      >
                        Generate Plan
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {plan.weeks?.map((week) => (
                      <WeekCard
                        key={week.week_number}
                        week={week}
                        onTaskComplete={handleTaskComplete}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="self"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SelfGuideTab recentLessons={recentLessons} recentQuizzes={recentQuizzes} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </PageWrapper>
  )
}
