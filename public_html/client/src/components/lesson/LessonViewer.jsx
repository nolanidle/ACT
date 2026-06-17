import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Zap, CheckCircle } from 'lucide-react'
import LessonBlock from './LessonBlock'
import Button from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'
import { staggerContainer, fadeInUp } from '../../animations/variants'

/**
 * Renders a complete lesson with title, staggered blocks, progress bar,
 * and a "Generate quiz" CTA at the bottom.
 *
 * @param {object} lesson - { title, description, section, blocks: [] }
 * @param {Function} onGenerateQuiz - called when "Generate quiz" is clicked
 * @param {boolean} generatingQuiz - loading state for quiz generation
 */
export default function LessonViewer({
  lesson = {},
  onGenerateQuiz,
  generatingQuiz = false,
}) {
  const { title = 'Lesson', description, section, blocks = [] } = lesson

  const [completedBlocks, setCompletedBlocks] = useState(new Set())

  const handleInteractionComplete = useCallback((blockIndex) => {
    setCompletedBlocks((prev) => {
      const next = new Set(prev)
      next.add(blockIndex)
      return next
    })
  }, [])

  const interactiveBlocks = blocks.filter((b) => b.type === 'interactive_question')
  const totalInteractive = interactiveBlocks.length
  const completedCount = completedBlocks.size
  const progressPercent = totalInteractive > 0
    ? Math.round((completedCount / totalInteractive) * 100)
    : 100 // No interactive blocks → show full progress

  const sectionColors = {
    english: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    math: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    reading: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    science: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Lesson header */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        {section && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${sectionColors[section?.toLowerCase()] || 'text-slate-400 bg-space-surface border-space-border'}`}
          >
            {section}
          </span>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mb-3 leading-tight">
          {title}
        </h1>

        {description && (
          <p className="text-slate-400 leading-relaxed text-base">{description}</p>
        )}

        {/* Progress indicator (only when there are interactive blocks) */}
        {totalInteractive > 0 && (
          <div className="mt-5 p-4 rounded-xl bg-space-card border border-space-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span className="text-sm font-medium text-slate-300">
                  Lesson Progress
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {completedCount} / {totalInteractive} checks
              </span>
            </div>
            <ProgressBar
              value={progressPercent}
              color="emerald"
              size="md"
              animated={false}
            />
          </div>
        )}
      </motion.div>

      {/* Blocks */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {blocks.map((block, i) => (
          <LessonBlock
            key={block.id || i}
            block={block}
            index={i}
            onInteractionComplete={() => handleInteractionComplete(i)}
          />
        ))}
      </motion.div>

      {/* Bottom CTA */}
      {blocks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 pt-8 border-t border-space-border flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-brand-blue-light" />
              <p className="text-sm font-semibold text-slate-200">Ready to practice?</p>
            </div>
            <p className="text-xs text-slate-500">
              Generate a personalized quiz based on this lesson.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            loading={generatingQuiz}
            onClick={onGenerateQuiz}
            leftIcon={<Zap size={16} />}
            className="flex-shrink-0"
          >
            {generatingQuiz ? 'Generating…' : 'Generate Quiz'}
          </Button>
        </motion.div>
      )}

      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={40} className="text-slate-600 mb-4" strokeWidth={1.5} />
          <p className="text-slate-500">This lesson has no content yet.</p>
        </div>
      )}
    </div>
  )
}
