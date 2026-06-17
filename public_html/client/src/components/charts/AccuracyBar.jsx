import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { truncate } from '../../utils/formatters'

// Dynamic color based on accuracy
function barColor(accuracy) {
  if (accuracy >= 80) return '#10b981'  // emerald
  if (accuracy >= 60) return '#3b82f6'  // blue
  if (accuracy >= 40) return '#f59e0b'  // amber
  return '#f43f5e'                       // rose
}

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-space-card border border-space-border rounded-xl px-4 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-slate-200 mb-1">{label}</p>
      <p className="text-sm font-bold" style={{ color: barColor(val) }}>
        {val}% accuracy
      </p>
    </div>
  )
}

// Custom label on bar
function CustomLabel({ x, y, width, value }) {
  if (!value && value !== 0) return null
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#94a3b8"
      textAnchor="middle"
      fontSize={10}
      fontWeight="600"
    >
      {value}%
    </text>
  )
}

/**
 * Recharts BarChart showing accuracy percentage by topic.
 *
 * @param {Array<{ topic: string, accuracy: number, total?: number }>} data
 * @param {string} className
 * @param {'horizontal'|'vertical'} layout
 */
export default function AccuracyBar({
  data = [],
  className = '',
  layout = 'vertical',
}) {
  if (!data.length) {
    return (
      <div
        className={`flex items-center justify-center h-48 text-slate-500 text-sm ${className}`}
      >
        No accuracy data yet.
      </div>
    )
  }

  const isHorizontal = layout === 'horizontal'

  return (
    <div
      className={`p-4 rounded-xl bg-space-surface border border-space-border ${className}`}
    >
      <ResponsiveContainer width="100%" height={Math.max(240, data.length * (isHorizontal ? 36 : 50))}>
        {isHorizontal ? (
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 60, bottom: 5, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#2d3a4f' }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={120}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => truncate(v, 18)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.accuracy)} />
              ))}
              <LabelList
                dataKey="accuracy"
                position="right"
                formatter={(v) => `${v}%`}
                style={{ fill: '#94a3b8', fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        ) : (
          <BarChart
            data={data}
            margin={{ top: 25, right: 10, bottom: 60, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis
              dataKey="topic"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#2d3a4f' }}
              angle={-35}
              textAnchor="end"
              interval={0}
              tickFormatter={(v) => truncate(v, 14)}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="accuracy" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.accuracy)} />
              ))}
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {[
          { color: '#10b981', label: '≥80% Mastered' },
          { color: '#3b82f6', label: '60-79% Proficient' },
          { color: '#f59e0b', label: '40-59% Practicing' },
          { color: '#f43f5e', label: '<40% Learning' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
