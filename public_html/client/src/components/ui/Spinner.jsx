import React from 'react'

const sizeMap = {
  xs: { size: 12, stroke: 1.5 },
  sm: { size: 16, stroke: 2 },
  md: { size: 24, stroke: 2.5 },
  lg: { size: 36, stroke: 3 },
  xl: { size: 48, stroke: 3.5 },
}

/**
 * SVG spinning loader.
 *
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {string} color - Tailwind text color class (defaults to brand-blue)
 * @param {string} className
 */
export default function Spinner({ size = 'md', color = 'text-brand-blue', className = '' }) {
  const { size: px, stroke } = sizeMap[size] || sizeMap.md
  const r = (px - stroke * 2) / 2
  const circumference = 2 * Math.PI * r

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin flex-shrink-0 ${color} ${className}`}
      aria-label="Loading"
      role="status"
    >
      {/* Track circle */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeOpacity="0.2"
      />
      {/* Spinning arc */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
    </svg>
  )
}
