import React from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import LatexRenderer from '../math/LatexRenderer'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Single answer choice button for a quiz question.
 *
 * @param {string|object} choice - text or { text, latex } object
 * @param {number} index - 0-based index for letter label
 * @param {boolean} isSelected
 * @param {boolean} isCorrect - revealed after submission
 * @param {boolean} isIncorrect - revealed after submission
 * @param {boolean} onClick
 * @param {boolean} disabled
 */
export default function AnswerChoice({
  choice,
  index = 0,
  isSelected = false,
  isCorrect = false,
  isIncorrect = false,
  onClick,
  disabled = false,
}) {
  const letter = LETTERS[index] || String.fromCharCode(65 + index)

  // Determine styling state
  let containerClass
  let letterClass
  let iconEl = null

  if (isCorrect) {
    containerClass =
      'border-emerald-500/70 bg-emerald-500/10 text-emerald-300 animate-pulse-green'
    letterClass = 'bg-emerald-500 text-white'
    iconEl = <Check size={14} className="text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
  } else if (isIncorrect) {
    containerClass =
      'border-rose-500/70 bg-rose-500/10 text-rose-300 animate-shake-red'
    letterClass = 'bg-rose-500 text-white'
    iconEl = <X size={14} className="text-rose-400 flex-shrink-0" strokeWidth={2.5} />
  } else if (isSelected) {
    containerClass =
      'border-brand-blue/70 bg-brand-blue/10 text-brand-blue-light'
    letterClass = 'bg-brand-blue text-white'
  } else {
    containerClass =
      'border-space-border text-slate-300 hover:border-brand-blue/40 hover:bg-brand-blue/5 hover:text-slate-100'
    letterClass = 'bg-space-surface text-slate-400 group-hover:bg-brand-blue/15 group-hover:text-brand-blue-light'
  }

  const choiceText = typeof choice === 'string' ? choice : choice?.text || ''
  const choiceLatex = typeof choice === 'object' ? choice?.latex : null

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'group w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue/30',
        disabled ? 'cursor-default' : 'cursor-pointer',
        containerClass,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Letter badge */}
      <span
        className={[
          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200',
          letterClass,
        ].join(' ')}
      >
        {letter}
      </span>

      {/* Choice text / latex */}
      <div className="flex-1 text-sm leading-relaxed pt-0.5">
        {choiceLatex ? (
          <span>
            {choiceText && <span className="mr-1">{choiceText}</span>}
            <LatexRenderer latex={choiceLatex} />
          </span>
        ) : (
          <span>{choiceText}</span>
        )}
      </div>

      {/* Result icon */}
      {iconEl && <div className="flex-shrink-0 mt-0.5">{iconEl}</div>}
    </motion.button>
  )
}
