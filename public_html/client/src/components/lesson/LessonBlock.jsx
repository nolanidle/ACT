import React, { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Lightbulb,
  CheckCircle,
  BookOpen,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import AnswerChoice from '../quiz/AnswerChoice'
import LatexRenderer from '../math/LatexRenderer'
import DiagramRenderer from '../diagrams/DiagramRenderer'
import { fadeInUp } from '../../animations/variants'

/* ─── Block type renderers ────────────────────────────────────── */

function ExplanationBlock({ block }) {
  return (
    <div className="relative pl-5 border-l-2 border-brand-blue bg-brand-blue/3 rounded-r-xl p-5">
      <div className="absolute left-0 top-5 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-blue border-2 border-space-base" />
      <div className="flex items-start gap-3 mb-3">
        <BookOpen size={16} className="text-brand-blue-light flex-shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-brand-blue-light uppercase tracking-wider">
          Explanation
        </p>
      </div>
      <div className="text-sm text-slate-300 leading-7 prose-sm">
        {renderMixedContent(block.content || block.text)}
      </div>
    </div>
  )
}

function ExampleBlock({ block }) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="rounded-xl border border-space-border bg-space-surface overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-brand-violet/10 border-b border-space-border">
        <span className="text-xs font-bold text-brand-violet-light uppercase tracking-wider">
          Example
        </span>
      </div>
      <div className="p-5">
        <div className="text-sm text-slate-200 leading-relaxed mb-4">
          {renderMixedContent(block.question || block.text)}
        </div>
        {block.visual && <DiagramRenderer visual={block.visual} />}

        <button
          onClick={() => setShowAnswer((v) => !v)}
          className="flex items-center gap-2 text-xs font-medium text-brand-blue-light hover:text-blue-300 transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${showAnswer ? 'rotate-180' : ''}`}
          />
          {showAnswer ? 'Hide solution' : 'Show solution'}
        </button>

        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-slate-300 leading-relaxed">
              <p className="text-xs font-semibold text-emerald-400 mb-2">Solution</p>
              {renderMixedContent(block.answer || block.solution)}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function InteractiveQuestionBlock({ block, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSelect = (key) => {
    if (revealed) return
    setSelected(key)
    setRevealed(true)
    if (key === block.correct_answer) {
      onComplete?.()
    }
  }

  const choices = block.choices || []

  return (
    <div className="rounded-xl border border-space-border bg-space-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle size={16} className="text-brand-violet-light" />
        <p className="text-xs font-semibold text-brand-violet-light uppercase tracking-wider">
          Quick Check
        </p>
      </div>

      <div className="text-sm text-slate-200 leading-relaxed mb-4">
        {renderMixedContent(block.question || block.text)}
      </div>

      {block.visual && <DiagramRenderer visual={block.visual} />}

      <div className="flex flex-col gap-2 mb-4">
        {choices.map((choice, i) => {
          const key = typeof choice === 'object' ? choice.key || String.fromCharCode(65 + i) : String.fromCharCode(65 + i)
          return (
            <AnswerChoice
              key={key}
              choice={choice}
              index={i}
              isSelected={selected === key}
              isCorrect={revealed && block.correct_answer === key}
              isIncorrect={revealed && selected === key && selected !== block.correct_answer}
              onClick={() => handleSelect(key)}
              disabled={revealed}
            />
          )
        })}
      </div>

      {/* Hint */}
      {block.hint && !revealed && (
        <button
          onClick={() => setShowHint((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors mb-3"
        >
          <Lightbulb size={12} />
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      )}
      {showHint && block.hint && (
        <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs text-amber-200 leading-relaxed mb-3">
          {block.hint}
        </div>
      )}

      {/* Post-answer explanation */}
      {revealed && block.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/20 text-sm text-slate-300 leading-relaxed"
        >
          <p className="text-xs font-semibold text-brand-blue-light mb-2">Explanation</p>
          {renderMixedContent(block.explanation)}
        </motion.div>
      )}
    </div>
  )
}

function StrategyTipBlock({ block }) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mt-0.5">
          <Lightbulb size={16} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            Strategy Tip
          </p>
          <div className="text-sm text-amber-100/80 leading-relaxed">
            {renderMixedContent(block.content || block.text)}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryBlock({ block }) {
  const points = block.points || block.items || []
  const content = block.content || block.text

  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle size={16} className="text-emerald-400" />
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Summary</p>
      </div>
      {content && (
        <p className="text-sm text-slate-300 leading-relaxed mb-3">{content}</p>
      )}
      {points.length > 0 && (
        <ul className="space-y-2">
          {points.map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
              <CheckCircle
                size={14}
                className="text-emerald-400 flex-shrink-0 mt-0.5 fill-emerald-400/20"
              />
              {renderMixedContent(pt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────── */

/**
 * Render content that may contain inline LaTeX in $...$ markers.
 */
function renderMixedContent(text = '') {
  if (!text) return null
  if (typeof text !== 'string') return String(text)

  // Split on $...$ or $$...$$ patterns
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return (
        <LatexRenderer
          key={i}
          latex={part.slice(2, -2)}
          block
          fallback={part}
        />
      )
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <LatexRenderer key={i} latex={part.slice(1, -1)} fallback={part} />
      )
    }
    return <span key={i}>{part}</span>
  })
}

/* ─── Main LessonBlock ────────────────────────────────────────── */

/**
 * Renders a single lesson block with scroll-triggered reveal animation.
 *
 * @param {object} block - lesson block data { type, ... }
 * @param {number} index - position in lesson for stagger delay
 * @param {Function} onInteractionComplete - called when interactive_question answered
 */
export default function LessonBlock({ block = {}, index = 0, onInteractionComplete }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px 0px' })

  function renderBlock() {
    switch (block.type) {
      case 'explanation':
        return <ExplanationBlock block={block} />
      case 'example':
        return <ExampleBlock block={block} />
      case 'interactive_question':
        return (
          <InteractiveQuestionBlock
            block={block}
            onComplete={onInteractionComplete}
          />
        )
      case 'strategy_tip':
        return <StrategyTipBlock block={block} />
      case 'summary':
        return <SummaryBlock block={block} />
      default:
        return (
          <div className="p-4 rounded-xl bg-space-surface border border-space-border text-sm text-slate-400">
            {block.content || block.text || JSON.stringify(block)}
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay: Math.min(index * 0.08, 0.4) }}
    >
      {renderBlock()}
    </motion.div>
  )
}
