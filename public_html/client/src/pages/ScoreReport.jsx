import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import {
  TrendingUp, Brain, BookOpen, Target, ChevronRight,
  ArrowUp, ArrowDown, Minus, BarChart2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import MasteryPill from '../components/gamification/MasteryPill'
import api from '../utils/api'
import { getScoreColor } from '../utils/scoring'

/* ─── Animated Score Display ─────────────────────────── */
function AnimatedScore({ finalScore, colorClass }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!finalScore || !ref.current) return
    const obj = { value: 0 }
    gsap.to(obj, {
      value: finalScore,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.value)
        }
      },
    })
  }, [finalScore])

  return (
    <span ref={ref} className={`text-7xl font-black ${colorClass}`}>
      0
    </span>
  )
}

/* ─── Topic Row ──────────────────────────────────────── */
function TopicRow({ topic }) {
  const accuracy = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0
  const masteryDelta = topic.mastery_delta || 0

  return (
    <tr className="border-b border-space-border/50 last:border-0 hover:bg-space-surface/40 transition-colors">
      <td className="px-5 py-3 text-sm font-medium text-slate-200">{topic.topic}</td>
      <td className="px-4 py-3 text-sm text-slate-400 capitalize">{topic.section}</td>
      <td className="px-4 py-3 text-sm text-center">
        <span className="text-slate-300">{topic.correct}/{topic.total}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`text-sm font-bold ${
          accuracy >= 80 ? 'text-emerald-400' : accuracy >= 60 ? 'text-amber-400' : 'text-rose-400'
        }`}>
          {accuracy}%
        </span>
      </td>
      <td className="px-4 py-3">
        <MasteryPill level={topic.mastery || 'not_started'} />
      </td>
      <td className="px-4 py-3 text-center">
        {masteryDelta > 0 ? (
          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
            <ArrowUp size={12} /> Improved
          </span>
        ) : masteryDelta < 0 ? (
          <span className="inline-flex items-center gap-1 text-rose-400 text-xs">
            <ArrowDown size={12} /> Dropped
          </span>
        ) : (
          <Minus size={14} className="text-slate-600 mx-auto" />
        )}
      </td>
    </tr>
  )
}

/* ─── Recharts tooltip ───────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-space-card border border-space-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-slate-200 mb-1 capitalize">{label}</p>
      <p className="text-sm text-brand-blue">{payload[0].value}% accuracy</p>
    </div>
  )
}

/* ─── Component ──────────────────────────────────────── */
export default function ScoreReport() {
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const type = searchParams.get('type') || 'quiz'

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        let endpoint
        switch (type) {
          case 'diagnostic': endpoint = `/diagnostic/${sessionId}/report`; break
          case 'exam':       endpoint = `/exam/${sessionId}/report`; break
          default:           endpoint = `/quiz/${sessionId}/report`
        }
        const { data } = await api.get(endpoint)
        setReport(data)
      } catch (err) {
        toast.error('Failed to load score report')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [sessionId, type])

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="xl" />
        </div>
      </PageWrapper>
    )
  }

  if (!report) {
    return (
      <PageWrapper>
        <div className="text-center py-20">
          <p className="text-slate-400">Report not found.</p>
        </div>
      </PageWrapper>
    )
  }

  const scaleScore = report.scale_score || report.composite || null
  const colorClass = getScoreColor(scaleScore || 0)

  const sectionChartData = Object.entries(report.sections || {}).map(([section, data]) => ({
    section: section.charAt(0).toUpperCase() + section.slice(1),
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    correct: data.correct,
    total: data.total,
  }))

  const weakestSkills = (report.topic_accuracy || [])
    .filter((t) => (t.total > 0) && ((t.correct / t.total) < 0.65))
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
    .slice(0, 5)

  return (
    <PageWrapper>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Score Reveal Header ── */}
        <motion.div variants={fadeInUp}>
          <Card glow className="p-8 text-center">
            <p className="text-sm font-semibold text-brand-blue uppercase tracking-widest mb-2">
              {type === 'diagnostic' ? 'Diagnostic' : type === 'exam' ? 'Practice Exam' : 'Quiz'} Complete
            </p>
            {scaleScore ? (
              <>
                <p className="text-slate-400 text-sm mb-2">Your Score</p>
                <AnimatedScore finalScore={scaleScore} colorClass={colorClass} />
                <p className="text-slate-500 text-sm mt-1">/ 36</p>
              </>
            ) : (
              <>
                <p className="text-slate-400 text-sm mb-2">Accuracy</p>
                <p className={`text-7xl font-black ${
                  (report.accuracy || 0) >= 80 ? 'text-emerald-400' :
                  (report.accuracy || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {report.accuracy || 0}%
                </p>
              </>
            )}
            <div className="flex items-center justify-center gap-6 mt-5 text-sm">
              <div className="text-center">
                <p className="text-emerald-400 font-bold text-xl">{report.correct || 0}</p>
                <p className="text-slate-500">Correct</p>
              </div>
              <div className="w-px h-8 bg-space-border" />
              <div className="text-center">
                <p className="text-rose-400 font-bold text-xl">{(report.total || 0) - (report.correct || 0)}</p>
                <p className="text-slate-500">Incorrect</p>
              </div>
              <div className="w-px h-8 bg-space-border" />
              <div className="text-center">
                <p className="text-slate-200 font-bold text-xl">{report.total || 0}</p>
                <p className="text-slate-500">Total</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── Section Breakdown Chart ── */}
        {sectionChartData.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="p-6">
              <h2 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2">
                <BarChart2 size={18} className="text-brand-blue" />
                Section Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectionChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" vertical={false} />
                  <XAxis
                    dataKey="section"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,58,79,0.5)' }} />
                  <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                    {sectionChartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.accuracy >= 80 ? '#10b981' :
                          entry.accuracy >= 60 ? '#f59e0b' : '#f43f5e'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* ── Topic Accuracy Table ── */}
        {report.topic_accuracy?.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card>
              <div className="px-5 py-4 border-b border-space-border">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Target size={16} className="text-brand-violet" />
                  Topic Accuracy
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-space-border">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Accuracy</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mastery</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topic_accuracy.map((topic, i) => (
                      <TopicRow key={i} topic={topic} />
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Weakest Skills ── */}
        {weakestSkills.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="p-6">
              <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Brain size={16} className="text-rose-400" />
                Focus Areas
              </h2>
              <div className="space-y-3">
                {weakestSkills.map((skill, i) => {
                  const acc = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-space-surface border border-space-border"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{skill.topic}</p>
                        <p className="text-xs text-rose-400 capitalize">{acc}% accuracy</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => navigate(`/lesson-generator?topic=${encodeURIComponent(skill.topic)}&section=${skill.section || ''}`)}
                        rightIcon={<ChevronRight size={13} />}
                      >
                        Generate Lesson
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── AI Suggestions ── */}
        {report.ai_suggestions && (
          <motion.div variants={fadeInUp}>
            <Card className="p-6 border-brand-blue/20">
              <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-blue" />
                AI Improvement Tips
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {report.ai_suggestions}
              </p>
            </Card>
          </motion.div>
        )}

        {/* ── Actions ── */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/quiz-generator')}
            leftIcon={<Target size={16} />}
          >
            Try Another Quiz
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/progress')}
            leftIcon={<TrendingUp size={16} />}
          >
            View Full Progress
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}
