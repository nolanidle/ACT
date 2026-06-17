import React from 'react'

const variantClasses = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 ring-emerald-500/10',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25 ring-amber-500/10',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/25 ring-rose-500/10',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/25 ring-blue-500/10',
  purple: 'bg-violet-500/15 text-violet-400 border-violet-500/25 ring-violet-500/10',
  default: 'bg-slate-700/40 text-slate-300 border-slate-600/30 ring-slate-600/10',
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

/**
 * Small status badge component.
 *
 * @param {'success'|'warning'|'danger'|'info'|'purple'|'default'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} dot - show colored dot prefix
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...rest
}) {
  const dotColor = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400',
    purple: 'bg-violet-400',
    default: 'bg-slate-400',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColor[variant] || dotColor.default}`}
        />
      )}
      {children}
    </span>
  )
}
