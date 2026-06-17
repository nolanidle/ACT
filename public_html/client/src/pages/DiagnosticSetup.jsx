import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, CheckCircle, Clock, Layers, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { fadeInUp, staggerContainer } from '../animations/variants'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../utils/api'

const SECTIONS = ['English', 'Math', 'Reading', 'Science']

const MODES = [
  {
    id: 'quick',
    label: 'Quick',
    description: '10 questions per section',
    time: '~15 min',
    questions: 10,
  },
  {
    id: 'standard',
    label: 'Standard',
    description: '20 questions per section',
    time: '~30 min',
    questions: 20,
  },
  {
    id: 'full',
    label: 'Full ACT',
    description: 'Complete ACT format',
    time: '2h 55min',
    questions: null,
  },
]

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[...Array(total)].map((_, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
            i < step
              ? 'bg-brand-blue border-brand-blue text-white'
              : i === step
              ? 'border-brand-blue text-brand-blue bg-brand-blue/10'
              : 'border-space-border text-slate-600 bg-space-surface'
          }`}>
            {i < step ? <CheckCircle size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 transition-all ${i < step ? 'bg-brand-blue' : 'bg-space-border'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function DiagnosticSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const testType = searchParams.get('test') || 'act'

  const [step, setStep] = useState(0)
  const [selectedSections, setSelectedSections] = useState(['English', 'Math', 'Reading', 'Science'])
  const [selectedMode, setSelectedMode] = useState('quick')
  const [loading, setLoading] = useState(false)

  const toggleSection = (section) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const mode = MODES.find((m) => m.id === selectedMode)

  const handleStart = async () => {
    if (selectedSections.length === 0) {
      toast.error('Please select at least one section')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/diagnostic/generate', {
        test: testType,
        sections: selectedSections.map((s) => s.toLowerCase()),
        mode: selectedMode,
      })
      navigate(`/practice-session/${data.sessionId}?type=diagnostic`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate diagnostic'
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
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <h1 className="text-2xl font-black text-slate-100">
              {testType === 'act' ? 'ACT' : 'PreACT'} Diagnostic Setup
            </h1>
            <p className="text-slate-400 text-sm mt-1">Configure your diagnostic test.</p>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <StepIndicator step={step} total={3} />
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 0: Sections */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-slate-100 mb-1">Select Sections</h2>
                  <p className="text-slate-400 text-sm mb-5">Choose which sections to include in your diagnostic.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {SECTIONS.map((section) => {
                      const selected = selectedSections.includes(section)
                      return (
                        <button
                          key={section}
                          onClick={() => toggleSection(section)}
                          className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                            selected
                              ? 'border-brand-blue bg-brand-blue/10 text-slate-100'
                              : 'border-space-border bg-space-surface text-slate-400 hover:border-brand-blue/40'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selected ? 'border-brand-blue bg-brand-blue' : 'border-slate-600'
                          }`}>
                            {selected && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="font-semibold">{section}</span>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 1: Mode */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-slate-100 mb-1">Select Mode</h2>
                  <p className="text-slate-400 text-sm mb-5">How many questions per section?</p>
                  <div className="space-y-3">
                    {MODES.map((m) => {
                      const selected = selectedMode === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMode(m.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                            selected
                              ? 'border-brand-blue bg-brand-blue/10'
                              : 'border-space-border bg-space-surface hover:border-brand-blue/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selected ? 'border-brand-blue bg-brand-blue' : 'border-slate-600'
                            }`}>
                              {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <div className="text-left">
                              <p className={`font-semibold ${selected ? 'text-slate-100' : 'text-slate-300'}`}>{m.label}</p>
                              <p className="text-xs text-slate-500">{m.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                            <Clock size={14} />
                            <span>{m.time}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-slate-100 mb-5">Review & Start</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-space-surface border border-space-border">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Layers size={15} />
                        <span>Test</span>
                      </div>
                      <span className="text-slate-100 font-semibold uppercase">{testType}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-space-surface border border-space-border">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <CheckCircle size={15} />
                        <span>Sections</span>
                      </div>
                      <span className="text-slate-100 font-semibold">{selectedSections.join(', ')}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-space-surface border border-space-border">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock size={15} />
                        <span>Mode</span>
                      </div>
                      <span className="text-slate-100 font-semibold">{mode?.label} — {mode?.time}</span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loading}
                    onClick={handleStart}
                    leftIcon={<Zap size={16} />}
                  >
                    Generate &amp; Start Diagnostic
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div variants={fadeInUp} className="flex justify-between mt-5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => step > 0 ? setStep((s) => s - 1) : navigate(-1)}
              leftIcon={<ChevronLeft size={16} />}
            >
              {step === 0 ? 'Back' : 'Previous'}
            </Button>
            {step < 2 && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (step === 0 && selectedSections.length === 0) {
                    toast.error('Select at least one section')
                    return
                  }
                  setStep((s) => s + 1)
                }}
                rightIcon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
