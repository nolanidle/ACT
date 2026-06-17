import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Zap, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import api from '../utils/api'

const TESTS = ['ACT', 'PreACT']
const SECTIONS = ['English', 'Math', 'Reading', 'Science']
const LENGTHS = [5, 10, 15, 20]
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const TIMER_MODES = [
  { label: 'Relaxed', value: 'relaxed', desc: 'No timer' },
  { label: 'Normal', value: 'normal', desc: 'ACT pacing' },
  { label: 'Intense', value: 'intense', desc: 'Reduced time' },
]

const TOPIC_EXAMPLES = {
  English: 'Punctuation, Subject-Verb Agreement, Transitions',
  Math: 'Quadratic Equations, Trigonometry, Probability',
  Reading: 'Main Idea, Author\'s Purpose, Inference',
  Science: 'Data Representation, Research Summaries',
}

export default function QuizGenerator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lessonId = searchParams.get('lessonId')

  const [test, setTest] = useState('ACT')
  const [section, setSection] = useState(searchParams.get('section') || 'English')
  const [topic, setTopic] = useState(searchParams.get('topic') || '')
  const [length, setLength] = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [timerMode, setTimerMode] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [prefilling, setPrefilling] = useState(false)

  // Pre-fill from lesson if lessonId provided
  useEffect(() => {
    if (!lessonId) return
    const fetchLesson = async () => {
      setPrefilling(true)
      try {
        const { data } = await api.get(`/lesson/${lessonId}`)
        if (data.section) setSection(data.section.charAt(0).toUpperCase() + data.section.slice(1))
        if (data.topic) setTopic(data.topic)
        if (data.test) setTest(data.test.toUpperCase() === 'ACT' ? 'ACT' : 'PreACT')
      } catch {
        // ignore
      } finally {
        setPrefilling(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    setLoading(true)
    try {
      const payload = {
        test: test.toLowerCase(),
        section: section.toLowerCase(),
        topic: topic.trim(),
        length,
        difficulty: difficulty.toLowerCase(),
        timer_mode: timerMode,
      }
      if (lessonId) payload.lesson_id = lessonId

      const { data } = await api.post('/quiz/generate', payload)
      navigate(`/practice-session/${data.sessionId || data.id}?type=quiz`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-black text-slate-100">Quiz Generator</h1>
            <p className="text-slate-400 text-sm mt-1">
              {lessonId ? 'Generating a quiz based on your lesson.' : 'AI will generate custom practice questions.'}
            </p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="p-6 space-y-6">
              {/* Test */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Test</label>
                <div className="flex gap-2">
                  {TESTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTest(t)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        test === t
                          ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/25'
                          : 'border-space-border text-slate-400 hover:border-brand-blue/40 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Section</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SECTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSection(s); if (!lessonId) setTopic('') }}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all ${
                        section === s
                          ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/25'
                          : 'border-space-border text-slate-400 hover:border-brand-blue/40 hover:text-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`e.g., ${TOPIC_EXAMPLES[section] || 'Enter topic'}`}
                  disabled={prefilling}
                  className="w-full px-4 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm disabled:opacity-50"
                />
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Questions</label>
                <div className="flex gap-2 flex-wrap">
                  {LENGTHS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        length === l
                          ? 'bg-brand-blue border-brand-blue text-white shadow-lg shadow-brand-blue/25'
                          : 'border-space-border text-slate-400 hover:border-brand-blue/40 hover:text-slate-200'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        difficulty === d
                          ? d === 'Easy'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : d === 'Medium'
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'bg-rose-500 border-rose-500 text-white'
                          : 'border-space-border text-slate-400 hover:border-brand-blue/40 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Mode */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Timer Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMER_MODES.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setTimerMode(m.value)}
                      className={`flex flex-col items-center gap-0.5 py-3 px-3 rounded-xl border transition-all text-center ${
                        timerMode === m.value
                          ? 'bg-brand-blue/10 border-brand-blue text-slate-100'
                          : 'border-space-border text-slate-400 hover:border-brand-blue/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold text-sm">{m.label}</span>
                      <span className="text-xs text-slate-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Generate */}
          <motion.div variants={fadeInUp}>
            {loading ? (
              <Card className="p-8 border-brand-blue/20">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Spinner size="xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={16} className="text-brand-blue animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-200">Generating your quiz...</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Creating {length} questions on <span className="text-slate-300">{topic}</span>
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleGenerate}
                leftIcon={<Zap size={18} />}
              >
                Generate Quiz
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
