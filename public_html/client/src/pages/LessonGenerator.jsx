import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Zap, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import api from '../utils/api'

const TESTS = ['ACT', 'PreACT']
const SECTIONS = ['English', 'Math', 'Reading', 'Science']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const LENGTHS = [
  { label: 'Short', value: 'short', desc: '3 blocks (~5 min)' },
  { label: 'Medium', value: 'medium', desc: '5 blocks (~10 min)' },
  { label: 'Long', value: 'long', desc: '8 blocks (~18 min)' },
]

const TOPIC_EXAMPLES = {
  English: 'Punctuation, Subject-Verb Agreement, Transitions',
  Math: 'Quadratic Equations, Trigonometry, Probability',
  Reading: 'Main Idea, Author\'s Purpose, Inference',
  Science: 'Data Representation, Research Summaries, Conflicting Viewpoints',
}

export default function LessonGenerator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [test, setTest] = useState('ACT')
  const [section, setSection] = useState(searchParams.get('section') || 'English')
  const [topic, setTopic] = useState(searchParams.get('topic') || '')
  const [difficulty, setDifficulty] = useState('Medium')
  const [length, setLength] = useState('medium')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/lesson/generate', {
        test: test.toLowerCase(),
        section: section.toLowerCase(),
        topic: topic.trim(),
        difficulty: difficulty.toLowerCase(),
        length,
      })
      navigate(`/lesson/${data.lessonId || data.id}`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate lesson'
      toast.error(msg)
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
            <h1 className="text-2xl font-black text-slate-100">Lesson Generator</h1>
            <p className="text-slate-400 text-sm mt-1">AI will generate a custom lesson tailored to your needs.</p>
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
                      onClick={() => { setSection(s); setTopic('') }}
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
                  placeholder={`e.g., ${TOPIC_EXAMPLES[section] || 'Enter a topic'}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-space-surface border border-space-border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all text-sm"
                />
                <p className="text-xs text-slate-600 mt-1.5">
                  Examples: {TOPIC_EXAMPLES[section]}
                </p>
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

              {/* Length */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Lesson Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value)}
                      className={`flex flex-col items-center gap-0.5 py-3 px-3 rounded-xl border transition-all text-center ${
                        length === l.value
                          ? 'bg-brand-blue/10 border-brand-blue text-slate-100'
                          : 'border-space-border text-slate-400 hover:border-brand-blue/40 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold text-sm">{l.label}</span>
                      <span className="text-xs text-slate-500">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Generate button or loading */}
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
                    <p className="font-semibold text-slate-200">Generating your lesson...</p>
                    <p className="text-sm text-slate-500 mt-1">AI is crafting a personalized lesson on <span className="text-slate-300">{topic}</span></p>
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
                Generate Lesson
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
