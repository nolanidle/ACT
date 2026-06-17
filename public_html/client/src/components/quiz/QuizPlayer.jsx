import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Flag,
  Bookmark,
  Send,
  List,
  X,
} from 'lucide-react'
import QuestionCard from './QuestionCard'
import Timer from './Timer'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// Timer seconds per mode
const TIMER_MODE_SECONDS = {
  relaxed: null,         // no timer
  normal: 45 * 60,      // 45 min
  intense: 30 * 60,     // 30 min
}

/**
 * Full quiz player with question navigator, timer, and submission.
 *
 * @param {Array} questions - array of question objects
 * @param {string} sessionId - quiz session ID for autosave & submission
 * @param {'relaxed'|'normal'|'intense'} timerMode
 * @param {Function} onComplete - called with { answers, score } on submit
 */
export default function QuizPlayer({
  questions = [],
  sessionId,
  timerMode = 'normal',
  onComplete,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: selectedKey }
  const [flagged, setFlagged] = useState({}) // { [questionId]: bool }
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState(null)
  const autosaveRef = useRef(null)

  const totalSeconds = TIMER_MODE_SECONDS[timerMode]
  const currentQuestion = questions[currentIndex]
  const questionId = currentQuestion?.id || currentIndex

  // Detect passage-based questions (split layout)
  const hasPassage = !!currentQuestion?.passage

  // Auto-save every 30s
  useEffect(() => {
    if (submitted || !sessionId) return

    autosaveRef.current = setInterval(async () => {
      try {
        await api.post('/quiz/autosave', { sessionId, answers })
      } catch {
        // silent — autosave failures shouldn't interrupt the student
      }
    }, 30_000)

    return () => clearInterval(autosaveRef.current)
  }, [answers, sessionId, submitted])

  const selectAnswer = useCallback((key) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionId]: key }))
  }, [questionId, submitted])

  const toggleFlag = useCallback(() => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }))
  }, [questionId])

  const goTo = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
      setNavOpen(false)
    }
  }

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(answers).length
    if (unanswered > 0 && !submitted) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
      )
      if (!confirmed) return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post('/quiz/submit', { sessionId, answers })
      setSubmitted(true)
      setSubmitDone(true)
      clearInterval(autosaveRef.current)
      toast.success('Quiz submitted!')
      onComplete?.(data)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Submission failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExpire = useCallback(() => {
    toast('Time is up — submitting automatically.', { icon: '⏱️' })
    handleSubmit()
  }, [handleSubmit])

  const answeredCount = Object.keys(answers).length
  const flaggedCount = Object.values(flagged).filter(Boolean).length
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-screen bg-space-base">
      {/* Question Navigator Sidebar */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 bg-black/40 lg:hidden"
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-30 w-64 bg-space-deep border-r border-space-border overflow-y-auto lg:static lg:translate-x-0 lg:z-auto"
            >
              <NavigatorPanel
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                flagged={flagged}
                onGoTo={goTo}
                onClose={() => setNavOpen(false)}
                answeredCount={answeredCount}
                progress={progress}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop navigator */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-space-deep border-r border-space-border overflow-y-auto">
        <NavigatorPanel
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          flagged={flagged}
          onGoTo={goTo}
          answeredCount={answeredCount}
          progress={progress}
        />
      </aside>

      {/* Main quiz area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-deep/80 border-b border-space-border backdrop-blur-sm sticky top-0 z-10 gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile nav toggle */}
            <button
              onClick={() => setNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            >
              <List size={18} />
            </button>
            <div className="text-sm text-slate-400">
              <span className="font-semibold text-slate-200">
                Q{currentIndex + 1}
              </span>
              <span> / {questions.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Check size={12} className="text-emerald-400" />
              {answeredCount} answered
              {flaggedCount > 0 && (
                <>
                  <span className="mx-1">·</span>
                  <Bookmark size={12} className="text-amber-400" />
                  {flaggedCount} flagged
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            {totalSeconds && !submitted && (
              <Timer
                totalSeconds={totalSeconds}
                onExpire={handleExpire}
                autoStart
                size={56}
                className="scale-90"
              />
            )}

            {/* Submit button */}
            {!submitted ? (
              <motion.div layout>
                <Button
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  onClick={handleSubmit}
                  leftIcon={<Send size={14} />}
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </Button>
              </motion.div>
            ) : (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-semibold border border-emerald-500/25"
              >
                <Check size={14} strokeWidth={2.5} />
                Submitted
              </motion.span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className={`flex-1 flex overflow-hidden ${hasPassage ? 'flex-row' : 'flex-col'}`}>
          {/* Passage pane (split layout) */}
          {hasPassage && (
            <div className="w-1/2 flex-shrink-0 border-r border-space-border overflow-y-auto p-5 lg:p-6">
              <p className="text-xs font-semibold text-brand-blue-light uppercase tracking-wider mb-3">
                Passage
              </p>
              <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                {currentQuestion.passage}
              </p>
            </div>
          )}

          {/* Question pane */}
          <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${hasPassage ? 'w-1/2' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <QuestionCard
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                  selectedAnswer={answers[questionId]}
                  correctAnswer={
                    submitted ? currentQuestion?.correct_answer : null
                  }
                  submitted={submitted}
                  onSelectAnswer={selectAnswer}
                  flagged={!!flagged[questionId]}
                  onFlag={toggleFlag}
                  onReport={() => setReportTarget(currentQuestion?.id)}
                  showPassage={!hasPassage}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-space-deep/80 border-t border-space-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft size={16} />}
          >
            Previous
          </Button>

          {/* Progress dots (truncated) */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-sm">
            {questions.slice(0, 40).map((_, i) => {
              const qId = questions[i]?.id || i
              const isAns = !!answers[qId]
              const isCurr = i === currentIndex
              const isFlagged = !!flagged[qId]
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={[
                    'w-2.5 h-2.5 rounded-full transition-all duration-150',
                    isCurr
                      ? 'bg-brand-blue scale-125 shadow-sm shadow-brand-blue/50'
                      : isFlagged
                      ? 'bg-amber-400'
                      : isAns
                      ? 'bg-emerald-500'
                      : 'bg-space-border hover:bg-slate-500',
                  ].join(' ')}
                  aria-label={`Go to question ${i + 1}`}
                />
              )
            })}
            {questions.length > 40 && (
              <span className="text-xs text-slate-600">+{questions.length - 40}</span>
            )}
          </div>

          <Button
            variant={currentIndex === questions.length - 1 ? 'primary' : 'secondary'}
            size="sm"
            onClick={
              currentIndex === questions.length - 1
                ? handleSubmit
                : () => goTo(currentIndex + 1)
            }
            disabled={currentIndex === questions.length - 1 && submitted}
            rightIcon={
              currentIndex === questions.length - 1 ? (
                <Send size={14} />
              ) : (
                <ChevronRight size={16} />
              )
            }
          >
            {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Navigator Panel ─────────────────────────────────────────── */
function NavigatorPanel({
  questions,
  currentIndex,
  answers,
  flagged,
  onGoTo,
  onClose,
  answeredCount,
  progress,
}) {
  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-space-border">
        <div>
          <p className="text-sm font-semibold text-slate-200">Questions</p>
          <p className="text-xs text-slate-500">{answeredCount} / {questions.length} answered</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4 py-3 border-b border-space-border">
        <div className="h-1.5 bg-space-surface rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-brand-blue to-brand-blue-light rounded-full"
          />
        </div>
        <p className="text-xs text-slate-600 mt-1">{progress}% complete</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-space-border flex-wrap">
        {[
          { color: 'bg-brand-blue', label: 'Current' },
          { color: 'bg-emerald-500', label: 'Answered' },
          { color: 'bg-amber-400', label: 'Flagged' },
          { color: 'bg-space-border', label: 'Unanswered' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid of question buttons */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            const qId = q?.id || i
            const isAnswered = !!answers[qId]
            const isCurrent = i === currentIndex
            const isFlagged = !!flagged[qId]

            return (
              <button
                key={i}
                onClick={() => onGoTo(i)}
                className={[
                  'aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-150',
                  isCurrent
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30 scale-110'
                    : isFlagged
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : isAnswered
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-space-surface text-slate-500 border border-space-border hover:border-slate-500 hover:text-slate-300',
                ].join(' ')}
                title={`Question ${i + 1}${isFlagged ? ' (flagged)' : isAnswered ? ' (answered)' : ''}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
