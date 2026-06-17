import React from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../../animations/variants'

/**
 * Wraps each page with AnimatePresence-compatible motion.div,
 * applies consistent padding and max-width centering.
 *
 * @param {React.ReactNode} children
 * @param {boolean} fullWidth - skip max-width container
 * @param {string} className - additional Tailwind classes
 * @param {boolean} noPadding - skip default padding
 */
export default function PageWrapper({
  children,
  fullWidth = false,
  className = '',
  noPadding = false,
}) {
  return (
    <motion.div
      {...pageTransition}
      className={[
        'flex-1 min-h-0',
        noPadding ? '' : 'p-4 sm:p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={
          fullWidth
            ? 'w-full h-full'
            : 'max-w-6xl mx-auto w-full'
        }
      >
        {children}
      </div>
    </motion.div>
  )
}
