import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Square, Clock, Zap, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import useAuthStore from '../store/authStore'
import api from '../utils/api'

const SECTION_CONFIG = [
  { id: 'english',  label: 'English',  questions: 75, minutes: 45, required: true },
  { id: 'math',     label: 'Math',     questions: 60, minutes: 60, required: true },
  { id: 'reading',  label: 'Reading',  questions: 40, minutes: 35, required: true },
  { id: 'science',  label: 'Science',  questions: 40, minutes: 35, required: false },
]

function formatMinutes(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

/* ─── Asteroid Loading Screen ────────────────────────── */
function ExamLoadingScreen({ status, progress }) {
  return (
    <div className="fixed inset-0 bg-space-base flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.7 ? 2 : 1,
              height: Math.random() > 0.7 ? 2 : 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Animated asteroid */}
      <div className="relative mb-10">
        <div className="asteroid-spin w-32 h-32 flex items-center justify-center">
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
            <ellipse cx="60" cy="50" rx="50" ry="40" fill="#1a2236" stroke="#2d4a8f" strokeWidth="1.5"/>
            <ellipse cx="38" cy="38" rx="10" ry="7" fill="#2d3a4f"/>
            <ellipse cx="75" cy="60" rx="7" ry="5" fill="#2d3a4f"/>
            <ellipse cx="50" cy="28" rx="4" ry="3" fill="#3d4a6f"/>
            <ellipse cx="85" cy="40" rx="5" ry="3.5" fill="#2d3a4f"/>
            <circle cx="30" cy="62" r="4" fill="#3d4a6f"/>
            <ellipse cx="65" cy="72" rx="6" ry="4" fill="#2d3a4f"/>
          </svg>
        </div>
        {/* Orbit ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="orbit-ring w-44 h-44 rounded-full border border-brand-blue/30" />
          <div className="orbit-dot-exam absolute">
            <div className="w-3 h-3 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-slate-100 mb-3">Building Your Exam</h2>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-slate-400 text-center max-w-sm mb-8"
        >
          {status || 'Preparing your exam...'}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-space-card rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-brand-blue rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-slate-600 mt-2">{progress}%</p>

      <style>{`
        @keyframes asteroid-spin {
          0%   { transform: rotate(0deg) translateY(-4px); }
          50%  { transform: rotate(5deg) translateY(4px); }
          100% { transform: rotate(0deg) translateY(-4px); }
        }
        @keyframes orbit-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .asteroid-spin { animation: asteroid-spin 4s ease-in-out infinite; }
        .orbit-ring    { animation: orbit-ring-spin 4s linear infinite; }
        .orbit-dot-exam {
          width: 176px;
          height: 176px;
          animation: orbit-ring-spin 4s linear infinite;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 2px;
        }
      `}</style>
    </div>
  )
}

/* ─── Component ──────────────────────────────────────── */
export default function ExamGenerator() {
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()

  const [sections, setSections] = useState(['english', 'math', 'reading', 'science'])
  const [loading, setLoading] = useState(false)
  const [sseStatus, setSseStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const eventSourceRef = useRef(null)

  const toggleSection = (id) => {
    const cfg = SECTION_CONFIG.find((s) => s.id === id)
    if (cfg?.required) return // can't uncheck required
    setSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const totalTime = sections.reduce(
    (sum, id) => sum + (SECTION_CONFIG.find((s) => s.id === id)?.minutes || 0),
    0
  )
  const totalQuestions = sections.reduce(
    (sum, id) => sum + (SECTION_CONFIG.find((s) => s.id === id)?.questions || 0),
    0
  )

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  const handleGenerate = () => {
    if (sections.length === 0) {
      toast.error('Select at least one section')
      return
    }
    setLoading(true)
    setSseStatus('Preparing your exam...')
    setProgress(5)

    const params = new URLSearchParams({
      sections: sections.join(','),
      ...(accessToken ? { token: accessToken } : {}),
    })

    const es = new EventSource(`/api/exam/generate?${params.toString()}`)
    eventSourceRef.current = es

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.status === 'progress' || msg.progress) {
          setSseStatus(msg.message || msg.status || 'Generating...')
          setProgress(msg.percent || progress)
        }
        if (msg.status === 'complete') {
          es.close()
          setProgress(100)
          navigate(`/practice-session/${msg.sessionId}?type=exam`)
        }
        if (msg.status === 'error') {
          es.close()
          setLoading(false)
          toast.error(msg.message || 'Exam generation failed')
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
      setLoading(false)
      // Fallback to regular POST
      handleFallbackGenerate()
    }
  }

  const handleFallbackGenerate = async () => {
    try {
      const { data } = await api.post('/exam/generate', { sections })
      navigate(`/practice-session/${data.sessionId || data.id}?type=exam`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Exam generation failed')
      setLoading(false)
    }
  }

  if (loading) {
    return <ExamLoadingScreen status={sseStatus} progress={progress} />
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          <motion.div variants={fadeInUp}>
            <h1 className="text-2xl font-black text-slate-100">Full Practice Exam</h1>
            <p className="text-slate-400 text-sm mt-1">Generate a complete ACT practice exam with AI-generated questions.</p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Select Sections</label>
                <div className="space-y-3">
                  {SECTION_CONFIG.map((cfg) => {
                    const selected = sections.includes(cfg.id)
                    return (
                      <button
                        key={cfg.id}
                        onClick={() => toggleSection(cfg.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          selected
                            ? 'border-brand-blue bg-brand-blue/10'
                            : 'border-space-border bg-space-surface hover:border-brand-blue/30'
                        } ${cfg.required ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          {selected ? (
                            <CheckSquare size={18} className="text-brand-blue flex-shrink-0" />
                          ) : (
                            <Square size={18} className="text-slate-600 flex-shrink-0" />
                          )}
                          <div className="text-left">
                            <p className={`font-semibold text-sm ${selected ? 'text-slate-100' : 'text-slate-400'}`}>
                              {cfg.label}
                              {cfg.required && (
                                <span className="ml-2 text-xs text-slate-600 font-normal">(required)</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{cfg.questions} questions · {formatMinutes(cfg.minutes)}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${selected ? 'bg-brand-blue' : 'bg-slate-700'}`} />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="flex items-center gap-6 pt-2 border-t border-space-border">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Brain size={15} />
                  <span>{totalQuestions} questions</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock size={15} />
                  <span>~{formatMinutes(totalTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Zap size={15} />
                  <span>{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleGenerate}
              leftIcon={<Zap size={18} />}
            >
              Generate Full Exam
            </Button>
            <p className="text-xs text-slate-600 text-center mt-2">
              AI generates all questions fresh — this may take 30–60 seconds.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
