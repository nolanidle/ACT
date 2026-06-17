import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Flag, AlertCircle } from 'lucide-react'
import AnswerChoice from './AnswerChoice'
import LatexRenderer from '../math/LatexRenderer'
import DiagramRenderer from '../diagrams/DiagramRenderer'
import { fadeInUp } from '../../animations/variants'

/**
 * Renders a single ACT question with choices, optional passage, and controls.
 *
 * @param {object} question - question data object
 * @param {number} questionNumber - 1-based display number
 * @param {string|null} selectedAnswer - currently selected answer key
 * @param {string|null} correctAnswer - revealed after submission (answer key)
 * @param {boolean} submitted - whether answers have been locked/revealed
 * @param {Function} onSelectAnswer - (key) => void
 * @param {boolean} flagged
 * @param {Function} onFlag - () => void
 * @param {Function} onReport - () => void
 * @param {boolean} showPassage - when false, passage is hidden (split layout handles it)
 */
export default function QuestionCard({
  question = {},
  questionNumber = 1,
  selectedAnswer = null,
  correctAnswer = null,
  submitted = false,
  onSelectAnswer,
  flagged = false,
  onFlag,
  onReport,
  showPassage = true,
}) {
  const {
    question_text = '',
    question_latex,
    choices = [],
    passage,
    visual_json,
    explanation,
    difficulty,
  } = question

  const [showExplanation, setShowExplanation] = useState(false)

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-5"
    >
      {/* Passage (shown in single-pane mode) */}
      {showPassage && passage && (
        <div className="rounded-xl bg-space-surface border border-space-border p-5">
          <p className="text-xs font-semibold text-brand-blue-light uppercase tracking-wider mb-3">
            Passage
          </p>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {passage}
          </p>
        </div>
      )}

      {/* Question body */}
      <div className="rounded-2xl bg-space-card border border-space-border p-6 shadow-sm">
        {/* Question header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue/30 to-brand-violet/30 border border-brand-blue/30 flex items-center justify-center text-sm font-bold text-brand-blue-light flex-shrink-0">
              {questionNumber}
            </span>
            {difficulty && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors[difficulty] || difficultyColors.medium}`}
              >
                {difficulty}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={onFlag}
              title={flagged ? 'Unflag question' : 'Flag for review'}
              className={`p-2 rounded-lg transition-colors ${
                flagged
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              {flagged ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button
              onClick={onReport}
              title="Report an issue"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <AlertCircle size={16} />
            </button>
          </div>
        </div>

        {/* Question text */}
        <div className="mb-5">
          <div className="text-slate-100 text-base leading-relaxed">
            {question_latex ? (
              <span>
                {question_text && <span className="mr-1">{question_text}</span>}
                <LatexRenderer latex={question_latex} />
              </span>
            ) : (
              <span>{question_text}</span>
            )}
          </div>
        </div>

        {/* Diagram / visual */}
        {visual_json && (
          <DiagramRenderer visual={visual_json} className="mb-5" />
        )}

        {/* Answer choices */}
        <div className="flex flex-col gap-2.5">
          {choices.map((choice, i) => {
            const choiceKey = typeof choice === 'object' ? choice.key || String.fromCharCode(65 + i) : String.fromCharCode(65 + i)
            const isSelected = selectedAnswer === choiceKey
            const isCorrect = submitted && correctAnswer === choiceKey
            const isIncorrect = submitted && isSelected && selectedAnswer !== correctAnswer

            return (
              <AnswerChoice
                key={choiceKey}
                choice={choice}
                index={i}
                isSelected={isSelected}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
                onClick={() => !submitted && onSelectAnswer?.(choiceKey)}
                disabled={submitted}
              />
            )
          })}
        </div>

        {/* Explanation (post-submit) */}
        {submitted && explanation && (
          <div className="mt-5 pt-5 border-t border-space-border">
            <button
              onClick={() => setShowExplanation((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-brand-blue-light hover:text-blue-300 transition-colors mb-3"
            >
              <Flag size={14} />
              {showExplanation ? 'Hide explanation' : 'Show explanation'}
            </button>

            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/20 text-sm text-slate-300 leading-relaxed">
                  {explanation}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
