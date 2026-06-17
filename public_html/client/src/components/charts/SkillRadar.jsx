import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const SECTION_COLORS = {
  english: '#3b82f6',
  math: '#7c3aed',
  reading: '#10b981',
  science: '#f59e0b',
}

// Custom tooltip
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-space-card border border-space-border rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-slate-200 mb-1">{payload[0]?.payload?.skill}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.stroke }}>
          {p.name}: {Math.round(p.value)}%
        </p>
      ))}
    </div>
  )
}

/**
 * Recharts RadarChart showing skill accuracy by section.
 *
 * @param {Array<{ skill: string, english?: number, math?: number, reading?: number, science?: number }>} skills
 * @param {string[]} activeSections - which sections to show
 * @param {string} className
 */
export default function SkillRadar({
  skills = [],
  activeSections = ['english', 'math', 'reading', 'science'],
  className = '',
}) {
  if (!skills.length) {
    return (
      <div className={`flex items-center justify-center h-48 text-slate-500 text-sm ${className}`}>
        No skill data yet.
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-xl bg-space-surface border border-space-border ${className}`}>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={skills} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid
            stroke="#2d3a4f"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickCount={5}
            axisLine={false}
          />

          {activeSections.map((section) => (
            <Radar
              key={section}
              name={section.charAt(0).toUpperCase() + section.slice(1)}
              dataKey={section}
              stroke={SECTION_COLORS[section] || '#94a3b8'}
              fill={SECTION_COLORS[section] || '#94a3b8'}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ fill: SECTION_COLORS[section], r: 3, strokeWidth: 0 }}
            />
          ))}

          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-400">{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
