import React from 'react'
import { motion } from 'framer-motion'

/**
 * Space-themed card component.
 *
 * @param {boolean} glow - adds an electric-blue glow border effect
 * @param {boolean} hover - adds subtle scale + border highlight on hover
 * @param {string} className - extra Tailwind classes
 */
const Card = React.forwardRef(function Card(
  { children, className = '', glow = false, hover = false, as = 'div', onClick, ...rest },
  ref
) {
  const Tag = motion[as] || motion.div

  return (
    <Tag
      ref={ref}
      onClick={onClick}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={[
        'relative rounded-2xl border bg-space-card',
        glow
          ? 'border-brand-blue/40 shadow-lg shadow-brand-blue/10'
          : 'border-space-border',
        hover
          ? 'cursor-pointer hover:border-brand-blue/40 hover:shadow-lg hover:shadow-brand-blue/10 transition-all duration-300'
          : '',
        glow ? 'card-glow' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
})

export default Card
