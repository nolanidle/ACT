import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import Button from './Button'
import { fadeInUp } from '../../animations/variants'

/**
 * Empty state component for lists, dashboards, etc.
 *
 * @param {React.ComponentType} icon - Lucide icon component (defaults to Inbox)
 * @param {string} title
 * @param {string} message
 * @param {{ label: string, onClick: Function, variant?: string, leftIcon?: React.ReactNode }} action
 * @param {string} className
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  message = 'Get started by adding something new.',
  action,
  className = '',
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Glow ring behind icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-brand-blue/10 blur-xl scale-150" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-space-surface border border-space-border">
          <Icon size={32} className="text-slate-500" strokeWidth={1.5} />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{message}</p>

      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            leftIcon={action.leftIcon}
            size="md"
          >
            {action.label}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
