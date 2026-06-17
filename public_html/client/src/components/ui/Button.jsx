import React from 'react'
import { motion } from 'framer-motion'
import Spinner from './Spinner'

const variantClasses = {
  primary:
    'bg-gradient-to-r from-brand-blue to-blue-500 hover:from-blue-500 hover:to-brand-blue-light text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/20',
  secondary:
    'bg-transparent border border-space-border text-slate-300 hover:border-brand-blue hover:text-brand-blue-light hover:bg-brand-blue/5',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-500/20 border border-rose-400/20',
  success:
    'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/20',
  ghost:
    'bg-transparent text-slate-300 hover:bg-white/5 hover:text-white border border-transparent',
  violet:
    'bg-gradient-to-r from-brand-violet to-violet-500 hover:from-violet-500 hover:to-brand-violet-light text-white shadow-lg shadow-violet-500/20 border border-violet-400/20',
}

const sizeClasses = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
  sm: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
}

/**
 * Space-themed button component.
 *
 * @param {'primary'|'secondary'|'danger'|'success'|'ghost'|'violet'} variant
 * @param {'xs'|'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    type = 'button',
    onClick,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:ring-offset-1 focus:ring-offset-space-card',
        'select-none cursor-pointer',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </motion.button>
  )
})

export default Button
