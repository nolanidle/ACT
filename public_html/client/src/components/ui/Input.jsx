import React, { useId } from 'react'

/**
 * Space-themed input, textarea, and select component.
 *
 * @param {string} label
 * @param {string} error - error message string
 * @param {string} hint - hint/helper text
 * @param {string} type - input type or 'textarea' or 'select'
 * @param {boolean} multiline - render textarea
 * @param {Array<{value:string, label:string}>} options - for select type
 * @param {React.ReactNode} leftIcon - icon rendered inside left side
 * @param {React.ReactNode} rightIcon - icon rendered inside right side
 * @param {number} rows - textarea rows
 */
const Input = React.forwardRef(function Input(
  {
    label,
    error,
    hint,
    type = 'text',
    multiline = false,
    options,
    leftIcon,
    rightIcon,
    className = '',
    wrapperClassName = '',
    rows = 4,
    id: idProp,
    ...rest
  },
  ref
) {
  const generatedId = useId()
  const id = idProp || generatedId

  const baseInputClasses = [
    'w-full bg-space-deep border rounded-xl px-4 py-2.5 text-sm text-slate-100',
    'placeholder:text-slate-500',
    'transition-all duration-200 outline-none',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    error
      ? 'border-rose-500/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
      : 'border-space-border focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/15',
  ]
    .filter(Boolean)
    .join(' ')

  const isSelect = type === 'select' || !!options
  const isTextarea = multiline || type === 'textarea'

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-slate-500 pointer-events-none">
            {leftIcon}
          </span>
        )}

        {isSelect ? (
          <select
            ref={ref}
            id={id}
            className={[
              baseInputClasses,
              'appearance-none bg-space-deep cursor-pointer',
              className,
            ].join(' ')}
            {...rest}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-space-card">
                {opt.label}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            className={[baseInputClasses, 'resize-y min-h-[80px]', className].join(' ')}
            {...rest}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            type={type}
            className={[baseInputClasses, className].join(' ')}
            {...rest}
          />
        )}

        {rightIcon && (
          <span className="absolute right-3 text-slate-500 pointer-events-none">
            {rightIcon}
          </span>
        )}

        {/* Select arrow */}
        {isSelect && (
          <span className="absolute right-3 text-slate-500 pointer-events-none">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
})

export default Input
